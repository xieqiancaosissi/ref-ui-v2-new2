import React, { useState, useMemo, Fragment, useRef } from "react";
import { FormattedMessage } from "react-intl";
import _ from "lodash";
import BigNumber from "bignumber.js";
import {
  UserOrderInfo,
  V3_POOL_SPLITER,
  pointToPrice,
} from "@/services/swapV3";
import { MyOrderMobileArrow } from "../../icons2";
import {
  calculateFeePercent,
  ONLY_ZEROS,
  toPrecision,
  toReadableNumber,
  scientificNotationToString,
  checkAllocations,
} from "@/utils/numbers";
import { TokenMetadata } from "@/services/ft-contract";
import Big from "big.js";
import { MyOrderInstantSwapArrowRight } from "../../icons2";
import { TOKEN_LIST_FOR_RATE } from "@/services/commonV3";
import { ArrowTopRightIcon } from "../../icons2";
import getConfig from "@/utils/config";
import { SellTokenAmount, BuyTokenAmount } from "./tokenAmountUI";
import {
  NearblocksIcon,
  PikespeakIcon,
  TxLeftArrow,
} from "@/components/pools/icon";
import { getTxId } from "@/services/indexer";
import { MobileInfoBanner } from "../widget";
import ClaimTip from "./claimTip";
import Claimed from "./claimed";
import Created from "./created";
import Actions from "./actions";
import SwapBanner from "./swapBanner";
function HistoryLine({
  order,
  index,
  tokensMap,
  sellAmountToBuyAmount,
  orderTx,
  hoverOn,
  setHoverOn,
}: {
  order: UserOrderInfo;
  index: number;
  tokensMap: { [key: string]: TokenMetadata };
  sellAmountToBuyAmount: any;
  orderTx: string;
  hoverOn: number;
  setHoverOn: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loadingStates, setLoadingStates] = useState<Record<string, any>>({});
  const [hoveredTx, setHoveredTx] = useState(null);
  const closeTimeoutRef = useRef(null) as any;
  const handleMouseEnter = (receipt_id: any) => {
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
  const buyToken = tokensMap[order.buy_token];
  const sellToken = tokensMap[order.sell_token];
  const calPoint =
    sellToken.id === order.pool_id.split(V3_POOL_SPLITER)[0]
      ? order.point
      : -order.point;

  const price = pointToPrice({
    tokenA: sellToken,
    tokenB: buyToken,
    point: calPoint,
  });
  const sort =
    TOKEN_LIST_FOR_RATE.indexOf(sellToken?.symbol) > -1 && +price !== 0;
  const orderRate = useMemo(() => {
    let p = price;
    if (sort) {
      p = new BigNumber(1).dividedBy(price).toFixed();
    }
    return (
      <span className="whitespace-nowrap col-span-1 flex items-start xs:flex-row xs:items-center flex-col relative xs:right-0">
        <span className="mr-1 text-white text-sm" title={p}>
          {toPrecision(p, 2)}
        </span>
        <span className="text-gray-10 text-xs xs:hidden">
          {`${sort ? sellToken.symbol : buyToken.symbol}/${
            sort ? buyToken.symbol : sellToken.symbol
          }`}
        </span>
        <span className="text-white text-sm lg:hidden md:hidden">
          {`${sort ? sellToken.symbol : buyToken.symbol}`}
        </span>
      </span>
    );
  }, [price, buyToken, sellToken, sort]);
  if (!buyToken || !sellToken) return null;

  const swapIn = toReadableNumber(
    sellToken.decimals,
    scientificNotationToString(
      new Big(order.original_deposit_amount || "0")
        .minus(order.original_amount || "0")
        .toString()
    )
  );

  const swapOut = toReadableNumber(
    buyToken.decimals,
    order.swap_earn_amount || "0"
  );

  const orderIn = toReadableNumber(
    sellToken.decimals,
    order.original_amount || "0"
  );

  const totalIn = toReadableNumber(
    sellToken.decimals,
    order.original_deposit_amount || "0"
  );

  const buyAmountRaw = sellAmountToBuyAmount(
    order.original_amount,
    order,
    price
  );

  const buyAmount = new Big(buyAmountRaw).gt(
    toReadableNumber(buyToken.decimals, order.bought_amount || "0")
  )
    ? buyAmountRaw
    : toReadableNumber(buyToken.decimals, order.bought_amount || "0");

  const totalOut = scientificNotationToString(
    new Big(buyAmount).plus(swapOut).toString()
  );

  const claimedAmount = toReadableNumber(
    buyToken.decimals,
    order.bought_amount || "0"
  );

  const buyAmountToSellAmount = (
    undecimaled_amount: string,
    order: UserOrderInfo,
    price: string
  ) => {
    const sell_amount = new Big(
      toReadableNumber(
        tokensMap[order.buy_token].decimals,
        undecimaled_amount || "0"
      )
    )
      .div(price)
      .toString();
    return scientificNotationToString(sell_amount);
  };

  const claimedAmountIn = buyAmountToSellAmount(
    scientificNotationToString(
      new Big(order.bought_amount || "0")
        .minus(order.unclaimed_amount || "0")
        .toString()
    ),
    order,
    price
  );

  const cancelAmount = sellAmountToBuyAmount(order.cancel_amount, order, price);

  const amountTotal = new Big(claimedAmount || "0").plus(cancelAmount || "0");

  const pClaimedAmount = new Big(claimedAmount || "0")
    .div(amountTotal.lte(0) ? 1 : amountTotal)
    .times(100)
    .toNumber();

  const pCancelAmount = new Big(cancelAmount || "0")
    .div(amountTotal.lte(0) ? 1 : amountTotal)
    .times(100)
    .toNumber();

  const displayPercents = checkAllocations("100", [
    pClaimedAmount > 0 && pClaimedAmount < 5
      ? "5"
      : scientificNotationToString(pClaimedAmount.toString()),
    pCancelAmount > 0 && pCancelAmount < 5
      ? "5"
      : scientificNotationToString(pCancelAmount.toString()),
  ]);

  const fee = Number(order.pool_id.split(V3_POOL_SPLITER)[2]);

  const feeTier = (
    <span className="rounded relative xsm:right-0 xsm:bg-none right-3 text-left  text-gray-10 px-1 py-0.5 h-5 text-xs lg:bg-gray-60 lg:bg-opacity-15 xs:text-white">
      {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
    </span>
  );
  return (
    <Fragment>
      {/* For PC */}
      <tr>
        <td>
          <div className="pb-2.5"></div>
        </td>
      </tr>
      <tr
        className={`mb-4 overflow-visible xs:hidden px-4 py-3 text-sm w-full  items-center ${
          hoverOn === index
            ? "bg-gray-20 bg-opacity-50 rounded-t-xl"
            : "bg-gray-20 bg-opacity-20 rounded-xl"
        }`}
        onMouseEnter={() => {
          setHoverOn(index);
        }}
        style={{
          zIndex: 21,
        }}
      >
        <td
          className={
            hoverOn === index &&
            (new Big(order.original_deposit_amount || "0")
              .minus(order.original_amount || "0")
              .gt(0) ||
              Number(claimedAmountIn) > 0)
              ? "rounded-tl-xl"
              : "rounded-l-xl"
          }
        >
          <SellTokenAmount sellToken={sellToken} orderIn={orderIn} />
        </td>

        <td>
          <span className="text-white text-lg frcs w-7 xs:hidden ">
            <MyOrderInstantSwapArrowRight />
          </span>
        </td>

        <td>
          <BuyTokenAmount buyToken={buyToken} buyAmount={buyAmount} />
        </td>

        <td>{feeTier}</td>

        <td>{orderRate}</td>

        <td>
          <Created order={order} />
        </td>

        <td className="">
          <Claimed
            buyToken={buyToken}
            order={order}
            claimedAmount={claimedAmount}
            cancelAmount={cancelAmount}
            displayPercents={displayPercents}
          />
        </td>
        <td
          className={
            hoverOn === index &&
            (new Big(order.original_deposit_amount || "0")
              .minus(order.original_amount || "0")
              .gt(0) ||
              Number(claimedAmountIn) > 0)
              ? " rounded-tr-xl"
              : " rounded-r-xl"
          }
        >
          <Actions
            order={order}
            orderTx={orderTx}
            hoveredTx={hoveredTx}
            loadingStates={loadingStates}
            handleTxClick={handleTxClick}
            handleMouseEnter={handleMouseEnter}
            handleMouseLeave={handleMouseLeave}
          />
        </td>
      </tr>
      {hoverOn === index &&
        (new Big(order.original_deposit_amount || "0")
          .minus(order.original_amount || "0")
          .gt(0) ||
          Number(claimedAmountIn) > 0) && (
          <>
            <tr className="relative z-20 whitespace-nowrap  w-full text-sm text-gray-10 rounded-xl">
              <SwapBanner
                order={order}
                totalIn={totalIn}
                totalOut={totalOut}
                swapIn={swapIn}
                swapOut={swapOut}
                sellToken={sellToken}
                buyToken={buyToken}
                sort={sort}
                claimedAmountIn={claimedAmountIn}
                claimedAmount={claimedAmount}
              />
            </tr>
          </>
        )}
      {/* For Mobile */}
      <div
        className="w-full relative mb-4 md:hidden lg:hidden bg-dark-290 rounded-lg"
        style={{
          zIndex: 20 - index,
        }}
      >
        {/* title */}
        <div className="rounded-t-xl relative bg-portfolioMobileBg px-3 pt-3">
          <div className="flex items-center relative justify-between">
            <SellTokenAmount sellToken={sellToken} orderIn={orderIn} />
            <MyOrderMobileArrow />
            <BuyTokenAmount buyToken={buyToken} buyAmount={buyAmount} />
          </div>
          <div className="grid grid-cols-3 pb-1.5">
            <div className="flex items-center justify-center bg-gray-270 rounded-xl text-xs text-gray-10 justify-self-start px-2 py-0.5">
              {ONLY_ZEROS.test(order.cancel_amount)
                ? "Filled"
                : new Big(order.original_deposit_amount).eq(order.cancel_amount)
                ? "Canceled"
                : "Partially Filled"}
            </div>
            <Created order={order} />
            <div className="relative z-50  text-xs justify-self-end">
              {!!orderTx && (
                <a
                  className="flex items-center text-gray-10 cursor-pointer bg-black bg-opacity-20 rounded py-0.5 px-1.5 hover:text-white"
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
                  {hoveredTx === orderTx && (
                    <div className="w-44 absolute top-6 right-0 bg-dark-70 border border-gray-70 rounded-lg p-2 shadow-lg z-50">
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
                          <div
                            className="ml-3 arrow"
                            style={{ display: "none" }}
                          >
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
                          <div
                            className="ml-3 arrow"
                            style={{ display: "none" }}
                          >
                            <TxLeftArrow />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </a>
              )}
            </div>
          </div>
        </div>
        {/*  content */}
        <div className="rounded-b-xl p-3">
          <MobileInfoBanner
            text={
              <FormattedMessage id="fee_tiers" defaultMessage={"Fee Tiers"} />
            }
            value={feeTier}
          />

          <MobileInfoBanner
            text={`1 ${
              sort ? buyToken?.symbol : tokensMap[order.sell_token].symbol
            } Price`}
            value={orderRate}
          />

          <MobileInfoBanner
            text={
              <FormattedMessage defaultMessage={"Claimed"} id="claimed_upper" />
            }
            value={
              <Claimed
                buyToken={buyToken}
                order={order}
                claimedAmount={claimedAmount}
                cancelAmount={cancelAmount}
                displayPercents={displayPercents}
              />
            }
          />

          <ClaimTip
            claimedAmount={claimedAmount}
            cancelAmount={cancelAmount}
            order={order}
            displayPercents={displayPercents}
          />
        </div>

        {/* swap banner */}
        {!ONLY_ZEROS.test(swapIn || "0") ? (
          <SwapBanner
            order={order}
            totalIn={totalIn}
            totalOut={totalOut}
            swapIn={swapIn}
            swapOut={swapOut}
            sellToken={sellToken}
            buyToken={buyToken}
            sort={sort}
            claimedAmountIn={claimedAmountIn}
            claimedAmount={claimedAmount}
          />
        ) : null}
      </div>
    </Fragment>
  );
}
export default React.memo(HistoryLine);
