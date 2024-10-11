import React, { useState } from "react";
import CurrentPrice from "../currentPrice";

export default function SetPriceRange(props: any) {
  const { token, getherPrice, tokenPriceList } = props;
  const [pairValue, setPairValue] = useState<any>();
  const changeVal = (e: any) => {
    setPairValue(e.target.value);
    getherPrice(e.target.value);
  };
  return (
    <div>
      <div className="flex items-center justify-start text-gray-60 font-normal text-sm mt-[24px] mb-[10px]">
        Set Price Range
      </div>
      <div
        className="flex flex-col h-16 w-full items-center border border-transparent hover:border-green-20 rounded px-[12px] py-[8px]"
        style={{ background: "rgba(0,0,0,.2)" }}
      >
        {token[0]?.id && token[1]?.id && (
          <div className="w-full flex justify-between items-center h-full">
            1 {token[0].symbol} =
            <input
              type="number"
              className="flex-1 text-white ml-[4px]"
              style={{ fontSize: "18px" }}
              value={pairValue}
              onChange={(e) => changeVal(e)}
              placeholder="0.0"
            />
            <span className="text-white text-base">
              {token[1].symbol || "NEAR"}
            </span>
          </div>
        )}
      </div>
      <CurrentPrice
        token={token}
        tokenPriceList={tokenPriceList}
        changeVal={changeVal}
      />
    </div>
  );
}
