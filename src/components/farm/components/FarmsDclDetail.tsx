import {
  Seed,
  BoostConfig,
  toRealSymbol,
  FarmBoost,
  list_liquidities,
  dcl_mft_balance_of,
  IStakeInfo,
  batch_stake_boost_nft,
  batch_unStake_boost_nft,
  claimRewardBySeed_boost,
} from "@/services/farm";
import { useRouter } from "next/router";
import Modal from "react-modal";
import {
  FaAngleDown,
  FaAngleUp,
  FarmDetailsBgIcon,
  FarmDetailsPoolIcon,
  FarmDetailsUnion,
  FarmListDCLIcon,
  QuestionMark,
  RefreshIcon,
} from "../icon";
import {
  UserLiquidityInfo,
  allocation_rule_liquidities,
  displayNumberToAppropriateDecimals,
  getEffectiveFarmList,
  getPriceByPoint,
  get_total_value_by_liquidity_amount_dcl,
  get_valid_range,
  isPending,
  mint_liquidity,
  sort_tokens_by_base,
} from "@/services/commonV3";
import { TokenMetadata } from "@/services/ft-contract";
import useTokens from "@/hooks/useTokens";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import { NEAR_META_DATA } from "@/utils/nearMetaData";
import {
  formatWithCommas,
  toInternationalCurrencySystem,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import BigNumber from "bignumber.js";
import { CalcIcon } from "../icon/FarmBoost";
import { useContext, useEffect, useMemo, useState } from "react";
import CalcModelDcl from "./CalcModelDcl";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import moment from "moment";
import styles from "../farm.module.css";
import { formatPercentage, formatWithCommas_usd } from "@/utils/uiNumber";
import Big from "big.js";
import { useAccountStore } from "@/stores/account";
import getConfig from "@/utils/config";
import { ButtonTextWrapper } from "@/components/common/Button";
import { LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import { isMobile } from "@/utils/device";
import { isStablePool } from "@/services/swap/swapUtils";
import { showWalletSelectorModal } from "@/utils/wallet";
import { useAppStore } from "@/stores/app";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { get_pool_name } from "@/services/commonV3";
import { IExecutionResult } from "@/interfaces/wallet";
import failToast from "@/components/common/toast/failToast";
import successToast from "@/components/common/toast/successToast";
import React from "react";
import { useFarmStore } from "@/stores/farm";

const { REF_VE_CONTRACT_ID, REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();

function FarmsDclDetail(props: {
  detailData: Seed;
  emptyDetailData: Function;
  tokenPriceList: any;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_data: Record<string, any>;
  user_data_loading: Boolean;
  dayVolumeMap: Record<string, string>;
  all_seeds: Seed[];
}) {
  const {
    detailData,
    emptyDetailData,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_data,
    user_data_loading,
    all_seeds,
  } = props;
  const init = useFarmStore((state) => state.init);
  const getConfig = useFarmStore((state) => state.getConfig);
  const get_user_unWithDraw_rewards = useFarmStore(
    (state) => state.get_user_unWithDraw_rewards
  );
  const get_user_seeds_and_unClaimedRewards = useFarmStore(
    (state) => state.get_user_seeds_and_unClaimedRewards
  );
  const cardWidth = isMobile() ? "100vw" : "430px";
  const cardHeight = isMobile() ? "90vh" : "80vh";
  const is_mobile = isMobile();
  const appStore = useAppStore();
  const { seed_id } = detailData;
  const pool = detailData.pool;
  const [listLiquiditiesLoading, setListLiquiditiesLoading] = useState(true);
  const [listLiquidities_inFarimg, set_listLiquidities_inFarimg] = useState<
    UserLiquidityInfo[]
  >([]);
  const [listLiquidities_unFarimg, set_listLiquidities_unFarimg] = useState<
    UserLiquidityInfo[]
  >([]);
  const [listLiquidities_unavailable, set_listLiquidities_unavailable] =
    useState<UserLiquidityInfo[]>([]);
  const [listLiquidities, setListLiquidities] = useState<UserLiquidityInfo[]>(
    []
  );
  const [mft_balance_in_dcl_account, set_mft_balance_in_dcl_account] =
    useState("0");
  const [nft_stake_loading, set_nft_stake_loading] = useState(false);
  const [nft_unStake_loading, set_nft_unStake_loading] = useState(false);
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  const {
    user_seeds_map = {},
    user_unclaimed_map = {},
    user_unclaimed_token_meta_map = {},
  } = user_data;
  const tokens = sortTokens(detailData?.pool?.tokens_meta_data || []);
  const [seedDclCalcVisible, setSeedDclCalcVisible] = useState(false);
  const [rangeSort, setRangeSort] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const isEnded = useMemo(() => {
    if (detailData?.farmList) {
      const farms = detailData.farmList;
      return farms[0].status == "Ended";
    }
    return false;
  }, [detailData]);
  const [activeTab, setActiveTab] = useState("Stake");
  const router = useRouter();
  const radio = getBoostMutil();
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
      get_mft_balance_of();
    }
  }, [isSignedIn, user_data_loading, all_seeds]);
  function sortTokens(tokens: TokenMetadata[]) {
    tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
      if (a.symbol === "NEAR") return 1;
      if (b.symbol === "NEAR") return -1;
      return 0;
    });
    return tokens;
  }
  const goBacktoFarms = () => {
    router.push("/v2farms");
    // init();
    emptyDetailData();
  };
  function getBoostMutil() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return "";
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = detailData;
    const love_user_seed = REF_VE_CONTRACT_ID
      ? user_seeds_map[REF_VE_CONTRACT_ID]
      : undefined;
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
  async function get_list_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    if (list.length > 0 && !user_data_loading && all_seeds.length > 0) {
      let temp_unavailable_final: UserLiquidityInfo[] = [];
      let temp_free_final: UserLiquidityInfo[] = [];
      let temp_farming_final: UserLiquidityInfo[] = [];
      const { free_amount = "0", locked_amount = "0" } =
        user_seeds_map[detailData.seed_id] || {};
      const user_seed_amount = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      const [temp_farming, temp_free, temp_unavailable] =
        allocation_rule_liquidities({
          list,
          user_seed_amount,
          seed: detailData,
        });
      temp_unavailable_final = temp_unavailable;
      temp_free_final = temp_free;
      temp_farming_final = temp_farming;
      const liquidities_minted_in_another_seed = temp_unavailable.filter(
        (liquidity: UserLiquidityInfo) => {
          const { mft_id } = liquidity;
          const { seed_id } = detailData;
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
              detailData.seed_id
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
      set_listLiquidities_unavailable(temp_unavailable_final);
      setListLiquidities(matched_liquidities);
    }
    if (!user_data_loading) {
      setListLiquiditiesLoading(false);
    }
  }
  async function get_mft_balance_of() {
    const { seed_decimal, seed_id } = detailData;
    const [contractId, temp_pool_id] = seed_id.split("@");
    const mft_id = `:${temp_pool_id}`;
    const balance = await dcl_mft_balance_of(mft_id);
    set_mft_balance_in_dcl_account(balance);
  }
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
    const tokens_sort = sort_tokens_by_base(tokens);
    let result = "";
    tokens_sort.forEach((token: TokenMetadata, index: number) => {
      if (token.id === WRAP_NEAR_CONTRACT_ID) {
        token.symbol = NEAR_META_DATA.symbol;
      }
      const symbol = toRealSymbol(token.symbol);
      if (index == tokens.length - 1) {
        result += symbol;
      } else {
        result += symbol + "-";
      }
    });
    return result;
  };
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
  function getTotalApr() {
    const farms = detailData.farmList;
    let apr = 0;
    const allPendingFarms = isPending();
    farms &&
      farms.forEach(function (item: FarmBoost) {
        const pendingFarm =
          item.status === "Created" || item.status === "Pending";
        if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
          if (item.apr !== undefined && item.apr !== null) {
            apr = +new BigNumber(apr).plus(new BigNumber(item.apr)).toFixed();
          }
        }
      });
    return apr * 100;
  }
  function get_total_apr() {
    const apr = getTotalApr();
    if (+apr == 0) {
      return "-";
    } else {
      return toPrecision(apr.toString(), 2) + "%";
    }
  }
  function getRange() {
    const [contractId, temp_pool_id] = detailData.seed_id.split("@");
    const [fixRange, dcl_pool_id, left_point, right_point] =
      temp_pool_id.split("&");
    const [token_x_metadata, token_y_metadata] = tokens;
    const decimalRate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let left_price = getPriceByPoint(+left_point, decimalRate);
    let right_price = getPriceByPoint(+right_point, decimalRate);
    if (!rangeSort) {
      const temp = left_price;
      left_price = new BigNumber(1).dividedBy(right_price).toFixed();
      right_price = new BigNumber(1).dividedBy(temp).toFixed();
    }
    const display_left_price = left_price;
    const display_right_price = right_price;
    return (
      <div className="flex items-center whitespace-nowrap xsm:flex-col xsm:items-end xsm:items-start">
        <div className="flex items-center">
          <RefreshIcon
            className="cursor-pointer mr-1.5 lg:hidden"
            onClick={() => {
              setRangeSort(!rangeSort);
            }}
          ></RefreshIcon>
          <span className="text-sm text-gray-50 xsm:text-white">
            1 {rangeSort ? token_x_metadata.symbol : token_y_metadata.symbol}=
          </span>
        </div>
        <div className="flex items-center xsm:mt-2.5">
          <span className="text-sm text-white mx-2">
            {displayNumberToAppropriateDecimals(display_left_price)} ~{" "}
            {displayNumberToAppropriateDecimals(display_right_price)}
          </span>
          <span className="text-sm text-gray-50 xsm:text-white">
            {rangeSort ? token_y_metadata.symbol : token_x_metadata.symbol}
          </span>
        </div>
      </div>
    );
  }
  const [yp_percent, yp_farming_value, yp_unFarm_value] = useMemo(() => {
    if (!listLiquiditiesLoading) {
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
    } else {
      return ["0%", "$0", "$0"];
    }
  }, [
    listLiquiditiesLoading,
    listLiquidities_inFarimg.length,
    listLiquidities_unFarimg.length,
  ]);
  const canStake = useMemo(() => {
    if (!listLiquiditiesLoading) {
      const { canStake } = get_stake_info();
      return canStake;
    }
    return false;
  }, [
    listLiquiditiesLoading,
    listLiquidities_inFarimg.length,
    listLiquidities_unFarimg.length,
  ]);
  const unclaimedRewardsData = useMemo(() => {
    return getTotalUnclaimedRewards();
  }, [user_unclaimed_map[seed_id]]);
  const canUnStake = useMemo(() => {
    if (!listLiquiditiesLoading) {
      return listLiquidities_inFarimg.length;
    }
  }, [listLiquiditiesLoading, listLiquidities_inFarimg.length]);
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    let resultTip = "";
    const tempFarms: { [key: string]: boolean } = {};

    detailData.farmList &&
      detailData.farmList.forEach((farm: FarmBoost) => {
        tempFarms[farm.terms.reward_token] = true;
      });
    const isEnded =
      detailData.farmList && detailData.farmList[0].status == "Ended";
    const unclaimed = user_unclaimed_map[seed_id] || {};
    const unClaimedTokenIds = Object.keys(unclaimed);
    const tokenList: any[] = [];
    unClaimedTokenIds?.forEach((tokenId: string) => {
      const token: TokenMetadata = user_unclaimed_token_meta_map[tokenId];
      // total price
      const { id, decimals, icon } = token;
      const amount = toReadableNumber(decimals, unclaimed[id] || "0");
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != "N/A") {
        totalPrice += +amount * tokenPrice;
      }
      // rewards number
      let displayNum = "";
      if (new BigNumber("0").isEqualTo(amount)) {
        displayNum = "-";
      } else if (new BigNumber("0.001").isGreaterThan(amount)) {
        displayNum = "<0.001";
      } else {
        displayNum = new BigNumber(amount).toFixed(3, 1);
      }
      // before boost number
      let beforeNum = "";
      if (radio) {
        const v = new BigNumber(amount).dividedBy(radio);
        if (new BigNumber("0").isEqualTo(v)) {
          beforeNum = "-";
        } else if (new BigNumber("0.001").isGreaterThan(v)) {
          beforeNum = "<0.001";
        } else {
          beforeNum = new BigNumber(v).toFixed(3, 1);
        }
      }
      const tempTokenData = {
        token,
        amount: displayNum,
        preAmount: beforeNum,
      };
      tokenList.push(tempTokenData);
      const txt = "ended_search";
      const itemHtml = `<div class="flex justify-between items-center h-8 active">
          <img class="w-5 h-5 rounded-full mr-7  border border-primaryGreen " src="${icon}"/>
            <div class="flex flex-col items-end text-xs text-navHighLightText">
            ${formatWithCommas(displayNum)}
            ${
              !isEnded && !tempFarms[id]
                ? `<span class="text-gray-10 text-xs">${txt}</span>`
                : ""
            }
          </div>
        </div>`;
      resultTip += itemHtml;
    });
    if (totalPrice == 0) {
      return {
        worth: <label className="opacity-30">{isSignedIn ? "$0" : "-"}</label>,
        showClaimButton: false,
        tip: resultTip,
        list: tokenList,
      };
    } else if (new BigNumber("0.01").isGreaterThan(totalPrice)) {
      return {
        worth: "<$0.01",
        showClaimButton: true,
        tip: resultTip,
        list: tokenList,
      };
    } else {
      return {
        worth: `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`,
        showClaimButton: true,
        tip: resultTip,
        list: tokenList,
      };
    }
  }
  function get_stake_info(): IStakeInfo {
    const { seed_id, min_deposit } = detailData;
    let total_v_liquidity = Big(0);
    let withdraw_amount = Big(0);
    const liquidities: UserLiquidityInfo[] = listLiquidities_unFarimg.concat(
      []
    );
    listLiquidities_unFarimg.forEach((l: UserLiquidityInfo) => {
      const v_liquidity = mint_liquidity(l, seed_id);
      total_v_liquidity = total_v_liquidity.plus(v_liquidity);
    });

    const [part_farm_liquidity] = listLiquidities_inFarimg.filter(
      (l: UserLiquidityInfo) => {
        return Big(l.unfarm_part_amount || 0).gt(0);
      }
    );
    if (part_farm_liquidity) {
      const unfarmPartAmount = part_farm_liquidity.unfarm_part_amount || "0";
      total_v_liquidity = total_v_liquidity.plus(unfarmPartAmount);
      liquidities.push(part_farm_liquidity);
    }
    if (total_v_liquidity.lt(min_deposit)) {
      if (part_farm_liquidity) {
        const unfarmPartAmount = part_farm_liquidity.unfarm_part_amount || "0";
        const v_liquidity = mint_liquidity(part_farm_liquidity, seed_id);
        withdraw_amount = new Big(v_liquidity).minus(unfarmPartAmount);
        total_v_liquidity = total_v_liquidity.plus(withdraw_amount);
      }
    }
    return {
      liquidities,
      total_v_liquidity: total_v_liquidity.toFixed(),
      withdraw_amount: withdraw_amount.toFixed(),
      canStake: total_v_liquidity.lt(min_deposit) || isEnded ? false : true,
    };
  }
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
    const [left_point, right_point] = get_valid_range(
      liquidity,
      detailData.seed_id
    );
    const v = get_liquidity_value(liquidity, left_point, right_point);
    return v;
  }
  function get_liquidity_value(
    liquidity: UserLiquidityInfo,
    leftPoint?: number,
    rightPoint?: number
  ) {
    const { amount } = liquidity;
    const poolDetail = detailData.pool;
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
      const txt = "start";
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
      if (pending) {
        itemHtml = `<div class="flex flex-col items-end my-2">
                      <div class="flex justify-between items-center w-full"><image class="w-5 h-5 rounded-full mr-7" style="filter: grayscale(100%)" src="${
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
        itemHtml = `<div class="flex justify-between items-center h-8 my-2">
                      <image class="w-5 h-5 rounded-full mr-7  border border-primaryGreen " src="${
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
        {detailData?.farmList && detailData.farmList[0] && (
          <>
            <div className="mr-1.5">{totalPriceDisplay}</div>
            <div
              className="text-white text-right"
              data-class="reactTip"
              data-tooltip-id={
                "rewardPerWeekId" + detailData.farmList[0].farm_id
              }
              data-place="top"
              data-tooltip-html={getRewardsPerWeekTip()}
            >
              <div className="flex items-center">
                {Object.entries(rewardTokenIconMap).map(([id, icon], index) => {
                  if (id === WRAP_NEAR_CONTRACT_ID) {
                    icon = NEAR_META_DATA.icon;
                  }
                  return (
                    <img
                      src={icon}
                      key={index}
                      className={`w-4 h-4 rounded-full border border-primaryGreen ${
                        index != 0 ? "-ml-1" : ""
                      }`}
                    ></img>
                  );
                })}
              </div>
              <CustomTooltip
                id={"rewardPerWeekId" + detailData?.farmList[0]?.farm_id}
              />
            </div>
          </>
        )}
      </>
    );
  }
  function formatCheckedList(data) {
    if (!data || typeof data !== "object") {
      return {};
    }
    const formattedData = {};
    for (const [key, value] of Object.entries(data)) {
      formattedData[key] = { value: value.toString() };
    }
    return formattedData;
  }
  function get_unStake_info() {
    const { free_amount = "0", locked_amount = "0" } =
      user_seeds_map[detailData.seed_id] || {};
    const user_seed_amount = new BigNumber(free_amount)
      .plus(locked_amount)
      .toFixed();
    return {
      liquidities: listLiquidities_inFarimg,
      withdraw_amount: user_seed_amount,
      seed_id: detailData.seed_id,
    };
  }
  function batchStakeNFT() {
    set_nft_stake_loading(true);
    const formattedCheckedList = formatCheckedList(user_unclaimed_map[seed_id]);
    const { liquidities, total_v_liquidity, withdraw_amount } =
      get_stake_info();
    batch_stake_boost_nft({
      liquidities,
      total_v_liquidity,
      withdraw_amount,
      seed_id: detailData.seed_id,
      checkedList: formattedCheckedList,
    }).then((res) => {
      handleStakeTranstion(res);
    });
  }
  async function handleStakeTranstion(res: IExecutionResult | undefined) {
    if (!res) return;
    if (res.status == "success") {
      set_nft_stake_loading(false);
      getConfig();
      get_user_unWithDraw_rewards();
      get_user_seeds_and_unClaimedRewards();
      successToast();
      await get_list_liquidities();
      setActiveTab("Unstake");
      get_mft_balance_of();
      init();
    } else if (res.status == "error") {
      failToast(res.errorResult?.message);
      set_nft_stake_loading(false);
    }
  }
  function batchUnStakeNFT() {
    set_nft_unStake_loading(true);
    // const unStake_info: IStakeInfo = get_unStake_info();
    const { liquidities, withdraw_amount, seed_id } = get_unStake_info();
    const formattedCheckedList = formatCheckedList(user_unclaimed_map[seed_id]);
    batch_unStake_boost_nft({
      seed_id,
      withdraw_amount,
      liquidities,
      checkedList: formattedCheckedList,
    }).then((res) => {
      handleUnStakeTranstion(res);
    });
  }
  async function handleUnStakeTranstion(res: IExecutionResult | undefined) {
    if (!res) return;
    if (res.status == "success") {
      set_nft_unStake_loading(false);
      init();
      getConfig();
      get_user_unWithDraw_rewards();
      get_user_seeds_and_unClaimedRewards();
      successToast();
      await get_list_liquidities();
      setActiveTab("Stake");
      get_mft_balance_of();
    } else if (res.status == "error") {
      failToast(res.errorResult?.message);
      set_nft_unStake_loading(false);
    }
  }
  function claimReward() {
    if (claimLoading) return;
    const formattedCheckedList = formatCheckedList(user_unclaimed_map[seed_id]);
    setClaimLoading(true);
    claimRewardBySeed_boost(detailData.seed_id, formattedCheckedList).then(
      (res) => {
        handleclaimTranstion(res);
      }
    );
  }
  async function handleclaimTranstion(res: IExecutionResult | undefined) {
    if (!res) return;
    if (res.status == "success") {
      setClaimLoading(false);
      init();
      getConfig();
      get_user_unWithDraw_rewards();
      get_user_seeds_and_unClaimedRewards();
      successToast();
    } else if (res.status == "error") {
      failToast(res.errorResult?.message);
      setClaimLoading(false);
    }
  }
  function goPool() {
    const poolId = pool?.pool_id;
    const pathname = get_pool_name(poolId);
    if (poolId) {
      router.push(`/poolV2/${pathname}`);
    }
  }
  function getAprTip() {
    const tempList = detailData.farmList;
    const lastList: any[] = [];
    const pending_farms: FarmBoost[] = [];
    const no_pending_farms: FarmBoost[] = [];
    let totalApr;
    const baseApr = getTotalApr();
    const txt = "Rewards APR";
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
    // eslint-disable-next-line prefer-const
    totalApr = baseApr;
    // show last display string
    let result: string = "";
    result = `
    <div class="flex items-center justify-between ">
      <span class="text-xs text-gray-60 mr-3">${txt}</span>
      <span class="text-sm text-white font-bold">${
        toPrecision(totalApr.toString(), 2) + "%"
      }</span>
    </div>
    `;
    lastList.forEach((item: any) => {
      const { rewardToken, apr: baseApr, pending, startTime } = item;
      const token = rewardToken;
      let itemHtml = "";
      const apr = baseApr;
      if (pending) {
        const startDate = moment.unix(startTime).format("YYYY-MM-DD");
        const txt = "start";
        itemHtml = `<div class="flex justify-between items-center h-8">
          <image class="w-5 h-5 rounded-full mr-7  border border-primaryGreen " style="filter: grayscale(100%)" src="${
            token.icon
          }"/>
          <div class="flex flex-col items-end">
            <label class="text-xs text-gray-60">${
              (apr == 0 ? "-" : formatWithCommas(toPrecision(apr, 2))) + "%"
            }</label>
            <label class="text-xs text-gray-60 ${
              +startTime == 0 ? "hidden" : ""
            }">${txt}: ${startDate}</label>
            <label class="text-xs text-gray-60 mt-0.5 ${
              +startTime == 0 ? "" : "hidden"
            }">Pending</label>
          </div>
      </div>`;
      } else {
        itemHtml = `<div class="flex justify-between items-center h-8">
          <image class="w-5 h-5 rounded-full mr-7  border border-primaryGreen " src="${
            token.icon
          }"/>
          <label class="text-xs text-gray-60">${
            (apr == 0 ? "-" : formatWithCommas(toPrecision(apr, 2))) + "%"
          }</label>
      </div>`;
      }
      result += itemHtml;
    });
    return result;
  }
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };
  function rewardRangeTip() {
    const tip = "Farm reward within this range";
    const result: string = `<div class="text-gray-110 text-xs text-left">${tip}</div>`;
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
  const stakeDisabled = !canStake || nft_stake_loading;
  const isEmpty = !canStake && !canUnStake;
  return (
    <>
      {/* pc */}
      <main
        className={`dark:text-white xsm:hidden ${
          isEnded ? styles.farmDetailsEnded : ""
        }`}
      >
        {/* title */}
        <div className="w-full bg-farmTitleBg pt-8 pb-5">
          <div className="m-auto 2xl:w-3/6 xl:w-4/6 lg:w-5/6">
            <p
              className="text-gray-60 text-sm mb-3 cursor-pointer"
              onClick={goBacktoFarms}
            >{`<  Farms`}</p>
            <div className="ml-32">
              <div className="frcb mb-5">
                <div className="frcc">
                  {displayImgs()}
                  <p className="ml-1.5 text-2xl paceGrotesk-Bold">
                    {displaySymbols()}
                  </p>
                  <FarmListDCLIcon className="ml-1" />
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
                  <p className="text-gray-50 mb-1">APR</p>
                  <p className="frcc">
                    <CalcIcon
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setSeedDclCalcVisible(true);
                      }}
                      className="text-gray-50 mr-1.5 cursor-pointer hover:text-greenColor"
                    />
                    <div
                      data-type="info"
                      data-place="top"
                      data-multiline={true}
                      data-tooltip-html={getAprTip()}
                      data-tooltip-id={
                        "aprId" + detailData?.farmList?.[0].farm_id + "your"
                      }
                      data-class="reactTip"
                    >
                      <span> {get_total_apr()}</span>
                      <CustomTooltip
                        id={
                          "aprId" + detailData?.farmList?.[0].farm_id + "your"
                        }
                      />
                    </div>
                  </p>
                </div>
                <div className="pr-6 text-sm relative w-max mr-6">
                  <div className="border-r border-gray-50 border-opacity-30 absolute right-0 top-1/4 h-1/2 w-0" />
                  <p className="text-gray-50 mb-1 flex items-center">
                    Reward Range
                    <div
                      className="text-white text-right ml-1"
                      data-class="reactTip"
                      data-tooltip-id="rewardRangeTipId"
                      data-place="top"
                      data-tooltip-html={rewardRangeTip()}
                    >
                      <QuestionMark></QuestionMark>
                      <CustomTooltip id="rewardRangeTipId" />
                    </div>
                  </p>
                  <p className="frcc">
                    <RefreshIcon
                      className="cursor-pointer mr-1.5"
                      onClick={() => {
                        setRangeSort(!rangeSort);
                      }}
                    ></RefreshIcon>
                    {getRange()}
                  </p>
                </div>
                <div className="pr-6 text-sm relative w-max">
                  <p className="text-gray-50 mb-1 flex items-center">
                    Rewards per week{" "}
                    <div
                      className="text-white text-right ml-1"
                      data-class="reactTip"
                      data-tooltip-id={"rewardPerWeekQId"}
                      data-place="top"
                      data-tooltip-html={valueOfRewardsTip()}
                    >
                      <QuestionMark></QuestionMark>
                      <CustomTooltip id={"rewardPerWeekQId"} />
                    </div>
                  </p>
                  <p className="flex items-center">
                    {totalTvlPerWeekDisplay()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {seedDclCalcVisible ? (
            <CalcModelDcl
              isOpen={seedDclCalcVisible}
              onRequestClose={(e) => {
                e.stopPropagation();
                setSeedDclCalcVisible(false);
              }}
              seed={detailData}
              tokenPriceList={tokenPriceList}
              style={{
                overlay: {
                  backdropFilter: "blur(15px)",
                  WebkitBackdropFilter: "blur(15px)",
                },
                content: {
                  outline: "none",
                  transform: "translate(-50%, -50%)",
                },
              }}
            />
          ) : null}
        </div>
        {/* content */}
        <div className={`2xl:w-3/6 xl:w-4/6 lg:w-5/6 pt-16 m-auto pb-8 `}>
          <div className="relative ml-80 bg-dark-10 rounded-md mb-2.5 w-2/5 ">
            <AddLiquidityEntryBar
              goPool={goPool}
              detailData={detailData}
              isEnded={isEnded}
              loading={listLiquiditiesLoading}
              inFarimg={listLiquidities_inFarimg}
              unFarimg={listLiquidities_unFarimg}
              unavailable={listLiquidities_unavailable}
            ></AddLiquidityEntryBar>
            {listLiquiditiesLoading && isSignedIn ? (
              <SkeletonTheme
                baseColor="rgba(33, 43, 53, 0.3)"
                highlightColor="#2A3643"
              >
                <Skeleton style={{ width: "100%" }} height={260} count={1} />
              </SkeletonTheme>
            ) : (
              <div className={`h-full p-5`}>
                <div className="flex items-center mb-8">
                  <button
                    className={`text-lg ${
                      activeTab === "Stake"
                        ? styles.gradient_text
                        : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab("Stake")}
                  >
                    Stake
                  </button>

                  {canUnStake ? (
                    <div
                      className="h-4 bg-gray-50 mx-5"
                      style={{ width: "2px" }}
                    />
                  ) : null}
                  {canUnStake ? (
                    <button
                      className={`text-lg ${
                        activeTab === "Unstake"
                          ? styles.gradient_text
                          : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("Unstake")}
                    >
                      Unstake
                    </button>
                  ) : null}
                </div>
                {activeTab === "Stake" && (
                  <>
                    <p className="text-gray-50 text-sm mb-1.5">Available</p>
                    {!isSignedIn ? (
                      <p className="text-2xl mb-11 text-gray-50">-</p>
                    ) : (
                      <p className="text-2xl mb-11">{yp_unFarm_value}</p>
                    )}
                  </>
                )}
                {canUnStake ? (
                  <>
                    {activeTab === "Unstake" && (
                      <>
                        <p className="text-gray-50 text-sm mb-1.5">Liquidity</p>
                        {!isSignedIn ? (
                          <p className="text-2xl mb-11 text-gray-50">-</p>
                        ) : (
                          <p className="text-2xl mb-11"> {yp_farming_value}</p>
                        )}
                      </>
                    )}
                  </>
                ) : null}
                {activeTab === "Stake" && (
                  <>
                    {!isSignedIn ? (
                      <div
                        className=" w-full h-11 frcc rounded text-base text-black bg-greenGradient cursor-pointer"
                        onClick={showWalletSelector}
                      >
                        Connect Wallet
                      </div>
                    ) : !isEnded ? (
                      <div
                        onClick={() => {
                          if (!stakeDisabled) {
                            batchStakeNFT();
                          }
                        }}
                        className={` w-full h-11 frcc rounded paceGrotesk-Bold text-base  ${
                          stakeDisabled
                            ? "cursor-not-allowed bg-gray-40 text-gray-50"
                            : "bg-greenGradient text-black cursor-pointer"
                        }`}
                      >
                        <ButtonTextWrapper
                          loading={nft_stake_loading}
                          Text={() => <>Stake</>}
                        />
                      </div>
                    ) : null}
                  </>
                )}
                {canUnStake ? (
                  <>
                    {activeTab === "Unstake" && (
                      <>
                        {!isSignedIn ? (
                          <div
                            className=" w-full h-11 frcc rounded text-base text-black bg-greenGradient cursor-pointer"
                            onClick={showWalletSelector}
                          >
                            Connect Wallet
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              if (!nft_unStake_loading) {
                                batchUnStakeNFT();
                              }
                            }}
                            className={` w-full h-11 frcc rounded paceGrotesk-Bold text-base  ${
                              nft_unStake_loading
                                ? "cursor-not-allowed bg-gray-40 text-gray-50"
                                : "text-green-10 border border-green-10 cursor-pointer"
                            }`}
                          >
                            <ButtonTextWrapper
                              loading={nft_unStake_loading}
                              Text={() => <>Unstake</>}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>

          <div className={`ml-80 bg-dark-10 rounded-md p-5  w-2/5 `}>
            <p className="flex items-center text-gray-50 text-sm mb-1.5">
              Unclaimed rewards
              <div
                className="text-white text-right ml-1.5"
                data-class="reactTip"
                data-tooltip-id={"unclaimedRewardQIdx"}
                data-place="top"
                data-tooltip-html={valueOfRewardsTip()}
              >
                <QuestionMark></QuestionMark>
                <CustomTooltip id={"unclaimedRewardQIdx"} />
              </div>
            </p>
            <div className="frcb">
              <p className="text-2xl frcc">
                <FarmDetailsUnion className="mr-4" />
                {unclaimedRewardsData.worth}
                {unclaimedRewardsData.showClaimButton ? (
                  <p
                    className="w-6 h-4 ml-1.5 bg-gray-100 frcc rounded-3xl text-gray-50 hover:text-white"
                    onClick={() => setShowDetail(!showDetail)}
                  >
                    {!showDetail ? (
                      <FaAngleUp className="cursor-pointer" />
                    ) : (
                      <FaAngleDown className="cursor-pointer" />
                    )}
                  </p>
                ) : null}
              </p>
              {unclaimedRewardsData.showClaimButton ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    claimReward();
                  }}
                  className={`border border-green-10 rounded frcc py-1.5 px-7 text-green-10 cursor-pointer text-sm ${
                    isEmpty || isEnded ? "hidden" : ""
                  }  `}
                >
                  <ButtonTextWrapper
                    loading={claimLoading}
                    Text={() => <>Claim</>}
                  />
                </div>
              ) : null}
            </div>
            {unclaimedRewardsData.showClaimButton ? (
              !showDetail ? null : (
                <div className="mt-2.5 border border-gray-90 p-4 rounded">
                  <div className="grid grid-cols-2 gap-4">
                    {unclaimedRewardsData.list.map(
                      (
                        {
                          token,
                          amount,
                          preAmount,
                        }: {
                          token: TokenMetadata;
                          amount: string;
                          preAmount: string;
                        },
                        index: number
                      ) => (
                        <div className="flex items-center" key={index}>
                          <div className="flex items-center">
                            <img
                              className="w-5 h-5 rounded-full border border-primaryGreen"
                              src={token.icon}
                            ></img>
                            <span className="text-gray-10 text-sm ml-1.5">
                              {toRealSymbol(token.symbol)}
                            </span>
                          </div>
                          <div className="flex items-center ml-2">
                            {preAmount ? (
                              <>
                                <span className="text-sm text-primaryText">
                                  {preAmount}
                                </span>
                                <span className="mx-3.5">1</span>
                                <span className={`text-sm text-white`}>
                                  {amount}
                                </span>
                              </>
                            ) : (
                              <span className={`text-sm text-primaryText`}>
                                {amount}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>
      </main>
      {/* mobile */}
      <div className={`lg:hidden px-4 ${isEnded ? styles.farmEnded : ""}`}>
        <div className="text-sm text-gray-60 pt-4 pb-6 flex items-center">
          <p onClick={goBacktoFarms}> {`Farms  >`}</p>
          <p className="text-white ml-1">Details</p>
        </div>
        <div className="text-white text-lg flex items-center justify-between mb-4">
          <div className="flex mb-1">
            {displayImgs()}
            <div className="ml-1 flex items-center">
              {displaySymbols()}
              <FarmListDCLIcon className="ml-1" />
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
        <div className="bg-dark-210 rounded-md p-3.5 mb-4">
          <div className="frcb text-sm mb-4">
            <p className="text-gray-50">APR</p>
            <p className="text-white frcc">
              <CalcIcon
                onClick={(e: any) => {
                  e.stopPropagation();
                  setSeedDclCalcVisible(true);
                }}
                className="text-gray-50 mr-1.5 cursor-pointer hover:text-greenColor"
              />
              <div
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-tooltip-html={getAprTip()}
                data-tooltip-id={
                  "aprId" + detailData?.farmList?.[0].farm_id + "your"
                }
                data-class="reactTip"
              >
                <span> {get_total_apr()}</span>
                <CustomTooltip
                  id={"aprId" + detailData?.farmList?.[0].farm_id + "your"}
                />
              </div>
            </p>
          </div>
          <div className="flex items-start justify-between text-sm mb-4">
            <p className="text-gray-50 frcc">
              <div
                className="text-white text-right mr-1"
                data-class="reactTip"
                data-tooltip-id="rewardRangeTipId"
                data-place="top"
                data-tooltip-html={rewardRangeTip()}
              >
                <QuestionMark></QuestionMark>
                <CustomTooltip id="rewardRangeTipId" />
              </div>
              Reward Range
            </p>
            <p className="text-white">
              {/* <RefreshIcon
                className="cursor-pointer mr-1.5"
                onClick={() => {
                  setRangeSort(!rangeSort);
                }}
              ></RefreshIcon> */}
              {getRange()}
            </p>
          </div>
          <div className="frcb text-sm mb-4">
            <p className="text-gray-50 frcc">
              <div
                className="text-white text-right mr-1"
                data-class="reactTip"
                data-tooltip-id={"rewardPerWeekQId"}
                data-place="top"
                data-tooltip-html={valueOfRewardsTip()}
              >
                <QuestionMark></QuestionMark>
                <CustomTooltip id={"rewardPerWeekQId"} />
              </div>
              Rewards per week
            </p>
            <p className="text-white frcc">{totalTvlPerWeekDisplay()}</p>
          </div>
        </div>
        <div className="bg-dark-210 rounded-md p-3.5 ">
          <p className="flex items-center text-gray-50 text-sm mb-1.5">
            Unclaimed rewards
            <div
              className="text-white text-right ml-1.5"
              data-class="reactTip"
              data-tooltip-id={"unclaimedRewardQIdx"}
              data-place="top"
              data-tooltip-html={valueOfRewardsTip()}
            >
              <QuestionMark></QuestionMark>
              <CustomTooltip id={"unclaimedRewardQIdx"} />
            </div>
          </p>
          <div className="frcb">
            <p className="text-2xl frcc text-white">
              <FarmDetailsUnion className="mr-4" />
              {unclaimedRewardsData.worth}
            </p>
            {!isEnded ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  claimReward();
                }}
                className="border border-green-10 rounded frcc py-1.5 px-7 text-green-10 cursor-pointer text-sm"
              >
                <ButtonTextWrapper
                  loading={claimLoading}
                  Text={() => <>Claim</>}
                />
              </div>
            ) : null}
          </div>
        </div>
        <div className="fixed bottom-8 left-0 w-full">
          {!isSignedIn ? (
            <div className="bg-dark-230 rounded-t-2xl px-4 py-6 flex">
              <div
                className=" w-full h-11 frcc rounded text-base text-black bg-greenGradient cursor-pointer "
                onClick={showWalletSelector}
              >
                Connect Wallet
              </div>
            </div>
          ) : listLiquiditiesLoading ||
            (!listLiquiditiesLoading &&
              listLiquidities_inFarimg.length == 0 &&
              listLiquidities_unFarimg.length == 0) ? (
            <AddLiquidityEntryMobileBar
              detailData={detailData}
              isEnded={isEnded}
              loading={listLiquiditiesLoading}
              inFarimg={listLiquidities_inFarimg}
              unFarimg={listLiquidities_unFarimg}
              unavailable={listLiquidities_unavailable}
              goPool={goPool}
            ></AddLiquidityEntryMobileBar>
          ) : (
            <div className="bg-dark-230 rounded-t-2xl px-4 py-6 flex">
              <div
                className="flex-1 bg-primaryGreen rounded frcc mr-3.5 h-12 text-black"
                onClick={() => handleTabClick("Stake")}
              >
                Stake
              </div>
              {canUnStake ? (
                <div
                  className="flex-1 text-primaryGreen border border-primaryGreen rounded frcc h-12"
                  onClick={() => handleTabClick("Unstake")}
                >
                  Unstake
                </div>
              ) : null}
              {isModalOpen && (
                <Modal
                  isOpen={isModalOpen}
                  onRequestClose={(e: any) => {
                    e.stopPropagation();
                    setIsModalOpen(false);
                  }}
                  style={{
                    overlay: {
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    },
                    content: {
                      outline: "none",
                      ...(is_mobile
                        ? {
                            transform: "translateX(-50%)",
                            top: "auto",
                            bottom: "32px",
                          }
                        : {
                            transform: "translate(-50%, -50%)",
                          }),
                    },
                  }}
                >
                  <div
                    className="text-white"
                    style={{
                      width: cardWidth,
                      maxHeight: cardHeight,
                    }}
                  >
                    <div className="bg-dark-10 rounded-t-2xl border border-modalGrayBg">
                      <div className="flex items-center mb-7 border-b border-white border-opacity-10 px-4">
                        <button
                          className={`text-lg pr-5 xsm:flex-1 ${
                            activeTab === "Stake"
                              ? styles.gradient_text
                              : "text-gray-500"
                          }`}
                          onClick={() => setActiveTab("Stake")}
                        >
                          Stake
                        </button>
                        <div
                          className={`h-4 bg-gray-50 xsm:hidden`}
                          style={{ width: "2px" }}
                        />
                        {canUnStake ? (
                          <button
                            className={`text-lg pl-5 xsm:flex-1 ${
                              activeTab === "Unstake"
                                ? styles.gradient_text
                                : "text-gray-500"
                            }`}
                            onClick={() => setActiveTab("Unstake")}
                          >
                            Unstake
                          </button>
                        ) : null}
                      </div>
                      {activeTab === "Stake" && (
                        <>
                          <p className="text-gray-50 text-sm mb-2.5 mx-4">
                            Available
                          </p>
                          <p className="text-2xl mb-20 text-gray-50 mx-4 bg-gray-10 bg-opacity-10 px-6 py-4 rounded">
                            {yp_unFarm_value}
                          </p>
                        </>
                      )}
                      {canUnStake ? (
                        <>
                          {activeTab === "Unstake" && (
                            <>
                              <p className="text-gray-50 text-sm mb-2.5 mx-4">
                                Liquidity
                              </p>
                              {!isSignedIn ? (
                                <p className="text-2xl mb-11 text-gray-50">-</p>
                              ) : (
                                <p className="text-2xl mb-20 text-gray-50 mx-4 bg-gray-10 bg-opacity-10 px-6 py-4 rounded">
                                  {yp_farming_value}
                                </p>
                              )}
                            </>
                          )}
                        </>
                      ) : null}
                      <div className="px-4 pb-4">
                        {activeTab === "Stake" && (
                          <>
                            {!isEnded ? (
                              <div
                                onClick={() => {
                                  if (!stakeDisabled) {
                                    batchStakeNFT();
                                  }
                                }}
                                className={` w-full h-11 frcc rounded paceGrotesk-Bold text-base  ${
                                  stakeDisabled
                                    ? "cursor-not-allowed bg-gray-40 text-gray-50"
                                    : "bg-greenGradient text-black cursor-pointer"
                                }`}
                              >
                                <ButtonTextWrapper
                                  loading={nft_stake_loading}
                                  Text={() => <>Stake</>}
                                />
                              </div>
                            ) : null}
                          </>
                        )}

                        {activeTab === "Unstake" && (
                          <>
                            {!isSignedIn ? (
                              <div
                                className=" w-full h-11 frcc rounded text-base text-black bg-greenGradient cursor-pointer"
                                onClick={showWalletSelector}
                              >
                                Connect Wallet
                              </div>
                            ) : !isEnded ? (
                              <div
                                onClick={() => {
                                  if (!nft_unStake_loading) {
                                    batchUnStakeNFT();
                                  }
                                }}
                                className={` w-full h-11 frcc rounded paceGrotesk-Bold text-base  ${
                                  nft_unStake_loading
                                    ? "cursor-not-allowed bg-gray-40 text-gray-50"
                                    : "text-green-10 border border-green-10 cursor-pointer"
                                }`}
                              >
                                <ButtonTextWrapper
                                  loading={nft_unStake_loading}
                                  Text={() => <>Unstake</>}
                                />
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AddLiquidityEntryBar(props: {
  loading: boolean;
  inFarimg: UserLiquidityInfo[];
  unFarimg: UserLiquidityInfo[];
  unavailable: UserLiquidityInfo[];
  detailData: Seed;
  isEnded: boolean;
  goPool: any;
}) {
  let tip: any;
  const {
    loading,
    inFarimg,
    unFarimg,
    unavailable,
    detailData,
    isEnded,
    goPool,
  } = props;
  if (!loading && inFarimg.length == 0 && unFarimg.length == 0) {
    // if (unavailable.length == 0) {
    //   tip = <FormattedMessage id="add_lp_tokens_tip" />;
    // } else {
    //   tip =
    //     'The price range of your liquidity is out of reward range. Please add liquidity within reward range.';
    // }
    tip =
      "You don't have liquidity during the farm reward range, click 'Add Liquidity' to start farming.";
  }
  if (loading || !tip || isEnded) return null;
  return (
    <div
      className="absolute inset-0 bg-dark-45 bg-opacity-70 flex flex-col items-center justify-center z-50 border rounded-lg cursor-pointer"
      onClick={goPool}
      style={{ backdropFilter: "blur(2px)" }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <FarmDetailsBgIcon />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center px-12">
          <p className="text-base mb-6 text-center">
            You don't have liquidity during the farm reward range, click 'Add
            Liquidity' to start farming.
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
  loading: boolean;
  inFarimg: UserLiquidityInfo[];
  unFarimg: UserLiquidityInfo[];
  unavailable: UserLiquidityInfo[];
  detailData: Seed;
  isEnded: boolean;
  goPool: any;
}) {
  let tip: any;
  const {
    loading,
    inFarimg,
    unFarimg,
    unavailable,
    detailData,
    isEnded,
    goPool,
  } = props;
  if (!loading && inFarimg.length == 0 && unFarimg.length == 0) {
    // if (unavailable.length == 0) {
    //   tip = <FormattedMessage id="add_lp_tokens_tip" />;
    // } else {
    //   tip =
    //     'The price range of your liquidity is out of reward range. Please add liquidity within reward range.';
    // }
    tip =
      "You don't have liquidity during the farm reward range, click 'Add Liquidity' to start farming.";
  }
  if (loading || !tip || isEnded) return null;
  return (
    <div
      className="bg-dark-230 px-8 py-6 rounded-t-2xl text-gray-10 cursor-pointer"
      onClick={goPool}
      style={{ backdropFilter: "blur(2px)" }}
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

export default React.memo(FarmsDclDetail);
