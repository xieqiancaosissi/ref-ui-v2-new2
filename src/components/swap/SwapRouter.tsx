import React, { useState } from "react";
import Big from "big.js";
import { useSwapStore } from "@/stores/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { ArrowTopRightIcon, ArrowRightIcon } from "./icons";
import TradeRouteModal from "./TradeRouteModal";

function SwapRouter() {
  const [showRouteDetail, setShowRouteDetail] = useState<boolean>(false);
  const swapStore = useSwapStore();
  const best = swapStore.getBest();
  const estimates = swapStore.getEstimates();
  const estimatesServer = swapStore.getEstimatesServer();
  const { estimatesFromServer, tokensMap } = estimatesServer || {};
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  function showDetailModal() {
    setShowRouteDetail(true);
  }
  function closeDetailModal() {
    setShowRouteDetail(false);
  }
  let throughPoolsLength = 0;
  if (estimatesServer) {
    throughPoolsLength = estimatesFromServer.routes
      .reduce((acc, cur) => {
        return acc.plus(cur.pools.length);
      }, Big(0))
      .toNumber();
  } else if (estimates) {
    throughPoolsLength = estimates.length;
  }
  if (!estimates?.length && !estimatesServer) return null;
  const routeLength = estimates?.length || estimatesFromServer?.routes?.length;
  function getDisplayTokensOfOnePath() {
    if (estimates) {
      return estimates[0].tokens || [];
    } else if (estimatesServer) {
      const route = estimatesFromServer.routes[0];
      const tokenIds = route.pools.reduce((acc, cur, index) => {
        if (index == 0) {
          acc.push(cur.token_in, cur.token_out);
        } else {
          acc.push(cur.token_out);
        }
        return acc;
      }, [] as string[]);
      return tokenIds.map((id) => tokensMap[id]);
    }
    return [];
  }
  return (
    <div className="flexBetween">
      <span>Router</span>
      <div
        onClick={showDetailModal}
        className="flex items-center gap-1.5 border border-gray-90 rounded p-0.5 px-1 text-xs text-gray-160 hover:text-white hover:bg-dark-10 cursor-pointer"
      >
        {/* <RefMarketIcon />
        <span className="w-px h-2 bg-gray-160"></span> */}
        {best == "v1" ? (
          <>
            {routeLength > 2 ? (
              <span>{throughPoolsLength} Steps in the Router</span>
            ) : (
              <div className="flex items-center gap-1">
                <OneRouter tokens={getDisplayTokensOfOnePath()} />
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-1">
            <OneRouter tokens={[tokenIn, tokenOut]} />
          </div>
        )}

        <ArrowTopRightIcon />
      </div>
      {showRouteDetail ? (
        <TradeRouteModal isOpen={true} onRequestClose={closeDetailModal} />
      ) : null}
    </div>
  );
}
export default React.memo(SwapRouter);
function OneRouter({ tokens }: { tokens: TokenMetadata[] }) {
  return tokens.map((token: TokenMetadata, index) => {
    return (
      <div className="flex items-center gap-1" key={token.id}>
        <img
          style={{ width: "14px", height: "14px" }}
          className="border border-dark-100 rounded-full"
          src={token.icon}
        />
        {index == tokens.length - 1 ? null : <ArrowRightIcon />}
      </div>
    );
  });
}
