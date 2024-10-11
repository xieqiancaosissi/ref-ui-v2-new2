import { TokenMetadata } from "@/services/ft-contract";
import { scientificNotationToString } from "@/utils/numbers";
import { toPrecision, toReadableNumber } from "@/utils/numbers";
import { percent } from "@/utils/numbers";
import { getStablePoolDecimal } from "@/services/swap/swapUtils";
import BigNumber from "bignumber.js";
import { getAccountId } from "@/utils/wallet";
export function formatePoolData(pool: any, userTotalShare: any) {
  const isSignedIn = getAccountId();

  const parsedUsertotalShare = scientificNotationToString(
    userTotalShare.toString()
  );

  const displayMyShareAmount = isSignedIn
    ? toPrecision(
        toReadableNumber(getStablePoolDecimal(pool.id), parsedUsertotalShare),
        2,
        true
      )
    : "-";

  const sharePercentValue = scientificNotationToString(
    percent(parsedUsertotalShare, pool.shares_total_supply).toString()
  );

  const sharePercent =
    Number(sharePercentValue) > 0 && Number(sharePercentValue) < 0.01
      ? "< 0.01%"
      : `${toPrecision(sharePercentValue, 2)}%`;

  const displaySharePercent = isSignedIn ? sharePercent : "";

  return {
    displayMyShareAmount,
    displaySharePercent,
  };
}

export const calculateTotalStableCoins = (
  pools: any[],
  tokens: { [id: string]: TokenMetadata }
) => {
  const coinsAmounts: { [id: string]: BigNumber } = {};

  pools.forEach((p) => {
    Object.entries(p.supplies).map(([id, amount]) => {
      coinsAmounts[id] = (
        coinsAmounts?.[id] ? coinsAmounts[id] : new BigNumber(0)
      ).plus(toReadableNumber(tokens[id].decimals, amount as any));
    });
  });

  const totalCoins = BigNumber.sum(...Object.values(coinsAmounts))
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });

  return { totalCoins, coinsAmounts };
};
