import { getAccountId } from "@/utils/wallet";
import {
  Action,
  Transaction as WSTransaction,
} from "@near-wallet-selector/core";

export async function batchDeleteKeys(
  publicKeys: string[],
  callback: (result: any) => void
) {
  const accountId = getAccountId();
  const wallet = await window.selector.wallet();
  const wstransactions: WSTransaction[] = [];
  const actions: Action[] = [];
  publicKeys.forEach((key) => {
    actions.push({
      type: "DeleteKey",
      params: {
        publicKey: key,
      },
    });
  });
  wstransactions.push({
    signerId: accountId,
    receiverId: accountId,
    actions,
  });
  wallet
    .signAndSendTransactions({
      transactions: wstransactions,
    })
    .then((res) => {
      console.log(res);
      callback(res);
      // console.log(res);
      // if (!webWalletIds.includes(wallet.id)) {
      //   window.location.reload();
      // }
    })
    .catch((error) => {
      console.log(error);
      callback(error);
      // if (!webWalletIds.includes(wallet.id)) {
      //   window.location.reload();
      // }
    });
}
