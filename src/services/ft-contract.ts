import { getAccountId } from "@/utils/wallet";
import { viewFunction } from "@/utils/near";
import getConfigV2 from "@/utils/configV2";
import getConfig from "@/utils/config";
import { nearMetadata } from "./wrap-near";
import { refFiViewFunction } from "@/utils/contract";
import { REF_UNI_V3_SWAP_CONTRACT_ID } from "@/utils/contract";
const configV2 = getConfigV2();
export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  ref?: number | string;
  near?: number | string;
  aurora?: number | string;
  total?: number;
  onRef?: boolean;
  onTri?: boolean;
  amountLabel?: string;
  amount?: number;
  dcl?: number | string;
  inner?: number | string;
  nearNonVisible?: number | string;
  t_value?: string;
  isRisk?: boolean;
}

export interface FTStorageBalance {
  total: string;
  available: string;
}

export const ftGetStorageBalanceContract = async (
  tokenId: string
): Promise<any | null> => {
  return ftViewFunction(tokenId, {
    methodName: "storage_balance_of",
    args: { account_id: REF_UNI_V3_SWAP_CONTRACT_ID },
  });
};

export const ftGetStorageBalance = async (
  tokenId: string
): Promise<any | null> => {
  return ftViewFunction(tokenId, {
    methodName: "storage_balance_of",
    args: { account_id: getAccountId() },
  });
};

export const currentStorageBalance = (accountId: string): Promise<any> => {
  return refFiViewFunction({
    methodName: "storage_balance_of",
    args: { account_id: accountId },
  });
};

export const ftViewFunction = (tokenId: string, { methodName, args }: any) => {
  return viewFunction({
    contractId: tokenId,
    methodName,
    args,
  });
};

export const unWrapToken = (token: TokenMetadata, keepId?: boolean) => {
  if (token.id === getConfig().WRAP_NEAR_CONTRACT_ID)
    return { ...nearMetadata, id: keepId ? token.id : nearMetadata.id };
  else return token;
};

export const native_usdc_has_upgrated = async (
  tokenId: string,
  accountId = getAccountId()
) => {
  try {
    await ftViewFunction(tokenId, {
      methodName: "storage_balance_of",
      args: { account_id: accountId },
    });
    return true;
  } catch (error) {
    await check_registration(tokenId).then((is_registration) => {
      if (is_registration) {
        return new Promise((resove) => {
          resove({ available: "1", total: "1" });
        });
      } else {
        return new Promise((resove) => {
          resove(null);
        });
      }
    });
    return false;
  }
};

export const check_registration = (
  tokenId: string,
  accountId = getAccountId()
): Promise<FTStorageBalance | null> => {
  return ftViewFunction(tokenId, {
    methodName: "check_registration",
    args: { account_id: accountId },
  });
};

export const tokenFtMetadata = async (tokenId: string) => {
  const metadata = await ftViewFunction(tokenId, {
    methodName: "tknx_metadata",
  });
  return metadata;
};
