import {
  Seed,
  BoostConfig,
  toRealSymbol,
  FarmBoost,
  getVeSeedShare,
  mftGetBalance,
  getMftTokenId,
  getServerTime,
} from "@/services/farm";
import {
  FarmDetailsBgIcon,
  FarmDetailsPoolIcon,
  FarmLpIcon,
  QuestionMark,
} from "../icon";
import { TokenMetadata } from "@/services/ft-contract";
import {
  getEffectiveFarmList,
  get_matched_seeds_for_dcl_pool,
  sort_tokens_by_base,
} from "@/services/commonV3";
import useTokens from "@/hooks/useTokens";
import { useRouter } from "next/router";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import { NEAR_META_DATA } from "@/utils/nearMetaData";
import {
  formatWithCommas,
  toInternationalCurrencySystem,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import BigNumber from "bignumber.js";
import { LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import getConfig from "@/utils/config";
import { get24hVolumes } from "@/services/indexer";
import {
  CalcIcon,
  LightningBase64,
  LightningBase64Grey,
  NewTag,
} from "../icon/FarmBoost";
import CalcModelBooster from "./CalcModelBooster";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import moment from "moment";
import { useAccountStore } from "@/stores/account";
import {
  LP_STABLE_TOKEN_DECIMALS,
  LP_TOKEN_DECIMALS,
} from "@/services/m-token";
import UserStakeBlock from "./FarmsDetailClaim";
import FarmsDetailStake from "./FarmsDetailStake";
import { getPoolsDetailById } from "@/services/pool";
import StakeMobile from "./StakeMobile";
import LPTip from "./LPTip";
import getConfigV2 from "@/utils/configV2";
import ShadowTip from "./ShadowTip";
import { isStablePool } from "@/services/swap/swapUtils";
import styles from "@/components/farm/farm.module.css";
import { showWalletSelectorModal } from "@/utils/wallet";
import { useAppStore } from "@/stores/app";
import getStablePoolTypeConfig from "@/utils/stablePoolConfig/stablePoolTypeConfig";
import React from "react";
interface IShareInfo {
  sharesInfo: {
    sharesInPool: string | number;
    amountByShadowInFarm: string | number;
    amountByTransferInFarm: string | number;
  };
}
const ONLY_ZEROS = /^0*\.?0*$/;
const stablePoolTypeConfig = getStablePoolTypeConfig();
const { STABLE_POOL_IDS } = stablePoolTypeConfig;
const { FARM_LOCK_SWITCH, REF_VE_CONTRACT_ID, FARM_BLACK_LIST_V2 } =
  getConfig();
const FarmsDetailContext = createContext<IShareInfo | null>(null);
function FarmsDetail(props: {
  detailData: Seed;
  emptyDetailData: Function;
  tokenPriceList: any;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_data: Record<string, any>;
  user_data_loading: Boolean;
  dayVolumeMap: Record<string, string>;
}) {
  const {
    detailData,
    emptyDetailData,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_data,
    user_data_loading,
    dayVolumeMap,
  } = props;
  const {
    user_seeds_map = {},
    user_unclaimed_map = {},
    user_unclaimed_token_meta_map = {},
  } = user_data;
  const { pool, seed_id } = detailData;
  const { token_account_ids } = pool || {};
  const DECIMALS =
    pool && new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
      ? LP_STABLE_TOKEN_DECIMALS
      : LP_TOKEN_DECIMALS;
  const { free_amount = "0", shadow_amount = "0" } =
    user_seeds_map[seed_id] || {};
  const freeAmount = toReadableNumber(DECIMALS, free_amount);
  const tokens = sortTokens(useTokens(token_account_ids) || []);
  const router = useRouter();
  const [yourApr, setYourApr] = useState("");
  const [dayVolume, setDayVolume] = useState("");
  const [yourActualAprRate, setYourActualAprRate] = useState("1");
  const [maxLoveShareAmount, setMaxLoveShareAmount] = useState<string>("0");
  const [calcVisible, setCalcVisible] = useState(false);
  const aprUpLimit = getAprUpperLimit();
  const [lpBalance, setLpBalance] = useState("");
  const [showAddLiquidityEntry, setShowAddLiquidityEntry] = useState(false);
  const [serverTime, setServerTime] = useState<number>();
  const accountStore = useAccountStore();
  const [isStakeMobileOpen, setStakeMobileOpen] = useState<boolean>(false);
  const [showActivateBox, setShowActivateBox] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("stake");
  const [isSharesInfoReady, setIsSharesInfoReady] = useState(false);
  const isSignedIn = accountStore.isSignedIn;
  const appStore = useAppStore();
  const [sharesInfo, setSharesInfo] = useState<{
    sharesInPool: string | number;
    amountByShadowInFarm: string | number;
    amountByTransferInFarm: string | number;
  }>({
    sharesInPool: "0",
    amountByShadowInFarm: "0",
    amountByTransferInFarm: "0",
  });
  async function getSharesInfo() {
    setIsSharesInfoReady(false);
    const { seed_id } = detailData;
    const { free_amount, shadow_amount } = user_seeds_map[seed_id] || {};
    if (pool) {
      const poolId = pool.id;
      const sharesInPool = await mftGetBalance(
        getMftTokenId(poolId.toString())
      );
      const amountByShadowInFarm = shadow_amount;
      const amountByTransferInFarm = free_amount;
      setSharesInfo({
        sharesInPool: sharesInPool || "0",
        amountByShadowInFarm: amountByShadowInFarm || "0",
        amountByTransferInFarm: amountByTransferInFarm || "0",
      });
      setIsSharesInfoReady(true);
    }
  }
  function sortTokens(tokens: TokenMetadata[]) {
    tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
      if (a.symbol === "NEAR") return 1;
      if (b.symbol === "NEAR") return -1;
      return 0;
    });
    return tokens;
  }

  useEffect(() => {
    if (!isSignedIn) {
      setActiveTab("unstake");
    }
  }, [isSignedIn]);
  useEffect(() => {
    getYourAprs();
  }, [boostConfig, user_seeds_map]);
  useEffect(() => {
    getPoolFee();
    get_ve_seed_share();
  }, []);
  useEffect(() => {
    get_server_time();
  }, []);
  useEffect(() => {
    if (
      // Object.keys(user_seeds_map).length && // new user no data
      !user_data_loading &&
      isSignedIn
    ) {
      getSharesInfo();
    }
  }, [user_seeds_map, user_data_loading, isSignedIn]);
  useEffect(() => {
    if (isSharesInfoReady) {
      getStakeBalance();
    }
  }, [isSharesInfoReady]);
  function getYourAprs() {
    const yourApr = getYourApr();
    if (yourApr) {
      setYourApr(yourApr);
    }
  }
  async function get_ve_seed_share() {
    const result = await getVeSeedShare();
    const maxShareObj = result?.accounts?.accounts[0] || {};
    const amount = maxShareObj?.amount;
    if (amount) {
      const amountStr = new BigNumber(amount).toFixed().toString();
      // const amountStr_readable = toReadableNumber(LOVE_TOKEN_DECIMAL, amountStr);
      const amountStr_readable = toReadableNumber(24, amountStr);
      setMaxLoveShareAmount(amountStr_readable);
    }
  }
  async function getPoolFee() {
    if (!pool) return;
    const feeCache = dayVolumeMap && dayVolumeMap[pool.id];
    if (feeCache) {
      setDayVolume(feeCache);
    } else {
      const fee = await get24hVolumes([pool.id.toString()]);
      setDayVolume(fee.join(", "));
    }
  }
  const goBacktoFarms = () => {
    router.push("/v2farms");
    emptyDetailData();
  };
  const displayImgs = () => {
    const tokenList: any[] = [];
    const tokens_sort = sort_tokens_by_base(tokens || []);
    tokens_sort.forEach((token: TokenMetadata) => {
      if (token.id === WRAP_NEAR_CONTRACT_ID) {
        token.icon = NEAR_META_DATA.icon;
      }
      tokenList.push(
        <label
          key={token.id}
          className={`h-7 w-7 rounded-full overflow-hidden border border-dark-90 -ml-1`}
        >
          <img src={token.icon} className="w-full h-full"></img>
        </label>
      );
    });
    return tokenList;
  };
  const displaySymbols = () => {
    let result = "";
    const tokens_meta_data = (pool && pool.tokens_meta_data) || [];
    const tokens_sort = sort_tokens_by_base(tokens_meta_data);
    tokens_sort.forEach((token: TokenMetadata, index: number) => {
      if (token.id === WRAP_NEAR_CONTRACT_ID) {
        token.symbol = NEAR_META_DATA.symbol;
      }
      const symbol = toRealSymbol(token.symbol);
      if (index === tokens_meta_data.length - 1) {
        result += symbol;
      } else {
        result += symbol + "-";
      }
    });
    return result;
  };
  function getYourApr() {
    if (!boostConfig) return "";
    const { affected_seeds } = boostConfig;
    const { seed_id } = detailData;
    if (typeof REF_VE_CONTRACT_ID === "undefined") return "";
    if (!affected_seeds || !seed_id || !(seed_id in affected_seeds)) {
      return "";
    }
    const user_seed = user_seeds_map[seed_id] || {};
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID] || {};
    const base = affected_seeds[seed_id];
    const hasUserStaked = Object.keys(user_seed).length;
    const { free_amount } = love_user_seed || {};
    const userLoveAmount = toReadableNumber(
      LOVE_TOKEN_DECIMAL,
      free_amount || "0"
    );
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
  function isPending() {
    let pending: boolean = true;
    const farms = detailData.farmList || [];
    for (let i = 0; i < farms.length; i++) {
      if (farms[i].status != "Created" && farms[i].status != "Pending") {
        pending = false;
        break;
      }
    }
    return pending;
  }
  function getActualTotalApr() {
    const farms = detailData.farmList;
    let apr = "0";
    const allPendingFarms = isPending();
    farms &&
      farms.forEach(function (item: FarmBoost) {
        const pendingFarm =
          item.status == "Created" || item.status == "Pending";
        const itemApr = item.apr ? item.apr : "0";
        if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
          apr = new BigNumber(apr).plus(itemApr).toFixed();
        }
      });
    return apr;
  }
  function getTotalApr(containPoolFee: boolean = true) {
    let day24Volume = 0;
    if (containPoolFee) {
      day24Volume = +getPoolFeeApr(dayVolume);
    }
    const apr = getActualTotalApr();
    if (new BigNumber(apr).isEqualTo(0) && day24Volume == 0) {
      return "-";
    } else {
      const temp = new BigNumber(apr).multipliedBy(100).plus(day24Volume);
      if (temp.isLessThan(0.01)) {
        return "<0.01%";
      } else {
        return toPrecision(temp.toFixed(), 2) + "%";
      }
    }
  }
  function getPoolFeeApr(dayVolume: string) {
    let result = "0";
    if (dayVolume && detailData.pool) {
      const { total_fee, tvl } = detailData.pool;
      const revenu24h = (total_fee / 10000) * 0.8 * Number(dayVolume);
      if (tvl > 0 && revenu24h > 0) {
        const annualisedFeesPrct = ((revenu24h * 365) / tvl) * 100;
        const half_annualisedFeesPrct = annualisedFeesPrct;
        result = toPrecision(half_annualisedFeesPrct.toString(), 2);
      }
    }
    return result;
  }
  function getAprUpperLimit() {
    if (!boostConfig || !maxLoveShareAmount || +maxLoveShareAmount == 0)
      return "";
    const { affected_seeds } = boostConfig;
    const { seed_id } = detailData;
    if (!affected_seeds || !seed_id || !(seed_id in affected_seeds)) {
      return "";
    }
    const base = affected_seeds[seed_id];
    let rate;
    if (+maxLoveShareAmount < 1) {
      rate = 1;
    } else {
      rate = new BigNumber(1)
        .plus(Math.log(+maxLoveShareAmount) / Math.log(base))
        .toFixed(2);
    }
    const apr = getActualTotalApr();
    let boostApr;
    if (apr) {
      boostApr = new BigNumber(apr).multipliedBy(rate);
    }
    if (boostApr && +boostApr > 0) {
      const r = new BigNumber(boostApr).multipliedBy(100).toFixed();
      return (
        <span>
          <label className="mx-0.5">～</label>
          {toPrecision(r.toString(), 2) + "%"}
        </span>
      );
    }
    return "";
  }
  function mergeCommonRewardsFarms(farms: FarmBoost[]) {
    const tempMap: Record<string, FarmBoost> = {};
    farms.forEach((farm: FarmBoost) => {
      const { reward_token, daily_reward } = farm.terms;
      const preMergedfarms: FarmBoost = tempMap[reward_token];
      if (preMergedfarms) {
        if (farm.apr) {
          preMergedfarms.apr = new BigNumber(preMergedfarms.apr || "0")
            .plus(farm.apr)
            .toFixed()
            .toString();
        }
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
  const getStakeBalance = async () => {
    if (!isSignedIn) {
      setShowAddLiquidityEntry(false);
    } else {
      if (pool) {
        const poolId = pool.id;
        const b = new BigNumber(sharesInfo.sharesInPool)
          .minus(sharesInfo.amountByShadowInFarm)
          .toFixed();
        if (Number(b) < 0) {
          setLpBalance("");
        } else {
          if (new Set(STABLE_POOL_IDS || []).has(poolId?.toString())) {
            setLpBalance(toReadableNumber(LP_STABLE_TOKEN_DECIMALS, b));
          } else {
            setLpBalance(toReadableNumber(LP_TOKEN_DECIMALS, b));
          }
          if (detailData.farmList) {
            const isEnded = detailData.farmList[0].status == "Ended";
            if (isEnded) {
              setShowAddLiquidityEntry(false);
            } else {
              const userSeed = user_seeds_map[detailData.seed_id];
              setShowAddLiquidityEntry(
                !Number(b) && !userSeed && !user_data_loading
              );
            }
          }
        }
      }
    }
  };
  function getRewardsPerWeekTip() {
    const tempList: FarmBoost[] = detailData.farmList || [];
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
        const { decimals } = farm.token_meta_data || { decimals: 0 };
        const weekAmount = toReadableNumber(
          decimals,
          new BigNumber(farm.terms.daily_reward).multipliedBy(7).toFixed()
        );
        lastList.push({
          commonRewardToken: farm.token_meta_data,
          commonRewardTotalRewardsPerWeek: weekAmount,
          startTime: farm.terms.start_at,
          pending: true,
        });
      });
    }
    if (no_pending_farms.length > 0) {
      const mergedFarms = mergeCommonRewardsFarms(
        JSON.parse(JSON.stringify(no_pending_farms))
      );
      mergedFarms.forEach((farm: FarmBoost) => {
        const { decimals } = farm.token_meta_data || { decimals: 0 };
        const weekAmount = toReadableNumber(
          decimals,
          new BigNumber(farm.terms.daily_reward).multipliedBy(7).toFixed()
        );
        lastList.push({
          commonRewardToken: farm.token_meta_data,
          commonRewardTotalRewardsPerWeek: weekAmount,
        });
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
    const rewards_week_txt = "rewards_week";
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
  function totalTvlPerWeekDisplay() {
    const farms = detailData.farmList || [];
    const rewardTokenIconMap: Record<string, string> = {};
    let totalPrice = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    farms &&
      farms.forEach((farm: FarmBoost) => {
        const { id, icon } = farm.token_meta_data || { id: "", icon: "" };
        rewardTokenIconMap[id] = icon;
      });
    effectiveFarms.forEach((farm: FarmBoost) => {
      const { id, decimals } = farm.token_meta_data || { id: "", decimals: 0 };
      const { daily_reward } = farm.terms;
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
    return (
      <>
        {totalPriceDisplay}
        {detailData?.farmList && detailData.farmList[0] && (
          <div
            className="text-white text-right ml-1.5"
            data-class="reactTip"
            data-tooltip-id={"rewardPerWeekId" + detailData.farmList[0].farm_id}
            data-place="top"
            data-tooltip-html={getRewardsPerWeekTip()}
          >
            <div className="flex items-center xsm:justify-end xsm:mt-1">
              {Object.entries(rewardTokenIconMap).map(([id, icon], index) => {
                if (id === WRAP_NEAR_CONTRACT_ID) {
                  icon = NEAR_META_DATA.icon;
                }
                return (
                  <img
                    src={icon}
                    key={index}
                    className={`w-4 h-4 rounded-full border border-primaryGreen ${
                      index !== 0 ? "-ml-1" : ""
                    }`}
                  ></img>
                );
              })}
            </div>

            <CustomTooltip
              id={"rewardPerWeekId" + detailData.farmList[0].farm_id}
            />
          </div>
        )}
      </>
    );
  }
  function getBoostMutil() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return "";
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = detailData;
    if (!REF_VE_CONTRACT_ID) {
      return "";
    }
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    const base = affected_seeds[seed_id];
    if (base && loveSeed) {
      const { free_amount = 0, locked_amount = 0 } = love_user_seed || {};
      const totalStakeLoveAmount = toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      if (+totalStakeLoveAmount > 0) {
        let result;
        if (+totalStakeLoveAmount < 1) {
          result = 1;
        } else {
          result = new BigNumber(1)
            .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
            .toFixed(2);
        }
        return result;
      }
      return "";
    }
    return "";
  }
  const get_server_time = async () => {
    const timestamp = await getServerTime();
    setServerTime(timestamp);
  };
  function goPool() {
    const poolId = pool?.id;
    const isStable = poolId !== undefined ? isStablePool(poolId) : false;
    if (isStable) {
      router.push(`/sauce/${poolId}`);
    } else {
      router.push(`/pool/${poolId}`);
    }
  }
  function showNewTag() {
    if (isInMonth()) {
      return true;
    }
  }
  function isEnded() {
    const farms = detailData.farmList;
    if (farms && farms.length > 0) {
      return farms[0].status == "Ended";
    }
    return false;
  }
  function isInMonth() {
    const endedStatus = isEnded();
    if (endedStatus) return false;
    const result = detailData.farmList?.find((farm: FarmBoost) => {
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
  function getAprTip(isYour?: Boolean) {
    const tempList = detailData.farmList;
    const lastList: any[] = [];
    const pending_farms: FarmBoost[] = [];
    const no_pending_farms: FarmBoost[] = [];
    const day24Volume = getPoolFeeApr(dayVolume);
    let totalApr;
    const baseApr = getTotalApr(false);
    const txt1 = "Pool fee APY";
    const txt2 = "Rewards APR";
    tempList?.forEach((farm: FarmBoost) => {
      if (farm.status == "Created") {
        pending_farms.push(farm);
      } else {
        no_pending_farms.push(farm);
      }
    });
    if (pending_farms.length > 0) {
      pending_farms.forEach((farm: FarmBoost) => {
        lastList.push({
          rewardToken: farm.token_meta_data,
          apr: new BigNumber(farm.apr || 0)
            .multipliedBy(100)
            .toFixed()
            .toString(),
          startTime: farm.terms.start_at,
          pending: true,
        });
      });
    }
    if (no_pending_farms.length > 0) {
      const mergedFarms = mergeCommonRewardsFarms(
        JSON.parse(JSON.stringify(no_pending_farms))
      );
      mergedFarms.forEach((farm: FarmBoost) => {
        lastList.push({
          rewardToken: farm.token_meta_data,
          apr: new BigNumber(farm.apr || 0)
            .multipliedBy(100)
            .toFixed()
            .toString(),
        });
      });
    }
    if (isYour) {
      totalApr = yourApr;
    } else {
      totalApr = baseApr;
    }
    // show last display string
    let result: string = "";
    result = `
    <div class="frcb">
      <span class="text-xs text-gray-60 mr-3">${txt1}</span>
      <span class="text-sm text-white font-bold">${
        +day24Volume > 0 ? day24Volume + "%" : "-"
      }</span>
    </div>
    <div class="flex justify-end text-white text-sm font-bold ">+</div>
    <div class="flex items-center justify-between ">
      <span class="text-xs text-gray-60 mr-3">${txt2}</span>
      <span class="text-sm text-white font-bold">${totalApr}</span>
    </div>
    `;
    if (isYour) {
      const displayYourActualAprRate = new BigNumber(yourActualAprRate).toFixed(
        2
      );
      result += `<div class="flex items-center justify-end text-xs text-gray-60">
      (${baseApr}<span class="flex items-center ${
        +displayYourActualAprRate == 1 ? "text-gray-60" : "text-primaryGreen"
      } text-xs ml-0.5">x${displayYourActualAprRate}<img src="${
        +displayYourActualAprRate == 1
          ? LightningBase64Grey()
          : LightningBase64()
      }"/></span>)
    </div>`;
    }
    function display_apr(apr: string) {
      const apr_big = new BigNumber(apr || 0);
      if (apr_big.isEqualTo(0)) {
        return "-";
      } else if (apr_big.isLessThan(0.01)) {
        return "<0.01%";
      } else {
        return formatWithCommas(toPrecision(apr, 2)) + "%";
      }
    }
    lastList.forEach((item: any) => {
      const { rewardToken, apr: baseApr, pending, startTime } = item;
      const token = rewardToken;
      let itemHtml = "";
      let apr = baseApr;
      if (isYour && yourApr && yourActualAprRate) {
        apr = new BigNumber(apr).multipliedBy(yourActualAprRate).toFixed();
      }
      if (pending) {
        const startDate = moment.unix(startTime).format("YYYY-MM-DD");
        const txt = "start";
        itemHtml = `<div class="flex justify-between items-center h-8">
          <image class="w-5 h-5 rounded-full mr-7" style="filter: grayscale(100%)" src="${
            token.icon
          }"/>
          <div class="flex flex-col items-end">
            <label class="text-xs text-farmText">${display_apr(apr)}</label>
            <label class="text-xs text-farmText ${
              +startTime == 0 ? "hidden" : ""
            }">${txt}: ${startDate}</label>
            <label class="text-xs text-farmText mt-0.5 ${
              +startTime == 0 ? "" : "hidden"
            }">Pending</label>
          </div>
      </div>`;
      } else {
        itemHtml = `<div class="flex justify-between items-center h-8">
          <image class="w-5 h-5 rounded-full mr-7" src="${token.icon}"/>
          <label class="text-xs text-navHighLightText">${display_apr(
            apr
          )}</label>
      </div>`;
      }
      result += itemHtml;
    });
    return result;
  }
  function showStakeMobile() {
    setStakeMobileOpen(true);
  }
  function hideStakeMobile() {
    setStakeMobileOpen(false);
  }
  const radio = getBoostMutil();
  const configV2 = getConfigV2();
  const is_support_lp = configV2.SUPPORT_SHADOW_POOL_IDS.includes(
    (pool?.id || "").toString()
  );
  function getAprTitleTip() {
    const yourAprTip = "Your APR";
    const rangeAprTip = "Range or reference APR";
    let result: string = "";
    if (yourApr) {
      result = `<div class="flex items-center text-gray-110 text-xs  text-left">
      <span class="text-white">${yourAprTip} / </span> &nbsp;${rangeAprTip} 
    </div>`;
    } else {
      result = `<div class="flex items-center text-gray-110 text-xs  text-left">
      ${rangeAprTip} 
    </div>`;
    }
    return result;
  }
  function valueOfRewardsTip() {
    const tip = "Indicative value based on prices and not actual execution";
    const result: string = `<div class="text-gray-110 text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  function showWalletSelector() {
    showWalletSelectorModal(appStore.setShowRiskModal);
  }
  const unlpBalances = toReadableNumber(
    DECIMALS,
    BigNumber(free_amount).plus(shadow_amount).toFixed()
  );
  const needForbidden =
    (FARM_BLACK_LIST_V2 || []).indexOf((pool?.id || 0).toString()) > -1;
  return (
    <>
      {/* pc */}
      <main
        className={`dark:text-white xsm:hidden ${
          isEnded() || needForbidden ? styles.farmDetailsEnded : ""
        }`}
      >
        {/* title */}
        <div className="w-full bg-farmTitleBg pt-8 pb-5">
          <div className="m-auto 2xl:w-3/6 xl:w-4/6 lg:w-5/6">
            <p
              className="text-gray-60 text-sm mb-3 cursor-pointer 2xl:-ml-32 z-50 w-fit"
              onClick={goBacktoFarms}
            >{`<  Farms`}</p>
            <div className="frcb mb-5">
              <div className="frcc">
                {displayImgs()}
                <p className="ml-1.5 text-2xl paceGrotesk-Bold flex items-center">
                  <p> {displaySymbols()}</p>
                  {showNewTag() ? <NewTag className="ml-1"></NewTag> : null}
                </p>
              </div>
              <div
                className="text-gray-60 text-sm frcc cursor-pointer"
                onClick={goPool}
              >
                Pool
                <div className="w-5 h-5 frcc bg-gray-100 rounded ml-1.5">
                  <FarmDetailsPoolIcon />
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="pr-6 text-sm relative w-max mr-6">
                <div className="border-r border-gray-50 border-opacity-30 absolute right-0 top-1/4 h-1/2 w-0" />
                <p className="text-gray-50 mb-1">Total staked</p>
                <p>
                  {`${
                    detailData.seedTvl
                      ? `$${toInternationalCurrencySystem(
                          detailData.seedTvl,
                          2
                        )}`
                      : "-"
                  }`}
                </p>
              </div>
              <div className="pr-6 text-sm relative w-max mr-6">
                <div className="border-r border-gray-50 border-opacity-30 absolute right-0 top-1/4 h-1/2 w-0" />
                <p className="text-gray-50 mb-1 flex items-center">
                  APR
                  <div
                    className="text-white text-right ml-1"
                    data-class="reactTip"
                    data-tooltip-id={"yourAprTipId_m"}
                    data-place="top"
                    data-tooltip-html={getAprTitleTip()}
                  >
                    <QuestionMark className="ml-1.5"></QuestionMark>
                    <CustomTooltip id={"yourAprTipId_m"} />
                  </div>
                </p>
                <p className="frcc">
                  <div
                    className={`text-white flex`}
                    data-type="info"
                    data-place="top"
                    data-multiline={true}
                    data-tooltip-html={getAprTip(yourApr ? true : false)}
                    data-tooltip-id={
                      "aprId" + detailData?.farmList?.[0]?.farm_id
                    }
                    data-class="reactTip"
                  >
                    {yourApr ? (
                      <div className="flex cursor-pointer justify-center">
                        <label className="text-white">{yourApr}</label>
                        <span className="text-sm text-gray-10">
                          ({getTotalApr()}
                          {aprUpLimit})
                        </span>
                      </div>
                    ) : (
                      <>
                        <label className="text-sm frcc cursor-pointer">
                          {getTotalApr()}
                        </label>
                        {aprUpLimit}
                      </>
                    )}
                    <CustomTooltip
                      id={"aprId" + detailData?.farmList?.[0].farm_id}
                    />
                  </div>
                  {isSignedIn ? (
                    is_support_lp ? (
                      <LPTip seed_id={detailData.seed_id} />
                    ) : null
                  ) : null}
                  <CalcIcon
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setCalcVisible(true);
                    }}
                    className="text-gray-60 ml-1.5 cursor-pointer hover:text-primaryGreen"
                  />
                </p>
              </div>
              <div className="pr-6 text-sm relative w-max">
                <p className="text-gray-50 mb-1 flex items-center">
                  Rewards per week{" "}
                  <div
                    data-class="reactTip"
                    data-tooltip-id={"rewardPerWeekQId"}
                    data-place="top"
                    data-tooltip-html={valueOfRewardsTip()}
                  >
                    <QuestionMark className="ml-1.5"></QuestionMark>
                    <CustomTooltip id={"rewardPerWeekQId"} />
                  </div>
                </p>
                <p className="flex items-center"> {totalTvlPerWeekDisplay()}</p>
              </div>
            </div>
          </div>
        </div>
        {/* content */}
        <FarmsDetailContext.Provider value={{ sharesInfo }}>
          <div className="2xl:w-3/6 xl:w-4/6 lg:w-5/6 pt-16 m-auto pb-8 flex">
            <div className="flex-1 mr-2.5 h-full">
              <UserStakeBlock
                detailData={detailData}
                tokenPriceList={tokenPriceList}
                lpBalance={lpBalance}
                loveSeed={loveSeed}
                boostConfig={boostConfig}
                user_seeds_map={user_seeds_map}
                user_unclaimed_map={user_unclaimed_map}
                user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
                user_data_loading={user_data_loading}
                radio={radio}
              ></UserStakeBlock>
            </div>
            <div className="relative flex-1 h-full">
              {showAddLiquidityEntry ? (
                <AddLiquidityEntryBar
                  goPool={goPool}
                  detailData={detailData}
                  showAddLiquidityEntry={showAddLiquidityEntry}
                  isSignedIn={isSignedIn}
                ></AddLiquidityEntryBar>
              ) : null}
              {isEnded() && Number(unlpBalances) <= 0 && isSignedIn && (
                <div
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-sm rounded-lg"
                  style={{
                    background: "rgba(22, 33, 42, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    zIndex: 1000,
                  }}
                >
                  <p
                    className="text-base"
                    style={{ color: "rgba(138, 150, 160, 1)" }}
                  >
                    The current Farm has ended
                  </p>
                </div>
              )}
              <div
                className={`h-full  ${
                  !isSignedIn ? "blur-0" : showAddLiquidityEntry ? "blur-2" : ""
                }`}
              >
                <FarmsDetailStake
                  detailData={detailData}
                  tokenPriceList={tokenPriceList}
                  stakeType="free"
                  serverTime={serverTime ?? 0}
                  lpBalance={lpBalance}
                  loveSeed={loveSeed}
                  boostConfig={boostConfig}
                  user_seeds_map={user_seeds_map}
                  user_unclaimed_map={user_unclaimed_map}
                  user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
                  user_data_loading={user_data_loading}
                  radio={radio}
                  updateSharesAndBalance={setSharesInfo}
                ></FarmsDetailStake>
              </div>
            </div>
          </div>
        </FarmsDetailContext.Provider>
        {+freeAmount > 0 && is_support_lp && isSignedIn ? (
          <div
            className="2xl:w-3/6 xl:w-4/6 lg:w-5/6 m-auto text-sm -mt-5 bg-white bg-opacity-5 p-4 rounded"
            style={{ color: "rgba(255, 255, 255, 0.6)" }}
          >
            <p className="flex mr-1.5">
              <FarmLpIcon className="mr-2" />
              How to stake LP on Burrow?
            </p>
            <span>
              Step 1.{" "}
              <a
                className="text-white underline cursor-pointer relative"
                tabIndex={99}
                onBlur={() => {
                  setShowActivateBox(false);
                }}
                onClick={() => {
                  setShowActivateBox(!showActivateBox);
                }}
              >
                Activate
                <ShadowTip
                  show={showActivateBox}
                  seed_id={seed_id}
                  user_unclaimed_map={user_unclaimed_map}
                />
              </a>{" "}
              the {`Burrow's`} LP as Collateral feature
            </span>
            <span>
              Step 2. Go to supply LP on{" "}
              <a
                className="text-white text-sm underline cursor-pointer"
                onClick={() => {
                  const shadow_id = `shadow_ref_v1-${pool?.id}`;
                  const url = `https://app.burrow.finance/tokenDetail/${shadow_id}`;
                  window.open(url);
                }}
              >
                Burrow
              </a>
            </span>
          </div>
        ) : null}
        {calcVisible ? (
          <CalcModelBooster
            isOpen={calcVisible}
            onRequestClose={(e) => {
              e.stopPropagation();
              setCalcVisible(false);
            }}
            seed={detailData}
            tokenPriceList={tokenPriceList}
            loveSeed={loveSeed}
            boostConfig={boostConfig}
            user_seeds_map={user_seeds_map}
            user_unclaimed_map={user_unclaimed_map}
            user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
          />
        ) : null}
      </main>
      {/* mobile */}
      <div
        className={`lg:hidden px-4 ${
          isEnded() || needForbidden ? styles.farmEnded : ""
        }`}
      >
        <div className="text-sm text-gray-60 pt-4 pb-6 flex items-center">
          <p onClick={goBacktoFarms}> {`Farms  >`}</p>
          <p className="text-white ml-1">Details</p>
        </div>
        {seed_id === "v2.ref-finance.near@4179" ? (
          <>
            <div className="flex mb-1">{displayImgs()}</div>
            <div className="text-white text-lg flex items-center justify-between mb-4">
              <div className="flex items-center">
                {displaySymbols()}
                {showNewTag() ? <NewTag className="ml-1"></NewTag> : null}
              </div>
              <div
                className="text-gray-60 text-sm flex items-center"
                onClick={goPool}
              >
                <p className="underline mr-1">Pool</p>
                <FarmDetailsPoolIcon />
              </div>
            </div>
          </>
        ) : (
          <div className="text-white text-lg flex items-center justify-between mb-4">
            <div className="flex mb-1">
              {displayImgs()}
              <div className="ml-1">
                {displaySymbols()}
                {showNewTag() ? <NewTag className="ml-1"></NewTag> : null}
              </div>
            </div>
            <div
              className="text-gray-60 text-sm flex items-center"
              onClick={goPool}
            >
              <p className="underline mr-1">Pool</p>
              <FarmDetailsPoolIcon />
            </div>
          </div>
        )}
        <div className="bg-dark-210 rounded-md p-3.5 mb-4">
          <div className="frcb text-sm mb-4">
            <p className="text-gray-50">Total staked</p>
            <p className="text-white">{`${
              detailData.seedTvl
                ? `$${toInternationalCurrencySystem(detailData.seedTvl, 2)}`
                : "-"
            }`}</p>
          </div>
          <div className="frcb text-sm mb-4">
            <p className="text-gray-50 flex items-center">
              <div
                className="text-white text-right"
                data-class="reactTip"
                data-tooltip-id={"yourAprTipId_m"}
                data-place="top"
                data-tooltip-html={getAprTitleTip()}
              >
                <QuestionMark className="mr-0.5"></QuestionMark>
                <CustomTooltip id={"yourAprTipId_m"} />
              </div>
              APR
            </p>
            <div className="text-white flex">
              <div
                className={`text-white flex`}
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-tooltip-html={getAprTip(yourApr ? true : false)}
                data-tooltip-id={"aprId" + detailData?.farmList?.[0]?.farm_id}
                data-class="reactTip"
              >
                {yourApr ? (
                  <div className="flex cursor-pointer justify-center">
                    <label className="text-white">{yourApr}</label>
                    <span className="text-sm text-gray-10">
                      ({getTotalApr()}
                      {aprUpLimit})
                    </span>
                  </div>
                ) : (
                  <>
                    <label className="text-sm frcc cursor-pointer">
                      {getTotalApr()}
                    </label>
                    {aprUpLimit}
                  </>
                )}
                <CustomTooltip
                  id={"aprId" + detailData?.farmList?.[0].farm_id}
                />
              </div>
              {isSignedIn ? (
                is_support_lp ? (
                  <LPTip seed_id={detailData.seed_id} />
                ) : null
              ) : null}
            </div>
          </div>
          <div className="flex items-start justify-between text-sm mb-1">
            <p className="text-gray-50 flex items-center">
              <div
                data-class="reactTip"
                data-tooltip-id={"rewardPerWeekQId"}
                data-place="top"
                data-tooltip-html={valueOfRewardsTip()}
              >
                <QuestionMark className="mr-0.5"></QuestionMark>
                <CustomTooltip id={"rewardPerWeekQId"} />
              </div>
              Rewards per week
            </p>
            <p className="text-white">{totalTvlPerWeekDisplay()}</p>
          </div>
        </div>
        <div className={`${showAddLiquidityEntry ? "mb-60" : "mb-40"}`}>
          <UserStakeBlock
            detailData={detailData}
            tokenPriceList={tokenPriceList}
            lpBalance={lpBalance}
            loveSeed={loveSeed}
            boostConfig={boostConfig}
            user_seeds_map={user_seeds_map}
            user_unclaimed_map={user_unclaimed_map}
            user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
            user_data_loading={user_data_loading}
            radio={radio}
          ></UserStakeBlock>
          {isSignedIn ? (
            +freeAmount > 0 && is_support_lp ? (
              <div
                className="text-sm mt-5 bg-white bg-opacity-5 p-4 rounded flex"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                <div className="mt-1">
                  <FarmLpIcon className="mr-2" />
                </div>
                <p className="mr-1.5">
                  How to stake LP on Burrow? Step 1.{" "}
                  <a
                    className="text-white underline cursor-pointer relative"
                    tabIndex={99}
                    onBlur={() => {
                      setShowActivateBox(false);
                    }}
                    onClick={() => {
                      setShowActivateBox(!showActivateBox);
                    }}
                  >
                    Activate
                    <ShadowTip show={showActivateBox} seed_id={seed_id} />
                  </a>
                  the {`Burrow's`} LP as Collateral feature. Step 2. Go to
                  supply LP on{" "}
                  <a
                    className="text-white text-sm underline cursor-pointer"
                    onClick={() => {
                      const shadow_id = `shadow_ref_v1-${pool?.id}`;
                      const url = `https://app.burrow.finance/tokenDetail/${shadow_id}`;
                      window.open(url);
                    }}
                  >
                    Burrow
                  </a>
                </p>
              </div>
            ) : null
          ) : null}
        </div>
        <div className="fixed bottom-8 left-0 w-full">
          {!isSignedIn ? (
            <div className="bg-dark-230 rounded-t-2xl px-4 py-6 flex">
              <div
                className=" w-full h-11 frcc rounded text-base text-primaryGreen border border-primaryGreen cursor-pointer "
                onClick={showWalletSelector}
              >
                Connect Wallet
              </div>
            </div>
          ) : showAddLiquidityEntry ? (
            <AddLiquidityEntryMobileBar
              detailData={detailData}
              showAddLiquidityEntry={showAddLiquidityEntry}
              goPool={goPool}
              isSignedIn={isSignedIn}
            ></AddLiquidityEntryMobileBar>
          ) : (
            <div
              className={`bg-dark-230 rounded-t-2xl px-4 py-6 flex ${
                isEnded() && Number(unlpBalances) <= 0 ? "hidden" : ""
              }`}
            >
              <div
                className={`flex-1 bg-primaryGreen rounded mr-3.5 h-12 text-black ${
                  isEnded() ? "hidden" : "frcc"
                }`}
                onClick={() => {
                  setActiveTab("stake");
                  showStakeMobile();
                }}
              >
                Stake
              </div>
              <div
                className={`flex-1 text-primaryGreen border border-primaryGreen rounded h-12  ${
                  Number(unlpBalances) > 0 ? "frcc" : "hidden"
                }`}
                onClick={() => {
                  setActiveTab("unstake");
                  showStakeMobile();
                }}
              >
                Unstake
              </div>
            </div>
          )}
        </div>
        <StakeMobile
          isOpen={isStakeMobileOpen}
          onRequestClose={hideStakeMobile}
          detailData={detailData}
          tokenPriceList={tokenPriceList}
          stakeType="free"
          serverTime={serverTime ?? 0}
          lpBalance={lpBalance}
          loveSeed={loveSeed}
          boostConfig={boostConfig}
          user_seeds_map={user_seeds_map}
          user_unclaimed_map={user_unclaimed_map}
          user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
          user_data_loading={user_data_loading}
          radio={radio}
          activeTab={activeTab}
          updateSharesAndBalance={setSharesInfo}
        />
      </div>
    </>
  );
}

type Pool = {
  token_account_ids: string[];
};
function AddLiquidityEntryBar(props: {
  detailData: Seed;
  showAddLiquidityEntry: any;
  goPool: any;
  isSignedIn: any;
}) {
  const { detailData, showAddLiquidityEntry, goPool, isSignedIn } = props;
  const [addLiquidityModalVisible, setAddLiquidityModalVisible] =
    useState(false);
  const poolA = detailData.pool;
  const poolId = poolA?.id;
  const [pool, setPool] = useState<Pool | null>(null);
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);
  const [addLiquidityButtonLoading, setAddLiquidityButtonLoading] =
    useState(true);

  useEffect(() => {
    if (poolId) {
      getPoolsDetailById({ pool_id: poolId as any }).then((res) => {
        setPool(res.data);
      });
    }
  }, [poolId]);
  const fetchedTokens = useTokens(pool?.token_account_ids || []);
  useEffect(() => {
    if (fetchedTokens) {
      setTokens(fetchedTokens);
      setAddLiquidityButtonLoading(!(fetchedTokens.length > 0 && pool));
    }
  }, [pool]);

  const needForbidden =
    (FARM_BLACK_LIST_V2 || []).indexOf(poolId?.toString() || "") > -1;
  if (!showAddLiquidityEntry || needForbidden || !isSignedIn) return null;

  return (
    <div
      className="absolute inset-0 bg-dark-45 bg-opacity-70 flex flex-col items-center justify-center z-50 border rounded-lg cursor-pointer"
      onClick={goPool}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <FarmDetailsBgIcon />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center px-12">
          <p className="text-base mb-6 text-center">
            You need LP tokens to stake into the corresponding farm. First, add
            liquidity to the pool to get LP tokens.
          </p>
          <div className="text-base flex items-center justify-center h-12 bg-AddLiquidityBg rounded w-72">
            Add Liquidity
          </div>
        </div>
      </div>
    </div>
  );
}

function AddLiquidityEntryMobileBar(props: {
  detailData: Seed;
  showAddLiquidityEntry: any;
  goPool: any;
  isSignedIn: any;
}) {
  const { detailData, showAddLiquidityEntry, goPool, isSignedIn } = props;
  const [addLiquidityModalVisible, setAddLiquidityModalVisible] =
    useState(false);
  const poolA = detailData.pool;
  const poolId = poolA?.id;
  const [pool, setPool] = useState<Pool | null>(null);
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);
  const [addLiquidityButtonLoading, setAddLiquidityButtonLoading] =
    useState(true);

  useEffect(() => {
    if (poolId) {
      getPoolsDetailById({ pool_id: poolId as any }).then((res) => {
        setPool(res.data);
      });
    }
  }, [poolId]);
  const fetchedTokens = useTokens(pool?.token_account_ids || []);
  useEffect(() => {
    if (fetchedTokens) {
      setTokens(fetchedTokens);
      setAddLiquidityButtonLoading(!(fetchedTokens.length > 0 && pool));
    }
  }, [pool]);

  const needForbidden =
    (FARM_BLACK_LIST_V2 || []).indexOf(poolId?.toString() || "") > -1;
  if (!showAddLiquidityEntry || needForbidden || !isSignedIn) return null;

  return (
    <div
      className="bg-dark-230 px-8 py-6 rounded-t-2xl text-gray-10 cursor-pointer"
      onClick={goPool}
    >
      <p className="text-center mb-4">
        You need LP tokens to stake into the corresponding farm. First, add
        liquidity to the pool to get LP tokens.
      </p>
      <div className="bg-AddLiquidityBg rounded h-11 frcc text-white text-sm">
        Add Liquidity
      </div>
    </div>
  );
}

export default React.memo(FarmsDetail);
