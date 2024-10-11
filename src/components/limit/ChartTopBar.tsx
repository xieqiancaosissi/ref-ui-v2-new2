import React from "react";
import { useLimitOrderChartStore } from "@/stores/limitChart";
import {
  Images,
  Symbols,
} from "@/components/pools/detail/liquidity/components/liquidityComComp";
import RateExchange from "./RateExchange";
import useTokenRate24h from "@/hooks/useTokenRate24h";
import { priceFormatter } from "@/services/limit/limitUtils";
import { IoArrowUpOutline } from "../reactIcons";
function ChartTopBar() {
  const limitChartStore = useLimitOrderChartStore();
  const tokenIn = limitChartStore.getTokenIn();
  const tokenOut = limitChartStore.getTokenOut();
  const diff = useTokenRate24h({
    base_token: tokenOut,
    token: tokenIn,
  });
  function switchTokens() {
    limitChartStore.setTokenIn(tokenOut);
    limitChartStore.setTokenOut(tokenIn);
  }
  function showOrderTable() {
    limitChartStore.setShowViewAll(true);
  }
  if (!(tokenIn && tokenOut)) return null;
  return (
    <div className="flex xsm:flex-col xsm:items-start items-center gap-3 xsm:gap-0 pl-1.5">
      <div className="flex items-center justify-between xsm:w-full">
        <div className="frcs">
          <Images
            borderStyle="1px solid #273342"
            size="6"
            tokens={[tokenIn, tokenOut]}
            uId={"swap-chart-header"}
            allowSameToken
            className="xsm:text-sm"
          />

          <Symbols
            className="ml-2 mr-2.5"
            tokens={[tokenIn, tokenOut]}
            size="4"
            separator="/"
          />
          <div className="lg:hidden">
            <RateExchange onChange={switchTokens} />
          </div>
        </div>
        <span
          onClick={showOrderTable}
          className="lg:hidden flex items-center justify-center rounded border border-gray-10 border-opacity-20 px-2 h-6 text-xs text-white"
        >
          View All
        </span>
      </div>
      <div className="frcs xsm:ml-0 xsm:mt-5">
        {diff && (
          <span className="text-sm text-gray-60">1 {tokenIn.symbol} =</span>
        )}
        <span className="text-white xsm:text-primaryGreen text-2xl font-extrabold px-2.5">
          {diff ? priceFormatter(diff.curPrice) : "-"}
        </span>

        {diff && (
          <span className="mr-1.5  text-sm text-gray-60">
            {tokenOut.symbol}
          </span>
        )}
        {diff && (
          <span
            className={`frcs text-xs rounded px-1 py-0.5
            ${
              diff.direction === "up"
                ? "text-primaryGreen bg-primaryGreen bg-opacity-10"
                : diff.direction === "down"
                ? "text-red-10 bg-red-10 bg-opacity-10"
                : "text-gray-60 bg-gray-60 bg-opacity-10"
            }
            
            `}
          >
            {diff.direction !== "unChange" && (
              <IoArrowUpOutline
                className={`${
                  diff.direction === "down" ? "transform  rotate-180" : ""
                } `}
              />
            )}

            {diff.percent}
          </span>
        )}
      </div>
      {/* for pc */}
      <div className="xsm:hidden">
        <RateExchange onChange={switchTokens} />
      </div>
      {/* for mobile */}
      {diff && (
        <div className="lg:hidden flex items-center justify-center rounded bg-dark-250 bg-opacity-80 w-full h-[30px] xsm:mt-2">
          <div className="flex items-center text-xs text-gray-260 text-opacity-75">
            Last Updated
            <span className="ml-1">{diff.lastUpdate}</span>
          </div>
        </div>
      )}
    </div>
  );
}
export default React.memo(ChartTopBar);
