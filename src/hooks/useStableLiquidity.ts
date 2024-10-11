import React, { useState, useEffect } from "react";
import { StablePool } from "@/interfaces/swap";
import { ONLY_ZEROS } from "@/utils/numbers";
import { getAddLiquidityShares } from "./useStableShares";
export const usePredictShares = ({
  poolId,
  tokenAmounts,
  stablePool,
}: {
  poolId: number;
  tokenAmounts: string[];
  stablePool: StablePool;
}) => {
  const [predicedShares, setPredictedShares] = useState<string>("0");
  const zeroValidae = () => {
    return tokenAmounts.every((amount) => ONLY_ZEROS.test(amount));
  };

  useEffect(() => {
    if (zeroValidae()) {
      setPredictedShares("0");
      return;
    }
    getAddLiquidityShares(
      poolId,
      tokenAmounts.map((amount) => amount || "0"),
      stablePool
    )
      .then(setPredictedShares)
      .catch((e) => e);
  }, [...tokenAmounts]);

  return predicedShares;
};
