import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import { getAccountId } from "@/utils/wallet";
import BigNumber from "bignumber.js";
import { useMemo, useState } from "react";
import { display_value } from "@/services/aurora";
import {
  UserLiquidityInfo,
  getEffectiveFarmList,
  get_intersection_icon_by_radio,
  get_intersection_radio,
  get_matched_seeds_for_dcl_pool,
  get_pool_name,
  get_total_value_by_liquidity_amount_dcl,
  mint_liquidity,
} from "@/services/commonV3";
import { FarmBoost, Seed } from "@/services/farm";
import {
  ArrowRightIcon,
  FarmMiningIcon,
  TriangleIcon,
} from "@/components/portfolio/components/icon";

export const REF_FI_POOL_ACTIVE_TAB = "REF_FI_POOL_ACTIVE_TAB_VALUE";

export const SWAP_MODE_KEY = "SWAP_MODE_VALUE";

export enum SWAP_MODE {
  NORMAL = "normal",
  LIMIT = "limit",
}

export function ArrowJump(props: any) {
  const [hover, setHover] = useState(false);
  const { clickEvent, extraClass } = props;
  return (
    <div
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onClick={clickEvent}
      className={`flex items-center justify-center border border-primaryText border-opacity-30 rounded-md w-4 h-4 bg-cardBg cursor-pointer ${extraClass}`}
    >
      <ArrowRightIcon
        className={`${hover ? "text-white" : "text-primaryText"}`}
      ></ArrowRightIcon>
    </div>
  );
}

export function display_percentage(amount: string) {
  const accountId = getAccountId();
  if (!accountId) return "-";
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo("0")) {
    return "0";
  } else if (amount_big.isLessThan("1")) {
    return "<1";
  } else {
    return toPrecision(amount, 0);
  }
}

export function display_number_ordinary(amount: string) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo("0")) {
    return "0";
  } else if (amount_big.isLessThan("0.01")) {
    return "<0.01";
  } else {
    return toPrecision(amount, 2);
  }
}

export function useTotalLiquidityData({
  YourLpValueV1,
  YourLpValueV2,
  lpValueV1Done,
  lpValueV2Done,
  v1LiquidityQuantity,
  v2LiquidityQuantity,
  v1LiquidityLoadingDone,
  v2LiquidityLoadingDone,
}: {
  YourLpValueV1: string;
  YourLpValueV2: string;
  lpValueV1Done: boolean;
  lpValueV2Done: boolean;
  v1LiquidityQuantity: string;
  v2LiquidityQuantity: string;
  v1LiquidityLoadingDone: boolean;
  v2LiquidityLoadingDone: boolean;
}) {
  const total_liquidity_value = useMemo(() => {
    let total_value = "$-";
    if (lpValueV1Done && lpValueV2Done) {
      total_value = display_value(
        new BigNumber(YourLpValueV1 || 0).plus(YourLpValueV2 || 0).toFixed()
      );
    }
    return total_value;
  }, [YourLpValueV1, YourLpValueV2, lpValueV1Done, lpValueV2Done]);
  const total_liquidity_quantity = useMemo(() => {
    let total_quantity = "-";
    if (v1LiquidityLoadingDone && v2LiquidityLoadingDone) {
      total_quantity = new BigNumber(v1LiquidityQuantity || 0)
        .plus(v2LiquidityQuantity || 0)
        .toFixed();
    }
    return total_quantity;
  }, [
    v1LiquidityQuantity,
    v2LiquidityQuantity,
    v1LiquidityLoadingDone,
    v2LiquidityLoadingDone,
  ]);
  return {
    total_liquidity_value,
    total_liquidity_quantity,
  };
}

export function useTotalOrderData({
  active_order_value_done,
  active_order_Loading_done,
  active_order_quanity,
  active_order_value,
}: {
  active_order_value_done: boolean;
  active_order_Loading_done: boolean;
  active_order_quanity: string;
  active_order_value: boolean;
}) {
  const total_active_orders_value = useMemo(() => {
    let total_value = "$-";
    if (active_order_value_done) {
      total_value = display_value(active_order_value.toString());
    }
    return total_value;
  }, [active_order_value_done, active_order_value]);

  const total_active_orders_quanity = useMemo(() => {
    let total_quantity = "-";
    if (active_order_Loading_done) {
      total_quantity = active_order_quanity;
    }
    return total_quantity;
  }, [active_order_Loading_done, active_order_quanity]);
  return {
    total_active_orders_value,
    total_active_orders_quanity,
  };
}

export function useTotalFarmData({
  dcl_farms_value,
  classic_farms_value,
  dcl_farms_value_done,
  classic_farms_value_done,
  all_farms_Loading_done,
  all_farms_quanity,
}: {
  dcl_farms_value: string;
  classic_farms_value: string;
  dcl_farms_value_done: boolean;
  classic_farms_value_done: boolean;
  all_farms_Loading_done: boolean;
  all_farms_quanity: string;
}) {
  const total_farms_value = useMemo(() => {
    let total_value = "$-";
    if (dcl_farms_value_done && classic_farms_value_done) {
      total_value = display_value(
        new BigNumber(classic_farms_value).plus(dcl_farms_value).toFixed()
      );
    }
    return total_value;
  }, [
    dcl_farms_value,
    classic_farms_value,
    dcl_farms_value_done,
    classic_farms_value_done,
  ]);
  const total_farms_quantity = useMemo(() => {
    let total_quantity = "-";
    if (all_farms_Loading_done) {
      total_quantity = all_farms_quanity;
    }
    return total_quantity;
  }, [all_farms_Loading_done, all_farms_quanity]);
  return {
    total_farms_value,
    total_farms_quantity,
  };
}

export function UpDownButton(props: any) {
  const { set_switch_off, switch_off } = props;
  const [hover, setHover] = useState<boolean>(false);
  return (
    <div
      onClick={() => {
        set_switch_off();
      }}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      className={`flex items-center justify-center rounded-md w-6 h-6 cursor-pointer border border-gray-10 border-opacity-10 ${
        switch_off ? (hover ? "" : "") : ""
      }`}
    >
      <TriangleIcon
        className={`${
          switch_off
            ? hover
              ? "text-white"
              : "text-gray-10"
            : "text-white transform rotate-180"
        }`}
      ></TriangleIcon>
    </div>
  );
}

export const REF_FI_LP_VALUE_COUNT = "REF_FI_LP_VALUE_COUNT";

export const REF_FI_LP_V2_VALUE = "REF_FI_LP_V2_VALUE";

function get_liquidity_value(
  liquidity: UserLiquidityInfo,
  seed: Seed,
  tokenPriceList: Record<string, any>
) {
  const { left_point, right_point, amount } = liquidity;
  const poolDetail = seed.pool;
  if (!poolDetail) {
    throw new Error("Pool detail is undefined");
  }
  const tokens = poolDetail.tokens_meta_data;
  const { token_x, token_y } = poolDetail;
  if (!token_x || !token_y) {
    throw new Error("Token x or y is undefined");
  }
  if (!tokens) {
    throw new Error("Tokens metadata is undefined");
  }
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
      [token_x]: tokens[0],
      [token_y]: tokens[1],
    },
  });

  return v;
}

export function get_your_apr(
  liquidity: UserLiquidityInfo,
  seed: Seed,
  tokenPriceList: Record<string, any>
) {
  const { farmList, total_seed_amount, total_seed_power, seed_id } = seed;
  // principal
  const total_principal = get_liquidity_value(liquidity, seed, tokenPriceList);
  // seed total rewards
  let total_rewards = "0";
  if (!farmList) {
    throw new Error("Farm list is undefined");
  }
  const effectiveFarms = getEffectiveFarmList(farmList);
  effectiveFarms.forEach((farm: FarmBoost) => {
    const { token_meta_data } = farm;
    const { daily_reward, reward_token } = farm.terms;
    if (!token_meta_data) {
      throw new Error("Token meta data is undefined");
    }
    const quantity = toReadableNumber(token_meta_data.decimals, daily_reward);
    const reward_token_price = Number(tokenPriceList[reward_token]?.price || 0);
    const cur_token_rewards = new BigNumber(quantity)
      .multipliedBy(reward_token_price)
      .multipliedBy(365);
    total_rewards = cur_token_rewards.plus(total_rewards).toFixed();
  });
  // lp percent
  let percent;
  const mint_amount = mint_liquidity(liquidity, seed_id);
  const temp_total = new BigNumber(total_seed_power || 0).plus(mint_amount);
  if (temp_total.isGreaterThan(0)) {
    percent = new BigNumber(mint_amount).dividedBy(temp_total);
  }
  // profit
  let profit;
  if (percent) {
    profit = percent.multipliedBy(total_rewards);
  }

  // your apr
  if (profit && +total_principal > 0) {
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

export function get_your_apr_raw(
  liquidity: UserLiquidityInfo,
  seed: Seed,
  tokenPriceList: Record<string, any>
) {
  const { farmList, total_seed_amount, total_seed_power, seed_id } = seed;
  // principal
  const total_principal = get_liquidity_value(liquidity, seed, tokenPriceList);
  // seed total rewards
  let total_rewards = "0";
  if (!farmList) {
    throw new Error("farmList is undefined");
  }
  const effectiveFarms = getEffectiveFarmList(farmList);
  effectiveFarms.forEach((farm: FarmBoost) => {
    const { token_meta_data } = farm;
    const { daily_reward, reward_token } = farm.terms;
    if (!token_meta_data) {
      throw new Error("Token meta data is undefined");
    }
    const quantity = toReadableNumber(token_meta_data.decimals, daily_reward);
    const reward_token_price = Number(tokenPriceList[reward_token]?.price || 0);
    const cur_token_rewards = new BigNumber(quantity)
      .multipliedBy(reward_token_price)
      .multipliedBy(365);
    total_rewards = cur_token_rewards.plus(total_rewards).toFixed();
  });
  // lp percent
  let percent;
  const mint_amount = mint_liquidity(liquidity, seed_id);
  const temp_total = new BigNumber(total_seed_power || 0).plus(mint_amount);
  if (temp_total.isGreaterThan(0)) {
    percent = new BigNumber(mint_amount).dividedBy(temp_total);
  }
  // profit
  let profit;
  if (percent) {
    profit = percent.multipliedBy(total_rewards);
  }

  // your apr
  if (profit && +total_principal > 0) {
    const your_apr = profit.dividedBy(total_principal).multipliedBy(100);

    return your_apr.toFixed();
  } else {
    return "";
  }
}

export function get_detail_the_liquidity_refer_to_seed({
  liquidity,
  all_seeds,
  is_in_farming,
  related_farms,
  tokenPriceList,
}: {
  liquidity: UserLiquidityInfo;
  all_seeds: Seed[];
  is_in_farming: boolean;
  related_farms: FarmBoost[];
  tokenPriceList: Record<string, any>;
}) {
  const { mft_id, left_point, right_point, amount } = liquidity;
  let Icon;
  let your_apr;
  let your_apr_raw;

  let link;
  let inRange;
  let status;
  const active_seeds = get_matched_seeds_for_dcl_pool({
    seeds: all_seeds,
    pool_id: liquidity.pool_id,
  });

  const canFarmSeed = active_seeds.find((seed: Seed) => {
    const { min_deposit, seed_id } = seed;
    const [fixRange, dcl_pool_id, left_point_seed, right_point_seed] = seed_id
      .split("@")[1]
      .split("&");
    const v_liquidity = mint_liquidity(liquidity, seed_id);
    const radio = get_intersection_radio({
      left_point_liquidity: left_point,
      right_point_liquidity: right_point,
      left_point_seed,
      right_point_seed,
    });
    const condition1 = new BigNumber(v_liquidity).isGreaterThanOrEqualTo(
      min_deposit
    );
    const condition2 = +radio > 0;
    const condition3 =
      mft_id ||
      (!mft_id && new BigNumber(amount).isGreaterThanOrEqualTo(1000000));
    if (condition1 && condition2 && condition3) return true;
  });
  const targetSeed = canFarmSeed || active_seeds[0];
  if (targetSeed) {
    const { seed_id } = targetSeed;
    const [fixRange, dcl_pool_id, left_point_seed, right_point_seed] = seed_id
      .split("@")[1]
      .split("&");
    const radio = get_intersection_radio({
      left_point_liquidity: left_point,
      right_point_liquidity: right_point,
      left_point_seed,
      right_point_seed,
    });
    if (canFarmSeed) {
      your_apr = get_your_apr(liquidity, targetSeed, tokenPriceList);
      your_apr_raw = get_your_apr_raw(liquidity, targetSeed, tokenPriceList);
    }
    Icon = get_intersection_icon_by_radio(radio);
    inRange = +radio > 0;
    const link_params = `${get_pool_name(
      dcl_pool_id
    )}[${left_point_seed}-${right_point_seed}]`;
    link = `/v2farms/${link_params}-r`;
    status = "run";
  }
  if (is_in_farming) {
    const actives = related_farms.filter((farm: FarmBoost) => {
      return farm.status != "Ended";
    });
    if (related_farms.length > 0) {
      if (actives.length > 0) {
        status = "run";
      } else {
        status = "end";
      }
    }
  }
  return {
    Icon,
    your_apr,
    link,
    inRange,
    status,
    your_apr_raw,
    targetSeed,
  };
}

export const FarmStampNew = ({ multi }: { multi: boolean }) => {
  return (
    <div className="px-1.5 ml-2 rounded-lg border flex items-center border-gradientFrom text-gradientFrom text-xs">
      <span className="whitespace-nowrap">Farms</span>

      {multi && (
        <span className="ml-1">
          <FarmMiningIcon w={14} h={14} />
        </span>
      )}
    </div>
  );
};

export const getFarmsCount = (poolId: string | number, farms: any) => {
  const count = farms.reduce((pre: number, cur: any) => {
    if (Number(cur.pool_id) === Number(poolId)) return pre + 1;
    return pre;
  }, 0);

  return count;
};

export const getEndedFarmsCount = (poolId: string | number, farms: any) => {
  const count = farms.reduce((pre: number, cur: any) => {
    if (
      Number(cur.pool_id) === Number(poolId) &&
      (cur.status === "Ended" || cur.status === "Created")
    )
      return pre + 1;
    return pre;
  }, 0);

  return count;
};

export const getRealEndedFarmsCount = (poolId: string | number, farms: any) => {
  const count = farms.reduce((pre: number, cur: any) => {
    if (Number(cur.pool_id) === Number(poolId) && cur.status === "Ended")
      return pre + 1;
    return pre;
  }, 0);

  return count;
};

export function display_number_withCommas(amount: string) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo("0")) {
    return "0";
  } else if (amount_big.isLessThan("0.01")) {
    return "<0.01";
  } else {
    return formatWithCommas(toPrecision(amount, 2));
  }
}
