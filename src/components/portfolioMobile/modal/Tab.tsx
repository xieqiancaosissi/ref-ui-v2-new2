import React, { useEffect, useMemo, useState, useContext } from "react";
import BigNumber from "bignumber.js";
import { FormattedMessage, useIntl } from "react-intl";
import {
  useTotalFarmData,
  useTotalLiquidityData,
  useTotalOrderData,
} from "../../../components/portfolioMobile/components/Tool";
import {
  PortfolioContextType,
  PortfolioData,
} from "../../../pages/portfolioMobile";
function Tab() {
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

    active_order_value_done,
    active_order_Loading_done,
    active_order_quanity,
    active_order_value,
  } = useContext(PortfolioData) as PortfolioContextType;
  const [tabList, setTabList] = useState([
    {
      name: "Active Orders",
      id: "active_orders",
      tag: "1",
      value: "$-",
      quantity: "-",
    },
    {
      name: "Your Liquidity",
      id: "your_liquidity_2",
      tag: "2",
      value: "$-",
      quantity: "-",
    },
    {
      name: "Yield Farming",
      id: "yield_farming",
      tag: "3",
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
  const { total_active_orders_value, total_active_orders_quanity } =
    useTotalOrderData({
      active_order_value_done,
      active_order_Loading_done,
      active_order_quanity,
      active_order_value,
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
    tabList[0].value = total_active_orders_value;
    tabList[0].quantity = total_active_orders_quanity;
    tabList[1].value = total_liquidity_value;
    tabList[1].quantity = total_liquidity_quantity;
    tabList[2].value = total_farms_value;
    tabList[2].quantity = total_farms_quantity;
    const parse_tabList = JSON.parse(JSON.stringify(tabList));
    setTabList(parse_tabList);
  }, [
    total_farms_value,
    total_farms_quantity,
    total_liquidity_value,
    total_liquidity_quantity,
    total_active_orders_value,
    total_active_orders_quanity,
  ]);
  function switchTab(tag: string) {
    setActiveTab(tag);
  }
  return (
    <div className="flex items-center">
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
              className={`flex-1 items-center cursor-pointer relative pb-2 ${
                index != tabList.length - 1 ? "" : ""
              }  ${tab.tag == activeTab ? "border-b-2 border-white" : ""}`}
              onClick={() => {
                switchTab(tab.tag);
              }}
            >
              <div className="frcc">
                <div className={`relative flex items-center`}>
                  <span
                    className={`whitespace-nowrap ${
                      tab.tag == activeTab
                        ? "text-white text-lg"
                        : "text-gray-10 text-base"
                    }`}
                  >
                    {tab.name || <FormattedMessage id={tab.id} />}
                  </span>
                  <span
                    className={`-mt-3 bg-primaryGreen text-black rounded-2xl text-xs py-0.5 px-2 ${
                      tab.tag == activeTab ? "" : "hidden"
                    }`}
                  >
                    {tab.quantity}
                  </span>
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
export default React.memo(Tab);
