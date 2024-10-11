import * as math from "mathjs";
import BN from "bn.js";
import getConfig from "@/utils/config";
import { Transaction } from "@/interfaces/wallet";
import { executeMultipleTransactions } from "@/utils/near";
import { ONE_YOCTO_NEAR } from "@/utils/contract";
import { RefFiFunctionCallOptions } from "@/interfaces/wallet";
import {
  ftGetStorageBalance,
  currentStorageBalance,
} from "@/services/ft-contract";
import { getAccountId } from "@/utils/wallet";
import {
  needDepositStorage,
  ONE_MORE_DEPOSIT_AMOUNT,
  STORAGE_PER_TOKEN,
  MIN_DEPOSIT_PER_TOKEN,
  storageDepositAction,
  storageDepositForFTAction,
} from "@/services/creator/storage";

const config = getConfig();
const { REF_FI_CONTRACT_ID } = config;
const registerTokenAndExchange = async (tokenId: string) => {
  const transactions: Transaction[] = [];
  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: "register_tokens",
      args: { token_ids: [tokenId] },
      amount: ONE_YOCTO_NEAR,
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit();

  if (neededStorage) {
    actions.unshift(storageDepositAction({ amount: neededStorage }));
  }

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: actions,
  });

  const exchangeBalanceAtFt = await ftGetStorageBalance(tokenId);
  if (!exchangeBalanceAtFt) {
    transactions.push({
      receiverId: tokenId,
      functionCalls: [storageDepositForFTAction()],
    });
  }

  return executeMultipleTransactions(transactions);
};

export const checkTokenNeedsStorageDeposit = async () => {
  let storageNeeded: math.MathType = 0;
  const needDeposit = await needDepositStorage();
  if (needDeposit) {
    storageNeeded = Number(ONE_MORE_DEPOSIT_AMOUNT);
  } else {
    const balance = await Promise.resolve(
      currentStorageBalance(getAccountId())
    );

    if (!balance) {
      storageNeeded = math.add(storageNeeded, Number(STORAGE_PER_TOKEN));
    }

    if (new BN(balance?.available || "0").lt(MIN_DEPOSIT_PER_TOKEN)) {
      storageNeeded = math.add(storageNeeded, Number(STORAGE_PER_TOKEN));
    }
  }

  return storageNeeded ? storageNeeded.toString() : "";
};

export default registerTokenAndExchange;
