import _ from "lodash";
import { Pool } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { toReadableNumber } from "@/utils/numbers";
import { isStablePool } from "./swapUtils";
import getSinglePoolEstimate from "./getSinglePoolEstimate";
import getStablePoolEstimate from "./getStablePoolEstimate";
import { getStablePoolFromCache } from "./swap";
const getPoolEstimate = async ({
  tokenIn,
  tokenOut,
  amountIn,
  pool,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  pool: Pool;
}) => {
  if (isStablePool(pool.id)) {
    const [, stablePoolInfo] = await getStablePoolFromCache(pool.id.toString());

    return getStablePoolEstimate({
      tokenIn,
      tokenOut,
      amountIn: toReadableNumber(tokenIn.decimals, amountIn),
      stablePoolInfo,
      stablePool: pool,
    });
  } else {
    return getSinglePoolEstimate(tokenIn, tokenOut, pool, amountIn);
  }
};
export default getPoolEstimate;
