import { viewFunction } from "@/utils/near";
import db from "@/db/RefDatabase";
import getConfig from "@/utils/config";
import { DEFAULT_PAGE_LIMIT, STABLE_LP_TOKEN_DECIMALS } from "@/utils/constant";
import { getTopPools } from "../indexer";
import { PoolRPCView, Pool, StablePool, IPoolSource } from "@/interfaces/swap";
import {
  parsePool,
  parsePools,
  isNotStablePool,
  isRatedPool,
} from "./swapUtils";
import { filterBlackListPools } from "@/services/common";
import { toNonDivisibleNumber, toReadableNumber } from "@/utils/numbers";
import { getStablePoolDecimal } from "./swapUtils";
import { ALL_STABLE_POOL_IDS } from "./swapConfig";
const config = getConfig();
const { REF_FI_CONTRACT_ID, BLACKLIST_POOL_IDS } = config;
export const fetchPoolsAndCacheData = async (): Promise<Pool[]> => {
  let pools: Pool[];
  try {
    const topPools = await getTopPools();
    pools = parsePools(topPools);
    await db.cacheTopPools(topPools);
  } catch (error) {
    pools = await fetchPoolsRPC();
  }
  db.cachePoolsByTokens(
    pools.filter(filterBlackListPools).filter((p: any) => isNotStablePool(p))
  );
  return pools;
};
const fetchPoolsRPC = async (): Promise<Pool[]> => {
  const totalPools = await getNumberOfPools();
  const pages = Math.ceil(totalPools / DEFAULT_PAGE_LIMIT);

  const res = (
    await Promise.all([...Array(pages)].map((_, i) => getAllPools(i + 1)))
  )
    .flat()
    .map((p) => ({ ...p, Dex: "ref", source: "rpc" as IPoolSource }));

  return res;
};
export const getNumberOfPools = async () => {
  return viewFunction({
    contractId: REF_FI_CONTRACT_ID,
    methodName: "get_number_of_pools",
  });
};
export const getAllPools = async (
  page: number = 1,
  perPage: number = DEFAULT_PAGE_LIMIT
): Promise<Pool[]> => {
  const index = (page - 1) * perPage;

  const poolData: PoolRPCView[] = await viewFunction({
    contractId: REF_FI_CONTRACT_ID,
    methodName: "get_pools",
    args: { from_index: index, limit: perPage },
  });
  return poolData.map((rawPool, i) => parsePool(rawPool, i + index));
};
export const getContainPairsPools = async ({
  tokenInId,
  tokenOutId,
}: {
  tokenInId: string;
  tokenOutId: string;
}): Promise<Pool[]> => {
  let pools: Pool[];
  const isLatest = await db.checkTopPools();
  if (isLatest) {
    const topPools = await db.queryTopPools();
    pools = parsePools(topPools);
  } else {
    pools = await fetchPoolsAndCacheData();
  }
  const containPairsPools = pools
    .filter(filterBlackListPools)
    .filter((pool: Pool) => {
      return (
        pool.tokenIds.includes(tokenInId) &&
        pool.tokenIds.includes(tokenOutId) &&
        isNotStablePool(pool)
      );
    });
  return containPairsPools;
};
export const getPool = async (id: number): Promise<PoolRPCView> => {
  const pool_info = await viewFunction({
    contractId: REF_FI_CONTRACT_ID,
    methodName: "get_pool",
    args: { pool_id: id },
  });
  return {
    ...pool_info,
    id,
  };
};
export const getStablePool = async (pool_id: number): Promise<StablePool> => {
  if (isRatedPool(pool_id)) {
    const pool_info = await viewFunction({
      contractId: REF_FI_CONTRACT_ID,
      methodName: "get_rated_pool",
      args: { pool_id },
    });

    return {
      ...pool_info,
      id: pool_id,
    };
  }

  const pool_info = await viewFunction({
    contractId: REF_FI_CONTRACT_ID,
    methodName: "get_stable_pool",
    args: { pool_id },
  });

  return {
    ...pool_info,
    id: pool_id,
    rates: pool_info.c_amounts.map((i: any) =>
      toNonDivisibleNumber(STABLE_LP_TOKEN_DECIMALS, "1")
    ),
  };
};
export const fetchStablePoolsAndCacheData = async (): Promise<StablePool[]> => {
  const pending = ALL_STABLE_POOL_IDS.map((pool_id) => getStablePool(+pool_id));
  const stableBaseDataPools = await Promise.all(pending);
  db.cacheStablePools(stableBaseDataPools);
  return stableBaseDataPools;
};
export const fetchStableBaseDataPoolsAndCacheData = async (): Promise<
  PoolRPCView[]
> => {
  const pending = ALL_STABLE_POOL_IDS.map((pool_id) => getPool(+pool_id));
  const stablePools = await Promise.all(pending);
  db.cacheStableBaseDataPools(stablePools);
  return stablePools;
};
export const getAllStablePoolsFromCache = async () => {
  const stableIsLatest = await db.checkStablePools();
  const stableBaseDataIsLatest = await db.checkStableBaseDataPools();
  let stableBaseDataPools, stablePools;
  if (stableBaseDataIsLatest) {
    stableBaseDataPools = await db.queryStableBaseDataPools();
  } else {
    stableBaseDataPools = await fetchStableBaseDataPoolsAndCacheData();
  }
  if (stableIsLatest) {
    stablePools = await db.queryStablePools();
  } else {
    stablePools = await fetchStablePoolsAndCacheData();
  }
  const stableBaseDataPoolsMap: Record<string, PoolRPCView> =
    stableBaseDataPools.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.id]: cur,
      };
    }, {});
  const stablePoolsMap: Record<string, StablePool> = stablePools.reduce(
    (acc, cur) => {
      return {
        ...acc,
        [cur.id]: cur,
      };
    },
    {}
  );
  const res = ALL_STABLE_POOL_IDS.filter(
    (id: string) => !BLACKLIST_POOL_IDS.includes(id.toString())
  ).map((id: string) => {
    const stablePoolInfo = stablePoolsMap[id];
    const stablePool = parsePool(stableBaseDataPoolsMap[id], +id);
    stablePool.rates = stablePoolInfo.token_account_ids.reduce(
      (acc: any, cur: any, i: number) => ({
        ...acc,
        [cur]: toReadableNumber(
          getStablePoolDecimal(stablePool.id),
          stablePoolInfo.rates[i]
        ),
      }),
      {}
    );
    return [stablePool, stablePoolInfo];
  });
  const allStablePoolsById = res.reduce((pre, cur) => {
    return {
      ...pre,
      [cur[0].id]: cur,
    };
  }, {}) as {
    [id: string]: [Pool, StablePool];
  };
  const allStablePools = Object.values(allStablePoolsById).map((p) => p[0]);
  const allStablePoolsInfo = Object.values(allStablePoolsById).map((p) => p[1]);

  return {
    allStablePoolsById,
    allStablePools,
    allStablePoolsInfo,
  };
};
export const getStablePoolFromCache = async (
  stable_pool_id: string
): Promise<[Pool, StablePool]> => {
  const stableIdsLatest = await db.checkStablePools();
  const stableBaseDataIdsLatest = await db.checkStableBaseDataPools();
  let stablePool, stablePoolInfo;
  if (stableBaseDataIdsLatest) {
    stablePool = parsePool(
      await db.queryStableBaseDataPoolById(stable_pool_id),
      +stable_pool_id
    );
  } else {
    stablePool = parsePool(
      await getPool(Number(stable_pool_id)),
      +stable_pool_id
    );
  }
  if (stableIdsLatest) {
    stablePoolInfo = await db.queryStablePoolById(stable_pool_id);
  } else {
    stablePoolInfo = await getStablePool(Number(stable_pool_id));
  }
  stablePool.rates = stablePoolInfo.token_account_ids.reduce(
    (acc: any, cur: any, i: number) => ({
      ...acc,
      [cur]: toReadableNumber(
        getStablePoolDecimal(stablePool.id),
        stablePoolInfo.rates[i]
      ),
    }),
    {}
  );

  return [stablePool, stablePoolInfo];
};
export const getAllPoolsByTokensFromCache = async () => {
  const isLatest = await db.checkPoolsTokens();
  let pools;
  if (isLatest) {
    pools = await db.getAllPoolsTokens();
  } else {
    pools = await fetchPoolsAndCacheData();
  }
  return pools;
};
