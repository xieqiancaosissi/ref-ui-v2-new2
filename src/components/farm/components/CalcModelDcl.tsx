import React, { useContext, useMemo, createContext } from "react";
import { ModalClose, QuestionMark } from "../icon";
import { FormattedMessage, useIntl } from "react-intl";
import { useState, useEffect, useRef } from "react";
import { BigNumber } from "bignumber.js";
import Modal from "react-modal";
import { FarmBoost, Seed } from "../../../services/farm";
import {
  toPrecision,
  toReadableNumber,
  formatWithCommas,
} from "../../../utils/numbers";
import { isMobile } from "../../../utils/device";
import getConfig from "../../../utils/config";
import { TokenMetadata, unWrapToken } from "../../../services/ft-contract";
import { LinkArrowIcon } from "../icon/FarmBoost";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {
  UserLiquidityInfo,
  getPriceByPoint,
  get_total_value_by_liquidity_amount_dcl,
  mint_liquidity,
  TOKEN_LIST_FOR_RATE,
  displayNumberToAppropriateDecimals,
  get_intersection_radio,
  get_intersection_icon_by_radio,
  getEffectiveFarmList,
  get_pool_name,
  openUrl,
} from "../../../services/commonV3";
import CustomTooltip from "../../customTooltip/customTooltip";
import { RefreshIcon } from "@/components/swap/icons";
import { useRouter } from "next/router";
interface DclContextType {
  seed: Seed;
  tokenPriceList: Record<string, any>;
  liquidity: UserLiquidityInfo | undefined;
  lp_amount: string;
  lp_value: string;
  one_lp_value: string;
  set_lp_amount: React.Dispatch<React.SetStateAction<string>>;
  set_lp_value: React.Dispatch<React.SetStateAction<string>>;
  getEffectiveFarmList: (farmList: FarmBoost[]) => FarmBoost[];
}

const DclContext = React.createContext<DclContextType | null>(null);

function CalcModelDcl(
  props: ReactModal.Props & {
    seed: Seed;
    tokenPriceList: Record<string, any>;
    liquidity?: UserLiquidityInfo;
  }
) {
  const cardWidth = isMobile() ? "100vw" : "420px";
  const cardHeight = isMobile() ? "90vh" : "80vh";
  const is_mobile = isMobile();
  const { seed, tokenPriceList, liquidity } = props;
  const [lp_amount, set_lp_amount] = useState("0");
  const [lp_value, set_lp_value] = useState("0");
  const [one_lp_value, set_one_lp_value] = useState("");
  useEffect(() => {
    get_one_lp_value();
  }, [seed, tokenPriceList]);
  function get_one_lp_value() {
    const { seed_id, pool } = seed;
    if (!pool || !pool.tokens_meta_data) {
      return;
    }
    const { tokens_meta_data } = pool;
    const [contractId, temp_pool_id] = seed_id.split("@");
    const [fixRange, dcl_pool_id, left_point, right_point] =
      temp_pool_id.split("&");
    const [token_x, token_y] = dcl_pool_id.split("|");
    const [token_x_meta, token_y_meta] = tokens_meta_data;
    const price_x = tokenPriceList[token_x]?.price || "0";
    const price_y = tokenPriceList[token_y]?.price || "0";
    const temp_valid = +right_point - +left_point;
    const range_square = Math.pow(temp_valid, 2);
    const amount = new BigNumber(Math.pow(10, 12))
      .dividedBy(range_square)
      .toFixed();
    const single_lp_value = get_total_value_by_liquidity_amount_dcl({
      left_point: +left_point,
      right_point: +right_point,
      amount,
      poolDetail: pool,
      price_x_y: { [token_x]: price_x, [token_y]: price_y },
      metadata_x_y: { [token_x]: token_x_meta, [token_y]: token_y_meta },
    });
    set_one_lp_value(single_lp_value);
  }
  return (
    <Modal
      {...props}
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
        className="text-white bg-dark-10 rounded-lg xs:rounded-t-2xl xs:border xs:border-modalGrayBg p-5"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
        }}
      >
        <div className="flex justify-between items-center">
          <label className="text-lg">ROI Calculator</label>
          <div className="cursor-pointer" onClick={props.onRequestClose}>
            <ModalClose />
          </div>
        </div>
        <DclContext.Provider
          value={{
            seed,
            tokenPriceList,
            liquidity,
            lp_amount,
            lp_value,
            one_lp_value,
            set_lp_amount,
            set_lp_value,
            getEffectiveFarmList,
          }}
        >
          {liquidity ? <LiquidityInfo></LiquidityInfo> : <SeedInfo></SeedInfo>}
          <CalcEle></CalcEle>
        </DclContext.Provider>
      </div>
    </Modal>
  );
}
function SeedInfo() {
  const intl = useIntl();
  const [rangeSort, setRangeSort] = useState(true);
  const router = useRouter();
  const context = useContext(DclContext);
  const { seed, one_lp_value, set_lp_amount, set_lp_value } = context ?? {};
  const rate_need_to_reverse_display = useMemo(() => {
    if (seed && seed.pool && seed.pool.tokens_meta_data) {
      const [tokenX] = seed.pool.tokens_meta_data;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) return true;
    }
    return false;
  }, [seed]);
  useEffect(() => {
    if (rate_need_to_reverse_display) {
      setRangeSort(false);
    }
  }, [rate_need_to_reverse_display]);
  function getRange() {
    const { seed } = context ?? {};
    const seed_id = seed?.seed_id ?? "";
    const pool = seed?.pool;
    const [contractId, temp_pool_id] = seed_id.split("@");
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
    if (!rangeSort) {
      const temp = left_price;
      left_price = new BigNumber(1).dividedBy(right_price).toFixed();
      right_price = new BigNumber(1).dividedBy(temp).toFixed();
    }
    const display_left_price = left_price;
    const display_right_price = right_price;
    return (
      <div className="flex whitespace-nowrap flex-col items-end text-sm text-gray-10">
        <div className="flex items-center">
          <RefreshIcon
            className="cursor-pointer mr-1"
            onClick={() => {
              setRangeSort(!rangeSort);
            }}
          ></RefreshIcon>
          <span>
            1 {rangeSort ? token_x_metadata.symbol : token_y_metadata.symbol}=
          </span>
        </div>
        <div className="flex items-center mt-0.5">
          <span className="mx-2">
            {displayNumberToAppropriateDecimals(display_left_price)} ~{" "}
            {displayNumberToAppropriateDecimals(display_right_price)}
          </span>
          <span>
            {rangeSort ? token_y_metadata.symbol : token_x_metadata.symbol}
          </span>
        </div>
      </div>
    );
  }
  function get_lp_amount(value: string) {
    if (set_lp_amount && set_lp_value) {
      if (one_lp_value && value && +value > 0) {
        const amount = new BigNumber(value).dividedBy(one_lp_value).toFixed();
        set_lp_amount(amount);
      } else {
        set_lp_amount("0");
      }
      set_lp_value(value);
    } else {
      console.error("set_lp_amount or set_lp_value is undefined");
    }
  }
  function rewardRangeTip() {
    const tip = "Farm reward within this range";
    const result: string = `<div class="text-gray-60 text-xs text-left">${tip}</div>`;
    return result;
  }
  function goPool() {
    const poolId = seed?.pool?.pool_id;
    const pathname = get_pool_name(poolId);
    if (poolId) {
      router.push(`/poolV2/${pathname}`);
    }
  }
  return (
    <>
      <div className="frcb text-sm text-gray-50 mt-4">
        <span>Liquidity staked</span>
        <div
          className="flex items-center text-gray-50 underline hover:text-primaryGreen"
          onClick={goPool}
        >
          <label className="mr-2 text-sm cursor-pointer">DCL Pool Detail</label>
          <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
        </div>
      </div>
      <div className="searchBoxGradientBorder flex items-center justify-between text-lg text-white px-4 h-12 bg-black bg-opacity-20 rounded-xl mt-2.5 mb-5">
        <label>$</label>
        <input
          className={`outline-none rounded w-full py-2 pl-1 mr-6`}
          onChange={(e) => {
            get_lp_amount(e.target.value);
          }}
        />
        <label className="text-sm text-gray-50">USD</label>
      </div>
      <div className="flex items-start justify-between">
        <div className="flex items-center text-sm text-gray-50">
          <span>Reward Range</span>
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
        </div>
        {getRange()}
      </div>
    </>
  );
}
function LiquidityInfo() {
  const {
    seed,
    tokenPriceList,
    lp_value,
    liquidity,
    set_lp_amount,
    set_lp_value,
    getEffectiveFarmList,
  } = useContext(DclContext) as DclContextType;
  useEffect(() => {
    get_liquidity_value();
    get_liquidity_amount();
  }, [seed, liquidity, tokenPriceList]);
  function get_liquidity_amount() {
    if (!liquidity || !seed) return;
    const mint_amount = mint_liquidity(liquidity, seed.seed_id);
    const amount = new BigNumber(mint_amount).shiftedBy(-6).toFixed();
    set_lp_amount(amount);
  }
  function get_liquidity_value() {
    if (!liquidity || !seed || !seed.pool) return;
    const { left_point, right_point, amount } = liquidity;
    const poolDetail = seed.pool;
    if (
      !poolDetail.token_x ||
      !poolDetail.token_y ||
      !poolDetail.tokens_meta_data
    )
      return;
    const { token_x, token_y, tokens_meta_data } = poolDetail;
    const v = get_total_value_by_liquidity_amount_dcl({
      left_point,
      right_point,
      poolDetail,
      amount,
      price_x_y: {
        [token_x]: tokenPriceList[token_x]?.price || "0",
        [token_y]: tokenPriceList[token_y]?.price || "0",
      },
      metadata_x_y: {
        [token_x]: tokens_meta_data[0],
        [token_y]: tokens_meta_data[1],
      },
    });
    set_lp_value(v);
  }
  function get_liquidity_value_display() {
    const v = lp_value;
    const v_big = new BigNumber(v);
    if (v_big.isLessThan(0.01)) {
      return `<$0.01`;
    } else {
      return `$${formatWithCommas(toPrecision(v.toString(), 2))}`;
    }
  }
  function get_your_intersection() {
    if (!liquidity) return;
    const { left_point, right_point } = liquidity;
    const [fixRange, dcl_pool_id, seed_left_point, seed_right_point] =
      seed.seed_id.split("@")[1].split("&");
    const radio = get_intersection_radio({
      left_point_liquidity: left_point,
      right_point_liquidity: right_point,
      left_point_seed: seed_left_point,
      right_point_seed: seed_right_point,
    });
    const p = new BigNumber(radio);
    const Icon = get_intersection_icon_by_radio(radio);
    const icon = <Icon num={Math.random()}></Icon>;
    function displayP(p: BigNumber) {
      if (p.isEqualTo(0)) {
        return "0%";
      } else if (p.isLessThan(1)) {
        return "1%";
      } else {
        return p?.toFixed(0, 1) + "%";
      }
    }
    return (
      <div className="flex items-center text-xs text-gray-10">
        <label className="mr-1.5">{displayP(p)}</label>
        {icon}
      </div>
    );
  }
  function get_your_apr() {
    if (!seed || !liquidity) return "-";
    const { farmList, total_seed_amount, total_seed_power } = seed;
    if (!farmList) return "-";
    // principal
    const total_principal = lp_value;
    // seed total rewards
    let total_rewards = "0";
    const effectiveFarms = getEffectiveFarmList(farmList);
    effectiveFarms.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      const { daily_reward, reward_token } = farm.terms;
      if (!token_meta_data) return "-";
      const quantity = toReadableNumber(token_meta_data.decimals, daily_reward);
      const reward_token_price = Number(
        tokenPriceList[reward_token]?.price || 0
      );
      const cur_token_rewards = new BigNumber(quantity)
        .multipliedBy(reward_token_price)
        .multipliedBy(365);
      total_rewards = cur_token_rewards.plus(total_rewards).toFixed();
    });
    // lp percent
    let percent;
    const mint_amount = mint_liquidity(liquidity, seed.seed_id);
    const part_farm_ratio = liquidity.part_farm_ratio;
    if (part_farm_ratio === undefined) return "-";
    if (+part_farm_ratio == 100) {
      // full farming
      if (+total_seed_power > 0) {
        percent = new BigNumber(mint_amount).dividedBy(total_seed_power);
      }
    } else if (+part_farm_ratio > 0 && +part_farm_ratio < 100) {
      // partial Farming
      if (+total_seed_power > 0) {
        const partial_amount = new BigNumber(mint_amount)
          .multipliedBy(part_farm_ratio)
          .dividedBy(100);
        percent = partial_amount.dividedBy(total_seed_power);
      }
    } else {
      // unFarming, unavailable
      const temp_total = new BigNumber(total_seed_power || 0).plus(mint_amount);
      if (temp_total.isGreaterThan(0)) {
        percent = new BigNumber(mint_amount).dividedBy(temp_total);
      }
    }
    // profit
    let profit;
    if (percent) {
      profit = percent.multipliedBy(total_rewards);
    }

    // your apr
    if (profit) {
      if (+total_principal == 0) {
        return 0;
      }
      const your_apr = profit.dividedBy(total_principal).multipliedBy(100);
      if (your_apr.isEqualTo("0")) {
        return "0%";
      } else if (your_apr.isLessThan(0.01)) {
        return `<0.01%`;
      } else {
        return `${toPrecision(your_apr.toFixed(), 2)}%`;
      }
    } else {
      return "-";
    }
  }
  function apr_title() {
    if (
      liquidity &&
      liquidity.part_farm_ratio !== undefined &&
      +liquidity.part_farm_ratio > 0
    ) {
      return "YourApr";
    } else {
      return "EstApr";
    }
  }
  return (
    <>
      <div className="flex items-center justify-between text-sm text-gray-50">
        <span>YourLiquidity</span>
        <span>{get_liquidity_value_display()}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-50 my-5">
        <span>PriceRangeOverlapRatio</span>
        <span>{get_your_intersection()}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-50 mb-7">
        <span>{apr_title()}</span>
        <span>{get_your_apr()}</span>
      </div>
    </>
  );
}
function CalcEle() {
  const [dateList, setDateList] = useState<string[]>(["1", "3", "6", "12"]);
  const [selecteDate, setSelecteDate] = useState("1");
  const [rewards_info, set_rewards_info] = useState<any>({});
  const {
    seed,
    tokenPriceList,
    lp_amount,
    lp_value,
    liquidity,
    getEffectiveFarmList,
  } = useContext(DclContext) as DclContextType;
  useEffect(() => {
    get_rewards_info();
  }, [lp_amount, lp_value, selecteDate, tokenPriceList]);
  function get_rewards_info() {
    if (+lp_amount > 0 && +lp_value > 0) {
      const { farmList, total_seed_power, total_seed_amount, seed_decimal } =
        seed;
      if (!farmList) return "-";
      // get lp percent
      const total_seed_power_readble = new BigNumber(total_seed_amount)
        .shiftedBy(-seed_decimal)
        .toFixed();
      let total_lp = "";
      if (+(liquidity?.part_farm_ratio || 0) > 0) {
        total_lp = new BigNumber(total_seed_power_readble).toFixed();
      } else {
        total_lp = new BigNumber(total_seed_power_readble)
          .plus(lp_amount)
          .toFixed();
      }
      const percent = new BigNumber(lp_amount).dividedBy(total_lp);
      // get rewards
      const rewardsArr: any[] = [];
      let total_rewards_price = "0";
      let ROI = "";
      const effectiveFarms = getEffectiveFarmList(farmList);
      effectiveFarms.forEach((farm: FarmBoost) => {
        const { terms, token_meta_data } = farm;
        if (!token_meta_data) return "-";
        const { daily_reward, reward_token } = terms;
        let date_rewards;
        date_rewards = new BigNumber(selecteDate)
          .multipliedBy(30)
          .multipliedBy(daily_reward)
          .toFixed();
        if (+selecteDate == 12) {
          date_rewards = new BigNumber(daily_reward)
            .multipliedBy(365)
            .toFixed();
        }
        const date_rewards_readale = toReadableNumber(
          token_meta_data.decimals,
          date_rewards
        );
        const can_get_rewards = percent.multipliedBy(date_rewards_readale);
        const price = tokenPriceList[reward_token]?.price || "0";
        const can_get_rewards_price = can_get_rewards.multipliedBy(price);
        total_rewards_price = can_get_rewards_price
          .plus(total_rewards_price)
          .toFixed();
        rewardsArr.push({
          token_meta_data,
          num: can_get_rewards.toFixed(),
        });
      });
      // get ROI
      ROI = new BigNumber(total_rewards_price).dividedBy(lp_value).toFixed();
      set_rewards_info({
        rewards: rewardsArr,
        total_rewards_price,
        ROI,
      });
    } else {
      set_rewards_info({});
    }
  }
  function changeDate(v: string) {
    setSelecteDate(v);
  }
  function getROI() {
    const ROI = rewards_info.ROI;
    if (!ROI) return "-%";
    const ROI_big = new BigNumber(ROI || "0").multipliedBy(100);
    if (ROI_big.isLessThan(0.01)) {
      return "<0.01%";
    } else {
      return toPrecision(ROI_big.toFixed(), 2) + "%";
    }
  }
  function getRewardsValue() {
    const total_rewards_price = rewards_info.total_rewards_price;
    if (!total_rewards_price) return "$-";
    const total_rewards_price_big = new BigNumber(total_rewards_price || "0");
    if (total_rewards_price_big.isLessThan(0.01)) {
      return "<$0.01";
    } else {
      return "$" + toPrecision(total_rewards_price_big.toFixed(), 2);
    }
  }
  function getRewardNum(num: string) {
    if (!num) return "-";
    const num_big = new BigNumber(num);
    if (num_big.isLessThan(0.001)) {
      return "<0.001";
    } else {
      return toPrecision(num_big.toFixed(), 3);
    }
  }
  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-50">Duration</label>
        </div>
        <div className="flex items-center border border-gray-90 bg-black bg-opacity-20 rounded-md h-8 mt-2.5 mb-2.5 p-0.5">
          {dateList.map((date) => {
            return (
              <div
                onClick={() => {
                  changeDate(date);
                }}
                className={
                  `flex items-center justify-center flex-grow text-sm rounded-md h-full cursor-pointer ` +
                  (date == selecteDate
                    ? "bg-gray-120 text-chartBg"
                    : "text-gray-50")
                }
                key={date}
              >
                {date}M
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3">
        <div className="flex flex-col rounded-lg p-5 bg-black bg-opacity-25">
          <p className="flex justify-between">
            <label className="text-sm text-gray-50 mr-2">ROI</label>
            <label className="text-sm text-gray-50 text-right break-all">
              {getROI()}
            </label>
          </p>
          <p className="flex justify-between mt-4">
            <label className="text-sm text-gray-50 mr-2">
              Value of rewards
            </label>
            <label className="text-sm text-gray-50 text-right break-all">
              {getRewardsValue()}
            </label>
          </p>
          <div className="mt-4">
            <label className="text-sm text-gray-50">Reward tokens</label>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {(rewards_info.rewards || []).map((item: any) => {
                const { token_meta_data, num } = item;
                const token = unWrapToken(token_meta_data, true);

                return (
                  <div className="flex items-center" key={token.symbol}>
                    <img
                      className="w-6 h-6 rounded-full border border-primaryGreen"
                      src={token.icon}
                    ></img>
                    <label className="ml-1.5 text-sm text-gray-50">
                      {getRewardNum(num)}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(CalcModelDcl);
