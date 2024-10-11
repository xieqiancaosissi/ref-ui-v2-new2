import getConfig from "../utils/config";
import { getAuthenticationHeaders } from "../services/signature";
import { ftGetStorageBalance } from "./ft-contract";
import { storageDepositForFTAction } from "./creator/storage";
import { executeMultipleTransactions } from "@/utils/near";
import { refFiViewFunction } from "../utils/contract";
import { getAccountId } from "../utils/wallet";
import moment from "moment";
import db from "@/db/RefDatabase";
import { toReadableNumber } from "@/utils/numbers";
import { RefFiFunctionCallOptions } from "./xref";
import { registerAccountOnToken } from "./creator/token";
import { nearDepositTransaction } from "./wrap-near";
import { Transaction } from "@/interfaces/swap";
import { ONLY_ZEROS } from "@/utils/numbers";
import { getDepositTransactions } from "./token";
import { LP_STORAGE_AMOUNT } from "@/utils/near";
import {
  TokenMetadata,
  native_usdc_has_upgrated,
  tokenFtMetadata,
} from "./ft-contract";
import getConfigV2 from "@/utils/configV2";
import { STORAGE_TO_REGISTER_WITH_FT } from "@/utils/constant";
import { ONE_YOCTO_NEAR } from "./xref";
import { storageDepositAction } from "./creator/storage";
import { withdrawAction } from "./creator/token";
import { checkTokenNeedsStorageDeposit } from "./swap/registerToken";
import { getExplorer, ExplorerType } from "@/utils/device";
import { toNonDivisibleNumber } from "@/utils/numbers";
import Big from "big.js";
import { getPool } from "./pool_detail";

const { REF_FI_CONTRACT_ID, WRAP_NEAR_CONTRACT_ID } = getConfig();
const { NO_REQUIRED_REGISTRATION_TOKEN_IDS } = getConfigV2();
const explorerType = getExplorer();
export const DEFLATION_MARK = "tknx.near";
const genUrlParams = (props: Record<string, string | number>) => {
  return Object.keys(props)
    .map((key) => key + "=" + props[key])
    .join("&");
};

export const getSearchResult = async ({
  type = "classic",
  sort = "tvl",
  limit = "100",
  offset = "0",
  farm = "false",
  hide_low_pool = "false",
  order = "desc",
  token_type = "",
  token_list = "",
  pool_id_list = "",
  onlyUseId = false,
  labels = "",
}: {
  type?: string;
  sort?: string;
  limit?: string;
  offset?: string;
  farm?: string | boolean;
  hide_low_pool?: string | boolean;
  order?: string;
  token_list?: string;
  token_type?: string;
  pool_id_list?: string;
  onlyUseId?: boolean;
  labels?: string;
}): Promise<any[]> => {
  let tktype = token_type;
  if (token_type == "all") {
    tktype = "";
  } else if (token_type == "stablecoin") {
    tktype = "stable_coin";
  }
  if (sort == "apr") {
    sort = "apy";
  }
  if (sort == "volume_24h") {
    sort = "24h";
  }

  try {
    let pools: any;
    const url = !onlyUseId
      ? `/pool/search?type=${type}&sort=${sort}&limit=${limit}&labels=${labels}&offset=${offset}&hide_low_pool=${hide_low_pool}&order_by=${order}&token_type=${tktype}&token_list=${token_list}&pool_id_list=${pool_id_list}`
      : `/pool/search?pool_id_list=${pool_id_list}`;
    pools = await fetch(getConfig().indexerUrl + url, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/pool/search"),
      },
    }).then((res) => res.json());

    if (pools?.data?.list.length > 0) {
      pools = pools.data;
      return pools;
    } else {
      pools = [];
      return [];
    }
  } catch (error) {
    return [];
  }
};

//for create pool
export const addSimpleLiquidityPool = async (
  tokenIds: string[],
  fee: number
) => {
  const storageBalances = await Promise.all(
    tokenIds.map((id) => ftGetStorageBalance(id))
  );
  const transactions: any[] = storageBalances
    .reduce((acc, sb, i) => {
      if (!sb || sb.total === "0") acc.push(tokenIds[i]);
      return acc;
    }, [])
    .map((id: any) => ({
      receiverId: id,
      functionCalls: [storageDepositForFTAction()],
    }));

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "add_simple_pool",
        args: { tokens: tokenIds, fee },
        amount: "0.05",
      },
    ],
  });

  return executeMultipleTransactions(transactions, false);
};

export const getPoolIndexTvlOR24H = async (type: string, day: any) => {
  try {
    const url = `/v3/${type}/chart/line?day=${day}`;
    const resp = await fetch(getConfig().indexerUrl + url, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders(`/v3/${type}/chart/line`),
      },
    }).then((res) => res.json());
    const waitExportMap: {
      high: number;
      low: number;
      list: number[];
      date: any[];
      totalVolume: number;
    } = {
      high: resp.data.high,
      low: resp.data.low,
      list: [],
      totalVolume: 0,
      date: [],
    };
    function timestampToDateString(timestamp: any) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}/${month}/${day}`;
    }
    waitExportMap.totalVolume = resp.data.list
      .reduce((accumulator: any, currentValue: any) => {
        const volume = parseFloat(currentValue.volume); //
        waitExportMap.list.push(Number(volume.toFixed(2))); //
        waitExportMap.date.push(timestampToDateString(currentValue.time));
        return accumulator + volume; //
      }, 0)
      .toFixed(3);
    return waitExportMap;
  } catch (error) {
    return {};
  }
};

export const getAllPoolData = async () => {
  return await fetch(getConfig().indexerUrl + "/all-pool-data", {
    method: "GET",
    headers: {
      ...getAuthenticationHeaders("/all-pool-data"),
    },
  })
    .then((res) => res.json())
    .then((res) => {
      return res.data;
    });
};

export const findSamePools = async (
  tokenList: Array<any>,
  createFee: number
) => {
  return await fetch(
    getConfig().indexerUrl +
      `/v3/pool/same?token_list=${tokenList.join(",")}&fee=${createFee}`,
    {
      method: "GET",
      headers: {
        ...getAuthenticationHeaders("/pool/same"),
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res.data;
    });
};

export const getPoolsDetailById = async ({ pool_id }: { pool_id: string }) => {
  return fetch(getConfig().indexerUrl + "/pool/detail?pool_id=" + pool_id, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/pool/detail"),
    },
  })
    .then((res) => res.json())
    .then((pools) => {
      console.log(pools);
      return pools.data;
    })
    .catch(() => {
      return [];
    });
};

export const getPoolsDetailByIds = async ({
  pool_ids,
}: {
  pool_ids: string[];
}): Promise<any[]> => {
  const ids = pool_ids.join("|");
  if (!ids) return [];

  return Promise.all(
    pool_ids.map((pool_id) => {
      return fetch(getConfig().indexerUrl + "/pool/detail?pool_id=" + pool_id, {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          ...getAuthenticationHeaders("/pool/detail"),
        },
      })
        .then((res) => res.json())
        .then((pools) => {
          return pools.data;
        })
        .catch(() => {
          return [];
        });
    })
  );
};

export const getBatchPoolDetailByIds = async (poolIds: Array<any>) => {
  const queryString = poolIds.map((id) => `pool_ids=${id}`).join("&");

  return fetch(getConfig().indexerUrl + "/v3/pool/detail?" + queryString, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      // ...getAuthenticationHeaders("/pool/detail"),
    },
  })
    .then((res) => res.json())
    .then((pools) => {
      return pools.data;
    })
    .catch(() => {
      return [];
    });
};

export const getSharesInPool = (id: number): Promise<string> => {
  return refFiViewFunction({
    methodName: "get_pool_shares",
    args: {
      pool_id: id,
      account_id: getAccountId(),
    },
  });
};

const parsePoolTxTimeStamp = (ts: string) => {
  return moment(Math.floor(Number(ts) / 1000000)).format("YYYY-MM-DD HH:mm:ss");
};

export interface ClassicPoolSwapTransaction {
  token_in: string;
  token_out: string;
  swap_in: string;
  swap_out: string;
  timestamp: string;
  tx_id: string;
  receipt_id: string;
}

export const getClassicPoolSwapRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    getConfig().indexerUrl + `/get-recent-transaction-swap?${paramString}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-recent-transaction-swap"),
      },
    }
  )
    .then((res) => res.json())
    .then((res: ClassicPoolSwapTransaction[]) => {
      return res.map((tx) => {
        return {
          ...tx,
          timestamp: parsePoolTxTimeStamp(tx.timestamp),
        };
      });
    });
};

export interface ClassicPoolLiquidtyRecentTransaction {
  method_name: string;
  timestamp: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
  tx_id: string;
  shares?: string;
  pool_id?: string;
  amounts?: string;
  receipt_id: string;
}

export const getClassicPoolLiquidtyRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    getConfig().indexerUrl + `/get-recent-transaction-liquidity?${paramString}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-recent-transaction-liquidity"),
      },
    }
  )
    .then((res) => res.json())
    .then((res: ClassicPoolLiquidtyRecentTransaction[]) => {
      return res.map((t) => ({
        ...t,
        timestamp: parsePoolTxTimeStamp(t.timestamp),
      }));
    });
};

export const getAllWatchListFromDb = async ({
  account = getAccountId()?.toString(),
}: {
  account?: string;
}) => {
  if (account) {
    return await db
      .allWatchList()
      .where({
        account,
      })
      .toArray();
  } else {
    return [];
  }
};

export const getWatchListFromDb = async ({
  pool_id,
  account = getAccountId(),
}: {
  pool_id: string;
  account?: string;
}) => {
  return await db
    .allWatchList()
    .where({
      pool_id,
      account,
    })
    .toArray();
};

export const addPoolToWatchList = async ({
  pool_id,
  account = getAccountId(),
}: {
  pool_id: string;
  account?: string;
}) => {
  return await db.watchList.put({
    id: account + "-" + pool_id,
    pool_id,
    account,
    update_time: new Date().getTime(),
  });
};
export const removePoolFromWatchList = async ({
  pool_id,
  account = getAccountId(),
}: {
  pool_id: string;
  account?: string;
}) => {
  return await db.watchList.delete(account + "-" + pool_id);
};
interface AddLiquidityToStablePoolOptions {
  id: number;
  amounts: string[];
  min_shares: string;
  tokens: TokenMetadata[];
}
export const addLiquidityToStablePool = async ({
  id,
  amounts,
  min_shares,
  tokens,
}: AddLiquidityToStablePoolOptions) => {
  // const transactions: Transaction[] = [];
  const depositTransactions = await getDepositTransactions({
    tokens,
    amounts: amounts.map((amount: any, i: number) =>
      toReadableNumber(tokens[i].decimals, amount)
    ),
  });

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: "add_stable_liquidity",
      args: { pool_id: id, amounts, min_shares },
      amount: LP_STORAGE_AMOUNT,
    },
  ];

  const transactions: Transaction[] = depositTransactions;

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [...actions],
  });

  if (tokens.map((t) => t.id).includes(WRAP_NEAR_CONTRACT_ID)) {
    const idx = tokens.findIndex((t) => t.id === WRAP_NEAR_CONTRACT_ID);

    if (idx !== -1 && !ONLY_ZEROS.test(amounts[idx])) {
      transactions.unshift(
        nearDepositTransaction(toReadableNumber(24, amounts[idx]))
      );
    }

    const registered = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);
    if (registered === null) {
      transactions.unshift({
        receiverId: WRAP_NEAR_CONTRACT_ID,
        functionCalls: [registerAccountOnToken()],
      });
    }
  }

  return executeMultipleTransactions(transactions, false);
};

interface RemoveLiquidityFromStablePoolOptions {
  id: number;
  shares: string;
  min_amounts: string[];
  tokens: TokenMetadata[];
  unregister?: boolean;
}
// todo by shares
export const removeLiquidityFromStablePool = async ({
  id,
  shares,
  min_amounts,
  tokens,
  unregister = false,
}: RemoveLiquidityFromStablePoolOptions) => {
  const tokenIds = tokens.map((token) => token.id);

  const withDrawTransactions: Transaction[] = [];

  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];
    const ftBalance = await ftGetStorageBalance(tokenId);
    if (ftBalance === null) {
      if (NO_REQUIRED_REGISTRATION_TOKEN_IDS.includes(tokenId)) {
        const r = await native_usdc_has_upgrated(tokenId);
        if (r) {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              storageDepositAction({
                registrationOnly: true,
                amount: STORAGE_TO_REGISTER_WITH_FT,
              }),
            ],
          });
        } else {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              {
                methodName: "register_account",
                args: {
                  account_id: getAccountId(),
                },
                gas: "10000000000000",
              },
            ],
          });
        }
      } else {
        withDrawTransactions.unshift({
          receiverId: tokenId,
          functionCalls: [
            storageDepositAction({
              registrationOnly: true,
              amount: STORAGE_TO_REGISTER_WITH_FT,
            }),
          ],
        });
      }
    }
  }

  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    withDrawTransactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  const withdrawActions = tokenIds.map((tokenId) =>
    withdrawAction({ tokenId, amount: "0", unregister })
  );

  const withdrawActionsFireFox = tokenIds.map((tokenId, i) =>
    withdrawAction({ tokenId, amount: "0", unregister, singleTx: true })
  );

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: "remove_liquidity",
      args: {
        pool_id: id,
        shares,
        min_amounts,
      },
      amount: ONE_YOCTO_NEAR,
      gas: "30000000000000",
    },
  ];
  let need_split = false;
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  if (selectedWalletId == "ledger") {
    need_split = true;
  }
  if (explorerType !== ExplorerType.Firefox && !need_split) {
    withdrawActions.forEach((item) => {
      actions.push(item);
    });
  }

  const transactions: Transaction[] = [
    ...withDrawTransactions,
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [...actions],
    },
  ];
  if (explorerType !== ExplorerType.Firefox && need_split) {
    withdrawActions.forEach((withdraw) => {
      transactions.push({
        receiverId: REF_FI_CONTRACT_ID,
        functionCalls: [withdraw],
      });
    });
  }

  if (explorerType === ExplorerType.Firefox) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: withdrawActionsFireFox,
    });
  }

  // if (
  //   tokenIds.includes(WRAP_NEAR_CONTRACT_ID) &&
  //   !ONLY_ZEROS.test(min_amounts[tokenIds.indexOf(WRAP_NEAR_CONTRACT_ID)])
  // ) {
  //   transactions.push(
  //     nearWithdrawTransaction(
  //       toReadableNumber(
  //         nearMetadata.decimals,
  //         min_amounts[tokenIds.indexOf(WRAP_NEAR_CONTRACT_ID)]
  //       )
  //     )
  //   );
  // }

  return executeMultipleTransactions(transactions, false);
};

export const predictRemoveLiquidityByTokens = async (
  pool_id: number,
  amounts: string[]
): Promise<string> => {
  return refFiViewFunction({
    methodName: "predict_remove_liquidity_by_tokens",
    args: { pool_id, amounts },
  });
};

interface RemoveLiquidityByTokensFromStablePoolOptions {
  id: number;
  amounts: string[];
  max_burn_shares: string;
  tokens: TokenMetadata[];
  unregister?: boolean;
}

// todo by tokens
export const removeLiquidityByTokensFromStablePool = async ({
  id,
  amounts,
  max_burn_shares,
  tokens,
  unregister = false,
}: RemoveLiquidityByTokensFromStablePoolOptions) => {
  const tokenIds = tokens.map((token) => token.id);
  const withDrawTransactions: Transaction[] = [];

  for (let i = 0; i < tokenIds.length; i++) {
    if (ONLY_ZEROS.test(amounts[i])) continue;

    const tokenId = tokenIds[i];

    const ftBalance = await ftGetStorageBalance(tokenId);
    if (ftBalance === null) {
      if (NO_REQUIRED_REGISTRATION_TOKEN_IDS.includes(tokenId)) {
        const r = await native_usdc_has_upgrated(tokenId);
        if (r) {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              storageDepositAction({
                registrationOnly: true,
                amount: STORAGE_TO_REGISTER_WITH_FT,
              }),
            ],
          });
        } else {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              {
                methodName: "register_account",
                args: {
                  account_id: getAccountId(),
                },
                gas: "10000000000000",
              },
            ],
          });
        }
      } else {
        withDrawTransactions.unshift({
          receiverId: tokenId,
          functionCalls: [
            storageDepositAction({
              registrationOnly: true,
              amount: STORAGE_TO_REGISTER_WITH_FT,
            }),
          ],
        });
      }
    }
  }

  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    withDrawTransactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  const withdrawActions = tokenIds
    .filter((tk, i) => !ONLY_ZEROS.test(amounts[i]))
    .map((tokenId) => withdrawAction({ tokenId, amount: "0", unregister }));

  const withdrawActionsFireFox = tokenIds
    .filter((tk, i) => !ONLY_ZEROS.test(amounts[i]))
    .map((tokenId, i) =>
      withdrawAction({ tokenId, amount: "0", unregister, singleTx: true })
    );

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: "remove_liquidity_by_tokens",
      args: { pool_id: id, amounts, max_burn_shares },
      amount: ONE_YOCTO_NEAR,
      gas: "30000000000000",
    },
  ];
  let need_split = false;
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  if (selectedWalletId == "ledger" || selectedWalletId == "mintbase-wallet") {
    need_split = true;
  }
  if (explorerType !== ExplorerType.Firefox && !need_split) {
    withdrawActions.forEach((item) => {
      actions.push(item);
    });
  }

  const transactions: Transaction[] = [
    ...withDrawTransactions,
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [...actions],
    },
  ];
  if (explorerType !== ExplorerType.Firefox && need_split) {
    withdrawActions.forEach((withdraw) => {
      transactions.push({
        receiverId: REF_FI_CONTRACT_ID,
        functionCalls: [withdraw],
      });
    });
  }

  if (explorerType === ExplorerType.Firefox) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: withdrawActionsFireFox,
    });
  }

  // if (
  //   tokenIds.includes(WRAP_NEAR_CONTRACT_ID) &&
  //   !ONLY_ZEROS.test(amounts[tokenIds.indexOf(WRAP_NEAR_CONTRACT_ID)])
  // ) {
  //   transactions.push(
  //     nearWithdrawTransaction(
  //       toReadableNumber(
  //         nearMetadata.decimals,
  //         amounts[tokenIds.indexOf(WRAP_NEAR_CONTRACT_ID)]
  //       )
  //     )
  //   );
  // }

  return executeMultipleTransactions(transactions, false);
};

interface AddLiquidityToPoolOptions {
  id: number;
  tokenAmounts: { token: TokenMetadata; amount: string }[];
}
export const addLiquidityToPool = async ({
  id,
  tokenAmounts,
}: AddLiquidityToPoolOptions) => {
  let amounts = tokenAmounts.map(({ token, amount }) =>
    toNonDivisibleNumber(token?.decimals, amount)
  );
  const transactions = await getDepositTransactions({
    tokens: tokenAmounts.map(({ token, amount }) => token),
    amounts: tokenAmounts.map(({ token, amount }) => amount),
  });
  // add deflation calc logic
  const tknx_tokens = tokenAmounts
    .map((item) => item.token)
    .filter((token) => token.id.includes(DEFLATION_MARK));
  if (tknx_tokens.length > 0) {
    const pending = tknx_tokens.map((token) => tokenFtMetadata(token.id));
    const tokenFtMetadatas = await Promise.all(pending);
    const rate = tokenFtMetadatas.reduce((acc, cur, index) => {
      const is_owner = cur.owner_account_id == getAccountId();
      return {
        ...acc,
        [tknx_tokens[index].id]: is_owner
          ? 0
          : (cur?.deflation_strategy?.fee_strategy?.SellFee?.fee_rate ?? 0) +
            (cur?.deflation_strategy?.burn_strategy?.SellBurn?.burn_rate ?? 0),
      };
    }, {});
    amounts = tokenAmounts.map(({ token, amount }) => {
      const reforeAmount = toNonDivisibleNumber(token.decimals, amount);
      let afterAmount = reforeAmount;
      if (rate[token.id]) {
        afterAmount = Big(1 - rate[token.id] / 1000000)
          .mul(reforeAmount)
          .toFixed(0);
      }
      return afterAmount;
    });
  }
  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: "add_liquidity",
      args: { pool_id: +id, amounts },
      amount: LP_STORAGE_AMOUNT,
    },
  ];

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [...actions],
  });

  const wNearTokenAmount = tokenAmounts.find(
    (TA) => TA.token.id === WRAP_NEAR_CONTRACT_ID
  );

  if (wNearTokenAmount && !ONLY_ZEROS.test(wNearTokenAmount.amount)) {
    transactions.unshift(nearDepositTransaction(wNearTokenAmount.amount));
  }

  if (tokenAmounts.map((ta) => ta.token.id).includes(WRAP_NEAR_CONTRACT_ID)) {
    const registered = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);
    if (registered === null) {
      transactions.unshift({
        receiverId: WRAP_NEAR_CONTRACT_ID,
        functionCalls: [registerAccountOnToken()],
      });
    }
  }

  return executeMultipleTransactions(transactions, false);
};

interface RemoveLiquidityOptions {
  id: number;
  shares: string;
  minimumAmounts: { [tokenId: string]: string };
  unregister?: boolean;
}

export const removeLiquidityFromPool = async ({
  id,
  shares,
  minimumAmounts,
  unregister = false,
}: RemoveLiquidityOptions) => {
  const pool = await getPool(id);

  const amounts = pool.tokenIds.map((tokenId: any) => minimumAmounts[tokenId]);

  const tokenIds = Object.keys(minimumAmounts);

  const withDrawTransactions: Transaction[] = [];

  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];

    const ftBalance = await ftGetStorageBalance(tokenId);
    if (ftBalance === null) {
      if (NO_REQUIRED_REGISTRATION_TOKEN_IDS.includes(tokenId)) {
        const r = await native_usdc_has_upgrated(tokenId);
        if (r) {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              storageDepositAction({
                registrationOnly: true,
                amount: STORAGE_TO_REGISTER_WITH_FT,
              }),
            ],
          });
        } else {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              {
                methodName: "register_account",
                args: {
                  account_id: getAccountId(),
                },
                gas: "10000000000000",
              },
            ],
          });
        }
      } else {
        withDrawTransactions.unshift({
          receiverId: tokenId,
          functionCalls: [
            storageDepositAction({
              registrationOnly: true,
              amount: STORAGE_TO_REGISTER_WITH_FT,
            }),
          ],
        });
      }
    }
  }

  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    withDrawTransactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  const withdrawActions = tokenIds.map((tokenId, i) =>
    withdrawAction({ tokenId, amount: "0", unregister })
  );

  const withdrawActionsFireFox = tokenIds.map((tokenId, i) =>
    withdrawAction({ tokenId, amount: "0", unregister, singleTx: true })
  );

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: "remove_liquidity",
      args: {
        pool_id: id,
        shares,
        min_amounts: amounts,
      },
      amount: ONE_YOCTO_NEAR,
      gas: "30000000000000",
    },
  ];
  if (explorerType !== ExplorerType.Firefox) {
    withdrawActions.forEach((item) => {
      actions.push(item);
    });
  }

  const transactions: Transaction[] = [
    ...withDrawTransactions,
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [...actions],
    },
  ];

  if (explorerType === ExplorerType.Firefox) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: withdrawActionsFireFox,
    });
  }

  // if (
  //   tokenIds.includes(WRAP_NEAR_CONTRACT_ID) &&
  //   !ONLY_ZEROS.test(minimumAmounts[WRAP_NEAR_CONTRACT_ID])
  // ) {
  //   transactions.push(
  //     nearWithdrawTransaction(
  //       toReadableNumber(
  //         nearMetadata.decimals,
  //         minimumAmounts[WRAP_NEAR_CONTRACT_ID]
  //       )
  //     )
  //   );
  // }

  return executeMultipleTransactions(transactions, false);
};

export const predictRemoveLiquidity = async (
  pool_id: number,
  shares: string
): Promise<[]> => {
  return refFiViewFunction({
    methodName: "predict_remove_liquidity",
    args: { pool_id, shares },
  });
};
