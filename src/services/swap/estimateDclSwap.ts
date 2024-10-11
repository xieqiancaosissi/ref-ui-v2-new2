import _ from "lodash";
import {
  EstimateDclSwapOptions,
  EstimateDclSwapView,
  IEstimateDclSwapView,
} from "@/interfaces/swapDcl";
import { getAllDclPoolsFromCache, getQuote } from "./swapDcl";
import { V3_POOL_FEE_LIST } from "@/utils/constant";
import { tagValidator } from "./swapDclUtils";

const estimateDclSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
}: EstimateDclSwapOptions): Promise<IEstimateDclSwapView> => {
  const allDCLPools = await getAllDclPoolsFromCache();
  const estimates: EstimateDclSwapView[] = await Promise.all(
    V3_POOL_FEE_LIST.map((fee) =>
      getQuote({
        fee,
        tokenIn,
        tokenOut,
        tokenInAmount: amountIn,
        allDCLPools,
      })
    )
  );
  const bestEstimate =
    estimates && estimates?.some((e) => !!e)
      ? _.maxBy(estimates, (e) => Number(!e?.tag ? -1 : e.amount))
      : null;
  if (bestEstimate && tagValidator(bestEstimate, tokenIn, amountIn)) {
    return bestEstimate;
  }
  return null;
};
export default estimateDclSwap;
