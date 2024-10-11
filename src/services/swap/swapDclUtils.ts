import Big from "big.js";
import { TokenMetadata } from "@/services/ft-contract";
import { scientificNotationToString } from "@/utils/numbers";
import { ITokenMetadata } from "@/interfaces/tokens";
import { IPoolDcl } from "@/interfaces/swapDcl";
import { LOG_BASE, POINTLEFTRANGE, POINTRIGHTRANGE } from "@/utils/constant";

export const getV3PoolId = (tokenA: string, tokenB: string, fee: number) => {
  const tokenSeq = [tokenA, tokenB].sort().join("|");

  return `${tokenSeq}|${fee}`;
};
export const tagValidator = (
  bestEstimate: { amount: string; tag: string },
  tokenIn: TokenMetadata,
  tokenInAmount: string
) => {
  if (!bestEstimate) return false;

  const tagInfo = bestEstimate?.tag?.split("|");

  return (
    !!bestEstimate &&
    !!bestEstimate?.tag &&
    tagInfo?.[0] === tokenIn?.id &&
    tagInfo?.[2] === tokenInAmount
  );
};

export const getDclPriceImpact = ({
  tokenIn,
  tokenOut,
  bestPool,
  bestFee,
  tokenInAmount,
  tokenOutAmount,
}: {
  tokenIn: ITokenMetadata;
  tokenOut: ITokenMetadata;
  bestPool: IPoolDcl;
  bestFee: string | number;
  tokenInAmount: string;
  tokenOutAmount: string;
}) => {
  try {
    const curPoint =
      tokenIn.id === bestPool.token_x
        ? bestPool.current_point
        : -1 * bestPool.current_point;

    const curPrice = pointToPrice({
      tokenA: tokenIn,
      tokenB: tokenOut,
      point: curPoint,
    });

    const newPrice = new Big(tokenInAmount).div(tokenOutAmount).toNumber();

    const pi = new Big(newPrice)
      .minus(new Big(1).div(curPrice))
      .div(newPrice)
      .times(100)
      .minus(+bestFee / 10000)
      .toString();

    return scientificNotationToString(pi);
  } catch (error) {
    return "0";
  }
};
export const pointToPrice = ({
  tokenA,
  tokenB,
  point,
}: {
  tokenA: TokenMetadata;
  tokenB: TokenMetadata;
  point: number;
}) => {
  const undecimal_price = Math.pow(LOG_BASE, point);
  const decimal_price_A_by_B = new Big(undecimal_price)
    .times(new Big(10).pow(tokenA.decimals))
    .div(new Big(10).pow(tokenB.decimals));

  return scientificNotationToString(decimal_price_A_by_B.toString());
};

export const priceToPoint = ({
  tokenA,
  tokenB,
  amountA,
  amountB,
  fee,
}: {
  tokenA: TokenMetadata;
  tokenB: TokenMetadata;
  amountA: string;
  amountB: string;
  fee: number;
}) => {
  const decimal_price_A_by_B = new Big(amountB).div(amountA);

  const pointDelta = feeToPointDelta(fee) as number;

  const price = decimal_price_A_by_B;

  const decimalRate = new Big(10)
    .pow(tokenB.decimals)
    .div(new Big(10).pow(tokenA.decimals))
    .toNumber();

  return getPointByPrice(
    pointDelta,
    scientificNotationToString(price.toString()),
    decimalRate
  );
};

export const feeToPointDelta = (fee: number) => {
  switch (fee) {
    case 100:
      return 1;
    case 400:
      return 8;
    case 2000:
      return 40;
    case 10000:
      return 200;
  }
};
/**
 * caculate point by price
 * @param pointDelta
 * @param price
 * @param decimalRate tokenY/tokenX
 * @returns
 */
export function getPointByPrice(
  pointDelta: number,
  price: string,
  decimalRate: number,
  noNeedSlot?: boolean
) {
  const point = Math.log(+price * decimalRate) / Math.log(LOG_BASE);
  const point_int = Math.round(point);
  let point_int_slot = point_int;
  if (!noNeedSlot) {
    point_int_slot = Math.round(point_int / pointDelta) * pointDelta;
  }
  if (point_int_slot < POINTLEFTRANGE) {
    return POINTLEFTRANGE;
  } else if (point_int_slot > POINTRIGHTRANGE) {
    return 800000;
  }
  return point_int_slot;
}
