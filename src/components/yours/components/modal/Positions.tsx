import React, { useState, useEffect, useContext, useMemo } from "react";
import { PortfolioContextType, PortfolioData } from "../RefPanelModal";
import { UpDownButton, useTotalLiquidityData } from "../Tool";
import { useAccountStore } from "@/stores/account";
import { getAccountId } from "@/utils/wallet";
import { YourLiquidityV2 } from "./YourLiquidityV2";
import { YourLiquidityV1 } from "./YourLiquidityV1";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import NoContent from "@/components/common/NoContent";

export default function Positions(props: any) {
  const {
    setYourLpValueV2,
    setYourLpValueV1,
    setLpValueV1Done,
    setLpValueV2Done,
    v1LiquidityQuantity,
    v2LiquidityQuantity,
    setV1LiquidityQuantity,
    setV2LiquidityQuantity,
    setV2LiquidityLoadingDone,
    setV1LiquidityLoadingDone,
    v1LiquidityLoadingDone,
    v2LiquidityLoadingDone,
    YourLpValueV1,
    YourLpValueV2,
    lpValueV1Done,
    lpValueV2Done,
    activeTab,
    setActiveTab,
  } = useContext(PortfolioData) as PortfolioContextType;
  const { total_liquidity_value, total_liquidity_quantity } =
    useTotalLiquidityData({
      YourLpValueV1,
      YourLpValueV2,
      lpValueV1Done,
      lpValueV2Done,
      v1LiquidityQuantity,
      v2LiquidityQuantity,
      v1LiquidityLoadingDone,
      v2LiquidityLoadingDone,
    });
  const accountStore = useAccountStore();
  const accountId = getAccountId();
  const isSignedIn = !!accountId || accountStore.isSignedIn;
  const total_quantity = +v1LiquidityQuantity + +v2LiquidityQuantity;
  const loading_status =
    !(v1LiquidityLoadingDone && v2LiquidityLoadingDone) && isSignedIn;

  const loading_status_v1 = !v1LiquidityLoadingDone && isSignedIn;
  const loading_status_v2 = !v2LiquidityLoadingDone && isSignedIn;

  const noData_status =
    !loading_status &&
    ((v1LiquidityLoadingDone &&
      v2LiquidityLoadingDone &&
      total_quantity == 0) ||
      !isSignedIn);

  const noData_status1 =
    (!loading_status_v1 &&
      v1LiquidityLoadingDone &&
      +v1LiquidityQuantity == 0) ||
    !isSignedIn;

  const noData_status2 =
    (!loading_status_v2 &&
      v2LiquidityLoadingDone &&
      +v2LiquidityQuantity == 0) ||
    !isSignedIn;

  const data_status =
    v1LiquidityLoadingDone && v2LiquidityLoadingDone && total_quantity > 0;

  const [poolType, setPoolType] = useState("dcl");

  if (!accountId) return <NoContent />;

  return (
    <div className="text-white xsm:pb-10">
      <div className="flex mt-4 lg:mb-12 xsm:mb-8 cursor-pointer select-none">
        <div
          className={`p-2 h-6 lg:text-sm xsm:text-lg font-medium frcc rounded ${
            poolType == "dcl"
              ? "text-white lg:bg-gray-40"
              : "text-gray-60 lg:bg-dark-10"
          }`}
          onClick={() => {
            setPoolType("dcl");
          }}
        >
          <span className="xsm:hidden">{`DCL (${v2LiquidityQuantity})`}</span>
          <span
            className={`lg:hidden ${
              poolType == "dcl" ? "text-with-custom-underline" : ""
            } `}
          >
            {`DCL Pools (${v2LiquidityQuantity})`}
            {/* <div
              className={`h-0.5 w-28 ${
                poolType == "dcl" ? "bg-white" : "bg-transparent"
              } mt-1 lg:hidden`}
            ></div> */}
          </span>
        </div>
        <div
          className={`p-2 ml-2 h-6 lg:text-sm xsm:text-lg font-medium frcc rounded ${
            poolType == "classic"
              ? "text-white lg:bg-gray-40"
              : "text-gray-60 lg:bg-dark-10"
          }`}
          onClick={() => {
            setPoolType("classic");
          }}
        >
          <span className="xsm:hidden">{`Classic (${v1LiquidityQuantity})`}</span>
          <span
            className={`lg:hidden ${
              poolType == "classic" ? "text-with-custom-underline" : ""
            } `}
          >
            {`Classic Pools (${v1LiquidityQuantity})`}
            {/* <div
              className={`h-0.5 w-38 ${
                poolType == "classic" ? "bg-white" : "bg-transparent"
              } mt-1 lg:hidden`}
            ></div> */}
          </span>
        </div>
      </div>
      <div className="">
        {/* liquidities list */}
        <div
          className={`${
            activeTab == "1" && poolType == "dcl" && !noData_status2
              ? ""
              : "hidden"
          }`}
        >
          <YourLiquidityV2
            setYourLpValueV2={setYourLpValueV2}
            setLpValueV2Done={setLpValueV2Done}
            setLiquidityLoadingDone={setV2LiquidityLoadingDone}
            setLiquidityQuantity={setV2LiquidityQuantity}
          />
        </div>
        <div
          className={`${
            activeTab == "1" && poolType == "classic" ? "" : "hidden"
          }`}
        >
          <YourLiquidityV1
            setLpValueV1Done={setLpValueV1Done}
            setYourLpValueV1={setYourLpValueV1}
            setLiquidityLoadingDone={setV1LiquidityLoadingDone}
            setLiquidityQuantity={setV1LiquidityQuantity}
          />
        </div>
      </div>
      {/* pc loading */}
      {loading_status_v2 && activeTab == "1" && poolType == "dcl" && null}

      {loading_status_v1 && activeTab == "1" && poolType == "classic" ? (
        <SkeletonTheme
          baseColor="rgba(33, 43, 53, 0.3)"
          highlightColor="#2A3643"
        >
          <Skeleton
            style={{ width: "100%" }}
            height={60}
            count={4}
            className="mt-4"
          />
        </SkeletonTheme>
      ) : null}

      {noData_status1 && activeTab == "1" && poolType == "classic" && (
        <NoContent></NoContent>
      )}

      {noData_status2 && activeTab == "1" && poolType == "dcl" && (
        <NoContent></NoContent>
      )}
    </div>
  );
}
