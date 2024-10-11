import Big from "big.js";
import BigNumber from "bignumber.js";
import _ from "lodash";
import { ILimitStore } from "@/stores/limitOrder";
import {
  toPrecision,
  toInternationalCurrencySystem,
  scientificNotationToString,
  toReadableNumber,
  numberWithCommas,
} from "@/utils/numbers";
import { IPoolDcl } from "@/interfaces/swapDcl";
import { ftGetTokenMetadata } from "@/services/token";
import { getAllTokenPrices } from "@/services/farm";
import getConfigV3 from "@/utils/configV3";
const { DEFAULT_LIMIT_POOL_ID } = getConfigV3();

export function setAmountOut({
  tokenInAmount,
  limitStore,
  rate,
}: {
  tokenInAmount: string;
  limitStore: ILimitStore;
  rate: string;
}) {
  let amountOut = new Big(rate || 0).mul(tokenInAmount || 0).toFixed();
  amountOut = prettyAmount(formatAmount(amountOut));
  limitStore.setTokenOutAmount(amountOut);
}

export function formatAmount(amount: string) {
  let formated = amount;
  const minValue = "0.00000001";
  if (new Big(amount).gte(minValue)) {
    formated = toPrecision(amount, 8, false, false);
  }
  return formated;
}
export function prettyAmount(amount: string) {
  if (Big(amount || 0).eq(0)) return "0";
  return amount;
}

export async function fillDclPool(p: IPoolDcl) {
  const token_x: any = p.token_x;
  const token_y: any = p.token_y;
  const tokenPriceList = await getAllTokenPrices();
  p.token_x_metadata = await ftGetTokenMetadata(token_x);
  p.token_y_metadata = await ftGetTokenMetadata(token_y);
  const pricex = tokenPriceList[token_x]?.price || 0;
  const pricey = tokenPriceList[token_y]?.price || 0;
  const { total_x, total_y, total_fee_x_charged, total_fee_y_charged }: any = p;
  const totalX = new BigNumber(total_x).minus(total_fee_x_charged).toFixed();
  const totalY = new BigNumber(total_y).minus(total_fee_y_charged).toFixed();
  const tvlx =
    Number(toReadableNumber(p.token_x_metadata?.decimals ?? 0, totalX)) *
    Number(pricex);
  const tvly =
    Number(toReadableNumber(p.token_y_metadata?.decimals ?? 0, totalY)) *
    Number(pricey);

  p.tvl = tvlx + tvly;
  p.tvlUnreal = Object.keys(tokenPriceList).length === 0;
  return p;
}

export function getBestTvlPoolList(pools: IPoolDcl[]) {
  if (!pools?.length) return [];
  const index = pools.findIndex(
    (p: IPoolDcl) => p.pool_id == DEFAULT_LIMIT_POOL_ID
  );
  if (index !== -1) {
    const [removed] = _.pullAt(pools, index);
    pools.unshift(removed);
  }
  const accPools = pools.reduce((acc, p) => {
    const { token_x, token_y } = p;
    const key = `${token_x}|${token_y}`;
    if (acc[key]) {
      acc[key].push(p);
    } else {
      acc[key] = [p];
    }
    return acc;
  }, {} as Record<string, IPoolDcl[]>);
  const bestPools = Object.values(accPools).map((subPools: IPoolDcl[]) => {
    return _.maxBy(subPools, (p) => Number(p.tvl || 0));
  });
  return bestPools;
}

export const formatNumber = (v: string | number) => {
  if (isInvalid(v)) return "-";
  const big = Big(v);
  if (big.eq(0)) {
    return "0";
  } else if (big.lt(0.01)) {
    return "<0.01";
  } else {
    return toInternationalCurrencySystem(big.toFixed(2, 1));
  }
};

export const isInvalid = function (v: any) {
  if (v === "" || v === undefined || v === null) return true;
  return false;
};

export const GEARS = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
export const priceFormatter = (price: string | number) => {
  return numberWithCommas(
    Number(price) === 0
      ? 0
      : Number(price) <= 0.01 && Number(price) > 0
      ? toPrecision(scientificNotationToString(price.toString()), 6)
      : new Big(scientificNotationToString(price.toString())).toFixed(4)
  );
};
export const getReverseRate = (rate: string) => {
  if (Big(rate || 0).gt(0)) {
    const rate_reverse = new Big(1).div(rate).toFixed();
    return toPrecision(rate_reverse, 8);
  }
  return "0";
};
