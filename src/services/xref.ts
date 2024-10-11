import getConfig from "@/utils/config";
import { RefFiViewFunctionOptions } from "@/utils/contract";
import { executeMultipleTransactions, getAccount } from "@/utils/near";
import { toNonDivisibleNumber } from "@/utils/numbers";
import { ftGetStorageBalance } from "./ft-contract";
import { getAccountId } from "@/utils/wallet";
import { NEW_ACCOUNT_STORAGE_COST } from "./wrap-near";
import { checkTokenNeedsStorageDeposit } from "./swap/registerToken";
import { storageDepositAction } from "./creator/storage";

const config = getConfig();
export const XREF_TOKEN_ID = config.XREF_TOKEN_ID;
export const REF_TOKEN_ID = config.REF_TOKEN_ID;
export const REF_FI_CONTRACT_ID = config.REF_FI_CONTRACT_ID;
export const XREF_TOKEN_DECIMALS = 18;
export const ONE_YOCTO_NEAR = "0.000000000000000000000001";

export const getPrice = async () => {
  return await refContractViewFunction({
    methodName: "get_virtual_price",
  }).catch(() => {
    return "0";
  });
};

export interface RefContractViewFunctionOptions
  extends RefFiViewFunctionOptions {
  gas?: string;
  amount?: string;
  contractId?: string;
}
export async function refContractViewFunction({
  methodName,
  args,
}: RefContractViewFunctionOptions) {
  const account = await getAccount();
  return account.viewFunction({ contractId: XREF_TOKEN_ID, methodName, args });
}

export const metadata = async () => {
  return await refContractViewFunction({
    methodName: "contract_metadata",
  });
};

interface StakeOptions {
  amount: string;
  msg?: string;
}

export interface RefFiFunctionCallOptions extends RefFiViewFunctionOptions {
  gas?: string;
  amount?: string;
  deposit?: string;
}

export interface Transaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

export const stake = async ({ amount, msg = "" }: StakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_TOKEN_ID,
      functionCalls: [
        {
          methodName: "ft_transfer_call",
          args: {
            receiver_id: XREF_TOKEN_ID,
            amount: toNonDivisibleNumber(XREF_TOKEN_DECIMALS, amount),
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: "50000000000000",
        },
      ],
    },
  ];

  const balance = await ftGetStorageBalance(XREF_TOKEN_ID);

  if (!balance || balance.total === "0") {
    transactions.unshift({
      receiverId: XREF_TOKEN_ID,
      functionCalls: [
        {
          methodName: "storage_deposit",
          args: {
            account_id: getAccountId(),
            registration_only: true,
          },
          gas: "50000000000000",
          amount: NEW_ACCOUNT_STORAGE_COST,
        },
      ],
    });
  }

  const needDeposit = await checkTokenNeedsStorageDeposit();
  if (needDeposit) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: needDeposit })],
    });
  }

  return executeMultipleTransactions(transactions, false);
};

interface UnstakeOptions {
  amount: string;
  msg?: string;
}
export const unstake = async ({ amount, msg = "" }: UnstakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: XREF_TOKEN_ID,
      functionCalls: [
        {
          methodName: "unstake",
          args: {
            amount: toNonDivisibleNumber(XREF_TOKEN_DECIMALS, amount),
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: "100000000000000",
        },
      ],
    },
  ];
  const balance = await ftGetStorageBalance(REF_TOKEN_ID);

  if (!balance) {
    transactions.unshift({
      receiverId: REF_TOKEN_ID,
      functionCalls: [
        {
          methodName: "storage_deposit",
          args: {
            account_id: getAccountId(),
            registration_only: true,
          },
          gas: "50000000000000",
          amount: NEW_ACCOUNT_STORAGE_COST,
        },
      ],
    });
  }
  const needDeposit = await checkTokenNeedsStorageDeposit();
  if (needDeposit) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: needDeposit })],
    });
  }

  return executeMultipleTransactions(transactions, false);
};
