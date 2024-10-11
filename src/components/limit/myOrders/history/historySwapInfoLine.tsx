import React, { useState, Fragment, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import _ from "lodash";
import BigNumber from "bignumber.js";
import { V3_POOL_SPLITER, pointToPrice } from "@/services/swapV3";
import { MobileHistoryOrderStamp, MyOrderMobileArrow } from "../../icons2";
import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import { TokenMetadata } from "@/services/ft-contract";
import { TIMESTAMP_DIVISOR } from "@/utils/constant";
import moment from "moment";
import { MyOrderInstantSwapArrowRight } from "../../icons2";
import { TOKEN_LIST_FOR_RATE } from "@/services/commonV3";
import getConfig from "@/utils/config";
import { getTxId } from "@/services/indexer";
import { MobileInfoBanner } from "../widget";
import { ArrowTopRightIcon } from "../../icons2";
import {
  NearblocksIcon,
  PikespeakIcon,
  TxLeftArrow,
} from "@/components/pools/icon";

function HistorySwapInfoLine({
  index,
  tokensMap,
  orderTx,
  token_in,
  token_out,
  pool_id,
  point,
  amount_in,
  amount_out,
  timestamp,
}: {
  index: number;
  tokensMap: { [key: string]: TokenMetadata };
  orderTx: string;
  token_in: string;
  token_out: string;
  pool_id: string;
  point: string;
  amount_in: string;
  amount_out: string;
  timestamp: string;
  hoverOn: number;
  setHoverOn: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loadingStates, setLoadingStates] = useState<Record<string, any>>({});
  const [hoveredTx, setHoveredTx] = useState<string | null>(null);
  const closeTimeoutRef = useRef(null) as any;

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

  const buyToken = tokensMap[token_out];

  const sellToken = tokensMap[token_in];

  if (!buyToken || !sellToken) return null;

  const orderIn = toReadableNumber(sellToken.decimals, amount_in || "0");

  const calPoint =
    sellToken.id === pool_id.split(V3_POOL_SPLITER)[0]
      ? Number(point)
      : -Number(point);

  const price = pointToPrice({
    tokenA: sellToken,
    tokenB: buyToken,
    point: calPoint,
  });

  const buyAmount = toReadableNumber(buyToken.decimals, amount_out || "0");

  const sellTokenAmount = (
    <span className="flex py-4 pl-3  flex-shrink-0 items-center">
      <img
        src={sellToken.icon}
        className="border border-gradientFrom rounded-full w-7 h-7 xsm:w-6 xsm:h-6"
        alt=""
      />

      <div className="flex   xs:flex-row flex-col ml-2">
        <span className="text-white text-sm mr-2" title={orderIn}>
          {Number(orderIn) > 0 && Number(orderIn) < 0.01
            ? "< 0.01"
            : toPrecision(orderIn, 2)}
        </span>

        <span className="text-gray-10 text-xs xs:relative xs:top-0.5">
          {sellToken.symbol}
        </span>
      </div>
    </span>
  );

  const buyTokenAmount = (
    <span className="flex items-center col-span-1 ">
      <img
        src={buyToken.icon}
        className="border flex-shrink-0 border-gradientFrom rounded-full w-7 h-7 xsm:w-6 xsm:h-6"
        alt=""
      />

      <div className="flex xs:flex-row flex-col ml-2">
        <span
          className="text-white mr-2 text-sm whitespace-nowrap"
          title={buyAmount}
        >
          {Number(buyAmount) > 0 && Number(buyAmount) < 0.01
            ? "< 0.01"
            : toPrecision(buyAmount, 2)}
        </span>

        <span className="text-gray-10 text-xs xs:relative xs:top-0.5">
          {buyToken.symbol}
        </span>
      </div>
    </span>
  );

  const fee = Number(pool_id.split(V3_POOL_SPLITER)[2]);

  const feeTier = (
    <span className="rounded relative xsm:right-0 xsm:bg-none right-3 text-left  text-gray-10 px-1 py-0.5 h-5 text-xs lg:bg-gray-60 lg:bg-opacity-15 xs:text-white">
      {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
    </span>
  );
  const sort =
    TOKEN_LIST_FOR_RATE.indexOf(sellToken?.symbol) > -1 && +price !== 0;
  const calcPrice = sort ? new BigNumber(1).dividedBy(price).toFixed() : price;

  const orderRate = (
    <span className="whitespace-nowrap col-span-1 flex items-start xs:flex-row xs:items-center flex-col relative  xs:right-0">
      <span className="mr-1 text-white text-sm" title={calcPrice}>
        {toPrecision(calcPrice, 2)}
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

  const claimed = (
    <span className="whitespace-nowrap col-span-2 xs:flex-col flex items-center ml-12">
      <div>
        <div className="flex items-center xs:justify-end">
          <img
            src={buyToken.icon}
            className="border border-gradientFrom rounded-full w-4 h-4"
            alt=""
          />
          <span
            className="text-white text-sm mx-1"
            title={toReadableNumber(buyToken.decimals, amount_out || "0")}
          >
            {Number(toReadableNumber(buyToken.decimals, amount_out || "0")) >
              0 &&
            Number(toReadableNumber(buyToken.decimals, amount_out || "0")) <
              0.001
              ? "< 0.001"
              : toPrecision(
                  toReadableNumber(buyToken.decimals, amount_out || "0"),
                  3
                )}
          </span>
        </div>
      </div>
    </span>
  );

  const created = (
    <span className=" relative  whitespace-nowrap    text-gray-10 xs:text-xs flex flex-col   xsm:justify-center  text-left xs:opacity-50">
      <span className="xsm:hidden">
        {moment(
          Math.floor(Number(timestamp) / TIMESTAMP_DIVISOR) * 1000
        ).format("YYYY-MM-DD")}
      </span>
      <span className="xsm:hidden">
        {moment(
          Math.floor(Number(timestamp) / TIMESTAMP_DIVISOR) * 1000
        ).format("HH:mm")}
      </span>

      <span className="lg:hidden text-center">
        {moment(
          Math.floor(Number(timestamp) / TIMESTAMP_DIVISOR) * 1000
        ).format("YYYY-MM-DD HH:mm")}
      </span>
    </span>
  );

  const actions = (
    <div className=" col-span-1 pr-4  text-gray-10  text-xs flex flex-col items-end justify-self-end p-1.5">
      <span className="flex items-center text-sm text-white whitespace-nowrap">
        {<FormattedMessage id="executed" defaultMessage={"Executed"} />}
      </span>
      <div className="relative">
        {!!orderTx && (
          <a
            className="flex items-center text-gray-10 cursor-pointer hover:text-white"
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
              <div className="w-44 absolute -bottom-2 left-14 bg-dark-70 border border-gray-70 rounded-lg p-2 shadow-lg z-50">
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
                      handleTxClick(orderTx, `${getConfig().explorerUrl}/txns`)
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
        )}
      </div>
    </div>
  );

  return (
    <>
      <Fragment>
        <tr>
          <td>
            <div className="pb-2.5"></div>
          </td>
        </tr>
        <tr
          className={`mb-4 overflow-visible   xs:hidden px-4 py-3 text-sm   z-20   relative  w-full rounded-xl items-center   hover:bg-gray-20 hover:bg-opacity-50 bg-gray-20 bg-opacity-20`}
          style={{
            zIndex: 21,
          }}
        >
          <td className="rounded-l-xl">{sellTokenAmount}</td>

          <td>
            <span className="text-white text-lg frcs w-7 xs:hidden ">
              <MyOrderInstantSwapArrowRight />
            </span>
          </td>

          <td>{buyTokenAmount}</td>

          <td>{feeTier}</td>

          <td>{orderRate}</td>

          <td>{created}</td>

          <td className=""></td>
          <td className="rounded-r-xl">{actions}</td>
        </tr>
      </Fragment>

      <div
        className="w-full relative mb-4 md:hidden lg:hidden bg-dark-290 rounded-lg"
        style={
          {
            // zIndex: 20 - index,
          }
        }
      >
        {/* title */}
        <div className="rounded-t-xl relative bg-portfolioMobileBg px-3 pt-3">
          <div className="flex items-center relative justify-between">
            {sellTokenAmount}
            <MyOrderMobileArrow />
            {buyTokenAmount}
          </div>
          <div className="grid grid-cols-3 pb-1.5">
            <div className="flex items-center justify-center bg-gray-270 rounded-xl text-xs text-gray-10 justify-self-start px-2 py-0.5">
              Swapped
            </div>
            {created}
            <div className="relative z-50 justify-self-end">
              {!!orderTx && (
                <a
                  className="flex items-center text-gray-10 cursor-pointer hover:text-white text-xs bg-black bg-opacity-20 rounded py-0.5 px-1.5"
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
        <div className="rounded-b-xl p-3 pb-1">
          <MobileInfoBanner
            text={
              <FormattedMessage id="fee_tiers" defaultMessage={"Fee Tiers"} />
            }
            value={feeTier}
          />

          <MobileInfoBanner
            text={`1 ${
              sort ? buyToken?.symbol : tokensMap[token_in].symbol
            } Price`}
            value={orderRate}
          />

          <MobileInfoBanner
            text={
              <FormattedMessage defaultMessage={"Executed"} id="executed" />
            }
            value={claimed}
          />
        </div>
      </div>
    </>
  );
}
export default React.memo(HistorySwapInfoLine);
