import { ONE_YOCTO_NEAR } from "../utils/contract";
import getConfig from "../utils/config";
import { Transaction } from "./farm";
import { TokenMetadata } from "./ft-contract";
import { utils } from "near-api-js";
import { NEAR_META_DATA } from "../utils/nearMetaData";

export const { WRAP_NEAR_CONTRACT_ID } = getConfig();
export const NEW_ACCOUNT_STORAGE_COST = "0.00125";

export const nearMetadata: TokenMetadata = NEAR_META_DATA;

export const wnearMetadata: TokenMetadata = {
  id: WRAP_NEAR_CONTRACT_ID,
  name: "wNEAR",
  symbol: "wNEAR",
  decimals: 24,
  icon: "https://img.ref.finance/images/w-NEAR-no-border.png",
};

export const nearWithdrawTransaction = (amount: string) => {
  const transaction: Transaction = {
    receiverId: WRAP_NEAR_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "near_withdraw",
        args: { amount: utils.format.parseNearAmount(amount) },
        amount: ONE_YOCTO_NEAR,
      },
    ],
  };
  return transaction;
};

export const nearDepositTransaction = (amount: string) => {
  const transaction: Transaction = {
    receiverId: WRAP_NEAR_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "near_deposit",
        args: {},
        gas: "50000000000000",
        amount,
      },
    ],
  };

  return transaction;
};
