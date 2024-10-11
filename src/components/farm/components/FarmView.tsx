import {
  BoostConfig,
  FarmBoost,
  Seed,
  UserSeedInfo,
  claimRewardBySeed_boost,
  getPoolIdBySeedId,
  list_liquidities,
} from "../../../services/farm";
import { useContext, useEffect, useMemo, useState } from "react";
import { useAccountStore } from "../../../stores/account";
import { ButtonTextWrapper } from "../../../components/common/Button";
import {
  get_pool_name,
  get_matched_seeds_for_dcl_pool,
  TOKEN_LIST_FOR_RATE,
  sort_tokens_by_base,
  getEffectiveFarmList,
  getPriceByPoint,
  displayNumberToAppropriateDecimals,
  UserLiquidityInfo,
  get_valid_range,
  get_total_value_by_liquidity_amount_dcl,
  allocation_rule_liquidities,
} from "../../../services/commonV3";
import { TokenMetadata } from "../../../services/ft-contract";
import { LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import { isMobile } from "@/utils/device";
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  formatWithCommas,
} from "@/utils/numbers";
import BigNumber from "bignumber.js";
import _ from "lodash";
import moment from "moment";
import {
  LightningBase64Grey,
  LightningBase64,
  BoostOptIcon,
  NewTag,
  ForbiddonIcon,
  CalcIcon,
} from "../icon/FarmBoost";
import getConfig from "../../../utils/config";
import { NEAR_META_DATA, WNEAR_META_DATA } from "../../../utils/nearMetaData";
import useTokens from "@/hooks/useTokens";
import CustomTooltip from "../../customTooltip/customTooltip";
import CalcModelBooster from "./CalcModelBooster";
import {
  ClockIcon,
  FarmListDCLIcon,
  FarmListRewards,
  FarmPlaceholder,
} from "../icon";
import {
  LP_STABLE_TOKEN_DECIMALS,
  LP_TOKEN_DECIMALS,
} from "../../../services/m-token";
import styles from "../farm.module.css";
import CalcModelDcl from "./CalcModelDcl";
import Countdown, { zeroPad } from "react-countdown";
import { useRouter } from "next/router";
import LPTip from "./LPTip";
import getConfigV2 from "@/utils/configV2";
import { formatPercentage, formatWithCommas_usd } from "@/utils/uiNumber";
import Big from "big.js";
import getStablePoolTypeConfig from "@/utils/stablePoolConfig/stablePoolTypeConfig";
import React from "react";
const stablePoolTypeConfig = getStablePoolTypeConfig();
const { STABLE_POOL_IDS } = stablePoolTypeConfig;

const {
  REF_VE_CONTRACT_ID,
  FARM_BLACK_LIST_V2,
  REF_UNI_V3_SWAP_CONTRACT_ID,
  WRAP_NEAR_CONTRACT_ID,
} = getConfig();

function FarmView(props: {
  seed: Seed;
  all_seeds?: Seed[];
  tokenPriceList: Record<string, any>;
  getDetailData: any;
  dayVolumeMap: Record<string, any>;
  boostConfig: BoostConfig;
  loveSeed: Seed;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_map: Record<string, any>;
  user_unclaimed_token_meta_map: Record<string, any>;
  maxLoveShareAmount: string;
}) {
  const {
    seed,
    tokenPriceList,
    getDetailData,
    dayVolumeMap,
    boostConfig,
    loveSeed,
    user_seeds_map,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    maxLoveShareAmount,
    all_seeds,
  } = props;
  const { pool, seedTvl, total_seed_amount, seed_id, farmList, seed_decimal } =
    seed;
  // console.log(detailData)
  const [contractId, temp_pool_id] = seed_id.split("@");
  const [listLiquidities_inFarimg, set_listLiquidities_inFarimg] = useState<
    UserLiquidityInfo[]
  >([]);
  const [listLiquidities_unFarimg, set_listLiquidities_unFarimg] = useState<
    UserLiquidityInfo[]
  >([]);
  let is_dcl_pool = false;
  if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
    is_dcl_pool = true;
  }
  const { getIsSignedIn } = useAccountStore();
  const [claimLoading, setClaimLoading] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [dclCalcVisible, setDclCalcVisible] = useState(false);
  const [error, setError] = useState<Error>();
  const [aprSwitchStatus, setAprSwitchStatus] = useState("1");
  const [lpSwitchStatus, setLpSwitchStatus] = useState("1");
  const [yourApr, setYourApr] = useState("");
  const [yourActualAprRate, setYourActualAprRate] = useState("1");
  const tokens = sortTokens(seed.pool?.tokens_meta_data || []);
  const router = useRouter();
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  const accountId = accountStore.getAccountId();
  const [yourTvl, setYourTvl] = useState("");
  const unClaimedTokens = useTokens(
    Object.keys(user_unclaimed_map[seed_id] || {})
  );
  //   const intl = useIntl();
  const rate_need_to_reverse_display = useMemo(() => {
    const tokens_meta_data = seed.pool?.tokens_meta_data;
    if (tokens_meta_data) {
      const [tokenX] = tokens_meta_data;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) return true;
      return false;
    }
    return false;
  }, [seed]);
  useEffect(() => {
    const yourApr = getYourApr();
    if (yourApr) {
      setYourApr(yourApr);
    }
  }, [boostConfig, user_seeds_map]);
  useEffect(() => {
    if (accountId) {
      get_list_liquidities();
    }
  }, [all_seeds, accountId]);
  useEffect(() => {
    let isMounted = true;
    if (!user_seeds_map || !accountId || !pool) {
      setYourTvl("");
      return;
    }
    const { free_amount, shadow_amount, locked_amount } =
      user_seeds_map[seed_id] || {};
    const yourLp = toReadableNumber(
      seed_decimal,
      new BigNumber(free_amount || 0)
        .plus(locked_amount || 0)
        .plus(shadow_amount || 0)
        .toFixed()
    );
    if (pool) {
      const { tvl, id, shares_total_supply } = pool;
      const DECIMALS = new Set(STABLE_POOL_IDS || []).has(id?.toString())
        ? LP_STABLE_TOKEN_DECIMALS
        : LP_TOKEN_DECIMALS;
      const poolShares = Number(
        toReadableNumber(DECIMALS, shares_total_supply)
      );
      const yourTvl =
        poolShares == 0
          ? 0
          : Number(
              toPrecision(((Number(yourLp) * tvl) / poolShares).toString(), 2)
            );
      if (isMounted) {
        setYourTvl(yourTvl.toString());
      }
    }
    return () => {
      isMounted = false;
      setYourTvl("");
    };
  }, [user_seeds_map, accountId, pool]);
  function sortTokens(tokens: TokenMetadata[]) {
    tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
      if (a.symbol === "NEAR") return 1;
      if (b.symbol === "NEAR") return -1;
      return 0;
    });
    return tokens;
  }
  function getTotalApr(containPoolFee: boolean = true) {
    let dayVolume = 0;
    if (!seed || !seed.pool) {
      return "-";
    }
    if (containPoolFee) {
      dayVolume = +getPoolFeeApr(dayVolumeMap[seed.pool.id]);
    }
    const apr = getActualTotalApr();
    if (new BigNumber(apr).isEqualTo(0) && dayVolume == 0) {
      return "-";
    } else {
      const temp = new BigNumber(apr).multipliedBy(100).plus(dayVolume);
      if (temp.isLessThan(0.01)) {
        return "<0.01%";
      } else {
        return toPrecision(temp.toFixed(), 2) + "%";
      }
    }
  }
  function getActualTotalApr() {
    const farms = seed.farmList;
    let apr = "0";
    const allPendingFarms = isPending();
    farms?.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == "Created" || item.status == "Pending";
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        const itemApr = item.apr ? item.apr : "0";
        apr = new BigNumber(apr).plus(new BigNumber(itemApr)).toFixed();
      }
    });
    return apr;
  }
  //   function getActualTotalBaseApr() {
  //     const farms = seed.farmList;
  //     let apr = 0;
  //     const allPendingFarms = isPending();
  //     farms?.forEach(function (item: FarmBoost) {
  //       const pendingFarm = item.status == "Created" || item.status == "Pending";
  //       if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
  //         apr = +new BigNumber(apr).plus(item.baseApr).toFixed();
  //       }
  //     });
  //     return apr;
  //   }
  function getAllRewardsSymbols() {
    const tempMap: {
      [key: string]: { icon: string; symbol: string; name: string };
    } = {};
    if (!seed || !seed.farmList) {
      return [];
    }
    seed.farmList.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      if (token_meta_data) {
        const { id } = token_meta_data;
        let { icon, symbol, name } = token_meta_data;
        if (id === WRAP_NEAR_CONTRACT_ID) {
          icon = NEAR_META_DATA.icon;
          symbol = NEAR_META_DATA.symbol;
          name = NEAR_META_DATA.name;
        }

        if (icon && id) {
          tempMap[id] = { icon, symbol, name };
        }
      }
    });
    return Object.entries(tempMap);
  }

  function totalTvlPerWeekDisplay() {
    const farms = seed.farmList || [];
    const rewardTokenIconMap: { [key: string]: string } = {};
    let totalPrice = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    effectiveFarms.forEach((farm: FarmBoost) => {
      if (!farm.token_meta_data || farm.token_meta_data.id === undefined) {
        return;
      }
      const { id, decimals, icon } = farm.token_meta_data || {};
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
  function getPoolFeeApr(dayVolume: string) {
    let result = "0";
    if (dayVolume) {
      const total_fee = seed.pool?.total_fee;
      const tvl = seed.pool?.tvl;
      if (total_fee !== undefined && tvl !== undefined) {
        const revenu24h = (total_fee / 10000) * 0.8 * Number(dayVolume);
        if (tvl > 0 && revenu24h > 0) {
          const annualisedFeesPrct = ((revenu24h * 365) / tvl) * 100;
          const half_annualisedFeesPrct = annualisedFeesPrct;
          result = toPrecision(half_annualisedFeesPrct.toString(), 2);
        }
      }
    }
    return result;
  }
  function getRewardsPerWeekTip() {
    const tempList: FarmBoost[] = seed.farmList || [];
    const lastList: any[] = [];
    const pending_farms: FarmBoost[] = [];
    const no_pending_farms: FarmBoost[] = [];
    tempList.forEach((farm: FarmBoost) => {
      if (farm.status == "Created") {
        pending_farms.push(farm);
      } else {
        no_pending_farms.push(farm);
      }
    });
    if (pending_farms.length > 0) {
      pending_farms.forEach((farm: FarmBoost) => {
        const { token_meta_data, terms } = farm;
        if (token_meta_data) {
          const { decimals } = token_meta_data;
          const weekAmount = toReadableNumber(
            decimals,
            new BigNumber(terms.daily_reward).multipliedBy(7).toFixed()
          );
          lastList.push({
            commonRewardToken: token_meta_data,
            commonRewardTotalRewardsPerWeek: weekAmount,
            startTime: terms.start_at,
            pending: true,
          });
        }
      });
    }
    if (no_pending_farms.length > 0) {
      const mergedFarms = mergeCommonRewardsFarms(
        JSON.parse(JSON.stringify(no_pending_farms))
      );
      mergedFarms.forEach((farm: FarmBoost) => {
        const { token_meta_data, terms } = farm;
        if (token_meta_data) {
          const { decimals } = token_meta_data;
          const weekAmount = toReadableNumber(
            decimals,
            new BigNumber(terms.daily_reward).multipliedBy(7).toFixed()
          );
          lastList.push({
            commonRewardToken: token_meta_data,
            commonRewardTotalRewardsPerWeek: weekAmount,
          });
        }
      });
    }
    function display_number(value: string | number) {
      if (!value) return value;
      const [whole, decimals] = value.toString().split(".");
      const whole_format = formatWithCommas(whole);
      if (+whole < 1 && decimals) {
        return whole_format + "." + decimals;
      } else {
        return whole_format;
      }
    }
    // show last display string
    let result: string = `<div class="text-sm text-gray-10 frcb"><p>Rewards/</p><p>Week</p></div>`;
    let itemHtml: string = "";
    lastList.forEach((item: any) => {
      const {
        commonRewardToken,
        commonRewardTotalRewardsPerWeek,
        pending,
        startTime,
      } = item;
      const token = commonRewardToken;
      if (token.id === WRAP_NEAR_CONTRACT_ID) {
        token.icon = NEAR_META_DATA.icon;
        token.symbol = NEAR_META_DATA.symbol;
        token.name = NEAR_META_DATA.name;
      }
      const txt = "start";
      if (pending) {
        itemHtml = `<div class="flex flex-col items-end my-2">
                        <div class="flex justify-between items-center w-full"><img class="w-4 h-4 rounded-full mr-7 border border-green-10" style="filter: grayscale(100%)" src="${
                          token.icon
                        }"/>
                        <label class="text-xs text-gray-10">${display_number(
                          commonRewardTotalRewardsPerWeek
                        )}</label>
                        </div>
  
                        <label class="text-xs text-gray-10 mt-0.5 ${
                          +startTime == 0 ? "hidden" : ""
                        }">${txt}: ${moment
          .unix(startTime)
          .format("YYYY-MM-DD")}</label>
                        <label class="text-xs text-gray-10 mt-0.5 ${
                          +startTime == 0 ? "" : "hidden"
                        }">Pending</label>
                      </div>`;
      } else {
        itemHtml = `<div class="flex justify-between items-center h-5 my-2">
                        <img class="w-4 h-4 rounded-full mr-7 border border-green-10" src="${
                          token.icon
                        }"/>
                        <label class="text-xs text-navHighLightText">${display_number(
                          commonRewardTotalRewardsPerWeek
                        )}</label>
                      </div>`;
      }

      result += itemHtml;
    });
    return result;
  }
  function mergeCommonRewardsFarms(farms: FarmBoost[]): FarmBoost[] {
    const tempMap: { [key: string]: FarmBoost } = {};
    farms.forEach((farm: FarmBoost) => {
      const { reward_token, daily_reward } = farm.terms;
      const preMergedfarms: FarmBoost = tempMap[reward_token];
      if (preMergedfarms) {
        preMergedfarms.apr = new BigNumber(preMergedfarms.apr || 0)
          .plus(farm.apr || 0)
          .toFixed()
          .toString();
        preMergedfarms.terms.daily_reward = new BigNumber(
          preMergedfarms.terms.daily_reward
        )
          .plus(daily_reward)
          .toFixed();
      } else {
        tempMap[reward_token] = farm;
      }
    });
    return Object.values(tempMap);
  }
  function isPending() {
    let pending: boolean = true;
    const farms = seed.farmList;
    if (farms && farms.length > 0) {
      for (let i = 0; i < farms.length; i++) {
        if (farms[i].status != "Created" && farms[i].status != "Pending") {
          pending = false;
          break;
        }
      }
    } else {
      pending = false;
    }
    return pending;
  }
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    unClaimedTokens?.forEach((token: TokenMetadata) => {
      const { id, decimals } = token;
      const num = (user_unclaimed_map[seed.seed_id] || {})[id];
      const amount = toReadableNumber(decimals, num || "0");
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != "N/A") {
        totalPrice += +amount * tokenPrice;
      }
    });
    if (totalPrice == 0) {
      return "0";
    } else if (new BigNumber("0.01").isGreaterThan(totalPrice)) {
      return "<$0.01";
    } else {
      return `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`;
    }
  }
  function isEnded() {
    const farms = seed.farmList;
    if (farms && farms.length > 0) {
      return farms[0].status == "Ended";
    }
    return false;
  }
  function getYourApr() {
    if (!boostConfig) return "";
    const { affected_seeds } = boostConfig;
    const { seed_id } = seed;
    const user_seed = user_seeds_map[seed_id] || {};
    const love_user_seed = REF_VE_CONTRACT_ID
      ? user_seeds_map[REF_VE_CONTRACT_ID]
      : undefined;
    const base = affected_seeds?.[seed_id];
    const hasUserStaked = Object.keys(user_seed).length;
    const { free_amount } = love_user_seed || {};
    const userLoveAmount = toReadableNumber(LOVE_TOKEN_DECIMAL, free_amount);
    if (base && hasUserStaked) {
      let rate;
      if (+userLoveAmount < 1) {
        rate = "1";
      } else {
        rate = new BigNumber(1)
          .plus(Math.log(+userLoveAmount) / Math.log(base))
          .toFixed();
      }
      setYourActualAprRate(rate);
      const apr = getActualTotalApr();
      let boostApr;
      if (apr) {
        boostApr = new BigNumber(apr).multipliedBy(rate);
      }
      if (boostApr && +boostApr > 0) {
        const r = +new BigNumber(boostApr).multipliedBy(100).toFixed();
        return toPrecision(r.toString(), 2) + "%";
      }
      return "";
    } else {
      return "";
    }
  }
  function getStartTime() {
    let start_at: any[] = [];
    const farmList = seed.farmList;
    farmList &&
      farmList.forEach(function (item) {
        start_at.push(item.terms.start_at);
      });
    start_at = _.sortBy(start_at);
    start_at = start_at.filter(function (val) {
      return val != "0";
    });
    return start_at[0];
  }
  const renderer = (countdown: any) => {
    if (countdown.completed) {
      return null;
    } else {
      return (
        <div style={{ width: "85px" }} className="whitespace-nowrap">
          {countdown.days ? countdown.days + "d: " : ""}
          {zeroPad(countdown.hours)}
          {"h"}: {zeroPad(countdown.minutes)}
          {"m"}
          {countdown.days ? "" : ": " + zeroPad(countdown.seconds) + "s"}
        </div>
      );
    }
  };
  function isInMonth() {
    const endedStatus = isEnded();
    if (endedStatus) return false;
    const result = farmList?.find((farm: FarmBoost) => {
      const start_at = farm?.terms?.start_at;
      if (start_at == 0) return true;
      const one_month_seconds = 15 * 24 * 60 * 60;
      const currentA = new Date().getTime();
      const compareB = new BigNumber(start_at)
        .plus(one_month_seconds)
        .multipliedBy(1000);
      const compareResult = compareB.minus(currentA);
      if (compareResult.isGreaterThan(0)) {
        return true;
      }
    });
    if (result) return true;
    return false;
  }
  function status_is_new_or_will_end() {
    let status = "";
    if (is_dcl_pool && !isEnded()) {
      const poolId = pool?.pool_id || "";
      const matched_seeds = get_matched_seeds_for_dcl_pool({
        seeds: all_seeds || [],
        pool_id: poolId,
        sort: "new",
      });
      if (matched_seeds.length > 1) {
        const latestSeed = matched_seeds[0];
        if (latestSeed.seed_id == seed.seed_id) {
          status = "new";
        } else {
          status = "will end";
        }
      }
    }
    return status;
  }
  function getRange() {
    const [fixRange, dcl_pool_id, left_point, right_point] =
      temp_pool_id.split("&");
    const tokensMetaData = pool?.tokens_meta_data;

    if (!tokensMetaData) {
      return;
    }

    const [token_x_metadata, token_y_metadata] = tokensMetaData;
    const decimalRate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let left_price = getPriceByPoint(+left_point, decimalRate);
    let right_price = getPriceByPoint(+right_point, decimalRate);
    if (rate_need_to_reverse_display) {
      const temp = left_price;
      left_price = new BigNumber(1).dividedBy(right_price).toFixed();
      right_price = new BigNumber(1).dividedBy(temp).toFixed();
    }
    const display_left_price = displayNumberToAppropriateDecimals(left_price);
    const display_right_price = displayNumberToAppropriateDecimals(right_price);

    return (
      <div className="flex items-center">
        <span className="text-sm">
          {display_left_price} ~ {display_right_price}
        </span>
        {/* <span className="text-sm text-gray-10 ml-2">
          {rate_need_to_reverse_display ? (
            <>
              {token_x_metadata.symbol}/{token_y_metadata.symbol}
            </>
          ) : (
            <>
              {token_y_metadata.symbol}/{token_x_metadata.symbol}
            </>
          )}
        </span> */}
      </div>
    );
  }
  function showNewTag() {
    if (is_dcl_pool) {
      const status = status_is_new_or_will_end();
      if (status == "new" || (!status && isInMonth())) {
        return true;
      }
    } else {
      return isInMonth();
    }
  }
  function toRealSymbol(symbol: string) {
    if (!symbol) return "";
    const blackList = ["nUSDO", "nKOK"];

    if (!symbol) return symbol;

    if (symbol === "nWETH" || symbol === "WETH") return "wETH";
    if (blackList.includes(symbol)) return symbol;
    return symbol?.charAt(0) === "n" &&
      symbol.charAt(1) === symbol.charAt(1).toUpperCase()
      ? symbol.substring(1)
      : symbol;
  }
  const needForbidden =
    pool &&
    (FARM_BLACK_LIST_V2 || []).indexOf(
      pool.id?.toString() || pool.pool_id?.toString() || ""
    ) > -1;
  const preprocessedTokens = tokens.map((token) => {
    if (token.id === WRAP_NEAR_CONTRACT_ID) {
      const newToken = { ...token };
      newToken.icon = NEAR_META_DATA.icon;
      newToken.symbol = NEAR_META_DATA.symbol;
      newToken.name = NEAR_META_DATA.name;
      return newToken;
    }
    return token;
  });
  const tokens_sort: TokenMetadata[] = sort_tokens_by_base(preprocessedTokens);
  function goFarmDetailPage(seed: Seed) {
    getDetailData({
      detailData: seed,
      tokenPriceList,
      loveSeed,
      all_seeds,
    });
    const poolId = getPoolIdBySeedId(seed.seed_id);
    const status =
      seed.farmList && seed.farmList[0].status == "Ended" ? "e" : "r";
    let mft_id = poolId;
    if (is_dcl_pool) {
      const [contractId, temp_pool_id] = seed.seed_id.split("@");
      const [fixRange, pool_id, left_point, right_point] =
        temp_pool_id.split("&");
      mft_id = `${get_pool_name(pool_id)}[${left_point}-${right_point}]`;
    }
    router.push(`/v2farms/${mft_id}-${status}`);
  }
  const configV2 = getConfigV2();
  const is_support_lp = configV2.SUPPORT_SHADOW_POOL_IDS.includes(
    (pool?.id || "").toString()
  );
  const [yp_percent, yp_farming_value, yp_unFarm_value] = useMemo(() => {
    const { farming_parts_value, can_farm_parts_value, un_farm_parts_value } =
      caculate_values();
    if (can_farm_parts_value.gt(0)) {
      const percent = farming_parts_value.div(can_farm_parts_value).mul(100);
      return [
        formatPercentage(percent.toFixed()),
        formatWithCommas_usd(farming_parts_value.toFixed()),
        formatWithCommas_usd(un_farm_parts_value.toFixed()),
      ];
    } else {
      return ["0%", "$0", "$0"];
    }
  }, [listLiquidities_inFarimg.length, listLiquidities_unFarimg.length]);
  function caculate_values() {
    const can_farm_liquidities = listLiquidities_inFarimg.concat(
      listLiquidities_unFarimg
    );
    // The total value of the liquidity that can be farmed
    let can_farm_parts_value = Big(0);
    can_farm_liquidities.forEach((l: UserLiquidityInfo) => {
      const l_v = get_range_part_value(l);
      can_farm_parts_value = can_farm_parts_value.plus(l_v || 0);
    });

    // The total value of the unfarming portion of liquidity (including the remaining portion of the NFT in the farm)
    let un_farm_parts_value = Big(0);
    listLiquidities_unFarimg.forEach((l: UserLiquidityInfo) => {
      const l_v = get_range_part_value(l);
      un_farm_parts_value = un_farm_parts_value.plus(l_v || 0);
    });
    const [part_farm_liquidity] = listLiquidities_inFarimg.filter(
      (l: UserLiquidityInfo) => {
        return Big(l.unfarm_part_amount || 0).gt(0);
      }
    );
    if (
      part_farm_liquidity &&
      part_farm_liquidity.part_farm_ratio !== undefined
    ) {
      const v = get_range_part_value(part_farm_liquidity);
      if (v !== null && v !== undefined) {
        const un_farm_part_value = Big(100)
          .minus(part_farm_liquidity.part_farm_ratio)
          .div(100)
          .mul(Big(v));
        un_farm_parts_value = un_farm_parts_value.plus(un_farm_part_value);
      }
    }
    // The total value of the farming portion of liquidity
    const farming_parts_value = can_farm_parts_value.minus(un_farm_parts_value);
    return {
      can_farm_parts_value,
      un_farm_parts_value,
      farming_parts_value,
    };
  }
  function get_range_part_value(liquidity: UserLiquidityInfo) {
    const [left_point, right_point] = get_valid_range(liquidity, seed_id);
    const v = get_liquidity_value(liquidity, left_point, right_point);
    return v;
  }
  function get_liquidity_value(
    liquidity: UserLiquidityInfo,
    leftPoint?: number,
    rightPoint?: number
  ) {
    const { amount } = liquidity;
    const poolDetail = pool;
    if (!poolDetail) {
      return null;
    }
    const { token_x, token_y } = poolDetail;
    const tokenX = token_x as string;
    const tokenY = token_y as string;
    const v = get_total_value_by_liquidity_amount_dcl({
      left_point: leftPoint || liquidity.left_point,
      right_point: rightPoint || liquidity.right_point,
      poolDetail,
      amount,
      price_x_y: {
        [tokenX]: tokenPriceList[tokenX]?.price || "0",
        [tokenY]: tokenPriceList[tokenY]?.price || "0",
      },
      metadata_x_y: {
        [tokenX]: tokens[0],
        [tokenY]: tokens[1],
      },
    });
    return v;
  }
  async function get_list_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    if (list.length > 0 && all_seeds.length > 0) {
      let temp_unavailable_final: UserLiquidityInfo[] = [];
      let temp_free_final: UserLiquidityInfo[] = [];
      let temp_farming_final: UserLiquidityInfo[] = [];
      const { free_amount = "0", locked_amount = "0" } =
        user_seeds_map[seed_id] || {};
      const user_seed_amount = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      const [temp_farming, temp_free, temp_unavailable] =
        allocation_rule_liquidities({
          list,
          user_seed_amount,
          seed,
        });
      temp_unavailable_final = temp_unavailable;
      temp_free_final = temp_free;
      temp_farming_final = temp_farming;
      const liquidities_minted_in_another_seed = temp_unavailable.filter(
        (liquidity: UserLiquidityInfo) => {
          const { mft_id } = liquidity;
          if (mft_id) {
            const [contractId, temp_pool_id] = seed_id.split("@");
            const [fixRange_s, pool_id_s, left_point_s, right_point_s] =
              temp_pool_id.split("&");
            const [fixRange_l, pool_id_l, left_point_l, right_point_l] =
              mft_id.split("&");
            return (
              left_point_s != left_point_l || right_point_s != right_point_l
            );
          }
        }
      );
      if (liquidities_minted_in_another_seed.length > 0) {
        const another_seeds = get_another_seeds(
          liquidities_minted_in_another_seed
        );
        Object.values(another_seeds).forEach((another_seed_detail: any) => {
          const list_new = JSON.parse(JSON.stringify(list));
          const [seed_another, user_seed_amount_another] = another_seed_detail;
          const [
            temp_farming_another,
            temp_free_another,
            temp_unavailable_another,
          ] = allocation_rule_liquidities({
            list: list_new,
            user_seed_amount: user_seed_amount_another,
            seed: seed_another,
          });
          const temp_farming_another_map: { [key: string]: UserLiquidityInfo } =
            {};
          temp_farming_another.forEach((liquidity: UserLiquidityInfo) => {
            if (liquidity.lpt_id !== undefined) {
              temp_farming_another_map[liquidity.lpt_id] = liquidity;
            }
          });

          // const { min_deposit } = detailData;
          liquidities_minted_in_another_seed.forEach(
            (liquidity: UserLiquidityInfo) => {
              if (liquidity.lpt_id !== undefined) {
                const liquidity_another: UserLiquidityInfo | undefined =
                  temp_farming_another_map[liquidity.lpt_id];

                if (
                  liquidity_another &&
                  liquidity_another.part_farm_ratio !== undefined
                ) {
                  if (+liquidity_another.part_farm_ratio > 0) {
                    liquidity.status_in_other_seed = "staked";
                  }
                }
              }
            }
          );
        });
        const temp_unavailable_new: UserLiquidityInfo[] = [];
        const frees_extra = temp_unavailable.filter(
          (liquidity: UserLiquidityInfo) => {
            const [left_point, right_point] = get_valid_range(
              liquidity,
              seed_id
            );
            const inRange = right_point > left_point;
            const { amount, mft_id } = liquidity;
            const amount_is_little = new BigNumber(amount).isLessThan(1000000);
            if (
              !(
                liquidity.status_in_other_seed == "staked" ||
                // liquidity.less_than_min_deposit ||
                !inRange ||
                (!mft_id && amount_is_little)
              )
            )
              return true;
            temp_unavailable_new.push(liquidity);
          }
        );
        temp_free_final = temp_free.concat(frees_extra);
        temp_unavailable_final = temp_unavailable_new;
      }
      const matched_liquidities = temp_farming_final
        .concat(temp_free_final)
        .concat(temp_unavailable_final);
      set_listLiquidities_inFarimg(temp_farming_final);
      set_listLiquidities_unFarimg(temp_free_final);
    }
  }
  function get_another_seeds(minted_liquidities: UserLiquidityInfo[]) {
    const target: any = {};
    minted_liquidities.forEach((liquidity_minted_in_another_seed) => {
      const { mft_id } = liquidity_minted_in_another_seed;
      if (mft_id === undefined) {
        return;
      }
      const seed_id_another =
        REF_UNI_V3_SWAP_CONTRACT_ID + "@" + mft_id.slice(1);
      const { free_amount = "0", locked_amount = "0" } =
        user_seeds_map[seed_id_another] || {};
      const user_seed_amount_another = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      const seed_another: Seed | undefined = all_seeds.find((seed: Seed) => {
        return seed.seed_id == seed_id_another;
      });
      if (seed_another) {
        target[seed_another.seed_id] = [seed_another, user_seed_amount_another];
      }
    });
    return target;
  }
  return (
    <>
      <div
        onClick={() => {
          goFarmDetailPage(seed);
        }}
        className={`relative rounded-2xl cursor-pointer p-5 ${
          isEnded() || needForbidden
            ? styles.farmEnded
            : !showNewTag()
            ? "bg-dark-290 "
            : "bg-farmItemBg rounded-lg"
        }
        `}
      >
        <div className="frcb mb-5">
          <div className="relative w-min h-14 flex-shrink-0">
            {tokens_sort.length === 2 ? (
              <>
                {tokens_sort.some((token) => token.id === WRAP_NEAR_CONTRACT_ID)
                  ? tokens_sort.map((token, index) => {
                      const isWrapNearContract =
                        token.id === WRAP_NEAR_CONTRACT_ID;
                      const sizeClass = isWrapNearContract
                        ? "w-8 h-8"
                        : "w-10 h-10";
                      const positionClass = isWrapNearContract
                        ? "absolute top-0 left-0 z-10"
                        : "absolute top-3 left-3 z-20";

                      return (
                        <label
                          key={token.id}
                          className={`rounded-full box-content overflow-hidden bg-dark-90 border border-dark-90 ${sizeClass} ${positionClass}`}
                        >
                          <img src={token.icon} className="w-full h-full" />
                        </label>
                      );
                    })
                  : tokens_sort.map((token, index) => {
                      const isFirst = index === 0;
                      const sizeClass = isFirst ? "w-8 h-8" : "w-10 h-10";
                      const positionClass = isFirst
                        ? "absolute top-0 left-0 z-10"
                        : "absolute top-3 left-3 z-20";

                      return (
                        <label
                          key={token.id}
                          className={`rounded-full box-content overflow-hidden bg-dark-90 border border-dark-90 ${sizeClass} ${positionClass}`}
                        >
                          <img src={token.icon} className="w-full h-full" />
                        </label>
                      );
                    })}
              </>
            ) : tokens_sort.length === 3 ? (
              <div className="flex">
                {tokens_sort.map((token, index) => (
                  <label
                    key={token.id}
                    className="rounded-full box-content overflow-hidden bg-dark-90 w-8 h-8 border border-dark-90"
                  >
                    <img src={token.icon} className="w-full h-full" />
                  </label>
                ))}
              </div>
            ) : (
              <div className="relative grid grid-cols-2 grid-rows-2 gap-0">
                {tokens_sort.map((token, index) => {
                  let zIndex = 10 + index;
                  if (index === 1 || index === 3) zIndex += 2;
                  if (index === 2 || index === 3) zIndex += 1;

                  const marginClass =
                    index === 1
                      ? "ml-[-2px]"
                      : index === 2
                      ? "mt-[-6px]"
                      : index === 3
                      ? "ml-[22px] mt-[-6px]"
                      : "ml-[22px]";

                  return (
                    <label
                      key={token.id}
                      className={`rounded-full box-content overflow-hidden bg-dark-90 w-6 h-6 border border-dark-90 ${marginClass}`}
                      style={{ zIndex }}
                    >
                      <img src={token.icon} className="w-full h-full" />
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end flex-grow ">
            <a
              href="#"
              className="text-base whitespace-nowrap overflow-hidden text-ellipsis max-w-44"
            >
              {tokens_sort.map((token, index) => {
                const hLine = index === tokens.length - 1 ? "" : "-";
                return `${toRealSymbol(token.symbol)}${hLine}`;
              })}
            </a>
            <div className="mt-1.5 frcc">
              <div
                className={`text-white text-right`}
                data-class="reactTip"
                data-tooltip-id={
                  "rewardPerWeekId" + (seed?.farmList?.[0]?.farm_id ?? "")
                }
                data-place="top"
                data-tooltip-html={getRewardsPerWeekTip()}
              >
                <div className="flex items-center bg-white bg-opacity-10 rounded-full p-0.5">
                  <span className="flex hover:bg-black hover:bg-opacity-20 rounded-full w-max">
                    {getAllRewardsSymbols()
                      .slice(0, 4)
                      .map(([id, data], index) => {
                        if (index === 2 && getAllRewardsSymbols().length > 4) {
                          return (
                            <FarmPlaceholder
                              key="placeholder"
                              className="-ml-1"
                            />
                          );
                        } else if (
                          index === 3 &&
                          getAllRewardsSymbols().length > 4
                        ) {
                          return (
                            <img
                              key={
                                getAllRewardsSymbols()[
                                  getAllRewardsSymbols().length - 1
                                ][0]
                              }
                              src={
                                getAllRewardsSymbols()[
                                  getAllRewardsSymbols().length - 1
                                ][1].icon
                              }
                              className="h-4 w-4 rounded-full border border-green-10 -ml-1"
                              alt={
                                getAllRewardsSymbols()[
                                  getAllRewardsSymbols().length - 1
                                ][1].name
                              }
                            />
                          );
                        } else if (
                          index < 2 ||
                          (index === 2 && getAllRewardsSymbols().length <= 4)
                        ) {
                          return (
                            <img
                              key={id}
                              src={data.icon}
                              className={`h-4 w-4 rounded-full border border-green-10 ${
                                index !== 0 ? "-ml-1" : ""
                              }`}
                              alt={data.name}
                            />
                          );
                        }
                        return null;
                      })}
                  </span>
                  <span className="text-gray-10 text-xs mx-1.5">
                    {totalTvlPerWeekDisplay()}/week
                  </span>
                </div>
              </div>
              {isPending() ? (
                <div className="flex flex-col text-purple-10 text-xs bg-purple-20 bg-opacity-20 rounded-2xl px-2 py-0.5 ml-1">
                  <em>Coming</em>
                </div>
              ) : showNewTag() ? (
                <NewTag className="ml-1"></NewTag>
              ) : null}
              {is_dcl_pool ? <FarmListDCLIcon className="ml-1" /> : null}
              {status_is_new_or_will_end() === "will end" ? (
                <span className="text-xs text-redwarningColor bg-purple-20 bg-opacity-20 rounded-3xl px-1.5 py-1">
                  Ending soon
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {is_dcl_pool ? (
          <>
            <div className="frcb mb-3.5">
              <p className="text-gray-60 text-sm">Range</p>
              <p className="text-sm">{getRange()}</p>
            </div>
            <div className="frcb mb-3.5">
              <p className="text-gray-60 text-sm">APR</p>
              <p className="text-sm frcc">
                <CalcIcon
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setCalcVisible(true);
                  }}
                  className="text-gray-10 mr-1.5 cursor-pointer hover:text-greenColor lg:hidden"
                />
                {getTotalApr()}
                <CalcIcon
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setDclCalcVisible(true);
                  }}
                  className="text-gray-10 ml-1.5 cursor-pointer hover:text-greenColor xsm:hidden"
                />
              </p>
            </div>
            <div className="frcb">
              <p className="text-gray-60 text-sm">Your stake/Unclaimed</p>
              <p className="text-sm frcc">
                {isSignedIn
                  ? Number(yp_unFarm_value) === 0
                    ? "0"
                    : yp_unFarm_value
                  : "0"}
                /
                <p
                  className={`${
                    getTotalUnclaimedRewards() === "0"
                      ? "text-white"
                      : "text-green-10"
                  } frcc`}
                >
                  {isSignedIn && getTotalUnclaimedRewards() !== "0" ? (
                    <FarmListRewards className="ml-1 mr-1" />
                  ) : null}
                  {isSignedIn ? (
                    getTotalUnclaimedRewards()
                  ) : (
                    <span className="text-white">0</span>
                  )}
                </p>
              </p>
            </div>
          </>
        ) : null}
        {!is_dcl_pool ? (
          <>
            <div className="frcb mb-3.5">
              <p className="text-gray-60 text-sm">Total staked</p>
              <p className="text-sm">
                {Number(seed.seedTvl) == 0
                  ? "-"
                  : `$${toInternationalCurrencySystem(seed.seedTvl || "", 2)}`}
              </p>
            </div>
            <div className="frcb mb-3.5">
              <p className="text-gray-60 text-sm">APR</p>
              <p className="text-sm frcc">
                <CalcIcon
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setCalcVisible(true);
                  }}
                  className="text-gray-10 mr-1.5 cursor-pointer hover:text-greenColor lg:hidden"
                />
                {getTotalApr()}
                {is_support_lp ? <LPTip seed_id={seed.seed_id} /> : null}
                <CalcIcon
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setCalcVisible(true);
                  }}
                  className="text-gray-10 ml-1.5 cursor-pointer hover:text-greenColor xsm:hidden"
                />
              </p>
            </div>
            <div className="frcb">
              <p className="text-gray-60 text-sm">Your stake/Unclaimed</p>
              <p className="text-sm frcc">
                {isSignedIn
                  ? Number(yourTvl) === 0
                    ? "0"
                    : "$" + toInternationalCurrencySystem(yourTvl, 2)
                  : "0"}
                /
                <p
                  className={`${
                    getTotalUnclaimedRewards() === "0"
                      ? "text-white"
                      : "text-green-10"
                  } frcc`}
                >
                  {isSignedIn && getTotalUnclaimedRewards() !== "0" ? (
                    <FarmListRewards className="ml-1 mr-1" />
                  ) : null}
                  {isSignedIn ? (
                    getTotalUnclaimedRewards()
                  ) : (
                    <span className="text-white">0</span>
                  )}
                </p>
              </p>
            </div>
          </>
        ) : null}
        <CustomTooltip
          id={"rewardPerWeekId" + (seed?.farmList?.[0]?.farm_id ?? "")}
          place="bottom"
        />
        {isPending() && moment.unix(getStartTime()).valueOf() > Date.now() ? (
          <div
            className="absolute bottom-0 text-purple-10 text-xs bg-purple-20 bg-opacity-20 w-full left-0 frcc"
            style={{
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px",
            }}
          >
            <ClockIcon className="mr-1.5" />
            <Countdown
              date={moment.unix(getStartTime()).valueOf()}
              renderer={renderer}
            />
          </div>
        ) : null}
      </div>
      {calcVisible ? (
        <CalcModelBooster
          isOpen={calcVisible}
          onRequestClose={(e) => {
            e.stopPropagation();
            setCalcVisible(false);
          }}
          seed={seed}
          boostConfig={boostConfig}
          loveSeed={loveSeed}
          tokenPriceList={tokenPriceList}
          user_seeds_map={user_seeds_map}
          user_unclaimed_map={user_unclaimed_map}
          user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
        />
      ) : null}
      {dclCalcVisible ? (
        <CalcModelDcl
          isOpen={dclCalcVisible}
          onRequestClose={(e) => {
            e.stopPropagation();
            setDclCalcVisible(false);
          }}
          seed={seed}
          tokenPriceList={tokenPriceList}
        />
      ) : null}
    </>
  );
}

export default FarmView;
