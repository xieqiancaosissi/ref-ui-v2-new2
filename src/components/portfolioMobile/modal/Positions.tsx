import React, { useState, useEffect, useContext, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  UpDownButton,
  useTotalLiquidityData,
} from "../../../components/portfolioMobile/components/Tool";
import { useAccountStore } from "@/stores/account";
import { getAccountId } from "@/utils/wallet";
import { BlueCircleLoading } from "@/components/pools/icon";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import {
  PortfolioContextType,
  PortfolioData,
} from "../../../pages/portfolioMobile";
import NoContent from "@/components/common/NoContent";
import YourLiquidityV2 from "./YourLiquidityV2";
import YourLiquidityV1 from "./YourLiquidityV1";

function Positions(props: any) {
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
  const noData_status =
    !loading_status &&
    ((v1LiquidityLoadingDone &&
      v2LiquidityLoadingDone &&
      total_quantity == 0) ||
      !isSignedIn);
  const data_status =
    v1LiquidityLoadingDone && v2LiquidityLoadingDone && total_quantity > 0;
  return (
    <div className="text-white">
      <p className="text-sm text-white mb-6">{total_liquidity_value}</p>
      {/* liquidities list */}
      <div className={`${activeTab == "2" ? "" : "hidden"}`}>
        <YourLiquidityV2
          setYourLpValueV2={setYourLpValueV2}
          setLpValueV2Done={setLpValueV2Done}
          setLiquidityLoadingDone={setV2LiquidityLoadingDone}
          setLiquidityQuantity={setV2LiquidityQuantity}
        ></YourLiquidityV2>
        <YourLiquidityV1
          setLpValueV1Done={setLpValueV1Done}
          setYourLpValueV1={setYourLpValueV1}
          setLiquidityLoadingDone={setV1LiquidityLoadingDone}
          setLiquidityQuantity={setV1LiquidityQuantity}
        ></YourLiquidityV1>
      </div>
      {/* pc loading */}
      {loading_status ? (
        <SkeletonTheme
          baseColor="rgba(33, 43, 53, 0.3)"
          highlightColor="#2A3643"
        >
          <Skeleton
            style={{ width: "100%" }}
            height={40}
            count={4}
            className="mt-4"
          />
        </SkeletonTheme>
      ) : null}
      {noData_status ? <NoContent h="h-[260px]" /> : null}
    </div>
  );
}

export default React.memo(Positions);
