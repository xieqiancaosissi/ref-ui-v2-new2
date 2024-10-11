import Big from "big.js";
import { UserLiquidityInfo } from "@/services/commonV3";
import { toReadableNumber } from "@/utils/numbers";
import { TokenMetadata } from "@/services/ft-contract";
export interface PoolInfo {
  pool_id?: string;
  token_x?: string;
  token_y?: string;
  fee: number;
  point_delta?: number;
  current_point?: number;
  state?: string; // running or paused
  total_liquidity?: string;
  liquidity?: string;
  liquidity_x?: string;
  max_liquidity_per_point?: string;
  percent?: string;
  total_x?: string;
  total_y?: string;
  tvl?: number;
  token_x_metadata?: TokenMetadata;
  token_y_metadata?: TokenMetadata;
  total_fee_x_charged?: string;
  total_fee_y_charged?: string;
  top_bin_apr?: string;
  top_bin_apr_display?: string;
  tvlUnreal?: boolean;
}

export function get_unClaimed_fee_data(
  liquidities: UserLiquidityInfo[],
  poolDetail: PoolInfo,
  tokenPriceList: any
) {
  // UnClaimed fee
  let total_amount_x_fee = Big(0);
  let total_amount_y_fee = Big(0);
  let total_tvl_fee = Big(0);
  const { token_x_metadata, token_y_metadata, pool_id } = poolDetail;
  liquidities.forEach((liquidity: UserLiquidityInfo) => {
    const { unclaimed_fee_x, unclaimed_fee_y } = liquidity;
    const unclaimed_fee_x_amount = toReadableNumber(
      (token_x_metadata as any).decimals,
      unclaimed_fee_x
    );
    const unclaimed_fee_y_amount = toReadableNumber(
      (token_y_metadata as any).decimals,
      unclaimed_fee_y
    );
    const token_x_price =
      tokenPriceList[(token_x_metadata as any).id]?.price || 0;
    const token_y_price =
      tokenPriceList[(token_y_metadata as any).id]?.price || 0;
    const total_fees_price = Big(unclaimed_fee_x_amount)
      .mul(token_x_price)
      .plus(Big(unclaimed_fee_y_amount).mul(token_y_price));
    total_amount_x_fee = Big(total_amount_x_fee).plus(unclaimed_fee_x_amount);
    total_amount_y_fee = Big(total_amount_y_fee).plus(unclaimed_fee_y_amount);
    total_tvl_fee = Big(total_tvl_fee).plus(total_fees_price);
  });
  return [
    total_tvl_fee.toNumber(),
    total_amount_x_fee.toNumber(),
    total_amount_y_fee.toNumber(),
  ];
}
