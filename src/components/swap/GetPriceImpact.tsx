import React from "react";
import {
  scientificNotationToString,
  multiply,
  divide,
  toInternationalCurrencySystemLongString,
  toPrecision,
} from "@/utils/numbers";
import {
  PRICE_IMPACT_WARN_VALUE,
  PRICE_IMPACT_RED_VALUE,
} from "@/utils/constant";
const GetPriceImpact = (
  value: string,
  tokenInAmount?: string,
  infoStyle?: string
) => {
  const textColor =
    Number(value) <= PRICE_IMPACT_WARN_VALUE
      ? "text-gray-50"
      : PRICE_IMPACT_WARN_VALUE < Number(value) &&
        Number(value) <= PRICE_IMPACT_RED_VALUE
      ? "text-yellow-10"
      : "text-red-10";
  const displayValue = scientificNotationToString(
    multiply(tokenInAmount || "0", divide(value, "100"))
  );

  const tokenInInfo =
    Number(displayValue) <= 0
      ? ` / 0`
      : ` / -${toInternationalCurrencySystemLongString(displayValue, 3)}`;

  if (Number(value) < 0.01)
    return (
      <span className="text-gray-50">
        {`< -0.01%`}
        {tokenInInfo}
      </span>
    );

  if (Number(value) > 1000)
    return (
      <span className="text-red-10">
        {`< -1000%`}
        {tokenInInfo}
      </span>
    );

  return (
    <span className={`${textColor} ${infoStyle}`}>
      {`-${toPrecision(value, 2)}%`}
      {tokenInInfo}
    </span>
  );
};
export default GetPriceImpact;
