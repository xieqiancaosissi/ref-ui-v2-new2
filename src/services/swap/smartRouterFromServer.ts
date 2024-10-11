import Big from "big.js";
import {
  toNonDivisibleNumber,
  scientificNotationToString,
} from "@/utils/numbers";
import { calculateMarketPrice } from "@/services/swap/swapUtils";
import { TokenMetadata } from "@/services/ft-contract";
import { ftGetTokenMetadata } from "@/services/token";
import { Pool } from "@/interfaces/swap";
import { isStablePool } from "@/services/swap/swapUtils";
import {
  IEstimateSwapServerView,
  IServerRoute,
  StablePool,
} from "@/interfaces/swap";
import getConfigV3 from "@/utils/configV3";
import {
  getAllStablePoolsFromCache,
  getAllPoolsByTokensFromCache,
} from "@/services/swap/swap";
import { getAllTokenPrices } from "../farm";
const configV3 = getConfigV3();
export const estimateSwapFromServer = async ({
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
  supportLedger,
}: {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippage: number;
  supportLedger: boolean;
}) => {
  const timeoutDuration = 5000;
  const controller = new AbortController();
  const timeOutId = setTimeout(() => {
    controller.abort();
  }, timeoutDuration);
  const resultFromServer = await fetch(
    `https://${
      configV3.findPathUrl
    }/findPath?amountIn=${amountIn}&tokenIn=${tokenIn}&tokenOut=${tokenOut}&pathDeep=${
      supportLedger ? 1 : 3
    }&slippage=${Number(slippage) / 100}`,
    {
      signal: controller.signal,
    }
  )
    .then((res) => {
      return res.json();
    })
    .finally(() => {
      clearTimeout(timeOutId);
    });
  return resultFromServer;
};

export async function getAvgFeeFromServer({
  estimatesFromServer,
  tokenInAmount,
  tokenIn,
  poolsMap,
}: {
  tokenInAmount: string;
  tokenIn: TokenMetadata;
  estimatesFromServer: IEstimateSwapServerView;
  poolsMap: Record<string, Pool>;
}) {
  let avgFee: number = 0;
  const { routes } = estimatesFromServer;
  routes.forEach((route) => {
    const { amount_in, pools } = route;
    const allocation = new Big(amount_in).div(
      new Big(toNonDivisibleNumber(tokenIn.decimals, tokenInAmount))
    );
    const routeFee = pools.reduce((acc, cur) => {
      return acc.plus(poolsMap[cur.pool_id]?.fee || 0);
    }, new Big(0));
    avgFee += allocation.mul(routeFee).toNumber();
  });
  return avgFee;
}
export async function getPriceImpactFromServer({
  estimatesFromServer,
  tokenIn,
  tokenOut,
  tokenInAmount,
  tokenOutAmount,
  poolsMap,
  tokensMap,
}: {
  estimatesFromServer: IEstimateSwapServerView;
  tokenInAmount: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenOutAmount: string;
  poolsMap: Record<string, Pool>;
  tokensMap: Record<string, TokenMetadata>;
}) {
  try {
    const tokenPriceList = await getAllTokenPrices();
    const newPrice = new Big(tokenInAmount || "0").div(
      new Big(tokenOutAmount || "1")
    );
    const { routes } = estimatesFromServer;
    const priceIn = tokenPriceList[tokenIn.id]?.price;
    const priceOut = tokenPriceList[tokenOut.id]?.price;
    const priceImpactForRoutes = routes.map((route) => {
      let oldPrice: Big;
      if (!!priceIn && !!priceOut) {
        oldPrice = new Big(priceOut).div(new Big(priceIn));

        return newPrice.lt(oldPrice)
          ? "0"
          : newPrice.minus(oldPrice).div(newPrice).times(100).abs().toFixed();
      }
      const pools = route.pools.map((pool) => poolsMap[pool.pool_id]);
      oldPrice = pools.reduce((acc, pool, i) => {
        const curRate = isStablePool(pool.id)
          ? new Big(pool.rates![route.pools[i].token_out]).div(
              new Big(pool.rates![route.pools[i].token_in])
            )
          : new Big(
              scientificNotationToString(
                calculateMarketPrice(
                  pool,
                  tokensMap[route.pools[i].token_in],
                  tokensMap[route.pools[i].token_out]
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
          new Big(routes[i].amount_in)
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
}
export async function getUsedPools(routes: IServerRoute[]) {
  const { topPools, stablePools } = await getAllPoolsFromCache();
  const pools: Record<string, any> = {};
  routes.forEach((route) => {
    route.pools.forEach((cur) => {
      let p;
      p = topPools.find((p: any) => +p.id === +cur.pool_id);
      if (!p) {
        p = stablePools.find((p: any) => +p.id === +cur.pool_id);
      }
      if (p) {
        pools[p.id] = p;
      }
    });
  });
  return pools;
}
export async function getUsedTokens(routes: IServerRoute[]) {
  const pending = routes.map((route) => getTokensOfRoute(route));
  const tokensList = await Promise.all(pending);
  const list = tokensList.flat();
  const tokens: Record<string, TokenMetadata> = list.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {} as Record<string, TokenMetadata>);
  return tokens;
}
export async function getTokensOfRoute(route: IServerRoute) {
  const tokenIds = route.pools.reduce((acc, cur, index) => {
    if (index == 0) {
      acc.push(cur.token_in, cur.token_out);
    } else {
      acc.push(cur.token_out);
    }
    return acc;
  }, [] as string[]);
  const pending = tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId));
  const tokens = await Promise.all(pending);
  return tokens as TokenMetadata[];
}
export async function getAllPoolsFromCache() {
  const topPools = await getAllPoolsByTokensFromCache();
  const { allStablePoolsInfo } = await getAllStablePoolsFromCache();
  const topPoolsMap = topPools.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, any>);
  const stablePoolsMap = allStablePoolsInfo.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, StablePool>);
  return {
    topPools,
    stablePools: allStablePoolsInfo,
    poolsMap: { ...topPoolsMap, ...stablePoolsMap },
  };
}
