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
import { scientificNotationToString, toReadableNumber } from "@/utils/numbers";
import { QuestionMark } from "@/components/farm/icon";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { openUrl } from "@/services/commonV3";
import {
  ArrowJump,
  REF_FI_POOL_ACTIVE_TAB,
  display_number_ordinary,
  display_percentage,
} from "../Tool";
import { display_value } from "@/services/aurora";
import { ArrowUpIcon, JumpUpperLeft } from "../icon";
import { useRouter } from "next/router";
import { usePoolStore } from "@/stores/pool";
import { getStablePoolDecimal, isStablePool } from "@/services/swap/swapUtils";
import { useShadowRecordStore } from "@/stores/liquidityStores";
import { useShadowRecord } from "@/hooks/useStableShares";
const AssetData = createContext<AssetDataContextType | null>(null);
function Asset() {
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
  }, [tokenPriceList, xrefBalance, xrefBalanceDone]);
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
    }, [lpValueV1Done, lpValueV2Done, total_xref_value]);
  const total_user_invest_value = useMemo(() => {
    return total_user_invest_value_done
      ? display_value(total_user_invest_value_original)
      : "$-";
  }, [total_user_invest_value_original, total_user_invest_value_done]);
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
  }, [lpValueV1Done, classic_farms_value_done]);
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
  }, [lpValueV2Done, dcl_farms_value_done]);
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
  ]);
  const show_total_xref_value = useMemo(() => {
    return total_xref_value_done ? display_value(total_xref_value) : "$-";
  }, [total_xref_value, total_xref_value_done]);
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
  const { onRequestClose, setIsOpen } = useContext(
    PortfolioData
  ) as PortfolioContextType;
  const router = useRouter();
  const poolStore = usePoolStore();
  return (
    <div className="flex mb-1">
      <div
        className="bg-gray-20 bg-opacity-70 rounded-md p-4 mr-1"
        style={{ width: "30%" }}
      >
        <div className="flex items-center mb-2">
          <p className="text-gray-50 text-sm">Your Investment</p>
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-tooltip-id="selectAllId"
            data-place="top"
            data-tooltip-html={getTip()}
          >
            <QuestionMark></QuestionMark>
            <CustomTooltip id="selectAllId" />
          </div>
        </div>
        <div className="text-2xl pb-1">{total_user_invest_value}</div>
        <div className="flex items-center text-gray-50 text-xs">
          {getCurrentDate()}
          <div
            className={`flex items-center text-xs rounded-md px-1 ml-1.5 bg-opacity-20 ${
              increase_percent_done ? "" : "hidden"
            } ${
              +increase_percent_original > 0
                ? "text-primaryGreen bg-primaryGreen"
                : "text-error bg-error"
            }`}
          >
            <ArrowUpIcon
              className={`mr-0.5 ${
                +increase_percent_original > 0 ? "" : "transform rotate-180"
              }`}
            ></ArrowUpIcon>
            {display_increase_percent()}
          </div>
        </div>
      </div>
      <div
        className="bg-gray-20 bg-opacity-70 rounded-md p-4 flex"
        style={{ width: "70%" }}
      >
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <p className="text-gray-50 text-sm mr-1">DCL Pools</p>
            <JumpUpperLeft
              className="cursor-pointer"
              onClick={() => {
                localStorage.setItem("REF_FI_POOL_ACTIVE_TAB", "v2");
                router.push("/pools");
                poolStore.setPoolActiveTab("dcl");
                onRequestClose();
                setIsOpen(false);
              }}
            />
          </div>
          <div className="text-2xl pb-1">{getV2PoolUSDValue()}</div>
          <div className="bg-gray-60 bg-opacity-15 rounded py-0.5 px-1 flex items-center text-xs w-fit">
            {percent_in_dcl_farms}
            <p
              className="text-sm text-gray-10 ml-1 underline cursor-pointer"
              onClick={() => {
                localStorage.setItem("BOOST_FARM_TAB", "yours");
                router.push("/v2farms");
                onRequestClose();
                setIsOpen(false);
              }}
            >
              in farm
            </p>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <p className="text-gray-50 text-sm mr-1">Classic Pools</p>
            <JumpUpperLeft
              className="cursor-pointer"
              onClick={() => {
                localStorage.setItem("REF_FI_POOL_ACTIVE_TAB", "v2");
                router.push("/pools");
                poolStore.setPoolActiveTab("classic");
                onRequestClose();
                setIsOpen(false);
              }}
            />
          </div>
          <div className="text-2xl pb-1">{getV1PoolUSDValue()}</div>
          <div className="bg-gray-60 bg-opacity-15 rounded py-0.5 px-1 flex items-center text-xs w-fit">
            {percent_in_classic_farms}
            <p
              className="text-sm text-gray-10 ml-1 underline cursor-pointer"
              onClick={() => {
                localStorage.setItem("BOOST_FARM_TAB", "yours");
                router.push("/v2farms");
                onRequestClose();
                setIsOpen(false);
              }}
            >
              in farm
            </p>
          </div>
          <ShadowRecordPercentage />
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <p className="text-gray-50 text-sm mr-1">xREF Staking</p>
            <JumpUpperLeft
              className="cursor-pointer"
              onClick={() => {
                localStorage.setItem("REF_FI_POOL_ACTIVE_TAB", "v2");
                router.push("/xref");
                onRequestClose();
                setIsOpen(false);
              }}
            />
          </div>
          <div className="text-2xl pb-1">{show_total_xref_value}</div>
        </div>
      </div>
    </div>
  );
}

const ShadowRecordPercentage = () => {
  const {
    tokenPriceList,
    YourLpValueV1,
    YourLpValueV2,
    lpValueV1Done,
    lpValueV2Done,
    history_total_asset,
    history_total_asset_done,
    your_classic_lp_all_in_farms,
  } = useContext(PortfolioData);

  const shadowRecords = useShadowRecord(
    (state) => state.shadowRecords
  ).shadowRecords;
  let totalShadowValue = 0;
  if (shadowRecords) {
    Object.entries(shadowRecords).forEach(([shadowId, value]) => {
      const inBurrow = shadowRecords?.[Number(shadowId)]?.shadow_in_burrow;
      const decimal = isStablePool(shadowId)
        ? getStablePoolDecimal(shadowId)
        : 24;
      const amount = toReadableNumber(
        decimal,
        scientificNotationToString(inBurrow.toString())
      );
      totalShadowValue += Number(amount);
    });
  }
  if (totalShadowValue === 0) return null;
  const percent = new BigNumber(totalShadowValue || 0).dividedBy(YourLpValueV1);
  return (
    <div>
      <div className="bg-gray-60 bg-opacity-15 rounded py-0.5 px-1 flex items-center text-xs w-fit mt-1">
        {display_percentage(percent.multipliedBy(100).toFixed()) + "%"}{" "}
        <span
          onClick={() => {
            openUrl("https://app.burrow.finance/");
          }}
          className="text-sm text-gray-10 ml-1 underline cursor-pointer"
        >
          in Burrow
        </span>{" "}
      </div>
    </div>
  );
};

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

export default React.memo(Asset);
