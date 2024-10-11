import getConfig from "../utils/config";
import { getAuthenticationHeaders } from "./signature";
import { TokenMetadata } from "./ft-contract";
import { parsePool } from "./swap/swapUtils";
import { refFiViewFunction } from "@/utils/contract";
import db from "@/db/RefDatabase";
const config = getConfig();
export interface Pool {
  id: number;
  tokenIds: string[];
  supplies: { [key: string]: string };
  fee: number;
  shareSupply: string;
  tvl: number;
  token0_ref_price: string;
  partialAmountIn?: string;
  Dex?: string;
  rates?: {
    [id: string]: string;
  };
  pool_kind?: string;
  pairAdd?: string;
  metas?: {
    [id: string]: TokenMetadata;
  };
}

export interface PoolRPCView {
  id: number;
  token_account_ids: string[];
  token_symbols: string[];
  amounts: string[];
  pool_kind?: string;
  total_fee: number;
  shares_total_supply: string;
  tvl: number;
  token0_ref_price: string;
  share: string;
  decimalsHandled?: boolean;
  tokens_meta_data?: TokenMetadata[];
  h24volume?: string;
  apr?: number;
  baseApr?: string;
}

export const getPoolMonthVolume = async (pool_id: string): Promise<any[]> => {
  return await fetch(config.sodakiApiUrl + `/pool/${pool_id}/volume`, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((monthVolume) => {
      return monthVolume.slice(0, 60);
    });
};

export const getPoolMonthTVL = async (pool_id: string): Promise<any[]> => {
  return await fetch(config.sodakiApiUrl + `/pool/${pool_id}/tvl`, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((monthTVL) => {
      return monthTVL.slice(0, 60);
    });
};

export const getV3PoolVolumeById = async (pool_id: string): Promise<any[]> => {
  return await fetch(
    config.indexerUrl + "/get-dcl-pools-volume?pool_id=" + pool_id,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-dcl-pools-volume"),
      },
    }
  )
    .then((res) => res.json())
    .then((list) => {
      (list || []).sort((v1: any, v2: any) => {
        const b =
          new Date(v1.dateString).getTime() - new Date(v2.dateString).getTime();
        return b;
      });
      return list.slice(-60);
    })
    .catch(() => {
      return [];
    });
};
export const getV3poolTvlById = async (pool_id: string): Promise<any[]> => {
  return await fetch(
    config.indexerUrl + "/get-dcl-pools-tvl-list?pool_id=" + pool_id,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-dcl-pools-tvl-list"),
      },
    }
  )
    .then((res) => res.json())
    .then((list) => {
      return list.slice(0, 60);
    })
    .catch(() => {
      return [];
    });
};

export const getPool = async (id: number | string): Promise<any> => {
  return refFiViewFunction({
    methodName: "get_pool",
    args: { pool_id: id },
  }).then((pool: PoolRPCView) => parsePool(pool as any, +id));
};

export const getPoolDetails = async (id: number): Promise<any> => {
  const [pool, volumes] = await Promise.all([
    getPool(id),
    refFiViewFunction({
      methodName: "get_pool_volumes",
      args: { pool_id: id },
    }),
  ]);

  return {
    ...pool,
    volumes: pool.tokenIds.reduce((acc: any, tokenId: string, i: number) => {
      acc[tokenId] = volumes[i];
      return acc;
    }, {}),
  };
};

export const canFarmV1 = async (
  pool_id: number,
  withEnded?: boolean
): Promise<Record<string, any>> => {
  let farms;

  if (!withEnded) {
    farms = (await db.queryFarms()).filter((farm) => farm.status !== "Ended");
  } else {
    farms = await db.queryFarms();
  }

  const count = farms.reduce((pre, cur) => {
    if (Number(cur.pool_id) === pool_id) return pre + 1;
    return pre;
  }, 0);

  const endedCount = farms.reduce((pre, cur) => {
    if (cur.status === "Ended" && Number(cur.pool_id) === pool_id)
      return pre + 1;
    return pre;
  }, 0);

  return {
    count,
    version: "V1",
    endedCount,
  };
};

export const canFarmV2 = async (
  pool_id: number,
  withEnded?: boolean
): Promise<Record<string, any>> => {
  let boostFarms;

  if (!withEnded) {
    boostFarms = (await db.queryBoostFarms()).filter(
      (farm) => farm.status !== "Ended"
    );
  } else {
    boostFarms = await db.queryBoostFarms();
  }
  const countV2 = boostFarms.reduce((pre, cur) => {
    if (cur.pool_id === pool_id) return pre + 1;
    return pre;
  }, 0);

  const endedCount = boostFarms.reduce((pre, cur) => {
    if (cur.status === "Ended" && cur.pool_id === pool_id) return pre + 1;
    return pre;
  }, 0);
  return {
    count: countV2,
    version: "V2",
    endedCount,
  };
};
