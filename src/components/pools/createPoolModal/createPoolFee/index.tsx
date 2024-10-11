import React, { useEffect, useState } from "react";
import Tips from "@/components/common/Tips/index";
import poolStyle from "./index.module.css";
import { feeList, bankList } from "./config";
export default function Fee({ getherFee }: { getherFee: (e: any) => void }) {
  const [isActive, setActive] = useState(0.3);
  const [feeValue, setFeeValue] = useState(isActive);
  const inputChange = (e: any) => {
    if (e.target.value >= 20) {
      setFeeValue(20);
    } else {
      setFeeValue(e.target.value);
    }
    setActive(e.target.value);
  };

  useEffect(() => {
    getherFee(feeValue);
  }, [feeValue]);
  return (
    <>
      <div className="flex lg:items-center justify-between mt-4 xsm:flex-col xsm:justify-start">
        {/*  */}
        <div className="lg:frcc text-gray-60 font-normal text-sm xsm:flex xsm:items-center xsm:mb-4">
          Total fee{" "}
          <Tips
            msg1={`LP fee 80%`}
            msg2={`Protocol fee and Refferral fee 20%`}
            extraStyles={"w-54"}
            origin="createPool"
          />
        </div>

        {/*  */}
        <div className="lg:frcc xsm:flex xsm:items-center xsm:justify-between">
          <div
            className={`frcc w-38 text-sm py-1  ${poolStyle.commonStyle} xsm:hidden`}
          >
            {feeList.map((item, index) => {
              return (
                <div
                  key={item.key + index}
                  className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-gray-120 rounded"
                      : "text-gray-60"
                  }
                  w-12 h-5 frcc cursor-pointer
                `}
                  onClick={() => {
                    setActive(item.key);
                    setFeeValue(item.key);
                  }}
                >
                  {item.value}%
                </div>
              );
            })}
          </div>

          <div
            className={`flex items-center justify-between flex-1 text-sm py-1 mr-4  lg:hidden`}
          >
            {feeList.map((item, index) => {
              return (
                <div
                  key={item.key + index}
                  className={`
                  ${isActive == item.key ? "text-white " : "text-gray-60"}
                   h-5 frcc cursor-pointer
                `}
                  onClick={() => {
                    setActive(item.key);
                    setFeeValue(item.key);
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-full border  frcc mr-1 ${
                      isActive == item.key
                        ? "border-green-10"
                        : "border-gray-60"
                    }`}
                  >
                    {isActive == item.key && (
                      <div className="w-3 h-3 rounded-full bg-green-10"></div>
                    )}
                  </div>
                  {item.value}%
                </div>
              );
            })}
          </div>
          <div className={poolStyle.filterSeacrhInputContainer}>
            <input
              type="number"
              className={poolStyle.filterSearchInput}
              value={feeValue}
              onChange={inputChange}
            />
            <span className="text-gray-50 text-sm">%</span>
          </div>
        </div>
      </div>

      {/*  */}
      <div
        className={`lg:w-100 xsm:w-full lg:h-20 xsm:min-h-20 p-4 mt-9 lg:text-xs xsm:text-sm font-normal justify-between flex flex-col ${poolStyle.commonStyle}`}
      >
        {bankList.map((item, index) => {
          return (
            <p
              className="flex justify-between items-center"
              key={item.title + index}
            >
              <span className="text-gray-50">{item.title}</span>
              <span className="text-white">
                {(feeValue * item.rate).toFixed(2)}%
              </span>
            </p>
          );
        })}
      </div>
    </>
  );
}
