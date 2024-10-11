import React, { useEffect, useState } from "react";
import {
  getEffectiveFarmList,
  get_pool_name,
  openUrlLocal,
} from "@/services/commonV3";
import { FarmBoost, Seed } from "../../../../services/farm";
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from "../../../../utils/numbers";
import { BigNumber } from "bignumber.js";
import { Fire, FarmBoardInDetailDCLPool } from "./icon";
import { FormattedMessage, useIntl } from "react-intl";
import { GradientFarmBorder } from "../../icon";
import { getAccountId } from "@/utils/wallet";

export function RelatedFarmsBox(props: any) {
  const { poolDetail, tokenPriceList, sole_seed } = props;
  const [related_seed, set_related_seed]: any = useState<Seed>();
  const [farm_loading, set_farm_loading] = useState<boolean>(true);
  useEffect(() => {
    if (poolDetail && Object.keys(tokenPriceList).length > 0) {
      get_farms_data();
    }
  }, [poolDetail, tokenPriceList, sole_seed]);
  async function get_farms_data() {
    if (sole_seed) {
      set_related_seed(sole_seed);
    }
    set_farm_loading(false);
  }
  function totalTvlPerWeekDisplay() {
    const farms = related_seed.farmList;
    const rewardTokenIconMap: any = {};
    let totalPrice = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    effectiveFarms.forEach((farm: FarmBoost) => {
      const { id, decimals, icon }: any = farm.token_meta_data;
      const { daily_reward } = farm.terms;
      rewardTokenIconMap[id] = icon;
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != "N/A") {
        const tokenAmount = toReadableNumber(decimals, daily_reward);
        totalPrice += +new BigNumber(tokenAmount)
          .multipliedBy(tokenPrice)
          .toFixed();
      }
    });
    totalPrice = +new BigNumber(totalPrice).multipliedBy(7).toFixed();
    const totalPriceDisplay =
      totalPrice == 0
        ? "-"
        : "$" + toInternationalCurrencySystem(totalPrice.toString(), 2);
    return totalPriceDisplay;
  }
  function isPending(seed: Seed) {
    let pending: boolean = true;
    const farms: any = seed.farmList;
    for (let i = 0; i < farms.length; i++) {
      if (farms[i].status != "Created" && farms[i].status != "Pending") {
        pending = false;
        break;
      }
    }
    return pending;
  }
  function getTotalAprForSeed() {
    const farms = related_seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending(related_seed);
    farms.forEach(function (item: FarmBoost | any) {
      const pendingFarm = item.status == "Created" || item.status == "Pending";
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = +new BigNumber(item.apr).plus(apr).toFixed();
      }
    });
    if (apr == 0) {
      return "-";
    } else {
      apr = +new BigNumber(apr).multipliedBy(100).toFixed();
      return toPrecision(apr.toString(), 2) + "%";
    }
  }
  function getAllRewardsSymbols() {
    const tempMap: any = {};
    related_seed.farmList.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      const { icon, id }: any = token_meta_data;
      tempMap[id] = icon;
    });
    const arr = Object.entries(tempMap);
    return arr.slice(0, 5);
  }
  function go_farm() {
    const { seed_id } = related_seed;
    const [contractId, temp_pool_id] = seed_id.split("@");
    const [fixRange, pool_id, left_point, right_point] =
      temp_pool_id.split("&");
    const link_params = `${get_pool_name(
      pool_id
    )}[${left_point}-${right_point}]`;
    openUrlLocal(`/v2farms/${link_params}-r`);
  }
  if (farm_loading) return null;
  if (!related_seed) return null;
  return (
    <div
      className={`flex flex-col mt-4 relative z-30 rounded ${
        getAccountId() ? "lg:left-[28px]" : "lg:left-[0]"
      }`}
    >
      <GradientFarmBorder className="absolute -z-10 left-2"></GradientFarmBorder>
      <div className="flex items-center px-6 pt-4 justify-between">
        <div className="text-white whitespace-nowrap text-base font-normal">
          Farm APR
        </div>

        <div className="rounded-lg flex items-center px-2 py-0.5">
          {getAllRewardsSymbols().map(([id, icon]: [any, any], index) => {
            return (
              <img
                key={id}
                src={icon}
                className={`h-4 w-4 rounded-full border border-gray-60 ${
                  index != 0 ? "-ml-1.5" : ""
                }`}
              ></img>
            );
          })}
          {related_seed?.farmList.length > 5 ? (
            <div
              className={`flex h-4 w-4 -ml-1.5 flex-shrink-0  items-center justify-center text-gradientFrom rounded-full bg-darkBg border border-gradientFromHover`}
            >
              <span className={`relative bottom-1`}>...</span>
            </div>
          ) : null}
          <span className="text-xs text-white">
            {totalTvlPerWeekDisplay()}
            /week
          </span>
        </div>
      </div>

      <div className="flex items-center px-6 pt-1 justify-between">
        <div className="flex items-center text-lg farmTextGradient">
          <span className="mr-2">{getTotalAprForSeed()}</span>
          <Fire />
        </div>

        <div
          className=" rounded text-white frcc w-28 h-8 text-sm cursor-pointer hover:opacity-90"
          style={{
            background: "linear-gradient(to bottom, #9EFF01, #5F9901)",
          }}
          onClick={go_farm}
        >
          Farm Now!
        </div>
      </div>
    </div>
  );
}
