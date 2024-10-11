import _ from "lodash";
import { Pool } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { StablePool } from "@/interfaces/swap";
import { getStablePoolDecimal } from "./swapUtils";
import getSwappedAmount from "./getSwappedAmount";
import {
  toReadableNumber,
  toPrecision,
  scientificNotationToString,
} from "@/utils/numbers";
const getStablePoolEstimate = ({
  tokenIn,
  tokenOut,
  amountIn,
  stablePoolInfo,
  stablePool,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  stablePoolInfo: StablePool;
  stablePool: Pool;
}) => {
  const STABLE_LP_TOKEN_DECIMALS = getStablePoolDecimal(stablePool.id);

  const [amount_swapped, , dy] = getSwappedAmount(
    tokenIn.id,
    tokenOut.id,
    amountIn,
    stablePoolInfo
  );

  const amountOut =
    amount_swapped < 0
      ? "0"
      : toPrecision(scientificNotationToString(amount_swapped.toString()), 0);

  const dyOut =
    amount_swapped < 0
      ? "0"
      : toPrecision(scientificNotationToString(dy.toString()), 0);

  return {
    estimate: toReadableNumber(STABLE_LP_TOKEN_DECIMALS, amountOut),
    noFeeAmountOut: toReadableNumber(STABLE_LP_TOKEN_DECIMALS, dyOut),
    pool: { ...stablePool, Dex: "ref" },
    token: tokenIn,
    outputToken: tokenOut.id,
    inputToken: tokenIn.id,
  };
};

export default getStablePoolEstimate;
