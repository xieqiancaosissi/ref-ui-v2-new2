import { executeMultipleTransactions } from "@/utils/near";
import { Transaction } from "@/interfaces/swap";
import { V3_POOL_SPLITER } from "@/utils/constant";
import { priceToPoint } from "@/services/swapV3";
import { TokenMetadata, ftGetStorageBalance } from "@/services/ft-contract";
import { registerAccountOnToken, ONE_YOCTO_NEAR } from "@/utils/contract";
import getConfig from "@/utils/config";
import { toNonDivisibleNumber, ONLY_ZEROS } from "@/utils/numbers";
import { get_user_storage_detail } from "@/services/swapV3";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import { storageDepositAction } from "@/services/creator/storage";
import { nearDepositTransaction } from "@/services/wrap-near";
import { ITokenMetadata } from "@/interfaces/tokens";
import { getTokenBalance } from "@/services/token";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { toReadableNumber } from "@/utils/numbers";
const { REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();
const createOrder = async ({
  tokenA,
  tokenB,
  amountA,
  amountB,
  pool_id,
}: {
  tokenA: TokenMetadata;
  tokenB: TokenMetadata;
  amountA: string;
  amountB: string;
  pool_id: string;
}) => {
  const transactions: Transaction[] = [];
  const fee = Number(pool_id.split(V3_POOL_SPLITER)[2]);

  const buy_token = tokenB.id;
  const point = priceToPoint({
    amountA,
    amountB,
    tokenA,
    tokenB,
    fee,
  });

  const tokenRegistered = await ftGetStorageBalance(tokenB.id).catch(() => {
    throw new Error(`${tokenB.id} doesn't exist.`);
  });

  if (tokenRegistered === null) {
    transactions.push({
      receiverId: tokenB.id,
      functionCalls: [registerAccountOnToken()],
    });
  }
  const new_point =
    pool_id.split(V3_POOL_SPLITER)[0] === tokenA.id ? point : -point;

  const msg = JSON.stringify({
    LimitOrderWithSwap: {
      client_id: "",
      pool_id,
      buy_token,
      point: new_point,
    },
  });

  transactions.push({
    receiverId: tokenA.id,
    functionCalls: [
      {
        methodName: "ft_transfer_call",
        args: {
          receiver_id: REF_UNI_V3_SWAP_CONTRACT_ID,
          amount: toNonDivisibleNumber(tokenA.decimals, amountA),
          msg,
        },
        gas: "250000000000000",
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });

  const neededStorage = await get_user_storage_detail({ size: 1 });
  if (!ONLY_ZEROS.test(neededStorage || "")) {
    transactions.unshift({
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        storageDepositAction({
          amount: neededStorage || "",
          registrationOnly: neededStorage == "0.5",
        }),
      ],
    });
  }

  if (tokenA.id === WRAP_NEAR_CONTRACT_ID && tokenA.symbol == "NEAR") {
    transactions.unshift(nearDepositTransaction(amountA));
  }

  return executeMultipleTransactions(transactions, false);
};
export default createOrder;

export async function updateTokensBalance(
  tokens: TokenMetadata[],
  limitStore: any
) {
  let TOKEN_IN: ITokenMetadata = tokens[0];
  let TOKEN_OUT: ITokenMetadata = tokens[1];
  const tokenInId = TOKEN_IN?.id;
  const tokenOutId = TOKEN_OUT?.id;
  limitStore.setBalanceLoading(true);
  const in_pending = getTokenBalance(
    getTokenUIId(TOKEN_IN) == "near" ? "NEAR" : tokenInId
  );
  const out_pending = getTokenBalance(
    getTokenUIId(TOKEN_OUT) == "near" ? "NEAR" : tokenOutId
  );
  const balances = await Promise.all([in_pending, out_pending]);
  TOKEN_IN = {
    ...TOKEN_IN,
    balanceDecimal: balances[0],
    balance: toReadableNumber(TOKEN_IN.decimals, balances[0]),
  };
  TOKEN_OUT = {
    ...TOKEN_OUT,
    balanceDecimal: balances[1],
    balance: toReadableNumber(TOKEN_OUT.decimals, balances[1]),
  };
  limitStore.setBalanceLoading(false);
  limitStore.setTokenIn(TOKEN_IN);
  limitStore.setTokenOut(TOKEN_OUT);
}
