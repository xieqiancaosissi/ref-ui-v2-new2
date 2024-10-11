import { FormattedMessage } from "react-intl";
import React, { useState, useRef } from "react";
import Big from "big.js";
import { UserOrderInfo } from "@/services/swapV3";
import {
  toPrecision,
  ONLY_ZEROS,
  scientificNotationToString,
} from "@/utils/numbers";
import ExclamationTip from "../exclamationTip";
import { TokenMetadata } from "@/services/ft-contract";
import { isClientMobie } from "@/utils/device";
import {
  MyOrderInstantSwapArrowRight,
  FilledEllipse,
  ArrowTopRightIcon,
} from "../../icons2";
import { BsCheckCircle } from "@/components/reactIcons";
import { useSwapStore } from "@/stores/swap";
import { isMobile } from "@/utils/device";
import getConfig from "@/utils/config";
import { getTxId } from "@/services/indexer";
import {
  NearblocksIcon,
  PikespeakIcon,
  TxLeftArrow,
} from "@/components/pools/icon";
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
  unClaimedAmountIn,
  unClaimedAmount,
  orderTx,
  isHoverOn,
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
  unClaimedAmountIn: string;
  unClaimedAmount: string;
  orderTx: string;
  isHoverOn: boolean;
}) {
  const [loadingStates, setLoadingStates] = useState<Record<string, any>>({});
  const [hoveredTx, setHoveredTx] = useState<string | null>(null);
  const closeTimeoutRef = useRef(null) as any;
  const swapStore = useSwapStore();
  const allTokenPrices = swapStore.getAllTokenPrices();
  const sellTokenPrice = allTokenPrices?.[sellToken.id]?.price || null;
  const buyTokenPrice = allTokenPrices?.[buyToken.id]?.price || null;
  const is_mobile = isMobile();
  const handleMouseEnter = (receipt_id: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredTx(receipt_id);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredTx(null);
    }, 200);
  };

  async function handleTxClick(receipt_id: string, url: string) {
    setLoadingStates((prevStates) => ({ ...prevStates, [receipt_id]: true }));
    try {
      const data = await getTxId(receipt_id);
      if (data && data.receipts && data.receipts.length > 0) {
        const txHash = data.receipts[0].originated_from_transaction_hash;
        window.open(`${url}/${txHash}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error(
        "An error occurred while fetching transaction data:",
        error
      );
    } finally {
      setLoadingStates((prevStates) => ({
        ...prevStates,
        [receipt_id]: false,
      }));
    }
  }
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
      colSpan={9}
      className={`text-gray-10 w-full relative px-3 pb-4 xsm:px-0 xsm:py-0 xsm:block ${
        isHoverOn ? "rounded-b-lg" : ""
      }`}
    >
      <div className="flex justify-between items-start border border-gray-30 rounded-sm bg-dark-210 px-3.5 py-4 xsm:bg-gray-20 xsm:bg-opacity-30 xsm:rounded-lg xsm:w-full xsm:mt-0.5 xsm:border-none">
        <div className="flex flex-col gap-4 xsm:w-full">
          {new Big(order.original_deposit_amount || "0")
            .minus(order.original_amount || "0")
            .gt(0) && (
            <>
              {/* Initial Order */}
              <div className="flex items-center gap-2 text-sm xsm:text-[13px] xsm:justify-between">
                <span className="flex items-center lg:w-35">
                  <FormattedMessage
                    id="initial_order"
                    defaultMessage={"Initial Order"}
                  />
                  {!is_mobile && (
                    <ExclamationTip
                      id="this_order_has_been_partially_filled"
                      defaultMessage="This order has been partially filled "
                      dataPlace="bottom"
                      colorhex="#7E8A93"
                      uniquenessId={
                        "this_order_has_been_partially_filled" + order.order_id
                      }
                    />
                  )}
                </span>

                <div className="flex items-center text-sm xsm:text-[13px]">
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
                </div>
              </div>
              {/* Instant Swap */}
              <div className="flex items-center gap-2 text-sm xsm:text-[13px] xsm:justify-between">
                <span className="flex items-center lg:w-35">
                  <FormattedMessage
                    id={is_mobile ? "filled_via_swap" : "instants_swap"}
                    defaultMessage={
                      is_mobile ? "Filled via swap" : "Instant Swap"
                    }
                  />
                  {!is_mobile && (
                    <ExclamationTip
                      colorhex="#7E8A93"
                      id={instant_swap_tip()}
                      defaultMessage={instant_swap_tip()}
                      dataPlace="bottom"
                      uniquenessId={"instant_swap_tip" + order.order_id}
                    />
                  )}
                </span>

                <span className="frcb xsm:justify-start lg:">
                  <div className="frcs text-sm  pr-2 xsm:pr-1.5 text-gray-10 xsm:text-[13px]">
                    <BsCheckCircle
                      className="mr-1.5 xsm:mr-0"
                      fill="#42bb17"
                      stroke="#42BB17"
                    />
                    <span className="xsm:hidden">
                      <FormattedMessage
                        id="swappped"
                        defaultMessage={"Swapped"}
                      ></FormattedMessage>
                    </span>
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
          {/* for mobile */}
          <div className="lg:hidden flex items-center justify-end text-xs -mt-3">
            <div className="flex  max-w-max text-dark-260 bg-dark-220 rounded px-2 py-1 items-center justify-end lg:hidden">
              <span className="">1</span>

              <span className="ml-1.5">
                {sort ? buyToken.symbol : sellToken.symbol}
              </span>

              {allTokenPrices?.[sort ? buyToken?.id : sellToken?.id]?.price && (
                <span className="ml-1">{`($${
                  allTokenPrices?.[sort ? buyToken?.id : sellToken?.id].price
                })`}</span>
              )}

              <span className="mx-6 xs:mx-2 ">=</span>
              <span className="">
                {toPrecision(
                  scientificNotationToString(
                    new Big(sort ? swapIn || 0 : swapOut || 0)
                      .div(
                        Number(sort ? swapOut : swapIn) === 0
                          ? 1
                          : sort
                          ? swapOut
                          : swapIn
                      )
                      .toString()
                  ),
                  3
                )}
              </span>

              <span className="ml-1.5">
                {sort ? sellToken.symbol : buyToken.symbol}
              </span>
            </div>
          </div>
          {/* Executing */}
          <div className="flex items-start gap-2 xsm:text-[13px] xsm:justify-between">
            <span className="xsm:text-gray-10 lg:w-35">
              <FormattedMessage
                id="executing_capital"
                defaultMessage={"Executing"}
              />
            </span>

            <div className="flex flex-col xsm:items-end">
              <span className="lg:frcb xsm:frcs">
                <div className="frcs text-sm pr-2 xsm:pr-0 text-gray-10 xsm:text-[13px]">
                  <BsCheckCircle
                    className="mr-1.5"
                    fill="#9EFE01"
                    stroke="#9EFE01"
                  />
                  {is_mobile ? null : (
                    <FormattedMessage
                      id="claimed"
                      defaultMessage={"Claimed"}
                    ></FormattedMessage>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <span
                    title={toPrecision(claimedAmountIn, sellToken.decimals)}
                    className="text-white"
                  >
                    {Number(claimedAmountIn) > 0 &&
                    Number(claimedAmountIn) < 0.01
                      ? "< 0.01"
                      : toPrecision(claimedAmountIn, 2)}
                  </span>

                  <span className="ml-1.5 xsm:text-gray-10">
                    {sellToken.symbol}
                  </span>
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

                  <span className="ml-1.5 xsm:text-gray-10">
                    {buyToken.symbol}
                  </span>
                </div>
              </span>

              <span className="pt-4 lg:frcb xsm:frcs">
                <div className="frcs text-sm pr-2 xsm:pr-0 text-gray-10 xsm:text-[13px]">
                  <span className="mr-1.5">
                    <FilledEllipse></FilledEllipse>
                  </span>
                  {is_mobile ? null : (
                    <FormattedMessage
                      id="filled"
                      defaultMessage={"Filled"}
                    ></FormattedMessage>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <span
                    title={toPrecision(unClaimedAmountIn, sellToken.decimals)}
                    className="text-white font-gothamBold"
                  >
                    {Number(unClaimedAmountIn) > 0 &&
                    Number(unClaimedAmountIn) < 0.01
                      ? "< 0.01"
                      : toPrecision(unClaimedAmountIn, 2)}
                  </span>

                  <span className="ml-1.5 xsm:text-gray-10">
                    {sellToken.symbol}
                  </span>
                  <span className="mx-6 xs:mx-2 text-gray-10">
                    {isClientMobie() ? (
                      <MyOrderInstantSwapArrowRight />
                    ) : (
                      <MyOrderInstantSwapArrowRight />
                    )}
                  </span>
                  <span
                    title={unClaimedAmount}
                    className="text-white font-gothamBold"
                  >
                    {Number(unClaimedAmount) > 0 &&
                    Number(unClaimedAmount) < 0.01
                      ? "< 0.01"
                      : toPrecision(unClaimedAmount, 2)}
                  </span>

                  <span className="ml-1.5 xsm:text-gray-10">
                    {buyToken.symbol}
                  </span>
                </div>
              </span>
            </div>
          </div>
        </div>
        {/* tx */}
        {!!orderTx ? (
          <div className="flex relative rounded border border-gray-90 px-2 py-0.5">
            <a
              className="flex items-center text-gray-10 cursor-pointer text-xs hover:text-white"
              onMouseEnter={() => handleMouseEnter(orderTx)}
              onMouseLeave={handleMouseLeave}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {loadingStates[orderTx] ? (
                <>
                  Tx
                  <span className="loading-dots"></span>
                </>
              ) : (
                <>
                  Tx
                  <span className="ml-1.5">
                    <ArrowTopRightIcon />
                  </span>
                </>
              )}
              {/* bg-dark-70 */}
              {hoveredTx === orderTx && (
                <div className="w-44 absolute -bottom-5 left-16 bg-dark-70 border border-gray-70 rounded-lg p-2 z-50">
                  <div className="flex flex-col">
                    <div
                      className="mb-2 px-3 py-2  text-white rounded-md flex items-center"
                      onMouseEnter={(e) => {
                        const arrow = e.currentTarget.querySelector(
                          ".arrow"
                        ) as HTMLElement;
                        if (arrow) {
                          arrow.style.display = "block";
                        }
                      }}
                      onMouseLeave={(e) => {
                        const arrow = e.currentTarget.querySelector(
                          ".arrow"
                        ) as HTMLElement;
                        if (arrow) {
                          arrow.style.display = "none";
                        }
                      }}
                      onClick={() =>
                        handleTxClick(
                          orderTx,
                          `${getConfig().explorerUrl}/txns`
                        )
                      }
                    >
                      <NearblocksIcon />
                      <p className="ml-2 text-sm">nearblocks</p>
                      <div className="ml-3 arrow" style={{ display: "none" }}>
                        <TxLeftArrow />
                      </div>
                    </div>
                    <div
                      className="px-3 py-2  text-white rounded-md flex items-center"
                      onMouseEnter={(e) => {
                        const arrow = e.currentTarget.querySelector(
                          ".arrow"
                        ) as HTMLElement;
                        if (arrow) {
                          arrow.style.display = "block";
                        }
                      }}
                      onMouseLeave={(e) => {
                        const arrow = e.currentTarget.querySelector(
                          ".arrow"
                        ) as HTMLElement;
                        if (arrow) {
                          arrow.style.display = "none";
                        }
                      }}
                      onClick={() =>
                        handleTxClick(
                          orderTx,
                          `${getConfig().pikespeakUrl}/transaction-viewer`
                        )
                      }
                    >
                      <PikespeakIcon />
                      <p className="ml-2 text-sm">Pikespeak...</p>
                      <div className="ml-3 arrow" style={{ display: "none" }}>
                        <TxLeftArrow />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </a>
          </div>
        ) : null}
      </div>
    </td>
  );
}

export default React.memo(SwapBanner);
