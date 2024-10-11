import getConfig from "../utils/config";
import { getAccountId } from "../utils/wallet";
import { getAccount, viewFunction } from "../utils/near";
import db from "@/db/RefDatabase";
import metadataDefaults from "@/utils/tokenIconConfig";
import { NEAR_META_DATA } from "@/utils/nearMetaData";
import { TokenMetadata, ftViewFunction } from "./ft-contract";
import { Transaction } from "@/interfaces/swap";
import { STORAGE_TO_REGISTER_WITH_FT } from "@/utils/constant";
import {
  ONLY_ZEROS,
  toNonDivisibleNumber,
  toReadableNumber,
} from "@/utils/numbers";
import { ONE_YOCTO_NEAR } from "./xref";
import { ftGetStorageBalance } from "./ft-contract";
import { REF_FI_CONTRACT_ID } from "@/utils/contract";
import { registerTokenAction } from "./creator/token";
import { checkTokenNeedsStorageDeposit } from "./swap/registerToken";
import { storageDepositAction } from "./creator/storage";
import { refFiViewFunction } from "@/utils/contract";
import { useEffect, useState } from "react";
import { NEAR_META_TX_DATA } from "@/utils/nearMetaData";
import { useAppStore } from "@/stores/app";

const specialToken = "pixeltoken.near";
const { WRAP_NEAR_CONTRACT_ID } = getConfig();
const BANANA_ID = "berryclub.ek.near";
const CHEDDAR_ID = "token.cheddar.near";
const CUCUMBER_ID = "farm.berryclub.ek.near";
const HAPI_ID = "d9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near";
const WOO_ID = "4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near";
const SOL_ID = "sol.token.a11bd.near";
const FRAX_ID = "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near";
const BLACKDRAGON_ID = "blackdragon.tkn.near";
const SOL_NATIVE_ID = "22.contract.portalbridge.near";
const BABY_BLACKDRAGON_ID = "babyblackdragon.tkn.near";
const INTEL_ID = "intel.tkn.near";
const XREF_ID = "xtoken.ref-finance.near";
const PORTALBRIDGE_ID = "16.contract.portalbridge.near";

export async function ftGetTokenMetadata(
  tokenId: string,
  accountPage?: boolean
) {
  try {
    if (tokenId == "near" || tokenId == "NEAR") {
      return NEAR_META_TX_DATA;
    }
    let metadata: any = await db
      .allTokens()
      .where({ id: String(tokenId) })
      .first();
    if (!metadata) {
      metadata = await viewFunction({
        contractId: tokenId,
        methodName: "ft_metadata",
        args: {},
      });
      await db.allTokens().put({
        id: tokenId,
        name: metadata.name,
        symbol: metadata.symbol,
        decimals: metadata.decimals,
        icon: metadata.icon,
      });
    }
    if (metadata.id === WRAP_NEAR_CONTRACT_ID) {
      if (accountPage)
        return {
          ...metadata,
          icon: metadataDefaults[WRAP_NEAR_CONTRACT_ID],
        };
      return {
        ...metadata,
        icon: NEAR_META_DATA.icon,
        symbol: "NEAR",
      };
    } else if (
      !metadata.icon ||
      metadata.id === BANANA_ID ||
      metadata.id === CHEDDAR_ID ||
      metadata.id === CUCUMBER_ID ||
      metadata.id === HAPI_ID ||
      metadata.id === WOO_ID ||
      metadata.id === WRAP_NEAR_CONTRACT_ID ||
      metadata.id === SOL_ID ||
      metadata.id === BLACKDRAGON_ID ||
      metadata.id === FRAX_ID ||
      metadata.id === SOL_NATIVE_ID ||
      metadata.id === BABY_BLACKDRAGON_ID ||
      metadata.id === INTEL_ID ||
      metadata.id === XREF_ID ||
      metadata.id === PORTALBRIDGE_ID
    ) {
      metadata.icon = metadataDefaults[tokenId];
      if (metadata.id === SOL_ID) {
        metadata.symbol = "SOL.Allbridge";
      }
      if (metadata.id === PORTALBRIDGE_ID) {
        metadata.symbol = "USDC.w";
      }
    }
    return {
      id: tokenId,
      ...metadata,
    };
  } catch (err) {
    return {
      id: tokenId,
      name: tokenId,
      symbol: tokenId?.split(".")[0].slice(0, 8),
      decimals: 6,
      icon: null,
    };
  }
}
export const ftGetTokensMetadata = async (tokenIds: string[]) => {
  const tokensMetadata = await Promise.all(
    tokenIds.map((id: string) => ftGetTokenMetadata(id))
  );

  return tokensMetadata.reduce((pre, cur, i) => {
    return {
      ...pre,
      [tokenIds[i]]: cur,
    };
  }, {});
};

export const getAccountNearBalance = async () => {
  const account = await getAccount();
  return account
    .getAccountBalance()
    .then(({ available }) => ({ available }))
    .catch(() => {
      return { available: "0" };
    });
};

export const getGlobalWhitelist = async (): Promise<string[]> => {
  const globalWhitelist = await viewFunction({
    contractId: getConfig().REF_FI_CONTRACT_ID as string,
    methodName: "get_whitelisted_tokens",
  });
  return [...new Set<string>([...globalWhitelist])];
};
export const getAccountWhitelist = async (
  accountId: string = getAccountId()
): Promise<string[]> => {
  const accountWhitelist = await viewFunction({
    contractId: getConfig().REF_FI_CONTRACT_ID as string,
    methodName: "get_user_whitelisted_tokens",
    args: { account_id: accountId },
  });
  return [...new Set<string>([...accountWhitelist])];
};

export const get_auto_whitelisted_postfix_list = async (): Promise<
  string[]
> => {
  const metadata = await viewFunction({
    contractId: getConfig().REF_FI_CONTRACT_ID as string,
    methodName: "metadata",
  });
  return metadata.auto_whitelisted_postfix;
};

export const ftGetBalance = (tokenId: string, account_id?: string) => {
  if (tokenId === "NEAR" || tokenId == "wrap.near") {
    return getAccountNearBalance().then(({ available }: any) => available);
  }
  return viewFunction({
    contractId: tokenId,
    methodName: "ft_balance_of",
    args: {
      account_id: getAccountId(),
    },
  }).catch(() => "0");
};

export const getWhitelistedTokens = async (): Promise<string[]> => {
  let userWhitelist = [];
  const globalWhitelist = await refFiViewFunction({
    methodName: "get_whitelisted_tokens",
  });
  if (getAccountId()) {
    userWhitelist = await refFiViewFunction({
      methodName: "get_user_whitelisted_tokens",
      args: { account_id: getAccountId() },
    });
  }

  return [...new Set<string>([...globalWhitelist, ...userWhitelist])];
};

export const getDepositTransactions = async ({
  tokens,
  amounts,
  msgs,
}: {
  tokens: TokenMetadata[];
  amounts: string[];
  msgs?: string[];
}) => {
  const whitelist = await getWhitelistedTokens();

  const transactions: Transaction[] = [];

  for (let i = 0; i < tokens.length; i++) {
    if (ONLY_ZEROS.test(amounts[i])) continue;
    const token = tokens[i];
    const gasFee =
      token.id === specialToken ? "150000000000000" : "100000000000000";
    transactions.unshift({
      receiverId: token.id,
      functionCalls: [
        {
          methodName: "ft_transfer_call",
          args: {
            receiver_id: REF_FI_CONTRACT_ID,
            amount: toNonDivisibleNumber(token.decimals, amounts[i]),
            msg: msgs?.[i] || "",
          },
          amount: ONE_YOCTO_NEAR,
          gas: gasFee,
        },
      ],
    });

    const exchangeBalanceAtFt = await ftGetStorageBalance(token.id);

    if (!exchangeBalanceAtFt) {
      transactions.unshift({
        receiverId: token.id,
        functionCalls: [
          {
            methodName: "storage_deposit",
            args: {
              account_id: REF_FI_CONTRACT_ID,
              registration_only: true,
            },
            amount: STORAGE_TO_REGISTER_WITH_FT,
            gas: "30000000000000",
          },
        ],
      });
    }

    if (!whitelist.includes(token.id)) {
      transactions.unshift({
        receiverId: REF_FI_CONTRACT_ID,
        functionCalls: [registerTokenAction(token.id)],
      });
    }
  }

  const neededStorage = await checkTokenNeedsStorageDeposit();

  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  return transactions;
};

export const getWhitelistedTokensAndNearTokens = async (): Promise<
  string[]
> => {
  const requestAll = [];
  const request1 = refFiViewFunction({
    methodName: "get_whitelisted_tokens",
  });
  requestAll.push(request1);
  const request2 = refFiViewFunction({
    methodName: "get_user_whitelisted_tokens",
    args: { account_id: getAccountId() },
  });
  requestAll.push(request2);
  const [globalWhitelist = [], userWhitelist = []] = await Promise.all(
    requestAll
  );

  return [
    ...new Set<string>([
      ...globalWhitelist,
      ...userWhitelist,
      getConfig().REF_VE_CONTRACT_ID,
    ]),
  ];
};

export const getTokenBalances = (): Promise<{
  [tokenId: string]: string;
}> => {
  return refFiViewFunction({
    methodName: "get_deposits",
    args: { account_id: getAccountId() },
  });
};

export const useTokenBalances = () => {
  const appStore = useAppStore();
  const personalDataUpdatedSerialNumber =
    appStore.getPersonalDataUpdatedSerialNumber();
  const [balances, setBalances] = useState<{
    [tokenId: string]: string;
  }>();
  const accountId = getAccountId();

  const isSignedIn = !!accountId;

  useEffect(() => {
    if (!isSignedIn) return;
    getTokenBalances()
      .then(setBalances)
      .catch(() => setBalances({}));
  }, [isSignedIn, accountId, personalDataUpdatedSerialNumber]);

  return balances;
};

export const farmGetBalance = (tokenId: string, account_id?: string) => {
  if (tokenId === "NEAR") {
    return getAccountNearBalance().then(({ available }: any) => available);
  }
  return ftViewFunction(tokenId, {
    methodName: "ft_balance_of",
    args: {
      account_id: account_id || getAccountId(),
    },
  }).catch(() => "0");
};

export const getDepositableBalance = async (
  tokenId: string,
  decimals?: number
) => {
  const safeDecimals = decimals || 0;
  if (tokenId === "NEAR") {
    return getAccountNearBalance().then(({ available }: any) => {
      return toReadableNumber(safeDecimals, available);
    });
  } else if (tokenId) {
    return farmGetBalance(tokenId)
      .then((res: string) => {
        return toReadableNumber(safeDecimals, res);
      })
      .catch((res: any) => "0");
  } else {
    return "";
  }
};

export const getTokenBalance = (tokenId: string) => {
  if (tokenId === "NEAR") {
    return getAccountNearBalance().then(({ available }: any) => available);
  }
  return viewFunction({
    contractId: tokenId,
    methodName: "ft_balance_of",
    args: {
      account_id: getAccountId(),
    },
  }).catch(() => "0");
};
