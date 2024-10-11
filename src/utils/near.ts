import { keyStores, utils, connect, Contract } from "near-api-js";
import { Transaction as WSTransaction } from "@near-wallet-selector/core";
import BN from "bn.js";
import { getCurrentWallet } from "../utils/wallet";
import { Transaction } from "../interfaces/wallet";
import getConfig from "../utils/config";
import { getSelectedWalletId, webWalletIds } from "../utils/wallet";
import {
  ledgerTipTrigger,
  ledgerTipClose,
} from "@/components/common/ledger/ledger";
import { IExecutionResult } from "@/interfaces/wallet";
import {
  addQueryParams,
  TRANSACTION_WALLET_TYPE,
} from "../utils/transactionsPopup";
const config = getConfig();

export const ONE_YOCTO_NEAR = "0.000000000000000000000001";
export const LP_STORAGE_AMOUNT = "0.01";
export const executeMultipleTransactions = async (
  transactions: Transaction[],
  reloadAfterTransaction = true,
  callbackUrl?: string
) => {
  const wstransactions: WSTransaction[] = [];

  transactions.forEach((transaction) => {
    wstransactions.push({
      signerId: window.accountId,
      receiverId: transaction.receiverId,
      actions: transaction.functionCalls.map((fc) => {
        return {
          type: "FunctionCall",
          params: {
            methodName: fc.methodName,
            args: fc.args || {},
            gas: getGas(fc.gas).toNumber().toFixed(),
            deposit: utils.format.parseNearAmount(fc.amount || "0")!,
          },
        };
      }),
    });
  });
  const selectedWalletId = getSelectedWalletId();
  ledgerTipTrigger();
  return (await getCurrentWallet())
    .signAndSendTransactions({
      transactions: wstransactions,
      callbackUrl,
    })
    .then((res) => {
      if (webWalletIds.includes(selectedWalletId)) return;
      if (!res)
        return {
          status: "error",
          errorResult: new Error(
            "The transaction succeeded but did not return the tx"
          ),
        } as IExecutionResult;
      // get tx hashes
      const transactionHashes = (Array.isArray(res) ? res : [res])?.map(
        (r) => r.transaction.hash
      );
      const parsedTransactionHashes = transactionHashes?.join(",");
      const newHref = addQueryParams(
        window.location.origin + window.location.pathname,
        {
          [TRANSACTION_WALLET_TYPE.WalletSelector]: parsedTransactionHashes,
        }
      );
      // for local refresh
      if (!reloadAfterTransaction) {
        return {
          status: "success",
          txHashes: parsedTransactionHashes,
          txHash: transactionHashes[transactionHashes.length - 1],
          successResult: res,
        } as IExecutionResult;
      }
      // for global refresh
      if (!webWalletIds.includes(selectedWalletId)) {
        window.location.href = newHref;
      }
    })
    .catch((e: Error) => {
      if (webWalletIds.includes(selectedWalletId)) return;
      // for local refresh
      if (!reloadAfterTransaction)
        return {
          status: "error",
          errorResult: e,
        } as IExecutionResult;
      // for global reresh
      if (!webWalletIds.includes(selectedWalletId)) {
        window.location.reload();
      }
    })
    .finally(() => {
      ledgerTipClose();
    });
};

export const getGas = (gas?: string) =>
  gas ? new BN(gas) : new BN("100000000000000");

export async function getNear() {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const nearConnection = await connect({ keyStore, ...config });
  return nearConnection;
}
export async function getKeypomNear() {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore(
    undefined,
    "keypom:"
  );
  const nearConnection = await connect({ keyStore, ...config });
  return nearConnection;
}
export async function getAccount() {
  const nearConnection = await getNear();
  const account = await nearConnection.account(window.accountId || "");
  return account;
}
export async function getKeypomAccount() {
  const nearConnection = await getKeypomNear();
  const account = await nearConnection.account(window.accountId || "");
  return account;
}

export async function getContractInstance({
  contractId,
  viewMethods,
  changeMethods,
}: {
  contractId: string;
  viewMethods: string[];
  changeMethods: string[];
}) {
  const account = await getAccount();
  const contract = new Contract(account, contractId, {
    viewMethods,
    changeMethods,
    useLocalViewExecution: true,
  });
  return contract;
}

export async function viewFunction(viewArg: {
  contractId: string;
  methodName: string;
  args?: object;
}) {
  const account = await getAccount();
  return await account.viewFunction(viewArg);
}
/***************************Do not insert other functions in this file (Lily and Luk)e*******************************/
/***************************Do not insert other functions in this file (Lily and Luk)e*******************************/
/***************************Do not insert other functions in this file (Lily and Luk)e*******************************/
/***************************Do not insert other functions in this file (Lily and Luk)e*******************************/
/***************************Do not insert other functions in this file (Lily and Luk)e*******************************/
