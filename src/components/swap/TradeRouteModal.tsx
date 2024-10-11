import React, { useMemo, useEffect, useState } from "react";
import Modal from "react-modal";
import { useSwapStore } from "@/stores/swap";
import {
  separateRoutes,
  getPoolAllocationPercents,
  getRouteAllocationPercents,
} from "@/services/swap/swapUtils";
import { getV3PoolId } from "@/services/swap/swapDclUtils";
import { IEstimateSwapServerView, Pool } from "@/interfaces/swap";
import TradeRouteHub from "@/components/swap/TradeRouteHub";
import { LeftBracket, RightBracket } from "@/components/swap/Bracket";
import Token from "@/components/swap/Token";
import { PolygonArrowIcon, RefMarketRouteIcon } from "./icons";
import { CloseIcon } from "@/components/common/Icons";
import { getTokensOfRoute } from "@/services/swap/smartRouterFromServer";

function TradeRouteModal({
  isOpen,
  onRequestClose,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
}) {
  const [estimatesFromServerUI, setEstimatesFromServerUI] =
    useState<IEstimateSwapServerView>();
  const swapStore = useSwapStore();
  const estimates = swapStore.getEstimates();
  const estimatesServer = swapStore.getEstimatesServer();
  const avgFee = swapStore.getAvgFee();
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const best = swapStore.getBest();
  const { estimatesFromServer } = estimatesServer || {};
  useEffect(() => {
    if (estimatesServer) {
      getTokensDataOfEstimatesServer();
    }
  }, [JSON.stringify(estimatesServer || {})]);
  async function getTokensDataOfEstimatesServer() {
    const pending = estimatesFromServer.routes.map((route) =>
      getTokensOfRoute(route)
    );
    const tokens_of_routes = await Promise.all(pending);
    estimatesFromServer.routes.map((route, index) => {
      route.tokens = tokens_of_routes[index];
    });
    setEstimatesFromServerUI(JSON.parse(JSON.stringify(estimatesFromServer)));
  }
  const identicalRoutes = estimates
    ? separateRoutes(
        estimates,
        estimates[estimates.length - 1].outputToken ?? ""
      )
    : [];
  const percents = useMemo(() => {
    try {
      const pools = identicalRoutes
        .map((r) => r[0])
        .map((hub: any) => hub.pool) as Pool[];
      return getPoolAllocationPercents(pools);
    } catch (error) {
      if (identicalRoutes.length === 0) return ["100"];
      else return identicalRoutes.map((r: any) => r[0].percent);
    }
  }, [JSON.stringify(identicalRoutes || []), best]);
  const percentsServer = useMemo(() => {
    const routes = estimatesFromServer?.routes || [];
    try {
      return getRouteAllocationPercents(routes);
    } catch (error) {
      return ["100"];
    }
  }, [(estimatesFromServer?.routes || []).length]);
  const routeLength =
    best == "v3"
      ? 1
      : identicalRoutes.length || estimatesFromServer?.routes?.length;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
    >
      <div className="bg-dark-10 p-6 lg:pb-8 rounded-lg rounded-b-none xsm:w-screen">
        {/* title */}
        <div className="flexBetween">
          <div className="flex items-center gap-3 text-white text-lg">
            <RefMarketRouteIcon /> Trade Router
          </div>
          <CloseIcon
            className="text-gray-50 hover:text-white cursor-pointer"
            onClick={onRequestClose}
          />
        </div>
        <div className="flexBetween mt-10">
          <Token icon={tokenIn.icon} size="26" />
          <LeftBracket size={routeLength} />
          <div className="relative mx-2 overflow-x-auto">
            <div className="w-[620px]">
              {best == "v1" && estimates ? (
                <>
                  {identicalRoutes.map((route: any, j) => {
                    return (
                      <div key={j} className="relative flexBetween my-3">
                        <span className="text-xs text-gray-180">
                          {percents[j]}%
                        </span>
                        {/* background line */}
                        <div
                          className="absolute border border-dashed left-8 opacity-30 border-gray-60 w-full"
                          style={{
                            width: "calc(100% - 32px)",
                          }}
                        ></div>
                        {/* pools have passed  */}
                        <div className="flex items-center">
                          {route[0].tokens
                            ?.slice(1, route[0].tokens.length)
                            .map((t, i) => {
                              return (
                                <>
                                  <TradeRouteHub
                                    poolId={Number(route[i].pool?.id)}
                                    token={t}
                                    contract="Ref_Classic"
                                  />
                                  {t.id !==
                                    route[0].tokens?.[
                                      route[0].tokens.length - 1
                                    ]?.id && (
                                    <div className="relative mx-3 z-10">
                                      <PolygonArrowIcon />
                                    </div>
                                  )}
                                </>
                              );
                            })}
                        </div>
                        <PolygonArrowIcon />
                      </div>
                    );
                  })}
                </>
              ) : null}
              {best == "v1" && estimatesFromServerUI ? (
                <>
                  {estimatesFromServerUI.routes.map((route, j) => {
                    const { pools, tokens } = route;
                    return (
                      <div key={j} className="relative frcb my-3 ">
                        <span className="text-xs text-gray-180">
                          {percentsServer[j]}%
                        </span>
                        <div
                          className="border border-dashed absolute left-5 opacity-30 border-gray-60 w-full px-3"
                          style={{
                            width: "calc(100% - 32px)",
                          }}
                        ></div>
                        <div className="frcs">
                          {tokens?.slice(1, tokens.length).map((t, i) => {
                            return (
                              <>
                                <TradeRouteHub
                                  poolId={Number(pools[i].pool_id)}
                                  token={t}
                                  contract="Ref_Classic"
                                />
                                {t.id !== tokens[tokens.length - 1]?.id && (
                                  <div className="mx-3">
                                    <PolygonArrowIcon />
                                  </div>
                                )}
                              </>
                            );
                          })}
                        </div>

                        <PolygonArrowIcon />
                      </div>
                    );
                  })}
                </>
              ) : null}
              {best == "v3" ? (
                <>
                  <div className="relative flexBetween my-3">
                    <span className="text-xs text-gray-180">100%</span>
                    {/* background line */}
                    <div
                      className="absolute border border-dashed left-8 opacity-30 border-gray-60 w-full"
                      style={{
                        width: "calc(100% - 32px)",
                      }}
                    ></div>
                    {/* pools have passed  */}
                    <div className="flex items-center">
                      <TradeRouteHub
                        poolId={getV3PoolId(
                          tokenIn.id,
                          tokenOut.id,
                          +avgFee * 100
                        )}
                        token={tokenOut}
                        contract="Ref_DCL"
                      />
                    </div>
                    <PolygonArrowIcon />
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <RightBracket size={routeLength} />
          <Token icon={tokenOut.icon} size="26" />
        </div>
      </div>
    </Modal>
  );
}
export default React.memo(TradeRouteModal);
