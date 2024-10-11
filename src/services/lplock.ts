import getConfig from "@/utils/config";
import {
  ONE_YOCTO_NEAR,
  refFiViewFunction,
  lockerViewFunction,
} from "../utils/contract";
import { executeFarmMultipleTransactions } from "@/utils/contract";
import { storageDepositAction } from "./creator/storage";
import { getAccountId } from "../utils/wallet";
import { useEffect, useState } from "react";

export interface ILock {
  locked_balance: string;
  unlock_time_sec: number;
  token_id?: string;
}
export interface ILockerAccounts {
  account_id: string;
  locked_tokens: Record<string, ILock>;
}

const { REF_TOKEN_LOCKER_CONTRACT_ID, REF_FI_CONTRACT_ID } = getConfig();
export const currentStorageBalanceOfLocker = (
  accountId: string
): Promise<any> => {
  return lockerViewFunction({
    methodName: "storage_balance_of",
    args: { account_id: accountId },
  });
};

export const mft_has_registered = async (
  token_id: string
): Promise<boolean> => {
  return refFiViewFunction({
    methodName: "mft_has_registered",
    args: { token_id, account_id: REF_TOKEN_LOCKER_CONTRACT_ID },
  });
};

export const get_accounts_paged = async (): Promise<ILockerAccounts[]> => {
  return lockerViewFunction({
    methodName: "get_accounts_paged",
    args: { from_index: 0, limit: 300 },
  });
};

export interface ILock {
  locked_balance: string;
  unlock_time_sec: number;
  token_id?: string;
}
export interface ILockerAccounts {
  account_id: string;
  locked_tokens: Record<string, ILock>;
}

export const get_account = async (): Promise<ILockerAccounts> => {
  return lockerViewFunction({
    methodName: "get_account",
    args: { account_id: getAccountId() },
  });
};

export const checkNeedsStorageDeposit = async () => {
  let storageNeeded;
  const balance = await currentStorageBalanceOfLocker(getAccountId());

  if (!balance) {
    storageNeeded = "0.1";
  }
  return storageNeeded;
};
export const lock_lp = async ({
  token_id,
  amount,
  unlock_time_sec,
  is_mft_registered,
}: {
  token_id: string;
  amount: string;
  unlock_time_sec: number;
  is_mft_registered: boolean;
}) => {
  const transactions: any[] = [];
  const neededStorage = await checkNeedsStorageDeposit();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_TOKEN_LOCKER_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  if (!is_mft_registered) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "mft_register",
          args: {
            token_id,
            account_id: REF_TOKEN_LOCKER_CONTRACT_ID,
          },
          amount: "0.01",
        },
      ],
    });
  }
  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "mft_transfer_call",
        args: {
          receiver_id: REF_TOKEN_LOCKER_CONTRACT_ID,
          token_id,
          amount,
          msg: JSON.stringify({
            Lock: {
              unlock_time_sec,
            },
          }),
        },
        amount: ONE_YOCTO_NEAR,
        gas: "200000000000000",
      },
    ],
  });
  return executeFarmMultipleTransactions(transactions);
};
export const unlock_lp = async ({
  token_id,
  amount,
}: {
  token_id: string;
  amount: string;
}) => {
  const transactions: any[] = [];
  const neededStorage = await checkNeedsStorageDeposit();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_TOKEN_LOCKER_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  transactions.push({
    receiverId: REF_TOKEN_LOCKER_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "withdraw",
        args: { token_id, amount },
        amount: ONE_YOCTO_NEAR,
        gas: "200000000000000",
      },
    ],
  });
  return executeFarmMultipleTransactions(transactions);
};

export function useLpLocker(mftId: any) {
  const [balance, setBalance] = useState("0");
  useEffect(() => {
    getBalance();
  }, [mftId]);
  async function getBalance() {
    const locked = await get_account();
    let balance = "0";
    if (locked) {
      balance =
        locked.locked_tokens[`${getConfig().REF_FI_CONTRACT_ID}@${mftId}`]
          ?.locked_balance || "0";
      setBalance(balance);
    }
  }
  return balance;
}
