import React, { useRef, useState, useEffect } from "react";
import { toPrecision } from "@/utils/numbers";
import Big from "big.js";
function RangeSlider(props: any) {
  const { setAmount, sliderAmount, setSliderAmount, max } = props;

  const [splitList] = useState([0, 25, 50, 75, 100]);

  const tipRef: any = useRef(null);
  const valueRef: any = useRef(null);
  useEffect(() => {
    const divMax = max > 0 ? max : 1;
    if (valueRef.current) {
      valueRef.current.style.backgroundSize = `${
        (sliderAmount * 100) / divMax
      }% 100%`;
    }
    if (tipRef.current) {
      tipRef.current.style.left = `${
        (sliderAmount * 100) / divMax > 100
          ? 100
          : (sliderAmount * 100) / divMax
      }%`;
      const marginLeft =
        (sliderAmount * 100) / divMax > 100
          ? -30
          : -10 - (20 * (sliderAmount * 100)) / divMax / 100;
      tipRef.current.style.marginLeft = `${marginLeft}px`;
    }
  }, [sliderAmount]);
  function changeValue(v: string) {
    setSliderAmount(v);
    // setAmount(
    //   Big(v)
    //     .div(100)
    //     .mul(balance || 0)
    //     .toFixed()
    // );
  }
  useEffect(() => {
    if (max == 0) {
      setSliderAmount(0);
    }
  }, [max]);
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3 -mx-3">
        {splitList.map((p) => {
          return (
            <div
              key={p}
              className={`flex flex-col items-center cursor-pointer`}
              onClick={() => {
                changeValue(new Big(max).times(p / 100).toString());
              }}
            >
              <span
                className={`flex items-center justify-center text-xs text-gray-60 w-11 py-1 border border-transparent hover:border-v3LiquidityRemoveBarColor rounded-lg ${
                  p == +sliderAmount ? "" : ""
                }`}
              >
                {p}%
              </span>
              {/* <label
                style={{ height: "5px", width: "1px" }}
                className="bg-gray-60 mt-1"
              ></label> */}
            </div>
          );
        })}
      </div>
      <div className={`relative flex flex-col`}>
        <input
          ref={valueRef}
          onChange={(e) => {
            changeValue(e.target.value);
          }}
          value={sliderAmount}
          type="range"
          className={`w-full cursor-pointer lock-bar`}
          style={{ backgroundSize: "100% 100%" }}
          min="0"
          max={max}
          step="any"
        />
        <div
          className={`frcc absolute top-4 -ml-10 rounded-md h-5`}
          style={{
            width: "39px",
            background: "#9AF901",
          }}
          ref={tipRef}
        >
          <span className="text-xs text-black">
            <label className="font-bold">
              {max > 0
                ? toPrecision(
                    ((sliderAmount * 100) / max > 100
                      ? 100
                      : new Big(sliderAmount).times(100).div(max)
                    ).toString(),
                    1
                  )
                : 0}
            </label>
            %
          </span>
        </div>
      </div>
    </div>
  );
}
export default React.memo(RangeSlider);
