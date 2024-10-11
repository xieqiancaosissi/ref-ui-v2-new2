import _ from "lodash";
import Big from "big.js";
import { Pool, PoolMode } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { toNonDivisibleNumber } from "@/utils/numbers";
import { toReadableNumber } from "@/utils/numbers";
import { getAllStablePoolsFromCache, getContainPairsPools } from "./swap";
import getSinglePoolEstimate from "./getSinglePoolEstimate";
import getStablePoolEstimate from "./getStablePoolEstimate";
import getPoolEstimate from "./getPoolEstimate";
import { ftGetTokenMetadata, ftGetTokensMetadata } from "@/services/token";
import {
  isStableToken,
  getStablePoolThisPair,
  isStablePool,
  getStablePoolInfoThisPair,
} from "./swapUtils";
// hybrid stable pool
async function getHybridStableSmart(
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
  amountIn: string
) {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  let pool1: Pool, pool2: Pool;

  let pools1: Pool[] = [];
  const pools2: Pool[] = [];

  const pools1Right: Pool[] = [];
  let pools2Right: Pool[] = [];

  const { allStablePools, allStablePoolsById, allStablePoolsInfo } =
    await getAllStablePoolsFromCache();

  const candidatePools: Pool[][] = [];

  /**
   * find possible routes for this pair
   *
   *
   */
  if (isStableToken(tokenIn.id)) {
    // first hop will be through stable pool.
    pools1 = allStablePools.filter((pool) =>
      pool.tokenIds.includes(tokenIn.id)
    );

    const otherStables = pools1
      .map((pool) => pool.tokenIds.filter((id) => id !== tokenIn.id))
      .flat();

    for (const otherStable of otherStables) {
      const stablePools = getStablePoolThisPair({
        tokenInId: otherStable,
        tokenOutId: tokenOut.id,
        stablePools: allStablePools,
      });

      const tmpPools = await getContainPairsPools({
        tokenInId: otherStable,
        tokenOutId: tokenOut.id,
      });
      const tobeAddedPools = tmpPools.concat(stablePools);
      pools2.push(
        ...tobeAddedPools.filter((p: any) => {
          const supplies = Object.values(p.supplies) as any;
          return new Big(supplies[0]).times(new Big(supplies[1])).gt(0);
        })
      );
    }
  }

  if (isStableToken(tokenOut.id)) {
    // second hop will be through stable pool.
    pools2Right = allStablePools.filter((pool) =>
      pool.tokenIds.includes(tokenOut.id)
    );

    const otherStables = pools2Right
      .map((pool) => pool.tokenIds.filter((id) => id !== tokenOut.id))
      .flat();
    for (const otherStable of otherStables) {
      const stablePools = getStablePoolThisPair({
        tokenInId: tokenIn.id,
        tokenOutId: otherStable,
        stablePools: allStablePools,
      });

      const tmpPools = await getContainPairsPools({
        tokenInId: tokenIn.id,
        tokenOutId: otherStable,
      });

      const tobeAddedPools = tmpPools.concat(stablePools);

      pools1Right.push(
        ...tobeAddedPools.filter((p) => {
          const supplies = Object.values(p.supplies);
          return new Big(supplies[0]).times(new Big(supplies[1])).gt(0);
        })
      );
    }
  }

  // find candidate pools

  for (const p1 of pools1) {
    const middleTokens = p1.tokenIds.filter((id: string) => id !== tokenIn.id);
    for (const middleToken of middleTokens) {
      const p2s = pools2.filter(
        (p) =>
          p.tokenIds.includes(middleToken) &&
          p.tokenIds.includes(tokenOut.id) &&
          middleToken !== tokenOut.id
      );
      let p2 = _.maxBy(p2s, (p) =>
        Number(
          new Big(toReadableNumber(tokenOut.decimals, p.supplies[tokenOut.id]))
        )
      );

      if (middleToken === tokenOut.id) {
        p2 = p1;
      }

      if (p1 && p2) {
        if (p1.id === p2.id) candidatePools.push([p1]);
        else candidatePools.push([p1, p2]);
      }
    }
  }
  for (const p1 of pools1Right) {
    const middleTokens = p1.tokenIds.filter((id: string) => id !== tokenIn.id);
    for (const middleToken of middleTokens) {
      const p2s = pools2Right.filter(
        (p) =>
          p.tokenIds.includes(middleToken) &&
          p.tokenIds.includes(tokenOut.id) &&
          middleToken !== tokenOut.id
      );
      let p2 = _.maxBy(p2s, (p) =>
        Number(
          new Big(toReadableNumber(tokenOut.decimals, p.supplies[tokenOut.id]))
        )
      );

      if (middleToken === tokenOut.id) {
        p2 = p1;
      }

      if (p1 && p2) {
        if (p1.id === p2.id) candidatePools.push([p1]);
        else candidatePools.push([p1, p2]);
      }
    }
  }

  if (candidatePools.length > 0) {
    const tokensMedata = await ftGetTokensMetadata(
      candidatePools.map((cp) => cp.map((p) => p.tokenIds).flat()).flat()
    );

    const BestPoolPair =
      candidatePools.length === 1
        ? candidatePools[0]
        : _.maxBy(candidatePools, (poolPair) => {
            // only one pool case, only for stable tokens
            if (poolPair.length === 1) {
              if (isStablePool(poolPair[0].id)) {
                return Number(
                  getStablePoolEstimate({
                    tokenIn,
                    tokenOut,
                    stablePool: getStablePoolThisPair({
                      tokenInId: tokenIn.id,
                      tokenOutId: tokenOut.id,
                      stablePools: allStablePools,
                    })[0],
                    amountIn,
                    stablePoolInfo: getStablePoolInfoThisPair({
                      tokenInId: tokenIn.id,
                      tokenOutId: tokenOut.id,
                      stablePoolsInfo: allStablePoolsInfo,
                    })[0],
                  }).estimate
                );
              } else {
                return Number(
                  getSinglePoolEstimate(
                    tokenIn,
                    tokenOut,
                    poolPair[0],
                    parsedAmountIn
                  ).estimate
                );
              }
            }

            const [tmpPool1, tmpPool2] = poolPair;
            const tokenMidId: any = poolPair[0].tokenIds.find(
              (t: string) =>
                poolPair[1].tokenIds.includes(t) &&
                t !== tokenIn.id &&
                t != tokenOut.id
            );

            const tokenMidMeta = tokensMedata[tokenMidId];

            const estimate1 = {
              ...(isStablePool(tmpPool1.id)
                ? getStablePoolEstimate({
                    tokenIn,
                    tokenOut: tokenMidMeta,
                    amountIn,
                    stablePoolInfo: allStablePoolsById[tmpPool1.id][1],
                    stablePool: allStablePoolsById[tmpPool1.id][0],
                  })
                : getSinglePoolEstimate(
                    tokenIn,
                    tokenMidMeta,
                    tmpPool1,
                    parsedAmountIn
                  )),
              status: PoolMode.SMART,
            };

            const estimate2 = {
              ...(isStablePool(tmpPool2.id)
                ? getStablePoolEstimate({
                    tokenIn: tokenMidMeta,
                    tokenOut,
                    amountIn: estimate1.estimate,
                    stablePoolInfo: allStablePoolsById[tmpPool2.id][1],
                    stablePool: allStablePoolsById[tmpPool2.id][0],
                  })
                : getSinglePoolEstimate(
                    tokenMidMeta,
                    tokenOut,
                    tmpPool2,
                    toNonDivisibleNumber(
                      tokenMidMeta.decimals,
                      estimate1.estimate
                    )
                  )),
              status: PoolMode.SMART,
            };

            return Number(estimate2.estimate);
          });

    // one pool case only get best price

    if (!BestPoolPair) return { actions: [], estimate: "0" };

    if (BestPoolPair.length === 1) {
      const bestPool = BestPoolPair[0];
      const estimate = await getPoolEstimate({
        tokenIn,
        tokenOut,
        amountIn: parsedAmountIn,
        pool: bestPool,
      });

      estimate.pool.partialAmountIn = parsedAmountIn;

      return {
        actions: [
          {
            ...estimate,
            status: PoolMode.STABLE,
            tokens: [tokenIn, tokenOut],
            inputToken: tokenIn.id,
            outputToken: tokenOut.id,
            totalInputAmount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
          },
        ],
        estimate: estimate.estimate,
      };
    }

    // two pool case get best price
    [pool1, pool2] = BestPoolPair;

    const tokenMidId: any = BestPoolPair[0].tokenIds.find(
      (t: string) =>
        BestPoolPair[1].tokenIds.includes(t) &&
        t !== tokenIn.id &&
        t != tokenOut.id
    );

    const tokenMidMeta = await ftGetTokenMetadata(tokenMidId);

    const estimate1 = {
      ...(isStablePool(pool1.id)
        ? getStablePoolEstimate({
            tokenIn,
            tokenOut: tokenMidMeta,
            amountIn,
            stablePoolInfo: allStablePoolsById[pool1.id][1],
            stablePool: allStablePoolsById[pool1.id][0],
          })
        : getSinglePoolEstimate(tokenIn, tokenMidMeta, pool1, parsedAmountIn)),
      status: PoolMode.SMART,
      tokens: [tokenIn, tokenMidMeta, tokenOut],
      inputToken: tokenIn.id,
      outputToken: tokenMidMeta.id,
      totalInputAmount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
    };

    estimate1.pool.partialAmountIn = parsedAmountIn;

    const estimate2 = {
      ...(isStablePool(pool2.id)
        ? getStablePoolEstimate({
            tokenIn: tokenMidMeta,
            tokenOut,
            amountIn: estimate1.estimate,
            stablePoolInfo: allStablePoolsById[pool2.id][1],
            stablePool: allStablePoolsById[pool2.id][0],
          })
        : getSinglePoolEstimate(
            tokenMidMeta,
            tokenOut,
            pool2,
            toNonDivisibleNumber(tokenMidMeta.decimals, estimate1.estimate)
          )),

      status: PoolMode.SMART,
      tokens: [tokenIn, tokenMidMeta, tokenOut],
      inputToken: tokenMidMeta.id,
      outputToken: tokenOut.id,
      totalInputAmount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
    };

    return { actions: [estimate1, estimate2], estimate: estimate2.estimate };
  }

  return { actions: [], estimate: "0" };
}
export default getHybridStableSmart;
