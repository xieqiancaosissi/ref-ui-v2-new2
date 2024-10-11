import {
  formatWithCommas,
  toInternationalCurrencySystem,
  calculateFairShare,
  toRoundedReadableNumber,
} from "@/utils/numbers";

export const tokenAmountInShares = (pool: any, token: any, shares: string) => {
  const value = toRoundedReadableNumber({
    decimals: token?.decimals,
    number: calculateFairShare({
      shareOf: pool?.supplies[token.tokenId],
      contribution: shares,
      totalContribution: pool?.shares_total_supply,
    }),
    precision: 3,
    withCommas: false,
  });

  return Number(value) == 0
    ? "0"
    : Number(value) < 0.001 && Number(value) > 0
    ? "< 0.001"
    : toInternationalCurrencySystem(value, 3);
};
