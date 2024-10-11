import { SwapOptions, Transaction } from "@/interfaces/swap";
import { ONE_YOCTO_NEAR, registerAccountOnToken } from "@/utils/contract";
import { TokenMetadata } from "@/services/ft-contract";
import { toNonDivisibleNumber, percentLess, round } from "@/utils/numbers";
import { executeMultipleTransactions } from "@/utils/near";
import getConfig from "@/utils/config";
import { ftGetStorageBalance } from "@/services/ft-contract";
import { nearDepositTransaction } from "@/services/wrap-near";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { IServerPool } from "@/interfaces/swap";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
const { REF_FI_CONTRACT_ID } = getConfig();
export const swap = async ({
  tokenIn,
  tokenOut,
  swapsToDo,
  slippageTolerance,
  amountIn,
}: SwapOptions) => {
  return nearInstantSwap({
    tokenIn,
    tokenOut,
    amountIn,
    swapsToDo,
    slippageTolerance,
  });
};
export const swapFromServer = async ({
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDoServer,
}: SwapOptions) => {
  if (!swapsToDoServer) return;
  const transactions: Transaction[] = [];
  const registerToken = async (token: TokenMetadata) => {
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
  const { routes } = swapsToDoServer;
  const actionsList: IServerPool[] = [];
  routes.forEach((route) => {
    route.pools.forEach((pool) => {
      if (+(pool?.amount_in || 0) == 0) {
        delete pool.amount_in;
      }
      pool.pool_id = Number(pool.pool_id);
      actionsList.push(pool);
    });
  });
  transactions.push({
    receiverId: tokenIn.id,
    functionCalls: [
      {
        methodName: "ft_transfer_call",
        args: {
          receiver_id: REF_FI_CONTRACT_ID,
          amount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
          msg: JSON.stringify({
            force: 0,
            actions: actionsList,
            ...(getTokenUIId(tokenOut) == "near"
              ? { skip_unwrap_near: false }
              : {}),
          }),
        },
        gas: "180000000000000",
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });

  if (getTokenUIId(tokenIn) == "near") {
    transactions.unshift(nearDepositTransaction(amountIn));
  }
  if (tokenIn.id === WRAP_NEAR_CONTRACT_ID) {
    const registered = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);
    if (registered === null) {
      transactions.unshift({
        receiverId: WRAP_NEAR_CONTRACT_ID,
        functionCalls: [registerAccountOnToken()],
      });
    }
  }
  return executeMultipleTransactions(transactions, false);
};

const nearInstantSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDo,
  slippageTolerance,
}: SwapOptions) => {
  const transactions: Transaction[] = [];
  const registerToken = async (token: TokenMetadata) => {
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
  const actionsList = [];
  const allSwapsTokens = swapsToDo!.map((s) => [s.inputToken, s.outputToken]); // to get the hop tokens

  for (const i in allSwapsTokens) {
    const swapTokens = allSwapsTokens[i];
    if (swapTokens[0] == tokenIn.id && swapTokens[1] == tokenOut.id) {
      // direct pool
      actionsList.push({
        pool_id: swapsToDo![i]?.pool?.id,
        token_in: tokenIn.id,
        token_out: tokenOut.id,
        amount_in: swapsToDo![i].partialAmountIn,
        min_amount_out: round(
          tokenOut.decimals,
          toNonDivisibleNumber(
            tokenOut.decimals,
            percentLess(slippageTolerance!, swapsToDo![i].estimate)
          )
        ),
      });
    } else if (swapTokens[1] == tokenOut.id) {
      // other hops
      actionsList.push({
        pool_id: swapsToDo![i]?.pool?.id,
        token_in: swapTokens[0],
        token_out: swapTokens[1],
        min_amount_out: round(
          tokenOut.decimals,
          toNonDivisibleNumber(
            tokenOut.decimals,
            percentLess(slippageTolerance!, swapsToDo![i].estimate)
          )
        ),
      });
    } else if (swapTokens[0] === tokenIn.id) {
      // first hop
      actionsList.push({
        pool_id: swapsToDo![i]?.pool?.id,
        token_in: swapTokens[0],
        token_out: swapTokens[1],
        amount_in: swapsToDo![i].partialAmountIn,
        min_amount_out: "0",
      });
    } else {
      // middle hop
      actionsList.push({
        pool_id: swapsToDo![i]?.pool?.id,
        token_in: swapTokens[0],
        token_out: swapTokens[1],
        min_amount_out: "0",
      });
    }
  }

  transactions.push({
    receiverId: tokenIn.id,
    functionCalls: [
      {
        methodName: "ft_transfer_call",
        args: {
          receiver_id: REF_FI_CONTRACT_ID,
          amount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
          msg: JSON.stringify({
            force: 0,
            actions: actionsList,
            ...(getTokenUIId(tokenOut) == "near"
              ? { skip_unwrap_near: false }
              : {}),
          }),
        },
        gas: "180000000000000",
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });

  if (getTokenUIId(tokenIn) == "near") {
    transactions.unshift(nearDepositTransaction(amountIn));
  }
  if (tokenIn.id === WRAP_NEAR_CONTRACT_ID) {
    const registered = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);
    if (registered === null) {
      transactions.unshift({
        receiverId: WRAP_NEAR_CONTRACT_ID,
        functionCalls: [registerAccountOnToken()],
      });
    }
  }
  return executeMultipleTransactions(transactions, false);
};
