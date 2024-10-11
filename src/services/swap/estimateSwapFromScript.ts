import Big from "big.js";
import { toNonDivisibleNumber, ONLY_ZEROS } from "@/utils/numbers";
import { EstimateSwapView, EstimateSwapOptions } from "@/interfaces/swap";
import { getContainPairsPools } from "./swap";
import getOneSwapActionResult from "./getOneSwapActionResult";
import { isStableToken, getRefPoolsByTokens, getLiquidity } from "./swapUtils";
import getHybridStableSmart from "./getHybridStableSmart";
import { LOW_POOL_TVL_BOUND } from "@/utils/constant";
import {
  transformWorkerResult,
  createSmartRouteLogicWorker,
} from "./smartRouteLogicWorker";
const smartRouteLogicWorker: any = createSmartRouteLogicWorker();
const estimateSwapFromScript = async ({
  tokenIn,
  tokenOut,
  amountIn,
  supportLedger,
  hideLowTvlPools,
}: EstimateSwapOptions): Promise<{
  estimates: EstimateSwapView[];
  tag: string;
}> => {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  const tag = `${tokenIn.id}-${parsedAmountIn}-${tokenOut.id}`;

  if (ONLY_ZEROS.test(parsedAmountIn))
    throw new Error(`${amountIn} is not a valid swap amount`);

  const throwNoPoolError = () => {
    throw new Error(
      `No pool available to make a swap from ${tokenIn?.symbol} -> ${tokenOut?.symbol} for the amount ${amountIn}`
    );
  };

  let containPairsPools = await getContainPairsPools({
    tokenInId: tokenIn.id,
    tokenOutId: tokenOut.id,
  });
  containPairsPools = containPairsPools.filter((p: any) => {
    return getLiquidity(p, tokenIn, tokenOut) > 0;
  });
  const { supportLedgerRes } = await getOneSwapActionResult({
    poolsOneSwap: containPairsPools,
    supportLedger,
    tokenIn,
    tokenOut,
    throwNoPoolError,
    amountIn,
    parsedAmountIn,
  });

  if (supportLedger || containPairsPools?.[0]?.source == "rpc") {
    return { estimates: supportLedgerRes, tag };
  }
  const orpools = hideLowTvlPools
    ? (await getRefPoolsByTokens()).filter(
        (pool) => +(pool.tvl || 0) >= LOW_POOL_TVL_BOUND
      )
    : await getRefPoolsByTokens();
  let res;
  let smartRouteV2OutputEstimate;

  try {
    const stableSmartActionsV2: any = transformWorkerResult(
      await smartRouteLogicWorker.getStableSmart({
        pools: orpools.filter((p) => !p?.Dex || p.Dex !== "tri"),
        inputToken: tokenIn.id,
        outputToken: tokenOut.id,
        totalInput: parsedAmountIn,
      })
    );
    res = stableSmartActionsV2;

    smartRouteV2OutputEstimate = stableSmartActionsV2
      .filter((a: any) => a.outputToken == a.routeOutputToken)
      .map((a: any) => new Big(a.estimate))
      .reduce((a: any, b: any) => a.plus(b), new Big(0))
      .toString();
  } catch (error) {
    console.error("smartRouteV2OutputEstimate error", error);
  }

  let bestEstimate = smartRouteV2OutputEstimate || 0;
  // hybrid smart routing
  if (isStableToken(tokenIn.id) || isStableToken(tokenOut.id)) {
    const hybridStableSmart = await getHybridStableSmart(
      tokenIn,
      tokenOut,
      amountIn
    );

    const hybridStableSmartOutputEstimate =
      hybridStableSmart.estimate.toString();

    if (
      new Big(
        hybridStableSmartOutputEstimate === "NaN"
          ? "0"
          : hybridStableSmartOutputEstimate
      ).gt(bestEstimate)
    ) {
      bestEstimate = hybridStableSmartOutputEstimate || 0;

      res = hybridStableSmart.actions;
    }
  }

  if (
    new Big(supportLedgerRes?.[0]?.estimate || 0).gt(new Big(bestEstimate || 0))
  ) {
    res = supportLedgerRes;
  }
  if (!res?.length) {
    throwNoPoolError();
  }
  return { estimates: res, tag };
};
export default estimateSwapFromScript;
