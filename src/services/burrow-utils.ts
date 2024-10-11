import { toReadableNumber } from "@/utils/numbers";
import Big from "big.js";

export const shrinkToken = (
  value: string | number,
  decimals: number
): string => {
  return toReadableNumber(decimals, Big(value || 0).toFixed(0));
};
