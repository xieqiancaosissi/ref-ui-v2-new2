import React, { useState, useEffect } from "react";
import { canFarmV1, canFarmV2 } from "@/services/pool_detail";
import { usePool } from "./usePools";
import BigNumber from "bignumber.js";
import { getStablePoolDecimal } from "@/services/swap/swapUtils";
import {
  toReadableNumber,
  toNonDivisibleNumber,
  scientificNotationToString,
  toPrecision,
} from "@/utils/numbers";
import Big from "big.js";
import _ from "lodash";
import { StablePool } from "@/interfaces/swap";
import { get_shadow_records } from "@/services/farm";
import { percent } from "@/utils/numbers";
import { getAccountId } from "@/utils/wallet";
import getConfigV2 from "@/utils/configV2";
import { list_farmer_seeds } from "@/services/farm";
import { isStablePool } from "@/services/swap/swapUtils";
import { REF_FI_CONTRACT_ID } from "@/utils/contract";

const FEE_DIVISOR = 10000;
export const useFarmStake = ({
  poolId,
  stakeList,
}: {
  poolId: number;
  stakeList: Record<string, string>;
}) => {
  const [farmStake, setFarmStake] = useState<string>("0"); //
  useEffect(() => {
    let totalFarmStake = new BigNumber("0"); //
    Object.keys(stakeList).forEach((seed) => {
      const id = Number(seed.split("@")[1]);
      if (id == poolId) {
        totalFarmStake = totalFarmStake.plus(new BigNumber(stakeList[seed])); //
      }
    });
    setFarmStake(totalFarmStake.toString()); //
  }, [poolId, stakeList]); //

  return farmStake;
};

export const useCanFarmV1 = (poolId: number, withEnded?: boolean) => {
  const [farmCount, setFarmCount] = useState<number>(0);
  const [farmVersion, setFarmVersion] = useState<string>("");
  const [endedFarmCount, setEndedFarmCount] = useState<number>(0);

  useEffect(() => {
    canFarmV1(poolId, withEnded).then(({ count, version, endedCount }) => {
      setFarmCount(count);
      setFarmVersion(version);
      setEndedFarmCount(endedCount);
    });
  }, [poolId]);

  return { farmCount, farmVersion, endedFarmCount };
};

export const useCanFarmV2 = (poolId: number, withEnded?: boolean) => {
  const [farmCount, setFarmCount] = useState<number>(0);

  const [endedFarmCount, setEndedFarmCount] = useState<number>(0);

  const [farmVersion, setFarmVersion] = useState<string>("");

  useEffect(() => {
    canFarmV2(poolId, withEnded).then(({ count, version, endedCount }) => {
      setFarmCount(count);
      setFarmVersion(version);
      setEndedFarmCount(endedCount);
    });
  }, [poolId]);

  return { farmCount, farmVersion, endedFarmCount };
};

//  const list_user_seeds = await list_farmer_seeds();

export const useYourliquidity = (poolId: number) => {
  const { pool, shares, stakeList, v2StakeList, finalStakeList } =
    usePool(poolId);
  // todo: check if can remove useFarmStake, use farmerSeeds only
  const farmStakeV1 = useFarmStake({ poolId, stakeList });
  const farmStakeV2Ori = useFarmStake({ poolId, stakeList: v2StakeList });
  // const farmerSeeds = useListFarmerSeeds();
  const [farmerSeeds, setFarmerSeeds] = useState<any>({});

  useEffect(() => {
    if (getAccountId()) {
      list_farmer_seeds().then((res) => {
        const transformedData = Object.keys(res).reduce((acc, key) => {
          const newKey = key.replace(`${REF_FI_CONTRACT_ID}@`, "");
          acc[newKey] = res[key];
          return acc;
        }, {});
        setFarmerSeeds(transformedData);
      });
    }
  }, [getAccountId()]);

  const poolSeed = farmerSeeds[poolId];
  const farmStakeV2 = poolSeed
    ? new BigNumber(poolSeed.free_amount).plus(poolSeed.shadow_amount).toFixed()
    : farmStakeV2Ori || "0";

  const farmStakeTotal = useFarmStake({ poolId, stakeList: finalStakeList });
  const { poolShadowRecord } = useShadowRecord(poolId);
  const { shadow_in_farm, shadow_in_burrow } = poolShadowRecord || {};
  const userTotalShare = BigNumber.sum(shares, farmStakeTotal);
  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });

  const processShare = (share, stakeAmount = "0") => {
    const totalShare = share
      ? BigNumber.sum(share, farmStakeTotal)
      : BigNumber("0");
    const totalShareString = totalShare
      .toNumber()
      .toLocaleString("fullwide", { useGrouping: false });
    const sharePercent = totalShare.isGreaterThan(0)
      ? percent(
          stakeAmount,
          totalShare
            .toNumber()
            .toLocaleString("fullwide", { useGrouping: false })
        ).toString()
      : "0";

    return { totalShare, totalShareString, sharePercent, stakeAmount };
  };
  const shadowBurrowShare = processShare(shares, shadow_in_burrow);

  return {
    pool,
    shares,
    stakeList,
    v2StakeList,
    finalStakeList,
    farmStakeTotal,
    farmStakeV1,
    farmStakeV2,
    userTotalShare,
    userTotalShareToString,
    shadowBurrowShare,
  };
};

export const useShadowRecord = (poolId: any) => {
  const [shadowRecords, setShadowRecords] = useState<any>({});
  useEffect(() => {
    if (getAccountId()) {
      get_shadow_records().then((res) => {
        setShadowRecords(res);
      });
    }
  }, [getAccountId()]);
  return { shadowRecords, poolShadowRecord: shadowRecords[poolId] };
};

export const useListFarmerSeeds = () => {
  const [farmerSeeds, setFarmerSeeds] = useState<any>({});
  useEffect(() => {
    if (getAccountId()) {
      list_farmer_seeds().then((res) => {
        setFarmerSeeds(res);
      });
    }
  }, [getAccountId()]);
  return { farmerSeeds };
};

const processShare = (share: any, stakeAmount = "0", farmStakeTotal: any) => {
  const totalShare = share
    ? BigNumber.sum(share, farmStakeTotal)
    : BigNumber("0");
  const totalShareString = totalShare
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });
  const sharePercent = totalShare.isGreaterThan(0)
    ? percent(
        stakeAmount,
        totalShare.toNumber().toLocaleString("fullwide", { useGrouping: false })
      ).toString()
    : "0";

  return { totalShare, totalShareString, sharePercent, stakeAmount };
};
export const getAddLiquidityShares = async (
  pool_id: number,
  amounts: string[],
  stablePool: any
) => {
  const amp = stablePool.amp;
  const trade_fee = stablePool.total_fee * 10000;

  const STABLE_LP_TOKEN_DECIMALS = getStablePoolDecimal(pool_id);
  const base_old_c_amounts = stablePool.c_amounts.map((amount: any) =>
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, amount)
  );
  const rates = stablePool?.degens
    ? stablePool.degens.map((r: any) =>
        toReadableNumber(STABLE_LP_TOKEN_DECIMALS, r)
      )
    : stablePool.rates.map((r: any) =>
        toReadableNumber(STABLE_LP_TOKEN_DECIMALS, r)
      );

  const old_c_amounts = base_old_c_amounts
    .map((amount: any, i: number) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount: any) => Number(amount));

  const deposit_c_amounts = amounts
    .map((amount, i) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount) => Number(amount));

  // const deposit_c_amounts = amounts.map((amount) =>
  //   Number(toNonDivisibleNumber(STABLE_LP_TOKEN_DECIMALS, amount))
  // );

  // const old_c_amounts = stablePool.c_amounts.map((amount) => Number(amount));

  const pool_token_supply = Number(stablePool.shares_total_supply);

  const [min_shares, fee_ratio] = calc_add_liquidity(
    amp,
    deposit_c_amounts,
    old_c_amounts,
    pool_token_supply,
    trade_fee
  );
  console.log("162");
  console.log(
    amp,
    deposit_c_amounts,
    old_c_amounts,
    pool_token_supply,
    trade_fee
  );

  return toPrecision(scientificNotationToString(min_shares.toString()), 0);
};

export const calc_add_liquidity = (
  amp: number,
  deposit_c_amounts: number[],
  old_c_amounts: number[],
  pool_token_supply: number,
  trade_fee: number
) => {
  if (pool_token_supply === 0) {
    const d_0 = calc_d(amp, deposit_c_amounts);
    return [d_0, 0];
  }

  const token_num = old_c_amounts.length;
  const d_0 = calc_d(amp, old_c_amounts);
  const c_amounts: any = [];
  for (let i = 0; i < old_c_amounts.length; i++) {
    c_amounts[i] = old_c_amounts[i] + deposit_c_amounts[i];
  }
  const d_1 = calc_d(amp, c_amounts);

  if (Number(d_1) <= Number(d_0))
    throw new Error(`D1 need less then or equal to D0.`);

  for (let i = 0; i < token_num; i++) {
    const ideal_balance = (old_c_amounts[i] * d_1) / d_0;
    const difference = Math.abs(ideal_balance - c_amounts[i]);
    const fee = normalized_trade_fee(token_num, difference, trade_fee);
    c_amounts[i] -= fee;
  }
  const d_2 = calc_d(amp, c_amounts);

  if (Number(d_1) < Number(d_2)) throw new Error(`D2 need less then D1.`);

  if (Number(d_2) <= Number(d_0))
    throw new Error(`D1 need less then or equal to D0.`);
  const mint_shares = (pool_token_supply * (d_2 - d_0)) / d_0;
  const diff_shares = (pool_token_supply * (d_1 - d_0)) / d_0;

  return [mint_shares, diff_shares - mint_shares];
};

const normalized_trade_fee = (
  token_num: number,
  amount: number,
  trade_fee: number
) => {
  const adjusted_trade_fee = Number(
    Math.floor((trade_fee * token_num) / (4 * (token_num - 1)))
  );
  return (amount * adjusted_trade_fee) / FEE_DIVISOR;
};

export const calc_d = (amp: number, c_amounts: number[]) => {
  const token_num = c_amounts.length;
  const sum_amounts = _.sum(c_amounts);
  let d_prev = 0;
  let d = sum_amounts;
  for (let i = 0; i < 256; i++) {
    let d_prod = d;
    let zeroCount = 0;
    for (const c_amount of c_amounts) {
      if (c_amount === 0) {
        zeroCount++;
        continue;
      }
      d_prod = (d_prod * d) / (c_amount * token_num);
    }
    if (zeroCount === token_num) {
      return 0;
    }
    d_prev = d;
    const ann = amp * token_num ** token_num;
    const numerator = d_prev * (d_prod * token_num + ann * sum_amounts);
    const denominator = d_prev * (ann - 1) + d_prod * (token_num + 1);
    d = numerator / denominator;
    if (Math.abs(d - d_prev) <= 1) break;
  }
  return isNaN(d) ? 0 : d;
};

export const calc_y = (
  amp: number,
  x_c_amount: number,
  current_c_amounts: number[],
  index_x: number,
  index_y: number
) => {
  const token_num = current_c_amounts.length;
  const ann = amp * token_num ** token_num;
  const d = calc_d(amp, current_c_amounts);
  let s = x_c_amount;
  let c = (d * d) / x_c_amount;
  for (let i = 0; i < token_num; i++) {
    if (i != index_x && i != index_y) {
      s += current_c_amounts[i];
      c = (c * d) / current_c_amounts[i];
    }
  }
  c = (c * d) / (ann * token_num ** token_num);
  const b = d / ann + s;
  let y_prev = 0;
  let y = d;
  for (let i = 0; i < 256; i++) {
    y_prev = y;
    const y_numerator = y ** 2 + c;
    const y_denominator = 2 * y + b - d;
    y = y_numerator / y_denominator;
    if (Math.abs(y - y_prev) <= 1) break;
  }

  return y;
};

export const getRemoveLiquidityByShare = (
  shares: string,
  stablePool: StablePool
) => {
  const c_amounts = stablePool.c_amounts.map((amount) => Number(amount));

  const pool_token_supply = Number(stablePool.shares_total_supply);

  const amounts = calc_remove_liquidity(
    Number(shares),
    c_amounts,
    pool_token_supply
  );

  // TODO:
  return amounts.map((amount: any) =>
    toPrecision(scientificNotationToString(amount.toString()), 0)
  );
};

export const getRemoveLiquidityByTokens = (
  amounts: string[],
  stablePool: StablePool
) => {
  const amp = stablePool.amp;
  // const removed_c_amounts = amounts.map((amount) =>
  //   Number(toNonDivisibleNumber(STABLE_LP_TOKEN_DECIMALS, amount))
  // );

  const STABLE_LP_TOKEN_DECIMALS = getStablePoolDecimal(stablePool.id);

  const pool_token_supply = Number(stablePool.shares_total_supply);

  const base_old_c_amounts = stablePool.c_amounts.map((amount) =>
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, amount)
  );
  const rates = stablePool?.degens
    ? stablePool.degens.map((r: any) =>
        toReadableNumber(STABLE_LP_TOKEN_DECIMALS, r)
      )
    : stablePool.rates.map((r: any) =>
        toReadableNumber(STABLE_LP_TOKEN_DECIMALS, r)
      );

  const old_c_amounts = base_old_c_amounts
    .map((amount, i) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount) => Number(amount));

  const removed_c_amounts = amounts
    .map((amount, i) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount) => Number(amount));
  // const old_c_amounts = stablePool.c_amounts.map((amount) => Number(amount));
  const trade_fee = Number(stablePool.total_fee);

  const [burn_shares, diff] = calc_remove_liquidity_by_tokens(
    amp,
    removed_c_amounts,
    old_c_amounts,
    pool_token_supply,
    trade_fee
  );

  return toPrecision(scientificNotationToString(burn_shares.toString()), 0);
};

export const calc_remove_liquidity = (
  shares: number,
  c_amounts: number[],
  pool_token_supply: number
) => {
  const amounts: any = [];
  for (let i = 0; i < c_amounts.length; i++) {
    amounts[i] = (c_amounts[i] * shares) / pool_token_supply;
  }
  return amounts;
};

export const calc_remove_liquidity_by_tokens = (
  amp: number,
  removed_c_amounts: number[],
  old_c_amounts: number[],
  pool_token_supply: number,
  trade_fee: number
) => {
  const token_num = old_c_amounts.length;
  const d_0 = calc_d(amp, old_c_amounts);
  const c_amounts: any = [];
  for (let i = 0; i < old_c_amounts.length; i++) {
    c_amounts[i] = old_c_amounts[i] - removed_c_amounts[i];
  }
  const d_1 = calc_d(amp, c_amounts);
  if (d_1 >= d_0) throw new Error(`D1 need less then or equal to D0.`);
  for (let i = 0; i < token_num; i++) {
    const ideal_balance = (old_c_amounts[i] * d_1) / d_0;
    const difference = Math.abs(ideal_balance - c_amounts[i]);
    const fee = normalized_trade_fee(token_num, difference, trade_fee);
    c_amounts[i] -= fee;
  }
  const d_2 = calc_d(amp, c_amounts);
  if (d_2 > d_1) throw new Error(`D2 need less then D1.`);
  if (d_1 >= d_0) throw new Error(`D1 need less then or equal to D0.`);
  const burn_shares = (pool_token_supply * (d_0 - d_2)) / d_0;
  const diff_shares = (pool_token_supply * (d_0 - d_1)) / d_0;

  return [burn_shares, burn_shares - diff_shares];
};

export const useFarmStakeAmount = ({
  poolId,
  farmVersion = "v2",
}: {
  poolId: any;
  farmVersion?: any;
}) => {
  const { pool, shares, stakeList, v2StakeList, finalStakeList } =
    usePool(poolId);

  if (!v2StakeList) {
    console.error(`${poolId} without v2StakeL`);
    return null;
  }

  const isShadowPool = getConfigV2().SUPPORT_SHADOW_POOL_IDS.includes(
    poolId?.toString()
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const farmStakeV1 = stakeList && useFarmStake({ poolId, stakeList });
  const farmStakeV2 =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    v2StakeList && useFarmStake({ poolId, stakeList: v2StakeList });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { shadowRecords } = useShadowRecord(poolId);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { farmerSeeds } = useListFarmerSeeds();
  const poolSeed =
    farmerSeeds[`${REF_FI_CONTRACT_ID}@${poolId}`] || farmerSeeds[poolId];

  const { shadow_in_farm } = shadowRecords?.[Number(poolId)] || {};

  let farmStakeAmount: string | number = 0;
  if (isShadowPool) {
    farmStakeAmount = poolSeed
      ? new BigNumber(poolSeed.free_amount)
          .plus(poolSeed.shadow_amount)
          .toFixed()
      : shadow_in_farm || "0";
  } else {
    switch (farmVersion) {
      case "v1":
        farmStakeAmount = farmStakeV1;
        break;
      case "v2":
        farmStakeAmount = farmStakeV2 || "0";
        break;
    }
  }
  return farmStakeAmount;
};

export const useNewPoolData = ({
  pool,
  shares,
}: {
  pool: any;
  shares: any;
}) => {
  const { shadowRecords } = useShadowRecord(pool?.id);
  const { farmerSeeds } = useListFarmerSeeds();
  const [newPool, setNewPool] = useState<any>();
  const isShadowPool = getConfigV2().SUPPORT_SHADOW_POOL_IDS.includes(
    pool?.id?.toString()
  );

  useEffect(() => {
    if (pool?.id) {
      updatePool();
    }
  }, [pool, shadowRecords, farmerSeeds]);

  // todo: pool mutated key and value update here
  const updatePool = () => {
    const pool2 = JSON.parse(JSON.stringify(pool));
    const poolSeed = farmerSeeds?.[pool2.id];
    pool2.raw = {
      farmerSeeds: poolSeed,
    };
    pool2.farmShare = poolSeed
      ? new BigNumber(poolSeed.free_amount)
          .plus(poolSeed.shadow_amount)
          .toFixed()
      : shares;

    const { availableShare, availableShareNonDivisible } =
      getPoolAvailableShare({
        pool: pool2,
        shadowRecords,
        shares,
      });
    pool2.availableShare = availableShare;
    pool2.availableShareNonDivisible = availableShareNonDivisible;
    setNewPool(pool2);
  };

  return { shadowRecords, farmerSeeds, newPool };
};

export const getPoolAvailableShare = ({
  pool,
  shadowRecords,
  shares,
}: {
  pool: any;
  shadowRecords: any;
  shares: any;
}) => {
  const decimal = isStablePool(pool.id) ? getStablePoolDecimal(pool.id) : 24;
  const sharesToken = toReadableNumber(
    decimal,
    scientificNotationToString(shares)
  );
  const isShadowPool = getConfigV2().SUPPORT_SHADOW_POOL_IDS.includes(
    pool?.id?.toString()
  );
  let availableShare = "";
  let availableShareNonDivisible = "";

  if (isShadowPool) {
    const { shadow_in_farm, shadow_in_burrow } =
      shadowRecords?.[Number(pool.id)] || {};
    const highestUsed = BigNumber.maximum(
      shadow_in_farm || 0,
      shadow_in_burrow || 0
    );

    availableShareNonDivisible = new BigNumber(shares)
      .minus(highestUsed)
      .toFixed();
    availableShare = toReadableNumber(
      decimal,
      scientificNotationToString(availableShareNonDivisible)
    );
  } else {
    availableShare = sharesToken;
    availableShareNonDivisible = shares;
  }

  return { availableShare, availableShareNonDivisible };
};
