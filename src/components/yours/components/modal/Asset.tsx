import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from "react";
import BigNumber from "bignumber.js";
import { PortfolioContextType, PortfolioData } from "../RefPanelModal";
import { useAccountStore } from "@/stores/account";
import { getAccountId } from "@/utils/wallet";
import { ftGetBalance, ftGetTokenMetadata } from "@/services/token";
import { XREF_TOKEN_ID } from "@/services/xref";
import { toReadableNumber } from "@/utils/numbers";
import { QuestionMark } from "@/components/farm/icon";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { openUrlLocal } from "@/services/commonV3";
import { useRouter } from "next/router";
import {
  ArrowJump,
  REF_FI_POOL_ACTIVE_TAB,
  display_number_ordinary,
  display_percentage,
  useTotalFarmData,
  useTotalLiquidityData,
  useTotalOrderData,
} from "../Tool";
import { display_value } from "@/services/aurora";
import { ArrowUpIcon, JumpUpperLeft } from "../icon";
import {
  StakeTotalValIcon,
  FarmTotalValIcon,
  PoolTotalValIcon,
  ArrowRightUpIcon,
} from "../icon";
const AssetData = createContext<AssetDataContextType | null>(null);
export default function Asset() {
  const {
    tokenPriceList,
    YourLpValueV1,
    YourLpValueV2,
    lpValueV1Done,
    lpValueV2Done,

    classic_farms_value,
    classic_farms_value_done,
    dcl_farms_value,
    dcl_farms_value_done,

    history_total_asset,
    history_total_asset_done,

    your_classic_lp_all_in_farms,
  } = useContext(PortfolioData) as PortfolioContextType;
  const [xrefBalance, setXrefBalance] = useState("0");
  const [xrefBalanceDone, setXrefBalanceDone] = useState<boolean>(false);
  const accountStore = useAccountStore();
  const accountId = getAccountId();
  const isSignedIn = !!accountId || accountStore.isSignedIn;
  useEffect(() => {
    if (isSignedIn) {
      // get xref balance
      ftGetBalance(XREF_TOKEN_ID).then(async (data: any) => {
        const token = await ftGetTokenMetadata(XREF_TOKEN_ID);
        const { decimals } = token;
        const balance = toReadableNumber(decimals, data);
        setXrefBalance(balance);
        setXrefBalanceDone(true);
      });
    }
  }, [isSignedIn]);
  const [total_xref_value, total_xref_value_done] = useMemo(() => {
    let total_value = "0";
    let total_value_done = false;
    if (Object.keys(tokenPriceList).length > 0 && +xrefBalance > 0) {
      const price = tokenPriceList[XREF_TOKEN_ID]?.price || 0;
      const totalValue = new BigNumber(xrefBalance || "0").multipliedBy(price);
      total_value = totalValue.toFixed();
      total_value_done = true;
    }
    if (xrefBalanceDone && +xrefBalance == 0) {
      total_value_done = true;
    }
    return [total_value, total_value_done];
  }, [tokenPriceList, xrefBalance, xrefBalanceDone, isSignedIn]);
  const [total_user_invest_value_original, total_user_invest_value_done] =
    useMemo(() => {
      let total_value = new BigNumber(0);
      let total_value_done = false;
      if (lpValueV1Done && lpValueV2Done) {
        total_value = total_value
          .plus(YourLpValueV1)
          .plus(YourLpValueV2)
          .plus(total_xref_value);
        total_value_done = true;
      }
      return [total_value.toFixed(), total_value_done];
    }, [lpValueV1Done, lpValueV2Done, total_xref_value, isSignedIn]);
  const total_user_invest_value = useMemo(() => {
    return total_user_invest_value_done
      ? display_value(total_user_invest_value_original)
      : "$-";
  }, [
    total_user_invest_value_original,
    total_user_invest_value_done,
    isSignedIn,
  ]);
  const percent_in_classic_farms = useMemo(() => {
    let percent = new BigNumber(0);
    let percent_done = false;
    if (lpValueV1Done && classic_farms_value_done) {
      percent_done = true;
      if (+YourLpValueV1 > 0) {
        percent = new BigNumber(classic_farms_value || 0).dividedBy(
          YourLpValueV1
        );
        // Special value processing
        if (your_classic_lp_all_in_farms && percent.isLessThan(100)) {
          percent = new BigNumber(1);
        }
        if (
          !your_classic_lp_all_in_farms &&
          percent.isGreaterThanOrEqualTo(1)
        ) {
          percent = new BigNumber(0.99);
        }
      }
    }
    return percent_done
      ? display_percentage(percent.multipliedBy(100).toFixed()) + "%"
      : "-%";
  }, [lpValueV1Done, classic_farms_value_done, isSignedIn]);
  const percent_in_dcl_farms = useMemo(() => {
    let percent = new BigNumber(0);
    let percent_done = false;
    if (lpValueV2Done && dcl_farms_value_done) {
      percent_done = true;
      if (+YourLpValueV2 > 0) {
        percent = new BigNumber(dcl_farms_value || 0).dividedBy(YourLpValueV2);
      }
    }
    return percent_done
      ? display_percentage(percent.multipliedBy(100).toFixed()) + "%"
      : "-%";
  }, [lpValueV2Done, dcl_farms_value_done, isSignedIn]);
  const [increase_percent_original, increase_percent_done] = useMemo(() => {
    let increase_percent = "0";
    let increase_percent_done = false;
    if (lpValueV1Done && lpValueV2Done && history_total_asset_done) {
      if (+history_total_asset > 0) {
        const p = new BigNumber(total_user_invest_value_original)
          .minus(history_total_asset)
          .dividedBy(history_total_asset)
          .multipliedBy(100);
        increase_percent = p.toFixed();
        increase_percent_done = true;
      }
    }
    return [increase_percent, increase_percent_done];
  }, [
    history_total_asset,
    history_total_asset_done,
    total_user_invest_value_original,
    lpValueV1Done,
    lpValueV2Done,
    isSignedIn,
  ]);
  const show_total_xref_value = useMemo(() => {
    return total_xref_value_done ? display_value(total_xref_value) : "$-";
  }, [total_xref_value, total_xref_value_done, isSignedIn]);
  function getTip() {
    const result: string = `<div class="text-navHighLightText text-xs text-left w-64 xsm:w-52">USD value of your investment on Ref:Classic pools + DCL pools (including staked in farms) + xREF</div>`;
    return result;
  }
  function getCurrentDate() {
    const date = new Date();
    const dateStr = date.toDateString();
    const dateArr = dateStr.split(" ");
    const [week, month, day, year] = dateArr;
    const result = `${month} ${day}, ${year}`;
    return result;
  }
  function getV2PoolUSDValue() {
    return lpValueV2Done ? display_value(YourLpValueV2) : "$-";
  }
  function getV1PoolUSDValue() {
    return lpValueV1Done ? display_value(YourLpValueV1) : "$-";
  }
  function display_increase_percent() {
    const big = new BigNumber(increase_percent_original);
    const big_abs = big.abs();
    const temp = display_number_ordinary(big_abs.toFixed());
    return temp + "%";
  }
  return (
    <AssetData.Provider
      value={{
        getTip,
        total_user_invest_value,
        getCurrentDate,
        getV2PoolUSDValue,
        percent_in_dcl_farms,
        getV1PoolUSDValue,
        percent_in_classic_farms,
        show_total_xref_value,
        increase_percent_original,
        display_increase_percent,
        increase_percent_done,
      }}
    >
      <AssetPage></AssetPage>
    </AssetData.Provider>
  );
}
function AssetPage() {
  const {
    getTip,
    total_user_invest_value,
    getCurrentDate,
    getV2PoolUSDValue,
    percent_in_dcl_farms,
    getV1PoolUSDValue,
    percent_in_classic_farms,
    show_total_xref_value,
    increase_percent_original,
    display_increase_percent,
    increase_percent_done,
  } = useContext(AssetData)!;
  const router = useRouter();
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
  return (
    <div
      className="w-full lg:h-70 lg:fixed lg:frcc "
      style={{
        top: "0px",
        zIndex: "51",
        background: "linear-gradient(to bottom, #030F16, #0C171F)",
      }}
    >
      <div className="lg:w-[1104px] xsm:w-full flex xsm:flex-col items-center justify-between">
        {/* pools value */}
        <div className="lg:frcc xsm:hidden xsm:h-19">
          <PoolTotalValIcon />
          <div className="ml-5 h-14 flex flex-col justify-between">
            <p className="text-gray-50 text-sm">Your Pool Value</p>
            <div className="frcc">
              <span className="text-white text-2xl">{tabList[0].value}</span>
              <div
                className="frcc ml-2"
                onClick={() => {
                  router.push("/pools");
                }}
              >
                <span className="underline cursor-pointer text-gray-160 text-sm mr-1.5 hover:text-gray-60">
                  Add Liquidity
                </span>
                <ArrowRightUpIcon />
              </div>
            </div>
          </div>
        </div>
        {/* farms value */}
        <div className="lg:frcc xsm:hidden xsm:h-19">
          <FarmTotalValIcon />
          <div className="ml-5 h-14 flex flex-col justify-between">
            <p className="text-gray-50 text-sm">Your Farm Value</p>
            <div className="frcc">
              <span className="text-white text-2xl">{tabList[1].value}</span>
              <div
                className="frcc ml-2"
                onClick={() => {
                  router.push("/v2farms");
                }}
              >
                <span className="underline cursor-pointer text-gray-160 text-sm mr-1.5 hover:text-gray-60">
                  Stake farms
                </span>
                <ArrowRightUpIcon />
              </div>
            </div>
          </div>
        </div>
        {/* stake value */}
        <div className="lg:frcc xsm:hidden xsm:h-19">
          <StakeTotalValIcon />
          <div className="ml-5 h-14 flex flex-col justify-between">
            <p className="text-gray-50 text-sm">Your Stake Value</p>
            <div className="frcc">
              <span className="text-white text-2xl">
                {show_total_xref_value}
              </span>
              <div
                className="frcc ml-2"
                onClick={() => {
                  router.push("/xref");
                }}
              >
                <span className="underline cursor-pointer text-gray-160 text-sm mr-1.5 hover:text-gray-60">
                  Stake
                </span>
                <ArrowRightUpIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}

        {/* pools value */}
        <div className="xsm:flex xsm:justify-between xsm:h-19 lg:hidden xsm:bg-dark-45 xsm:w-full xsm:p-4 xsm:rounded-md">
          <div className="flex  items-center">
            <PoolTotalValIcon />
            <div className="ml-5 h-14 flex flex-col justify-between">
              <p className="text-gray-50 text-sm">Your Pool Value</p>
              <span className="text-white text-2xl">{tabList[0].value}</span>
            </div>
          </div>

          <div
            className="frcc ml-2"
            onClick={() => {
              router.push("/pools");
            }}
          >
            <span className="underline cursor-pointer text-gray-160 text-sm mr-1.5 hover:text-gray-60">
              Add Liquidity
            </span>
            <ArrowRightUpIcon />
          </div>
        </div>
        {/* farms value */}
        <div className="xsm:flex xsm:justify-between xsm:h-19 lg:hidden xsm:bg-dark-45 xsm:w-full xsm:p-4 my-2 xsm:rounded-md">
          <div className="flex  items-center">
            <FarmTotalValIcon />
            <div className="ml-5 h-14 flex flex-col justify-between">
              <p className="text-gray-50 text-sm">Your Farm Value</p>
              <span className="text-white text-2xl">{tabList[1].value}</span>
            </div>
          </div>
          <div
            className="frcc ml-2"
            onClick={() => {
              router.push("/v2farms");
            }}
          >
            <span className="underline cursor-pointer text-gray-160 text-sm mr-1.5 hover:text-gray-60">
              Stake farms
            </span>
            <ArrowRightUpIcon />
          </div>
        </div>
        {/* stake value */}
        <div className="xsm:flex xsm:justify-between xsm:h-19 lg:hidden xsm:bg-dark-45 xsm:w-full xsm:p-4 xsm:rounded-md">
          <div className="flex  items-center">
            <StakeTotalValIcon />
            <div className="ml-5 h-14 flex flex-col justify-between">
              <p className="text-gray-50 text-sm">Your Stake Value</p>
              <span className="text-white text-2xl">
                {show_total_xref_value}
              </span>
            </div>
          </div>
          <div
            className="frcc ml-2"
            onClick={() => {
              router.push("/xref");
            }}
          >
            <span className="underline cursor-pointer text-gray-160 text-sm mr-1.5 hover:text-gray-60">
              Stake
            </span>
            <ArrowRightUpIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

export interface AssetDataContextType {
  getTip: () => string;
  total_user_invest_value: string;
  getCurrentDate: () => string;
  getV2PoolUSDValue: () => string;
  percent_in_dcl_farms: string;
  getV1PoolUSDValue: () => string;
  percent_in_classic_farms: string;
  show_total_xref_value: string;
  increase_percent_original: string;
  display_increase_percent: () => string;
  increase_percent_done: boolean;
}
