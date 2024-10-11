import {
  AccountID,
  Address,
  CallArgs,
  Engine,
  FunctionCallArgsV2,
  parseHexString,
  // @ts-ignore
} from "@aurora-is-near/engine";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import {
  ftGetTokenMetadata,
  getDepositableBalance,
  getWhitelistedTokensAndNearTokens,
} from "./token";
import { defaultTokenList, getAuroraConfig } from "@/utils/auroraConfig";
import { Near, WalletConnection, keyStores } from "near-api-js";
import getConfig from "@/utils/config";
import {
  WRAP_NEAR_CONTRACT_ID,
  nearMetadata,
  nearWithdrawTransaction,
} from "./wrap-near";
import {
  formatWithCommas,
  scientificNotationToString,
  toInternationalCurrencySystem,
  toInternationalCurrencySystemLongString,
  toNonDivisibleNumber,
  toPrecision,
} from "@/utils/numbers";
import { useAccountStore } from "@/stores/account";
import Big from "big.js";
import { Erc20Abi } from "./abi/erc20";
import AbiCoder from "web3-eth-abi";
import { getAccountId } from "@/utils/wallet";
import { list_user_assets } from "./swapV3";
import BigNumber from "bignumber.js";
import { Transaction, getStakedListByAccountId } from "./farm";
import { ILock, get_account } from "./lplock";
import { getSharesInPool } from "./pool";
import { ftGetStorageBalance, TokenMetadata } from "./ft-contract";
import { REF_FI_CONTRACT_ID, RefFiFunctionCallOptions } from "./xref";
import {
  STORAGE_TO_REGISTER_WITH_FT,
  STORAGE_TO_REGISTER_WITH_MFT,
  storageDepositAction,
} from "./creator/storage";
import { executeMultipleTransactions } from "@/utils/near";
import { toBufferBE } from "bigint-buffer";
import { checkTokenNeedsStorageDeposit } from "./swap/registerToken";
import { ONE_YOCTO_NEAR } from "@/utils/near";
import { REF_UNI_V3_SWAP_CONTRACT_ID } from "@/utils/contract";
import { useAppStore } from "@/stores/app";

const config = getConfig();
export const oneETH = new Big(10).pow(18);

export const AuroraCallGas = "150000000000000";

class AuroraWalletConnection extends WalletConnection {
  async _completeSignInWithAccessKey() {
    const currentUrl = new URL(window.location.href);
    const publicKey = currentUrl.searchParams.get("public_key") || "";
    const allKeys = (currentUrl.searchParams.get("all_keys") || "").split(",");
    const accountId = currentUrl.searchParams.get("account_id") || "";
    // TODO: Handle errors during login
    if (accountId) {
      this._authData = {
        accountId,
        allKeys,
      };
      window.localStorage.setItem(
        this._authDataKey,
        JSON.stringify(this._authData)
      );
      if (publicKey) {
        await this._moveKeyFromTempToPermanent(accountId, publicKey);
      }
    }
  }
}
export const getAurora = () => {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const near = new Near({
    keyStore,
    headers: {},
    ...config,
  });
  const aurora_walletConnection = new AuroraWalletConnection(near, "aurora");
  const account = new AuroraWalletConnection(
    near,
    config.REF_FARM_BOOST_CONTRACT_ID
  ).account();
  //@ts-ignore
  return new Engine(
    aurora_walletConnection,
    keyStore,
    account,
    getConfig().networkId,
    "aurora"
  );
};

export const toAddress = (address: string | any) => {
  return typeof address === "string"
    ? Address.parse(address).unwrapOrElse(() => Address.zero())
    : address;
};

export const getTokenNearAccount = async (auroraAddress: string) => {
  try {
    return (
      await getAurora().getNEP141Account(toAddress(auroraAddress))
    ).unwrap();
  } catch (error) {}
};

export const getBatchTokenNearAcounts = async (ids: string[]) => {
  return await Promise.all(
    ids.map((id) =>
      id === getAuroraConfig().WETH
        ? "aurora"
        : getTokenNearAccount(id).then((res) => res?.id)
    )
  );
};

export const getTriTokenIdsOnRef = async () => {
  const auroraTokens = defaultTokenList.tokens;
  const allSupportPairs = getAuroraConfig().Pairs;
  const symbolToAddress: Record<string, string> = auroraTokens.reduce(
    (pre, cur) => {
      return {
        ...pre,
        [cur.symbol]: cur.address,
      };
    },
    {}
  );
  const idsOnPair = Object.keys(allSupportPairs)
    .map((pairName: string) => {
      const names = pairName.split("-");
      return names.map((n) => {
        if (n === "ETH") return getAuroraConfig().WETH;
        else return symbolToAddress[n];
      });
    })
    .flat();
  const ids = await getBatchTokenNearAcounts(idsOnPair);
  return ids?.filter((id: string) => !!id) || [];
};

export const useUserRegisteredTokensAllAndNearBalance = () => {
  const [tokens, setTokens] = useState<any[]>();
  const [tokens_loading, set_tokens_loading] = useState<boolean>(true);
  const appStore = useAppStore();
  const personalDataUpdatedSerialNumber =
    appStore.getPersonalDataUpdatedSerialNumber();
  useDebounce(
    () => {
      set_tokens_loading(true);
      getWhitelistedTokensAndNearTokens()
        .then(async (tokenList) => {
          const triTokenIds = await getTriTokenIdsOnRef();
          const newList = [
            ...new Set((triTokenIds || []).concat(tokenList)),
          ] as string[];
          const walletBalancePromise = Promise.all(
            [nearMetadata.id, ...newList].map((tokenId) => {
              return getDepositableBalance(tokenId);
            })
          );
          const tokenMetadataPromise = Promise.all(
            newList.map((tokenId) => ftGetTokenMetadata(tokenId, true))
          );
          return Promise.all([tokenMetadataPromise, walletBalancePromise]);
        })
        .then((result) => {
          const arr = result[0];
          arr.unshift(nearMetadata);
          arr.forEach((token, index) => {
            token.near = result[1][index];
            token.nearNonVisible = result[1][index];
          });
          setTokens(arr);
          appStore.set_update_time(new Date().getTime());
        })
        .finally(() => {
          set_tokens_loading(false);
        });
    },
    500,
    [personalDataUpdatedSerialNumber]
  );
  return {
    tokens,
    tokens_loading,
  };
};

export const auroraAddr = (nearAccount: string) =>
  new AccountID(nearAccount).toAddress().toString();

export const useAuroraTokens = () => {
  const [tokens, setTokens] = useState<any>({});

  const tokenList = defaultTokenList;

  useEffect(() => {
    setTokens(
      Object.assign(
        {
          tokenAddresses: tokenList.tokens.map((t) => t.address),
          tokensByAddress: tokenList.tokens.reduce(
            (
              m: {
                [key: string]: {
                  address: string;
                  [key: string]: any;
                };
              },
              t: {
                address: string;
                [key: string]: any;
              }
            ) => {
              m[t.address] = t;
              return m;
            },
            {}
          ),
        },
        tokenList
      )
    );
  }, [tokenList]);

  return tokens;
};

export const fetchBalance = async (address: string) => {
  return scientificNotationToString(
    Big((await getAurora().getBalance(toAddress(address))).unwrap()).toString()
  );
};

export const decodeOutput = (abi: any[], methodName: string, buffer: any) => {
  const abiItem = abi.find((a) => a.name === methodName);
  if (!abiItem) {
    return null;
  }
  return AbiCoder.decodeParameters(
    abiItem.outputs,
    `0x${buffer.toString("hex")}`
  );
};
export const buildInput = (abi: any[], methodName: string, params: any) => {
  const abiItem = abi.find((a) => a.name === methodName);
  if (!abiItem) {
    return null;
  }

  return AbiCoder.encodeFunctionCall(abiItem, params);
};

export const fetchErc20Balance = async (
  address: string,
  tokenAddress: string
) => {
  try {
    const input = buildInput(Erc20Abi, "balanceOf", [address]);
    const res = (
      await getAurora().view(
        toAddress(address),
        toAddress(tokenAddress),
        0,
        input
      )
    ).unwrap();

    const out = decodeOutput(Erc20Abi, "balanceOf", res);
    if (out && out[0] !== null && out[0] !== undefined) {
      return Big(out[0] as any);
    }
  } catch (e) {
    return false;
  }
};

export const useAuroraBalances = (address: string) => {
  const [tokenBalances, setTokenBalances] = useState(null);
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  const tokensData = useAuroraTokens();
  const appStore = useAppStore();
  const personalDataUpdatedSerialNumber =
    appStore.getPersonalDataUpdatedSerialNumber();
  useDebounce(
    () => {
      if (!tokensData?.tokenAddresses || !isSignedIn) return;

      const requestAddress = tokensData.tokenAddresses.concat([
        getAuroraConfig().WETH,
      ]);

      Promise.all(
        requestAddress.map((add: string) =>
          add === getAuroraConfig().WETH
            ? fetchBalance(address)
            : fetchErc20Balance(address, add)
        )
      ).then((res) => {
        setTokenBalances(
          res.reduce((pre, cur, i) => {
            if (Number(cur) > 0)
              return {
                ...pre,
                [requestAddress[i]]: scientificNotationToString(cur.toString()),
              };
            else return pre;
          }, {})
        );
      });
    },
    1500,
    [tokensData, isSignedIn, address, personalDataUpdatedSerialNumber]
  );

  return tokenBalances;
};

export const useAuroraBalancesNearMapping = (address: string) => {
  const auroraMapping = useAuroraBalances(address);

  const [nearMapping, setNearMapping] = useState(null);

  const accountId = getAccountId();

  const isSignedIn = !!accountId;

  useEffect(() => {
    if (!auroraMapping || !isSignedIn) return;
    const auroraAddresses = Object.keys(auroraMapping);

    getBatchTokenNearAcounts(auroraAddresses)
      .then((nearAccounts) => {
        return nearAccounts.reduce((pre: any, cur: any, i: number) => {
          return {
            ...pre,
            [cur]: Object.values(auroraMapping)[i],
          };
        }, {});
      })
      .then((res) => {
        setNearMapping(res);
      });
  }, [auroraMapping, isSignedIn]);

  return nearMapping;
};

export const useDCLAccountBalance = (isSignedIn: boolean) => {
  const [assets, setAssets] = useState<any>();
  const appStore = useAppStore();
  const personalDataUpdatedSerialNumber =
    appStore.getPersonalDataUpdatedSerialNumber();
  useEffect(() => {
    list_user_assets().then(setAssets);
  }, [isSignedIn, personalDataUpdatedSerialNumber]);

  return assets;
};

export function display_number_internationalCurrencySystemLongString(
  amount: string
) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo("0")) {
    return "0";
  } else if (amount_big.isLessThan("0.01")) {
    return "<0.01";
  } else {
    return toInternationalCurrencySystemLongString(amount, 2);
  }
}
export function display_value(amount: string) {
  const accountId = getAccountId();
  if (!accountId) return "$-";
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo("0")) {
    return "$0";
  } else if (amount_big.isLessThan("0.01")) {
    return "<$0.01";
  } else {
    return `$${toInternationalCurrencySystem(amount, 2)}`;
  }
}

export function display_value_withCommas(amount: string) {
  const accountId = getAccountId();
  if (!accountId) return "$-";
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo("0")) {
    return "$0";
  } else if (amount_big.isLessThan("0.01")) {
    return "<$0.01";
  } else {
    return `$${formatWithCommas(toPrecision(amount, 2))}`;
  }
}

export const useStakeListByAccountId = () => {
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  const [stakeList, setStakeList] = useState<Record<string, string>>({});
  const [v2StakeList, setV2StakeList] = useState<Record<string, string>>({});

  const [finalStakeList, setFinalStakeList] = useState<Record<string, string>>(
    {}
  );
  const [stakeListDone, setStakeListDone] = useState<boolean>(false);

  useEffect(() => {
    if (!isSignedIn) return;
    getStakedListByAccountId({})
      .then(({ stakedList, finalStakeList, v2StakedList }) => {
        setStakeList(stakedList);
        setV2StakeList(v2StakedList);
        setFinalStakeList(finalStakeList);
        setStakeListDone(true);
      })
      .catch((error) => {
        console.error("Failed to fetch staked list", error);
      });
  }, [isSignedIn]);

  return {
    stakeList,
    v2StakeList,
    finalStakeList,
    stakeListDone,
  };
};

export const getErc20Addr = async (token_id: string) => {
  if (token_id === "aurora") return getAuroraConfig().WETH;

  return (
    await getAurora().getAuroraErc20Address(new AccountID(token_id))
  ).unwrap();
};

export const useBatchTotalShares = (
  ids: (any | number)[],
  finalStakeList: Record<string, string>,
  stakeListDone: boolean
) => {
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  const [batchShares, setBatchShares] = useState<string[]>();
  const [batchFarmStake, setBatchFarmStake] = useState<(string | number)[]>();
  const [batchLpLocked, setBatchLpLocked] = useState<(string | number)[]>();
  const [sharesDone, setSharesDone] = useState<boolean>(false);
  const [accountLocked, setAccountLocked] = useState<Record<string, ILock>>();

  const getFarmStake = (pool_id: number) => {
    const farmStake = "0";

    const seedIdList: string[] = Object.keys(finalStakeList);
    let tempFarmStake: string | number = "0";
    seedIdList.forEach((seed) => {
      const id = Number(seed.split("@")[1]);
      if (id == pool_id) {
        tempFarmStake = BigNumber.sum(
          farmStake,
          finalStakeList[seed]
        ).valueOf();
      }
    });

    return tempFarmStake;
  };
  useEffect(() => {
    if (isSignedIn) {
      get_account().then((locked) => {
        setAccountLocked(locked?.locked_tokens || {});
      });
    }
  }, [isSignedIn]);
  useEffect(() => {
    if (
      !ids ||
      !finalStakeList ||
      !isSignedIn ||
      !stakeListDone ||
      !accountLocked
    )
      return undefined;
    getShares();
  }, [
    ids?.join("-"),
    finalStakeList,
    isSignedIn,
    stakeListDone,
    accountLocked,
  ]);
  async function getShares() {
    const shareInPools = await Promise.all(
      ids.map((id) => getSharesInPool(Number(id)))
    );
    const shareInLocked = ids.map((id) => {
      const key = `${getConfig().REF_FI_CONTRACT_ID}@:${id}`;
      return accountLocked?.[key]?.locked_balance || "0";
    });
    const shareInFarms = ids.map((id) => getFarmStake(Number(id)));
    setBatchShares(shareInPools);
    setBatchFarmStake(shareInFarms);
    setBatchLpLocked(shareInLocked);
    setSharesDone(true);
  }
  return {
    sharesDone,
    shares: batchShares,
    batchTotalShares:
      ids?.map((id, index) => {
        return new Big(batchShares?.[index] || "0")
          .plus(new Big(batchFarmStake?.[index] || "0"))
          .plus(new Big(batchLpLocked?.[index] || "0"))
          .toNumber();
      }) || undefined,
  };
};

export const batchWithdrawFromAurora = async (tokenMap: any) => {
  const tokenIdList = Object.keys(tokenMap);

  const transactions: Transaction[] = [];

  const registerToken = async (tokenId: string) => {
    const tokenRegistered = await ftGetStorageBalance(tokenId).catch(() => {
      throw new Error(`${tokenId} doesn't exist.`);
    });
    const tokenOutActions: RefFiFunctionCallOptions[] = [];

    if (tokenRegistered === null) {
      tokenOutActions.push({
        methodName: "storage_deposit",
        args: {
          registration_only: true,
          account_id: getAccountId(),
        },
        gas: "30000000000000",
        amount: STORAGE_TO_REGISTER_WITH_MFT,
      });

      transactions.push({
        receiverId: tokenId,
        functionCalls: tokenOutActions,
      });
    }
  };

  await Promise.all(tokenIdList.map((id) => registerToken(id)));

  const tokens = await Promise.all(
    tokenIdList.map((id) => ftGetTokenMetadata(id))
  );

  const actions = await Promise.all(
    tokens.map((tk, i) =>
      withdrawFromAurora({
        token_id: tk.id,
        amount: tokenMap[tk.id].amount,
        decimal: tk.decimals,
      })
    )
  );

  actions.forEach((action) =>
    transactions.push({
      receiverId: "aurora",
      functionCalls: [action],
    })
  );

  if (!!tokenMap[WRAP_NEAR_CONTRACT_ID]) {
    transactions.push(
      nearWithdrawTransaction(tokenMap[WRAP_NEAR_CONTRACT_ID].amount)
    );
  }

  return executeMultipleTransactions(transactions, false);
};

export async function withdrawFromAurora({
  token_id,
  amount,
  decimal,
}: {
  token_id: string;
  amount: string;
  decimal: number;
}) {
  if (token_id === "aurora") {
    const callAddress = toAddress(getAuroraConfig().ethBridgeAddress);

    const input = `0x00${Buffer.from(getAccountId(), "utf-8").toString("hex")}`;

    const value = new Big(oneETH).mul(amount).round(0, 0).toFixed(0);

    return auroraCallToAction(callAddress, input, value);
  } else {
    const input = buildInput(Erc20Abi, "withdrawToNear", [
      `0x${Buffer.from(getAccountId(), "utf-8").toString("hex")}`,
      toNonDivisibleNumber(decimal, amount), // need to check decimals in real case
    ]);
    const erc20Addr = await getErc20Addr(token_id);

    // await getAurora().call(toAddress(erc20Addr), input);

    return auroraCallToAction(erc20Addr, input);
  }
}

export function prepareInput(args: any) {
  if (typeof args === "undefined") return Buffer.alloc(0);
  if (typeof args === "string") return Buffer.from(parseHexString(args));
  return Buffer.from(args);
}

export function prepareAmount(value: any) {
  if (typeof value === "undefined") return toBufferBE(BigInt(0), 32);
  const number = BigInt(value);
  return toBufferBE(number, 32);
}

export function auroraCallToAction(contract: any, input: any, value?: string) {
  const inner_args = new FunctionCallArgsV2({
    contract: contract.toBytes(),
    value: prepareAmount(value || "0"),
    input: prepareInput(input),
  });

  const args = new CallArgs({
    functionCallArgsV2: inner_args,
  }).encode();

  const action: RefFiFunctionCallOptions = {
    methodName: "call",
    args: prepareInput(args),
    gas: AuroraCallGas,
    deposit: "0",
  };

  return action;
}

export const batchWithdraw = async (tokenMap: any) => {
  const transactions: Transaction[] = [];
  const neededStorage = await checkTokenNeedsStorageDeposit();

  if (neededStorage) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  const tokenIdList = Object.keys(tokenMap);
  const ftBalancePromiseList: any[] = [];
  tokenIdList.forEach(async (tokenId) => {
    const promise = ftGetStorageBalance(tokenId);
    ftBalancePromiseList.push(promise);
  });
  const ftBalanceList = await Promise.all(ftBalancePromiseList);
  ftBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.push({
        receiverId: tokenIdList[index],
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_FT,
          }),
        ],
      });
    }
  });

  const widthdrawActions: any[] = [];
  let wNEARAction;
  tokenIdList.forEach((tokenId) => {
    const { decimals, amount } = tokenMap[tokenId];
    const parsedAmount = toNonDivisibleNumber(decimals, amount);
    widthdrawActions.push({
      methodName: "withdraw",
      args: {
        token_id: tokenId,
        amount: parsedAmount,
        unregister: false,
        skip_unwrap_near: false,
      },
      gas: "55000000000000",
      amount: ONE_YOCTO_NEAR,
    });
  });
  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: widthdrawActions,
  });
  if (wNEARAction) {
    transactions.push(wNEARAction);
  }
  return executeMultipleTransactions(transactions);
};

export const batchWithdrawDCL = async (tokenMap: any) => {
  const transactions: Transaction[] = [];
  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  const tokenIdList = Object.keys(tokenMap);
  const ftBalancePromiseList: any[] = [];
  tokenIdList.forEach(async (tokenId) => {
    const promise = ftGetStorageBalance(tokenId);
    ftBalancePromiseList.push(promise);
  });
  const ftBalanceList = await Promise.all(ftBalancePromiseList);
  ftBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.push({
        receiverId: tokenIdList[index],
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_FT,
          }),
        ],
      });
    }
  });

  const widthdrawActions: any[] = [];
  tokenIdList.forEach((tokenId) => {
    const { decimals, amount } = tokenMap[tokenId];
    const parsedAmount = toNonDivisibleNumber(decimals, amount);
    widthdrawActions.push({
      methodName: "withdraw_asset",
      args: { token_id: tokenId, amount: parsedAmount },
      gas: "55000000000000",
    });
  });
  transactions.push({
    receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
    functionCalls: widthdrawActions,
  });

  return executeMultipleTransactions(transactions);
};
export const batchWithdrawInner = async (tokens: TokenMetadata[]) => {
  const split_num = 5;
  const transactions: Transaction[] = [];
  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  const ftBalancePromiseList: any[] = [];
  tokens.forEach(async ({ id: tokenId }) => {
    const promise = ftGetStorageBalance(tokenId);
    ftBalancePromiseList.push(promise);
  });
  const ftBalanceList = await Promise.all(ftBalancePromiseList);
  ftBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.push({
        receiverId: tokens[index].id,
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_FT,
          }),
        ],
      });
    }
  });

  const widthdrawActionsV1: any[] = [];
  const widthdrawActionsV3: any[] = [];
  tokens.forEach((token: TokenMetadata) => {
    const { decimals, ref, dcl, id } = token;
    if (Big(ref || 0).gt(0)) {
      const parsedAmount = toNonDivisibleNumber(
        decimals,
        Big(ref || 0).toFixed()
      );
      widthdrawActionsV1.push({
        methodName: "withdraw",
        args: {
          token_id: id,
          amount: parsedAmount,
          unregister: false,
          skip_unwrap_near: false,
        },
        gas: "55000000000000",
        amount: ONE_YOCTO_NEAR,
      });
    }
    if (Big(dcl || 0).gt(0)) {
      const parsedAmount = toNonDivisibleNumber(
        decimals,
        Big(dcl || 0).toFixed()
      );
      widthdrawActionsV3.push({
        methodName: "withdraw_asset",
        args: { token_id: id, amount: parsedAmount },
        gas: "55000000000000",
      });
    }
  });
  if (widthdrawActionsV1.length > 0) {
    const list = splitArray(widthdrawActionsV1, split_num);
    list.forEach((actions) => {
      transactions.push({
        receiverId: REF_FI_CONTRACT_ID,
        functionCalls: actions,
      });
    });
  }
  if (widthdrawActionsV3.length > 0) {
    const list = splitArray(widthdrawActionsV3, split_num);
    list.forEach((actions) => {
      transactions.push({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls: actions,
      });
    });
  }
  return executeMultipleTransactions(transactions, false);
};
export const batchWithdrawAurora = async (tokens: TokenMetadata[]) => {
  const transactions: Transaction[] = [];

  const registerToken = async (tokenId: string) => {
    const tokenRegistered = await ftGetStorageBalance(tokenId).catch(() => {
      throw new Error(`${tokenId} doesn't exist.`);
    });
    const tokenOutActions: RefFiFunctionCallOptions[] = [];

    if (tokenRegistered === null) {
      tokenOutActions.push({
        methodName: "storage_deposit",
        args: {
          registration_only: true,
          account_id: getAccountId(),
        },
        gas: "30000000000000",
        amount: STORAGE_TO_REGISTER_WITH_MFT,
      });

      transactions.push({
        receiverId: tokenId,
        functionCalls: tokenOutActions,
      });
    }
  };

  await Promise.all(tokens.map(({ id }) => registerToken(id)));
  const actions = await Promise.all(
    tokens.map((tk) =>
      withdrawFromAurora({
        token_id: tk.id,
        amount: Big(tk.aurora || 0).toFixed(),
        decimal: tk.decimals,
      })
    )
  );
  actions.forEach((action) =>
    transactions.push({
      receiverId: "aurora",
      functionCalls: [action],
    })
  );
  const wnear = tokens.find((t) => t.id == WRAP_NEAR_CONTRACT_ID);
  if (wnear) {
    transactions.push(
      nearWithdrawTransaction(Big(wnear.aurora || 0).toFixed())
    );
  }
  return executeMultipleTransactions(transactions, false);
};

function splitArray(arr: Array<any>, splitNum: number) {
  const result: any = [];
  const num = Math.ceil(arr.length / splitNum);
  for (let i = 0; i < num; i++) {
    const start_i = i * splitNum;
    const end_i = start_i + splitNum;
    result.push(arr.slice(start_i, end_i));
  }
  return result;
}
