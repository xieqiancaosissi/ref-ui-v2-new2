import _ from "lodash";
import { Pool } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { PoolMode, EstimateSwapView } from "@/interfaces/swap";
import { getAllStablePoolsFromCache } from "./swap";
import getStablePoolEstimate from "./getStablePoolEstimate";
import getSinglePoolEstimate from "./getSinglePoolEstimate";
import getPoolEstimate from "./getPoolEstimate";
import {
  isStableToken,
  getStablePoolThisPair,
  isStablePool,
} from "./swapUtils";
const getOneSwapActionResult = async ({
  poolsOneSwap,
  tokenIn,
  tokenOut,
  supportLedger,
  throwNoPoolError,
  amountIn,
  parsedAmountIn,
}: {
  poolsOneSwap: Pool[];
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  supportLedger: boolean;
  throwNoPoolError: (p?: any) => void;
  amountIn: string;
  parsedAmountIn: string;
}) => {
  const { allStablePoolsById, allStablePools } =
    await getAllStablePoolsFromCache();

  let supportLedgerRes: EstimateSwapView[] = [];

  /**
   * for swap pro, we need to calculate the result on tri pool
   * to do price comparison on tri result and ref result
   *
   */

  let pools: Pool[] = poolsOneSwap;

  if (isStableToken(tokenIn.id) && isStableToken(tokenOut.id)) {
    pools = pools.concat(
      getStablePoolThisPair({
        tokenInId: tokenIn.id,
        tokenOutId: tokenOut.id,
        stablePools: allStablePools,
      })
    );
  }

  /**s
   *  single swap action estimate for support ledger and swap pro mode
   *
   */
  if (pools.length === 0 && supportLedger) {
    throwNoPoolError();
  }

  if (pools.length > 0) {
    const bestPricePool =
      pools.length === 1
        ? pools[0]
        : (_.maxBy(pools, (p) => {
            if (isStablePool(p.id)) {
              return Number(
                getStablePoolEstimate({
                  tokenIn,
                  tokenOut,
                  stablePool: allStablePoolsById[p.id][0],
                  stablePoolInfo: allStablePoolsById[p.id][1],
                  amountIn,
                }).estimate
              );
            }
            return Number(
              getSinglePoolEstimate(tokenIn, tokenOut, p, parsedAmountIn)
                .estimate
            );
          }) as Pool);

    const estimateRes = await getPoolEstimate({
      tokenIn,
      tokenOut,
      amountIn: parsedAmountIn,
      pool: bestPricePool,
    });

    const res = [
      {
        ...estimateRes,
        status: PoolMode.PARALLEL,
        routeInputToken: tokenIn.id,
        totalInputAmount: parsedAmountIn,
        pool: {
          ...bestPricePool,
          partialAmountIn: parsedAmountIn,
        },
        tokens: [tokenIn, tokenOut],
        inputToken: tokenIn.id,
        outputToken: tokenOut.id,
        parsedAmountIn,
      },
    ];

    supportLedgerRes = res;
  }

  // get result on tri pools but just one swap action

  return {
    supportLedgerRes,
  };
};
export default getOneSwapActionResult;
