import BN from "bn.js";
import { getAccountId } from "@/utils/wallet";
import {
  RefFiFunctionCallOptions,
  REF_FI_CONTRACT_ID,
  refFiViewFunction,
  REF_UNI_V3_SWAP_CONTRACT_ID,
} from "@/utils/contract";
import getConfig from "@/utils/config";

export const STORAGE_PER_TOKEN = "0.005";
export const STORAGE_TO_REGISTER_WITH_FT = "0.1";
export const STORAGE_TO_REGISTER_WITH_MFT = "0.1";
export const MIN_DEPOSIT_PER_TOKEN = new BN("5000000000000000000000");
export const MIN_DEPOSIT_PER_TOKEN_FARM = new BN("45000000000000000000000");
export const ONE_MORE_DEPOSIT_AMOUNT = "0.01";

interface StorageDepositActionOptions {
  accountId?: string;
  registrationOnly?: boolean;
  amount: string;
}
export const storageDepositAction = ({
  accountId = getAccountId(),
  registrationOnly = false,
  amount,
}: StorageDepositActionOptions): RefFiFunctionCallOptions => ({
  methodName: "storage_deposit",
  args: {
    account_id: accountId,
    registration_only: registrationOnly,
  },
  amount,
});

export const storageDepositForTokenAction = (
  accountId: string = getAccountId()
): RefFiFunctionCallOptions =>
  storageDepositAction({
    accountId,
    amount: STORAGE_PER_TOKEN,
  });

export const storageDepositForFTAction = () =>
  storageDepositAction({
    accountId: REF_FI_CONTRACT_ID,
    amount: STORAGE_TO_REGISTER_WITH_FT,
    registrationOnly: true,
  });

export const storageDepositForMFTAction = () =>
  storageDepositAction({
    accountId: getConfig().REF_FARM_CONTRACT_ID,
    amount: STORAGE_TO_REGISTER_WITH_MFT,
  });

export const needDepositStorage = async (accountId = getAccountId()) => {
  const storage = await refFiViewFunction({
    methodName: "get_user_storage_state",
    args: { account_id: accountId },
  });

  return new BN(storage?.deposit).lte(new BN(storage?.usage));
};
export const storageDepositForV3Action = () =>
  storageDepositAction({
    accountId: REF_UNI_V3_SWAP_CONTRACT_ID,
    amount: STORAGE_TO_REGISTER_WITH_FT,
    registrationOnly: true,
  });
