import React, { useContext, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import HoverTip from "@/components/common/Tips";
export function PoolSlippageSelectorV3({
  slippageTolerance,
  onChange,
  textColor,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
  textColor?: string;
}) {
  const validSlippages = [0.1, 0.5, 1.0];
  const intl = useIntl();
  const slippageCopyId =
    "Slippage means the difference between what you expect to get and what you actually get due to other executing first";

  return (
    <>
      <fieldset className="flex lg:items-center flex-wrap justify-between mb-4 pt-2">
        <div className="flex items-center md:mb-4 xs:mb-4">
          <label
            className={`text-sm text-center ${textColor || "text-gray-10"}`}
          >
            Slippage tolerance
          </label>
          <div className="text-gray-10">
            <HoverTip msg={slippageCopyId} extraStyles={"w-50"} />
          </div>
        </div>

        <div className="flex text-white items-center">
          {validSlippages.map((slippage) => (
            <div
              key={slippage}
              className={`flex items-center justify-center cursor-pointer w-12 rounded-lg text-xs border border-gray-100  py-1 px-2 mx-1 ${
                slippage === slippageTolerance
                  ? "text-white bg-gray-100"
                  : "text-gray-60"
              }`}
              onClick={() => onChange(slippage)}
            >
              {slippage}%
            </div>
          ))}
        </div>
      </fieldset>
    </>
  );
}
