import moment from "moment";
import * as math from "mathjs";
import Big from "big.js";
import _, { sortBy } from "lodash";
import { PoolRPCView, Pool, IPoolsByTokens } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import {
  toReadableNumber,
  scientificNotationToString,
  toNonDivisibleNumber,
  percent,
  subtraction,
  toPrecision,
} from "@/utils/numbers";
import { ALL_STABLE_POOL_IDS, AllStableTokenIds } from "./swapConfig";
import getStablePoolTypeConfig from "@/utils/stablePoolConfig/stablePoolTypeConfig";
import { StablePool, EstimateSwapView, IServerRoute } from "@/interfaces/swap";
import {
  STABLE_LP_TOKEN_DECIMALS,
  RATED_POOL_LP_TOKEN_DECIMALS,
} from "@/utils/constant";
import db from "@/db/RefDatabase";
import { ITokenMetadata } from "@/interfaces/tokens";
import { MIN_RETAINED_NEAR_AMOUNT } from "@/utils/constant";
import { NEAR_META_DATA, WNEAR_META_DATA } from "@/utils/nearMetaData";
import getConfig from "@/utils/config";

const { WRAP_NEAR_CONTRACT_ID } = getConfig();
const { RATED_POOLS_IDS, DEGEN_POOLS_IDS } = getStablePoolTypeConfig();
export const parsePool = (pool: PoolRPCView, id: number): Pool => ({
  id: Number(id >= 0 ? id : pool.id),
  tokenIds: pool.token_account_ids,
  supplies: pool.amounts.reduce(
    (acc: { [tokenId: string]: string }, amount: string, i: number) => {
      acc[pool.token_account_ids[i]] = amount;
      return acc;
    },
    {}
  ),
  fee: pool.total_fee,
  shareSupply: pool.shares_total_supply,
  tvl: pool.tvl,
  pool_kind: pool?.pool_kind,
});
export const parsePools = (pools: PoolRPCView[]): Pool[] => {
  const parsedPools = pools.map((p: PoolRPCView) => {
    return {
      ...parsePool(p, p.id),
      Dex: "ref",
    };
  });
  return parsedPools;
};
export const parsePoolsByTokens = (pools: Pool[]): IPoolsByTokens[] => {
  const poolsByTokens = pools.map((pool: Pool) => ({
    id: pool.id,
    token1Id: pool.tokenIds[0],
    token2Id: pool.tokenIds[1],
    token1Supply: pool.supplies[pool.tokenIds[0]],
    token2Supply: pool.supplies[pool.tokenIds[1]],
    fee: pool.fee,
    shares: pool.shareSupply,
    pool_kind: pool.pool_kind,
    update_time: moment().unix(),
    Dex: pool.Dex,
    pairAdd: pool.pairAdd,
    tvl: pool.tvl,
  }));
  return poolsByTokens;
};
export const parsePoolsByTokensToPool = (pools: IPoolsByTokens[]): Pool[] => {
  const parsedPools = pools.map((item: IPoolsByTokens) => ({
    id: item.id,
    tokenIds: [item.token1Id, item.token2Id],
    supplies: {
      [item.token1Id]: item.token1Supply,
      [item.token2Id]: item.token2Supply,
    },
    shareSupply: item.shares,
    fee: item.fee,
    Dex: item.Dex,
    pairAdd: item.pairAdd,
    pool_kind: item.pool_kind,
  }));
  return parsedPools;
};
export const getLiquidity = (
  pool: Pool,
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata
) => {
  const amount1 = toReadableNumber(tokenIn.decimals, pool.supplies[tokenIn.id]);
  const amount2 = toReadableNumber(
    tokenOut.decimals,
    pool.supplies[tokenOut.id]
  );

  const lp = new Big(amount1).times(new Big(amount2));

  return Number(lp);
};
export const getStablePoolThisPair = ({
  tokenInId,
  tokenOutId,
  stablePools,
}: {
  tokenInId: string;
  tokenOutId: string;
  stablePools: Pool[];
}) => {
  return stablePools.filter(
    (p) =>
      p.tokenIds.includes(tokenInId) &&
      p.tokenIds.includes(tokenOutId) &&
      tokenInId !== tokenOutId
  );
};
export const isNotStablePool = (pool: Pool) => {
  return !isStablePool(pool.id);
};
export const isStablePool = (id: string | number) => {
  return ALL_STABLE_POOL_IDS.map((id) => id.toString()).includes(id.toString());
};
export const isRatedPool = (id: string | number) => {
  return RATED_POOLS_IDS.includes(id.toString());
};
export const isDegenPool = (id: string | number) => {
  return DEGEN_POOLS_IDS.includes(id.toString());
};

export const isStableToken = (id: string) => {
  return AllStableTokenIds.includes(id);
};
export const getStablePoolDecimal = (id: string | number, pool?: any) => {
  if (isRatedPool(id) || isDegenPool(id) || pool?.pool_kind == "DEGEN_SWAP")
    return RATED_POOL_LP_TOKEN_DECIMALS;
  // else if (isStablePool(id)) return STABLE_LP_TOKEN_DECIMALS;
  else return STABLE_LP_TOKEN_DECIMALS;
};
export const getRefPoolsByTokens = async () => {
  return await db.queryAllPoolsByTokens();
};
export const getStablePoolInfoThisPair = ({
  tokenInId,
  tokenOutId,
  stablePoolsInfo,
}: {
  tokenInId: string;
  tokenOutId: string;
  stablePoolsInfo: StablePool[];
}) => {
  return stablePoolsInfo.filter(
    (p) =>
      p.token_account_ids.includes(tokenInId) &&
      p.token_account_ids.includes(tokenOutId)
  );
};
export function separateRoutes(
  actions: EstimateSwapView[],
  outputToken: string
) {
  const res = [];
  let curRoute = [];

  for (const i in actions) {
    curRoute.push(actions[i]);
    if (actions[i].outputToken === outputToken) {
      res.push(curRoute);
      curRoute = [];
    }
  }

  return res;
}
export const getPriceImpact = ({
  estimates,
  tokenIn,
  tokenOut,
  tokenInAmount,
  tokenOutAmount,
  tokenPriceList,
}: {
  estimates: EstimateSwapView[];
  tokenInAmount: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenOutAmount: string;
  tokenPriceList: any;
}) => {
  try {
    const newPrice = new Big(tokenInAmount || "0").div(
      new Big(tokenOutAmount || "1")
    );

    const routes = separateRoutes(estimates, tokenOut.id);
    const priceImpactForRoutes = routes.map((estimates) => {
      let oldPrice: Big;

      const priceIn = tokenPriceList[tokenIn.id]?.price;
      const priceOut = tokenPriceList[tokenOut.id]?.price;

      if (!!priceIn && !!priceOut) {
        oldPrice = new Big(priceOut).div(new Big(priceIn));

        return newPrice.lt(oldPrice)
          ? "0"
          : newPrice.minus(oldPrice).div(newPrice).times(100).abs().toFixed();
      }

      const pools = estimates.map((s) => s?.pool);

      oldPrice = pools.reduce((acc, pool: any, i) => {
        const curRate = isStablePool(pool.id)
          ? new Big(pool.rates[estimates?.[i]?.outputToken || 0]).div(
              new Big(pool.rates[estimates?.[i]?.inputToken || 1])
            )
          : new Big(
              scientificNotationToString(
                calculateMarketPrice(
                  pool,
                  estimates?.[0]?.tokens?.[i],
                  estimates?.[0]?.tokens?.[i + 1]
                ).toString()
              )
            );

        return acc.mul(curRate);
      }, new Big(1));

      return newPrice.lt(oldPrice)
        ? "0"
        : newPrice.minus(oldPrice).div(newPrice).times(100).abs().toFixed();
    });
    const rawRes = priceImpactForRoutes.reduce(
      (pre, cur, i) => {
        return pre.plus(
          new Big(routes?.[i]?.[0]?.partialAmountIn || 0)
            .div(new Big(toNonDivisibleNumber(tokenIn.decimals, tokenInAmount)))
            .mul(cur)
        );
      },

      new Big(0)
    );

    return scientificNotationToString(rawRes.toString());
  } catch (error) {
    return "0";
  }
};
export const calculateMarketPrice = (
  pool: Pool,
  tokenIn: TokenMetadata | any,
  tokenOut: TokenMetadata | any
) => {
  const cur_in_balance = toReadableNumber(
    tokenIn.decimals,
    pool.supplies[tokenIn.id]
  );

  const cur_out_balance = toReadableNumber(
    tokenOut.decimals,
    pool.supplies[tokenOut.id]
  );

  return math.evaluate(`(${cur_in_balance} / ${cur_out_balance})`);
};
export const getAverageFee = ({
  estimates,
  tokenIn,
  tokenOut,
  tokenInAmount,
}: {
  estimates: EstimateSwapView[];
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenInAmount: string;
}) => {
  let avgFee: number = 0;
  try {
    const routes = separateRoutes(estimates, tokenOut.id);

    routes.forEach((route) => {
      const allocation = new Big(route[0]?.partialAmountIn || "0").div(
        new Big(toNonDivisibleNumber(tokenIn.decimals, tokenInAmount))
      );

      const routeFee = route.reduce(
        (acc, cur) => {
          return acc.plus(new Big(cur?.pool?.fee || "0"));
        },

        new Big(0)
      );

      avgFee += allocation.mul(routeFee).toNumber();
    });
  } catch (error) {}
  return avgFee;
};

export function getPoolAllocationPercents(pools: Pool[]) {
  if (pools.length === 1) return ["100"];

  if (pools) {
    const partialAmounts = pools.map((pool) => {
      return math.bignumber(pool.partialAmountIn);
    });

    const ps: string[] = new Array(partialAmounts.length).fill("0");

    const sum =
      partialAmounts.length === 1
        ? partialAmounts[0]
        : math.sum(...partialAmounts);

    const sortedAmount = sortBy(partialAmounts, (p) => Number(p));

    const minIndexes: number[] = [];

    for (let k = 0; k < sortedAmount.length - 1; k++) {
      let minIndex = -1;

      for (let j = 0; j < partialAmounts.length; j++) {
        if (partialAmounts[j].eq(sortedAmount[k]) && !minIndexes.includes(j)) {
          minIndex = j;
          minIndexes.push(j);
          break;
        }
      }
      const res = math
        .round(percent(partialAmounts[minIndex].toString(), sum))
        .toString();

      if (Number(res) === 0) {
        ps[minIndex] = "1";
      } else {
        ps[minIndex] = res;
      }
    }

    const finalPIndex = ps.indexOf("0");

    ps[finalPIndex] = subtraction(
      "100",
      ps.length === 1 ? Number(ps[0]) : math.sum(...ps.map((p) => Number(p)))
    ).toString();

    return ps;
  } else {
    return [];
  }
}
export function getRouteAllocationPercents(routes: IServerRoute[]) {
  if (routes.length === 1) return ["100"];

  if (routes) {
    const partialAmounts = routes.map((route) => {
      return math.bignumber(route.amount_in);
    });

    const ps: string[] = new Array(partialAmounts.length).fill("0");

    const sum =
      partialAmounts.length === 1
        ? partialAmounts[0]
        : math.sum(...partialAmounts);

    const sortedAmount = sortBy(partialAmounts, (p) => Number(p));

    const minIndexes: number[] = [];

    for (let k = 0; k < sortedAmount.length - 1; k++) {
      let minIndex = -1;

      for (let j = 0; j < partialAmounts.length; j++) {
        if (partialAmounts[j].eq(sortedAmount[k]) && !minIndexes.includes(j)) {
          minIndex = j;
          minIndexes.push(j);
          break;
        }
      }
      const res = math
        .round(percent(partialAmounts[minIndex].toString(), sum))
        .toString();

      if (Number(res) === 0) {
        ps[minIndex] = "1";
      } else {
        ps[minIndex] = res;
      }
    }

    const finalPIndex = ps.indexOf("0");

    ps[finalPIndex] = subtraction(
      "100",
      ps.length === 1 ? Number(ps[0]) : math.sum(...ps.map((p) => Number(p)))
    ).toString();

    return ps;
  } else {
    return [];
  }
}
export function getMax(token: ITokenMetadata): string {
  const isNEAR = getTokenUIId(token) == "near";
  const { balance } = token || {};
  let max = balance || "0";
  if (isNEAR) {
    const minusDiff = Big(balance || 0).minus(MIN_RETAINED_NEAR_AMOUNT);
    max = minusDiff.gt(0) ? toPrecision(minusDiff.toFixed(), 12) : "0";
  }
  return max;
}
export function getTokenUIId(token?: ITokenMetadata) {
  if (token?.id == WRAP_NEAR_CONTRACT_ID && token?.symbol == "NEAR") {
    return "near";
  }
  return token?.id ?? "";
}

export function is_near_wnear_swap(
  tokenA: ITokenMetadata,
  tokenB: ITokenMetadata
): boolean {
  const tokenA_id = getTokenUIId(tokenA);
  const tokenB_id = getTokenUIId(tokenB);
  return (
    (tokenA_id == "near" && tokenB_id == WRAP_NEAR_CONTRACT_ID) ||
    (tokenA_id == WRAP_NEAR_CONTRACT_ID && tokenB_id == "near")
  );
}
export function getWnearToken(tokens: TokenMetadata[]) {
  const NEAR = tokens.filter((token) => token.id === WRAP_NEAR_CONTRACT_ID)[0];
  if (!NEAR) return;
  const wnearToken = JSON.parse(JSON.stringify(NEAR));
  wnearToken.icon = WNEAR_META_DATA.icon;
  wnearToken.symbol = WNEAR_META_DATA.symbol;
  wnearToken.name = "Wrapped NEAR fungible token";
  NEAR.icon = NEAR_META_DATA.icon;
  NEAR.symbol = "NEAR";
  NEAR.name = "Near";
  return wnearToken;
}
