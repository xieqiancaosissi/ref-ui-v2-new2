import React, { useState } from "react";
import Big from "big.js";

export function PointInputComponent({
  handlePriceToAppropriatePoint,
  customPrice,
  setCustomPrice,

  getPrice,
  point,
  setPoint,

  inputStatus,
  setInputStatus,
  disbaled,
}: any) {
  return (
    <div className={`flex items-center justify-between xsm:flex-grow`}>
      <input
        type="number"
        placeholder="0.0"
        step="any"
        className={`text-base font-bold mx-2 text-left xsm:text-right ${
          disbaled ? "text-gray-60" : "text-white"
        }`}
        onBlur={() => {
          setInputStatus(false);
          if (customPrice) {
            const appropriate_point_temp =
              handlePriceToAppropriatePoint(customPrice);
            setPoint(appropriate_point_temp);
          } else {
            setPoint(point);
          }
        }}
        disabled={disbaled}
        value={inputStatus ? customPrice : getPrice()}
        onChange={({ target }) => {
          setInputStatus(true);
          const inputPrice = target.value;
          if (Big(target.value || 0).lt(0)) {
            setCustomPrice("0");
          } else {
            setCustomPrice(inputPrice);
          }
        }}
      />
    </div>
  );
}
