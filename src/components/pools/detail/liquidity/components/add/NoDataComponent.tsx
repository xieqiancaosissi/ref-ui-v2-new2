import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { useAccountStore } from "@/stores/account";
import { LiquidityProviderData } from "../../AddYourLiquidityDCL";

export function NoDataComponent() {
  const [chartTab, setChartTab] = useState<"liquidity" | "yours">("liquidity");
  const [priceRangeMode, setPriceRangeMode] = useState<
    "by_range" | "by_radius"
  >("by_range");
  const { show_chart }: any = useContext(LiquidityProviderData);
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  return (
    <div className={`w-full xs:w-full md:w-full flex flex-col self-stretch`}>
      {/* chart area */}
      <div
        className={`xsm:bg-mobileOrderListBg xsm:py-2.5 xsm:px-4 ${
          show_chart ? "" : "hidden"
        }`}
      >
        <div className="relative mb-5 mt-24 pt-px" style={{ height: "270px" }}>
          <div className="absolute left-0 -top-24 inline-flex items-center justify-between bg-dark-10 rounded-lg border border-gray-100 p-0.5">
            <span
              onClick={() => {
                setChartTab("liquidity");
              }}
              className={`w-20 frcc text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer ${
                chartTab == "liquidity"
                  ? "text-white bg-gray-100"
                  : "text-gray-60"
              }`}
            >
              Liquidity
            </span>
            <span
              className={`w-20 frcc ${
                isSignedIn ? "cursor-pointer" : "cursor-not-allowed"
              } text-xs font-bold px-3 py-1.5 rounded-md ${
                chartTab == "yours" ? "text-white bg-gray-100" : "text-gray-60"
              }`}
              onClick={() => {
                if (isSignedIn) {
                  setChartTab("yours");
                }
              }}
            >
              Yours
            </span>
          </div>
          <div className="flex items-center justify-center text-ms text-gray-60 mt-20">
            Oops! The Pool doesn’t exist
          </div>
        </div>
      </div>
      {/* set price range area */}
      <div className="lg:rounded-xl p-4 xsm:mb-3">
        {/* price range mode area */}
        <div className="frcb">
          <div className="text-white flex flex-col text-sm ">
            Set Price Range
            <span className="text-xs font-gotham text-gray-10"></span>
          </div>

          <div className="rounded p-0.5 border frcs text-xs text-gray-10 border-gray-90 xsm:hidden">
            <span
              className={`whitespace-nowrap min-w-20 px-3 py-1.5 rounded-md cursor-pointer ${
                priceRangeMode === "by_range"
                  ? "text-white bg-gray-120"
                  : "text-gray-60"
              }`}
              onClick={() => {
                setPriceRangeMode("by_range");
              }}
            >
              By range
            </span>
            <span
              className={`whitespace-nowrap min-w-20 px-3 py-1.5 rounded-md cursor-pointer ${
                priceRangeMode === "by_radius"
                  ? "text-white bg-gray-120"
                  : "text-gray-60"
              }`}
              onClick={() => {
                setPriceRangeMode("by_radius");
              }}
            >
              By Radius
            </span>
          </div>
        </div>
        <div className="rounded p-0.5 flex items-center lg:hidden">
          <div className="text-white text-sm flex items-center">
            <div
              className="w-4 h-4 rounded-full border border-green-10 frcc mr-1"
              onClick={() => {
                setPriceRangeMode("by_range");
              }}
            >
              {priceRangeMode === "by_range" && (
                <div className="w-3 h-3 rounded-full bg-green-10"></div>
              )}
            </div>
            By range
          </div>

          <div className="text-white text-sm flex items-center ml-10">
            <div
              className="w-4 h-4 rounded-full border border-green-10 frcc mr-1"
              onClick={() => {
                setPriceRangeMode("by_radius");
              }}
            >
              {priceRangeMode === "by_radius" && (
                <div className="w-3 h-3 rounded-full bg-green-10"></div>
              )}
            </div>
            By Radius
          </div>
        </div>
        {/* content */}
        <div className="lg:grid lg:grid-cols-3 xsm:flex xsm:flex-col gap-3 pt-4 mt-3">
          {/* target price input box */}
          <div
            className={`${
              priceRangeMode === "by_range" ? "hidden" : ""
            } flex items-center justify-between rounded p-2.5 col-span-1 ${"bg-black bg-opacity-20"}`}
          >
            <span className="text-sm text-gray-60 xs:text-xs md:text-xs whitespace-nowrap">
              Target Price
            </span>
            <span className="text-base text-gray-60 font-bold">0</span>
          </div>

          {/* radius input box */}
          <div
            className={` ${
              priceRangeMode === "by_range" ? "hidden" : ""
            } flex items-center justify-between rounded p-2.5 col-span-1 ${"bg-black bg-opacity-20"}`}
          >
            <span className="text-sm text-gray-60 xs:text-xs md:text-xs whitespace-nowrap">
              Radius
            </span>
            <span className="text-base text-gray-60 font-bold">0</span>
          </div>

          {/* min price input box */}
          <div
            className={`flex items-center justify-between rounded p-2.5 col-span-1 ${"bg-black bg-opacity-20"}`}
          >
            <span className="text-sm text-gray-60 xs:text-xs md:text-xs whitespace-nowrap">
              Min Price
            </span>
            <span className="text-base text-gray-60 font-bold">0</span>
          </div>

          {/* max price input box */}
          <div
            className={`flex items-center justify-between rounded p-2.5 col-span-1 ${"bg-black bg-opacity-20"}`}
          >
            <span className="text-sm text-gray-60 xs:text-xs whitespace-nowrap md:text-xs">
              Max Price
            </span>
            <span className="text-base text-gray-60 font-bold">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
