import { nearSwapOptions, Transaction } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { executeMultipleTransactions } from "@/utils/near";
import { ftGetStorageBalance } from "@/services/ft-contract";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { registerAccountOnToken } from "@/utils/contract";
import {
  nearDepositTransaction,
  nearWithdrawTransaction,
} from "@/services/wrap-near";

const nearSwap = async ({ tokenIn, tokenOut, amountIn }: nearSwapOptions) => {
  const transactions: Transaction[] = [];
  const registerToken = async (token: TokenMetadata) => {
    if (getTokenUIId(tokenOut) == "near") return;
    const tokenRegistered = await ftGetStorageBalance(token.id).catch(() => {
      throw new Error(`${token.id} doesn't exist.`);
    });

    if (tokenRegistered === null) {
      transactions.push({
        receiverId: token.id,
        functionCalls: [registerAccountOnToken()],
      });
    }
  };
  await registerToken(tokenOut);
  if (getTokenUIId(tokenIn) == "near") {
    transactions.push(nearDepositTransaction(amountIn));
  } else {
    transactions.push(nearWithdrawTransaction(amountIn));
  }

  return executeMultipleTransactions(transactions, false);
};
export default nearSwap;
