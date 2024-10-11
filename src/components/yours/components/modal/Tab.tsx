import React, { useEffect, useMemo, useState, useContext } from "react";
import BigNumber from "bignumber.js";
import { FormattedMessage, useIntl } from "react-intl";
import { PortfolioContextType, PortfolioData } from "../RefPanelModal";
import styles from "../../yours.module.css";
import {
  useTotalFarmData,
  useTotalLiquidityData,
  useTotalOrderData,
} from "../Tool";
import { useAccountStore } from "@/stores/account";
import { getAccountId } from "@/utils/wallet";
export default function Tab() {
  const {
    activeTab,
    setActiveTab,
    YourLpValueV2,
    YourLpValueV1,
    lpValueV1Done,
    lpValueV2Done,
    v1LiquidityQuantity,
    v2LiquidityQuantity,
    v1LiquidityLoadingDone,
    v2LiquidityLoadingDone,

    dcl_farms_value_done,
    classic_farms_value_done,
    dcl_farms_value,
    classic_farms_value,
    all_farms_quanity,
    all_farms_Loading_done,
  } = useContext(PortfolioData) as PortfolioContextType;
  const accountStore = useAccountStore();
  const accountId = getAccountId();
  const isSignedIn = !!accountId || accountStore.isSignedIn;
  const [tabList, setTabList] = useState([
    {
      name: "Pools",
      id: "your_liquidity_2",
      tag: "1",
      value: "$-",
      quantity: "-",
    },
    {
      name: "Farms",
      id: "yield_farming",
      tag: "2",
      value: "$-",
      quantity: "-",
    },
  ]);
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

  const { total_farms_value, total_farms_quantity } = useTotalFarmData({
    dcl_farms_value,
    classic_farms_value,
    dcl_farms_value_done,
    classic_farms_value_done,
    all_farms_Loading_done,
    all_farms_quanity,
  });

  useEffect(() => {
    if (!isSignedIn) {
      setTabList([
        {
          name: "Pools",
          id: "your_liquidity_2",
          tag: "1",
          value: "$-",
          quantity: "-",
        },
        {
          name: "Farms",
          id: "yield_farming",
          tag: "2",
          value: "$-",
          quantity: "-",
        },
      ]);
    } else {
      tabList[0].value = total_liquidity_value;
      tabList[0].quantity = total_liquidity_quantity;
      tabList[1].value = total_farms_value;
      tabList[1].quantity = total_farms_quantity;
      const parse_tabList = JSON.parse(JSON.stringify(tabList));
      setTabList(parse_tabList);
    }
  }, [
    total_farms_value,
    total_farms_quantity,
    total_liquidity_value,
    total_liquidity_quantity,
    isSignedIn,
  ]);

  function switchTab(tag: string) {
    setActiveTab(tag);
  }

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // ipad pro
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div
      className="frcc lg:fixed w-full h-17 xsm:mt-12"
      style={{
        top: "230px",
        zIndex: "51",
        background: !isMobile ? "#0C171F" : "",
      }}
    >
      <div className="flex items-center lg:w-[1104px] xsm:w-full">
        <div className={styles.filterPoolType}>
          {tabList.map(
            (
              tab: {
                name: string;
                tag: string;
                value: string;
                quantity: string;
                id: string;
              },
              index
            ) => {
              return (
                <div
                  key={`${tab.tag}_${index}`}
                  className={`
                ${
                  tab.tag == activeTab
                    ? "text-white bg-poolsTypelinearGrayBg rounded"
                    : "text-gray-60"
                }
                 lg:w-29 xsm:w-1/2 lg:h-8 xsm:h-9 frcc text-base relative
              `}
                  onClick={() => {
                    switchTab(tab.tag);
                  }}
                >
                  <div className="flex flex-col items-start">
                    <div className={`flex items-center`}>
                      <span
                        className={`text-sm  ${
                          tab.tag == activeTab ? "text-white " : "text-gray-10"
                        }`}
                      >
                        {tab.name || <FormattedMessage id={tab.id} />}
                        <span className="lg:hidden">({tab.quantity})</span>
                      </span>
                      <div
                        className={`
                          ${
                            tab.tag == activeTab
                              ? styles.tagActive
                              : styles.tagDisable
                          }
                        `}
                      >
                        {tab.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
