import { Transaction } from "@/interfaces/swap";
import { IV3Swap } from "@/interfaces/swapDcl";
import { ONE_YOCTO_NEAR } from "@/utils/contract";
import { toNonDivisibleNumber } from "@/utils/numbers";
import { executeMultipleTransactions } from "@/utils/near";
import getConfig from "@/utils/config";
import { ftGetStorageBalance } from "@/services/ft-contract";
import { nearDepositTransaction } from "@/services/wrap-near";
import { toReadableNumber, toPrecision, ONLY_ZEROS } from "@/utils/numbers";
import {
  registerAccountOnToken,
  get_user_storage_detail,
} from "@/utils/contract";
import { V3_POOL_SPLITER } from "@/utils/constant";
import { priceToPoint } from "@/services/swap/swapDclUtils";
import { NEAR_META_DATA } from "@/utils/nearMetaData";
import { storageDepositAction } from "@/services/creator/storage";
const { WRAP_NEAR_CONTRACT_ID, REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();
const dclSwap = async ({
  Swap,
  swapInfo,
  SwapByOutput,
  LimitOrderWithSwap,
}: IV3Swap) => {
  const transactions: Transaction[] = [];
  const { tokenA, tokenB, amountA, amountB } = swapInfo;
  if (Swap) {
    const pool_ids = Swap.pool_ids;

    const tokenRegistered = await ftGetStorageBalance(tokenB.id).catch(() => {
      throw new Error(`${tokenB.id} doesn't exist.`);
    });

    if (tokenRegistered === null) {
      transactions.push({
        receiverId: tokenB.id,
        functionCalls: [registerAccountOnToken()],
      });
    }

    const output_token = tokenB.id;
    const min_output_amount = toPrecision(Swap.min_output_amount, 0);

    const msg = JSON.stringify({
      Swap: {
        pool_ids,
        output_token,
        min_output_amount,
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
          gas: "180000000000000",
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
    if (tokenB.id === WRAP_NEAR_CONTRACT_ID && tokenB.symbol == "wNEAR") {
      transactions.push(
        nearDepositTransaction(
          toReadableNumber(NEAR_META_DATA.decimals, min_output_amount)
        )
      );
    }
  }

  if (SwapByOutput) {
    const pool_ids = Swap?.pool_ids;
    const output_token = tokenB.id;
    const output_amount = toNonDivisibleNumber(tokenB.decimals, amountB);
    const msg = JSON.stringify({
      SwapByOutput: {
        pool_ids,
        output_token,
        output_amount,
      },
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
          gas: "180000000000000",
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }
  if (LimitOrderWithSwap) {
    const pool_id = LimitOrderWithSwap.pool_id;

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

    const neededStorage = (await get_user_storage_detail({
      size: 1,
    })) as string;
    if (!ONLY_ZEROS.test(neededStorage)) {
      transactions.unshift({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls: [
          storageDepositAction({
            amount: neededStorage,
            registrationOnly: neededStorage == "0.5",
          }),
        ],
      });
    }
  }

  if (tokenA.id === WRAP_NEAR_CONTRACT_ID && tokenA.symbol == "NEAR") {
    transactions.unshift(nearDepositTransaction(amountA));
  }

  if (tokenA.id === WRAP_NEAR_CONTRACT_ID) {
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
export default dclSwap;
