import Big from "big.js";
import { utils } from "near-api-js";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { Transaction } from "../interfaces/wallet";
import getConfig from "../utils/config";
import { STORAGE_TO_REGISTER_WITH_MFT } from "../utils/constant";
import { getAccount, executeMultipleTransactions } from "./near";
import { getAccountId } from "./wallet";
import { getNear } from "./near";
import { UserStorageDetail } from "@/interfaces/swapDcl";

const config = getConfig();
export const REF_FARM_BOOST_CONTRACT_ID = config.REF_FARM_BOOST_CONTRACT_ID;
export const REF_FI_CONTRACT_ID = config.REF_FI_CONTRACT_ID;
export const REF_UNI_V3_SWAP_CONTRACT_ID = config.REF_UNI_V3_SWAP_CONTRACT_ID;
export const REF_UNI_SWAP_CONTRACT_ID = config.REF_UNI_SWAP_CONTRACT_ID;
export const REF_VE_CONTRACT_ID = config.REF_VE_CONTRACT_ID;

export const ONE_YOCTO_NEAR = "0.000000000000000000000001";

export interface RefFiViewFunctionOptions {
  contractId?: string;
  methodName: string;
  args?: object;
}

export interface RefFiFunctionCallOptions extends RefFiViewFunctionOptions {
  gas?: string;
  amount?: string;
}

export async function refFarmBoostViewFunction({
  methodName,
  args,
}: {
  contractId?: string;
  methodName: string;
  args?: object;
}) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: REF_FARM_BOOST_CONTRACT_ID,
    methodName,
    args,
  });
}

export async function refSwapV3ViewFunction({
  methodName,
  args,
}: {
  contractId?: string;
  methodName: string;
  args?: object;
}) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: REF_UNI_V3_SWAP_CONTRACT_ID,
    methodName,
    args,
  });
}

export async function refSwapV3OldVersionViewFunction({
  methodName,
  args,
}: {
  contractId?: string;
  methodName: string;
  args?: object;
}) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: REF_UNI_SWAP_CONTRACT_ID,
    methodName,
    args,
  });
}

export async function refVeViewFunction({
  methodName,
  args,
}: {
  contractId?: string;
  methodName: string;
  args?: object;
}) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: REF_VE_CONTRACT_ID as any,
    methodName,
    args,
  });
}

export const refFarmBoostFunctionCall = async ({
  methodName,
  args,
  gas,
  amount,
}: RefFiFunctionCallOptions) => {
  const transaction: Transaction = {
    receiverId: REF_FARM_BOOST_CONTRACT_ID,
    functionCalls: [
      {
        methodName,
        args,
        amount,
        gas,
      },
    ],
  };

  return await executeMultipleTransactions([transaction], false);
};

export async function refFiViewFunction({
  methodName,
  args,
}: RefFiViewFunctionOptions) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: REF_FI_CONTRACT_ID,
    methodName,
    args,
  });
}
export async function lockerViewFunction({
  methodName,
  args,
}: RefFiViewFunctionOptions) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: config.REF_TOKEN_LOCKER_CONTRACT_ID,
    methodName,
    args,
  });
}

export const nearDepositTransaction = (amount: string) => {
  const transaction: Transaction = {
    receiverId: config.WRAP_NEAR_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "near_deposit",
        args: {},
        gas: "50000000000000",
        amount,
      },
    ],
  };
};

export const executeFarmMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  return executeMultipleTransactions(transactions, false, callbackUrl);
};

export const registerAccountOnToken = () => {
  return {
    methodName: "storage_deposit",
    args: {
      registration_only: true,
      account_id: getAccountId(),
    },
    gas: "30000000000000",
    amount: STORAGE_TO_REGISTER_WITH_MFT,
  };
};

export const get_user_storage_detail = async ({ size }: { size: number }) => {
  const user_id = getAccountId();

  let deposit_fee = new Big(0);

  if (!user_id) {
    alert("sign in first");
    return;
  }

  const detail: UserStorageDetail = await refSwapV3ViewFunction({
    methodName: "get_user_storage_detail",
    args: {
      user_id,
    },
  });
  // first register
  if (!detail) {
    return "0.5";
  }
  const {
    max_slots,
    cur_order_slots,
    cur_liquidity_slots,
    locked_near,
    storage_for_asset,
    slot_price,
  } = detail;

  if (size + cur_liquidity_slots + cur_order_slots > max_slots) {
    const need_num = size + cur_liquidity_slots + cur_order_slots - max_slots;
    const need_num_final = Math.max(need_num, 10);
    deposit_fee = deposit_fee.plus(new Big(slot_price).mul(need_num_final));
    if (user_id !== detail.sponsor_id) {
      deposit_fee = deposit_fee.plus(new Big(detail.locked_near));
    }
  }
  if (deposit_fee.eq(0)) {
    return "";
  }

  return utils.format.formatNearAmount(deposit_fee.toFixed(0));
};
export const checkTransaction = async (txHash: string) => {
  const near = await getNear();
  return (near.connection.provider as JsonRpcProvider).sendJsonRpc(
    "EXPERIMENTAL_tx_status",
    [txHash, getAccountId()]
  );
};

export const checkTransactionStatus = async (txHash: string) => {
  const near = await getNear();
  return near.connection.provider.txStatus(txHash, getAccountId());
};

const REF_FARM_CONTRACT_ID = getConfig().REF_FARM_CONTRACT_ID;
export async function refFarmViewFunction({
  methodName,
  args,
}: RefFiViewFunctionOptions) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: REF_FARM_CONTRACT_ID,
    methodName,
    args,
  });
}

export async function refMeMeFarmViewFunction({
  methodName,
  args,
}: RefFiViewFunctionOptions) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: getConfig().REF_MEME_FARM_CONTRACT_ID,
    methodName,
    args,
  });
}

export async function xrefMeMeFarmViewFunction({
  contractId,
  methodName,
  args,
}: RefFiViewFunctionOptions) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: contractId || "",
    methodName,
    args,
  });
}
