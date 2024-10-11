import React, { useEffect, useState } from "react";
import { toRealSymbol } from "@/services/farm";
import { TokenMetadata } from "@/services/ft-contract";
import { getBoostTokenPrices } from "@/services/farm";
import BigNumber from "bignumber.js";
import { toPrecision } from "@/utils/numbers";
import { ExchangeIcon } from "../../icon";

export const POINTDELTAMAP = {
  100: 1,
  400: 8,
  2000: 40,
  10000: 200,
};
export default function CurrentPrice(props: any) {
  const { token, tokenPriceList, changeVal } = props;

  //   const [createPoolButtonLoading, setCreatePoolButtonLoading] = useState(false);
  const [createPoolRate, setCreatePoolRate] = useState<string>("");
  const [rateStatus, setRateStatus] = useState(true);
  useEffect(() => {
    if (Object.keys(tokenPriceList)?.length > 0 && token?.length > 0) {
      const rateString = new BigNumber(
        tokenPriceList[token[rateStatus ? 0 : 1].id]?.price /
          tokenPriceList[token[rateStatus ? 1 : 0].id]?.price
      ).toFixed();
      setCreatePoolRate(toPrecision(rateString, 6));
    }
  }, [tokenPriceList, token]);

  function switchRate() {
    setRateStatus(!rateStatus);
  }
  function getPoolRate() {
    if (createPoolRate) {
      const rate = 1 / +createPoolRate;
      return toPrecision(rate.toString(), 6);
    }
    return "";
  }
  return (
    <div className="flex items-center mt-[8px] text-gray-50">
      <span className="text-sm text-gray-50 mr-2 mb-2">Current Price:</span>
      {token[0]?.id && token[1]?.id && (
        <div className="flex items-center text-sm mb-2">
          {rateStatus ? (
            <div
              className="mr-0.5 underline hover:cursor-pointer"
              onClick={() => {
                changeVal({
                  target: {
                    value: createPoolRate,
                  },
                });
              }}
            >
              1 {toRealSymbol(token[0]?.symbol)}
              <label className="mx-0.5">=</label>
              <span>
                {createPoolRate} {toRealSymbol(token[1]?.symbol)}
              </span>
            </div>
          ) : (
            <div
              className="mr-0.5 underline hover:cursor-pointer"
              onClick={() => {
                changeVal({
                  target: {
                    value: createPoolRate,
                  },
                });
              }}
            >
              1 {toRealSymbol(token[1]?.symbol)}
              <label className="mx-0.5">=</label>
              <span>
                {getPoolRate()} {toRealSymbol(token[0]?.symbol)}
              </span>
            </div>
          )}

          <ExchangeIcon
            className="ml-[4px] cursor-pointer text-green-10"
            onClick={switchRate}
          />
        </div>
      )}
    </div>
  );
}
