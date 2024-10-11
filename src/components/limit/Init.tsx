import React, { useEffect } from "react";
import {
  pointToPrice,
  regularizedPoint,
  feeToPointDelta,
} from "@/services/swapV3";
import { toPrecision } from "@/utils/numbers";
import { getReverseRate } from "@/services/limit/limitUtils";
import {
  useLimitStore,
  usePersistLimitStore,
  IPersistLimitStore,
} from "@/stores/limitOrder";

function Init() {
  const limitStore = useLimitStore();
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const dclPool = persistLimitStore.getDclPool();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  // init
  useEffect(() => {
    if (dclPool?.pool_id && tokenIn?.id && tokenOut?.id) {
      const { current_point, pool_id, fee } = dclPool;
      const [token_x, token_y] = pool_id.split("|");
      const point = token_x == tokenIn.id ? current_point : current_point * -1;
      const regularPoint = regularizedPoint(point, fee);
      const price = pointToPrice({
        tokenA: tokenIn,
        tokenB: tokenOut,
        point:
          point === regularPoint
            ? regularPoint
            : regularPoint + feeToPointDelta(fee),
      });
      const rate = toPrecision(price, 8);
      limitStore.setRate(rate);
      limitStore.setReverseRate(getReverseRate(rate));
      limitStore.setMarketRate(rate);
      limitStore.setTokenInAmount("1");
      limitStore.setTokenOutAmount(rate);
    }
  }, [dclPool?.pool_id, dclPool?.current_point, tokenIn?.id, tokenOut?.id]);
  return null;
}
export default React.memo(Init);
