import React from "react";
import { FormattedMessage } from "react-intl";
import Big from "big.js";
import { UserOrderInfo } from "@/services/swapV3";
import { toPrecision, ONLY_ZEROS } from "@/utils/numbers";
import ExclamationTip from "../exclamationTip";
import { TokenMetadata } from "@/services/ft-contract";
import { isClientMobie } from "@/utils/device";
import { MyOrderInstantSwapArrowRight } from "../../icons2";
import { BsCheckCircle } from "@/components/reactIcons";
import { useSwapStore } from "@/stores/swap";
function SwapBanner({
  order,
  totalIn,
  totalOut,
  swapIn,
  swapOut,
  sellToken,
  buyToken,
  sort,
  claimedAmountIn,
  claimedAmount,
}: {
  order: UserOrderInfo;
  totalIn: string;
  totalOut: string;
  swapIn: string;
  swapOut: string;
  sellToken: TokenMetadata;
  buyToken: TokenMetadata;
  sort: boolean;
  claimedAmountIn: string;
  claimedAmount: string;
}) {
  const swapStore = useSwapStore();
  const allTokenPrices = swapStore.getAllTokenPrices();
  const sellTokenPrice = allTokenPrices?.[sellToken.id]?.price || null;
  const buyTokenPrice = allTokenPrices?.[buyToken.id]?.price || null;
  function instant_swap_tip() {
    const token_sell_symbol = sellToken.symbol;
    const token_buy_symbol = buyToken.symbol;
    const sell_token_price = sellTokenPrice
      ? `($${toPrecision(sellTokenPrice, 2)})`
      : "";
    const buy_token_price = buyTokenPrice
      ? `($${toPrecision(buyTokenPrice, 2)})`
      : "";
    let rate = new Big(swapOut).div(ONLY_ZEROS.test(swapIn) ? 1 : swapIn);
    if (sort) {
      rate = new Big(1).div(rate.eq(0) ? "1" : rate);
    }
    const display_rate = rate.toFixed(3);
    let result = "";
    if (sort) {
      result = `1 ${token_buy_symbol} ${buy_token_price} = ${display_rate} ${token_sell_symbol}`;
    } else {
      result = `1 ${token_sell_symbol} ${sell_token_price} = ${display_rate} ${token_buy_symbol}`;
    }
    return result;
  }
  return (
    <td
      colSpan={8}
      className="rounded-b-xl xsm:hidden  w-full relative bg-gray-20 bg-opacity-50 px-3 pb-4 text-gray-10"
    >
      <div className="flex flex-col gap-4 border border-gray-30 rounded bg-dark-210 px-3 py-4">
        {new Big(order.original_deposit_amount || "0")
          .minus(order.original_amount || "0")
          .gt(0) && (
          <>
            {/* Initial Order */}
            <div className="flex items-center gap-2">
              <span className="flex items-center w-35">
                <FormattedMessage
                  id="initial_order"
                  defaultMessage={"Initial Order"}
                />
                <ExclamationTip
                  id="this_order_has_been_partially_filled"
                  defaultMessage="This order has been partially filled "
                  dataPlace="top"
                  colorhex="#7E8A93"
                  uniquenessId={
                    "this_order_has_been_partially_filled" + order.order_id
                  }
                />
              </span>

              <span className="flex items-center">
                <span title={totalIn} className="text-white">
                  {Number(totalIn) > 0 && Number(totalIn) < 0.01
                    ? "< 0.01"
                    : toPrecision(totalIn, 2)}
                </span>

                <span className="ml-1.5">{sellToken.symbol}</span>
                <span className="mx-6 xs:mx-2 text-white xs:text-gray-10">
                  {isClientMobie() ? (
                    <MyOrderInstantSwapArrowRight />
                  ) : (
                    <MyOrderInstantSwapArrowRight />
                  )}
                </span>
                <span
                  title={toPrecision(totalOut, buyToken.decimals)}
                  className="text-white"
                >
                  {Number(totalOut) > 0 && Number(totalOut) < 0.01
                    ? "< 0.01"
                    : toPrecision(totalOut, 2)}
                </span>

                <span className="ml-1.5">{buyToken.symbol}</span>
              </span>
            </div>
            {/* Instant Swap */}
            <div className="flex items-center gap-2">
              <span className="flex items-center w-35">
                <FormattedMessage
                  id="instants_swap"
                  defaultMessage={"Instant Swap"}
                />

                <ExclamationTip
                  colorhex="#7E8A93"
                  id={instant_swap_tip()}
                  defaultMessage={instant_swap_tip()}
                  dataPlace="top"
                  uniquenessId={"instant_swap_tip" + order.order_id}
                />
              </span>

              <span className="frcb">
                <div className="frcs text-sm w pr-2 text-gray-10">
                  <BsCheckCircle
                    className="mr-1.5"
                    fill="#00FFC2"
                    stroke="#00FFC2"
                  />

                  <FormattedMessage
                    id="swappped"
                    defaultMessage={"Swapped"}
                  ></FormattedMessage>
                </div>

                <div className="flex items-center justify-end">
                  <span title={swapIn} className="text-white">
                    {Number(swapIn) > 0 && Number(swapIn) < 0.01
                      ? "< 0.01"
                      : toPrecision(swapIn, 2)}
                  </span>

                  <span className="ml-1.5">{sellToken.symbol}</span>
                  <span className="mx-6 xs:mx-2 text-gray-10">
                    {isClientMobie() ? (
                      <MyOrderInstantSwapArrowRight />
                    ) : (
                      <MyOrderInstantSwapArrowRight />
                    )}
                  </span>
                  <span title={swapOut} className="text-white">
                    {Number(swapOut) > 0 && Number(swapOut) < 0.01
                      ? "< 0.01"
                      : toPrecision(swapOut, 2)}
                  </span>

                  <span className="ml-1.5">{buyToken.symbol}</span>
                </div>
              </span>
            </div>
          </>
        )}
        {/* Executed */}
        {Number(claimedAmountIn) > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-35">
              <FormattedMessage id="executed" defaultMessage={"Executed"} />
            </span>

            <span className="frcb">
              <div className="frcs text-sm pr-2 text-gray-10">
                <BsCheckCircle
                  className="mr-1.5"
                  fill="#9EFE01"
                  stroke="#9EFE01"
                />

                <FormattedMessage
                  id="claimed"
                  defaultMessage={"Claimed"}
                ></FormattedMessage>
              </div>

              <div className="flex items-center justify-end">
                <span
                  title={toPrecision(claimedAmountIn, sellToken.decimals)}
                  className="text-white"
                >
                  {Number(claimedAmountIn) > 0 && Number(claimedAmountIn) < 0.01
                    ? "< 0.01"
                    : toPrecision(claimedAmountIn, 2)}
                </span>

                <span className="ml-1.5">{sellToken.symbol}</span>
                <span className="mx-6 xs:mx-2 text-gray-10">
                  {isClientMobie() ? (
                    <MyOrderInstantSwapArrowRight />
                  ) : (
                    <MyOrderInstantSwapArrowRight />
                  )}
                </span>
                <span title={claimedAmount} className="text-white">
                  {Number(claimedAmount) > 0 && Number(claimedAmount) < 0.01
                    ? "< 0.01"
                    : toPrecision(claimedAmount, 2)}
                </span>

                <span className="ml-1.5">{buyToken.symbol}</span>
              </div>
            </span>
          </div>
        )}
      </div>
    </td>
  );
}
export default React.memo(SwapBanner);
