import React from "react";
import { TokenMetadata } from "@/services/ft-contract";
import { toPrecision } from "@/utils/numbers";

export function SellTokenAmountPre({
  sellToken,
  orderIn,
}: {
  sellToken: TokenMetadata;
  orderIn: string;
}) {
  return (
    <span className="flex py-4 pl-3  flex-shrink-0 items-center">
      <img
        src={sellToken.icon}
        className="border border-gradientFrom rounded-full w-7 h-7 xsm:w-6 xsm:h-6"
        alt=""
      />

      <div className="flex   xs:flex-row flex-col ml-2">
        <span className="text-white text-sm mr-2" title={orderIn}>
          {Number(orderIn) > 0 && Number(orderIn) < 0.01
            ? "< 0.01"
            : toPrecision(orderIn, 2)}
        </span>

        <span className="text-gray-10 text-xs xs:relative xs:top-0.5">
          {sellToken.symbol}
        </span>
      </div>
    </span>
  );
}
export function BuyTokenAmountPre({
  buyToken,
  buyAmount,
}: {
  buyToken: TokenMetadata;
  buyAmount: string;
}) {
  return (
    <span className="flex items-center col-span-1 ">
      <img
        src={buyToken.icon}
        className="border flex-shrink-0 border-gradientFrom rounded-full w-7 h-7 xsm:w-6 xsm:h-6"
        alt=""
      />

      <div className="flex xs:flex-row flex-col ml-2">
        <span
          className="text-white mr-2 text-sm whitespace-nowrap"
          title={buyAmount}
        >
          {Number(buyAmount) > 0 && Number(buyAmount) < 0.01
            ? "< 0.01"
            : toPrecision(buyAmount, 2)}
        </span>

        <span className="text-gray-10 text-xs xs:relative xs:top-0.5">
          {buyToken.symbol}
        </span>
      </div>
    </span>
  );
}

export const SellTokenAmount = React.memo(SellTokenAmountPre);
export const BuyTokenAmount = React.memo(BuyTokenAmountPre);
