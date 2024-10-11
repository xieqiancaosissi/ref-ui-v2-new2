import Big from "big.js";
import {
  parsedArgs,
  parsedTransactionSuccessValue,
} from "@/utils/transactionsPopup";
import {
  ONLY_ZEROS,
  toReadableNumber,
  toPrecision,
  scientificNotationToString,
} from "@/utils/numbers";
import { V3_POOL_SPLITER } from "@/utils/constant";
import { ftGetTokenMetadata } from "../../services/token";
import limitOrderFailPopUp from "./limitOrderFailPopUp";
import limitOrderSuccessPopUp from "./limitOrderSuccessPopUp";
const limitOrderPopUp = async (res: any, txHash: string) => {
  const byNeth =
    res?.transaction?.actions?.[0]?.FunctionCall?.method_name === "execute";
  const byEvm =
    res?.transaction?.actions?.[0]?.FunctionCall?.method_name === "rlp_execute";
  const isPackage = byNeth || byEvm;
  const ft_resolved_id =
    res?.receipts?.findIndex((r: any) =>
      r?.receipt?.Action?.actions?.some(
        (a: any) => a?.FunctionCall?.method_name === "ft_resolve_transfer"
      )
    ) + (isPackage ? 1 : 0);

  const ft_on_transfer_id =
    res?.receipts?.findIndex((r: any) =>
      r?.receipt?.Action?.actions?.some(
        (a: any) => a?.FunctionCall?.method_name === "ft_on_transfer"
      )
    ) + (isPackage ? 1 : 0);

  const ft_transfer_call_args = parsedArgs(
    isPackage
      ? res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall?.args
      : res?.transaction?.actions?.[0]?.FunctionCall?.args || ""
  );

  const parsedInputArgs = JSON.parse(ft_transfer_call_args || "");
  const LimitOrderWithSwap = JSON.parse(
    parsedInputArgs?.msg || "{}"
  )?.LimitOrderWithSwap;

  if (!LimitOrderWithSwap) {
    return false;
  }
  const ft_resolved_tx_outcome =
    res?.receipts_outcome?.[ft_resolved_id]?.outcome;
  const parsedValue = JSON.parse(
    parsedTransactionSuccessValue(ft_resolved_tx_outcome) || ""
  );

  const isFailed = ONLY_ZEROS.test(parsedValue || 0);

  if (isFailed) {
    limitOrderFailPopUp(txHash);
    return true;
  }

  const ft_on_transfer_logs =
    res?.receipts_outcome?.[ft_on_transfer_id]?.outcome?.logs;

  const ft_on_transfer_log =
    ft_on_transfer_logs?.[ft_on_transfer_logs?.length - 1];

  const idx = ft_on_transfer_log?.indexOf("{");

  const parsed_ft_on_transfer_log = JSON.parse(
    ft_on_transfer_log.slice(idx) || ""
  );

  const order_id = parsed_ft_on_transfer_log?.data?.[0]?.order_id;

  const original_amount = parsed_ft_on_transfer_log?.data?.[0]?.original_amount;

  const original_deposit_amount =
    parsed_ft_on_transfer_log?.data?.[0]?.original_deposit_amount;

  const { point, pool_id, buy_token } = LimitOrderWithSwap;

  const ids = pool_id.split(V3_POOL_SPLITER).splice(0, 2);

  const sell_token_id = ids.find((t: string) => t !== buy_token);

  const sellToken = await ftGetTokenMetadata(sell_token_id);

  const ft_on_transfer_log_swap = ft_on_transfer_logs?.[0];

  const idx_swap = ft_on_transfer_log?.indexOf("{");

  const parsed_ft_on_transfer_log_swap = JSON.parse(
    ft_on_transfer_log_swap.slice(idx_swap) || ""
  );
  if (!!order_id) {
    const limitOrderAmount =
      Number(toReadableNumber(sellToken.decimals, original_amount || "0")) <
      0.01
        ? "< 0.01"
        : toPrecision(
            toReadableNumber(sellToken.decimals, original_amount || "0"),
            2
          );

    const swapAmount = toReadableNumber(
      sellToken.decimals,
      scientificNotationToString(
        new Big(original_deposit_amount || "0")
          .minus(original_amount || "0")
          .toString()
      )
    );

    let swapAmountOut =
      Number(swapAmount) == 0
        ? "0"
        : parsed_ft_on_transfer_log_swap?.data?.[0]?.amount_out;

    const buyToken = await ftGetTokenMetadata(buy_token);

    swapAmountOut = toReadableNumber(buyToken.decimals, swapAmountOut);

    limitOrderSuccessPopUp({
      tokenSymbol: sellToken.symbol,
      swapAmount:
        Number(swapAmount) > 0 && Number(swapAmount) < 0.01
          ? "< 0.01"
          : toPrecision(swapAmount, 2, false, false),
      limitOrderAmount,
      tokenOutSymbol: buyToken.symbol,

      txHash,
      swapAmountOut:
        Number(swapAmountOut) > 0 && Number(swapAmountOut) < 0.01
          ? "< 0.01"
          : toPrecision(swapAmountOut, 2, false, false),
    });
  } else {
    const swapAmount = toReadableNumber(sellToken.decimals, parsedValue);

    let swapAmountOut =
      Number(swapAmount) == 0
        ? "0"
        : parsed_ft_on_transfer_log_swap?.data?.[0]?.amount_out;

    const buyToken = await ftGetTokenMetadata(buy_token);

    swapAmountOut = toReadableNumber(buyToken.decimals, swapAmountOut);

    // all swap
    limitOrderSuccessPopUp({
      tokenSymbol: sellToken.symbol,
      swapAmount:
        Number(swapAmount) < 0.01
          ? "< 0.01"
          : toPrecision(swapAmount, 2, false, false),
      limitOrderAmount: "",
      txHash,
      tokenOutSymbol: buyToken.symbol,
      swapAmountOut:
        Number(swapAmountOut) > 0 && Number(swapAmountOut) < 0.01
          ? "< 0.01"
          : toPrecision(swapAmountOut, 2, false, false),
    });
  }

  // success pop up

  return true;

  // find ft_resolve_on tx
};

export default limitOrderPopUp;
