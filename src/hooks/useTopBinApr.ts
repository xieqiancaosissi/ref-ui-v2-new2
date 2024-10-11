import React, { useState, useEffect } from "react";
import { PoolInfo } from "@/services/swapV3";
import { getDCLTopBinFee } from "@/services/indexer";
import { ONLY_ZEROS } from "@/utils/numbers";
import Big from "big.js";
import { formatPercentage } from "@/utils/uiNumber";
import { IChartConfig } from "@/components/pools/detail/dcl/d3Chart/interfaces";
import { IChartItemConfig } from "@/components/pools/detail/dcl/d3Chart/interfaces";
import { get_default_config_for_chart } from "@/components/pools/detail/dcl/d3Chart/config";
import { get_custom_config_for_chart } from "@/components/pools/detail/dcl/d3Chart/config";
import { getPriceByPoint, getPointByPrice } from "@/services/commonV3";

export const useDCLTopBinFee = ({
  pool,
  way,
}: {
  pool: PoolInfo;
  way?: "value" | "display";
}) => {
  const [topBinApr, setTopBinApr] = useState<string>("-");
  useEffect(() => {
    if (!pool) return;
    const [bin, start_point, end_point] = get_config_of_dcl_pool(pool);
    getDCLTopBinFee({
      pool_id: pool.pool_id,
      bin,
      start_point,
      end_point,
    }).then((res) => {
      if (!res || ONLY_ZEROS.test(res.total_liquidity)) return;
      const apr = new Big(res.total_fee)
        .div(res.total_liquidity)
        .mul(365)
        .mul(100)
        .toFixed();
      const apr_display = formatPercentage(apr);
      if (way == "value") {
        setTopBinApr(apr);
      } else {
        setTopBinApr(apr_display);
      }
    });
  }, [pool]);

  return topBinApr;
};

function get_config_of_dcl_pool(pool: PoolInfo) {
  const pool_id = pool.pool_id;
  const { bin, rangeGear } = get_default_config_for_chart(
    pool_id?.split("|")?.pop()
  ) as IChartItemConfig;
  const custom_config: IChartConfig = get_custom_config_for_chart();
  const bin_final = custom_config[pool_id]?.bin || bin;
  const rangeGear_final = custom_config[pool_id]?.rangeGear || rangeGear;
  const [price_l, price_r] = get_price_range_by_percent(
    rangeGear_final[0],
    pool
  );
  const point_l = get_point_by_price(price_l, pool);
  const point_r = get_point_by_price(price_r, pool);
  return [bin_final, point_l, point_r];
}

function get_price_range_by_percent(
  percent: number,
  pool: PoolInfo
): [string, string] {
  const { current_point } = pool;
  const p_l_r = percent / 100;
  const price = get_price_by_point(current_point, pool);
  const price_l_temp = Big(1 - p_l_r).mul(price);
  const price_l = price_l_temp.lt(0) ? "0" : price_l_temp.toFixed();
  const price_r = Big(1 + p_l_r)
    .mul(price)
    .toFixed();

  return [price_l, price_r];
}
function get_price_by_point(point: number, pool: PoolInfo) {
  const { token_x_metadata, token_y_metadata } = pool;
  const decimalRate_point =
    Math.pow(10, token_x_metadata.decimals) /
    Math.pow(10, token_y_metadata.decimals);
  const price = getPriceByPoint(point, decimalRate_point);
  return price;
}
function get_point_by_price(price: string, pool: PoolInfo) {
  const { point_delta, token_x_metadata, token_y_metadata } = pool;
  const decimalRate_point =
    Math.pow(10, token_y_metadata.decimals) /
    Math.pow(10, token_x_metadata.decimals);
  const point = getPointByPrice(point_delta, price, decimalRate_point);
  return point;
}
