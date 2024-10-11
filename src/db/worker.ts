import { keyStores, Near } from "near-api-js";
import db, { FarmDexie } from "./RefDatabase";
import { getAuthenticationHeaders } from "../services/signature";
import { TokenMetadata } from "../services/ft-contract";
import { Seed, FarmBoost } from "../services/farm";
import { PoolRPCView } from "../interfaces/swap";
import { IPoolDcl } from "../interfaces/swapDcl";
import {
  parsePool,
  isRatedPool,
  isNotStablePool,
} from "../services/swap/swapUtils";
import { STABLE_LP_TOKEN_DECIMALS } from "../utils/constant";
import { toNonDivisibleNumber } from "../utils/numbers";
import { filterBlackListPools } from "../services/common";

let config: any = {};
let ALL_STABLE_POOL_IDS: string[] = [];
onmessage = (event) => {
  if (event?.data?.config && event?.data?.ALL_STABLE_POOL_IDS) {
    config = event?.data?.config;
    ALL_STABLE_POOL_IDS = event?.data?.ALL_STABLE_POOL_IDS;
    runWorker();
  }
};

const runWorker = () => {
  const {
    REF_FARM_BOOST_CONTRACT_ID,
    REF_UNI_V3_SWAP_CONTRACT_ID,
    DCL_POOL_BLACK_LIST,
    REF_FI_CONTRACT_ID,
  } = config;

  const near = new Near({
    keyStore: new keyStores.InMemoryKeyStore(),
    headers: {},
    ...config,
  });
  const getTokens = async () => {
    return await fetch(config.indexerUrl + "/list-token", {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/list-token"),
      },
    })
      .then((res) => res.json())
      .then((tokens) => {
        return tokens;
      });
  };
  const cacheTokens = async () => {
    const tokens = await getTokens();
    const tokenArr = Object.keys(tokens).map((key) => ({
      id: key,
      icon: tokens[key].icon,
      decimals: tokens[key].decimals,
      name: tokens[key].name,
      symbol: tokens[key].symbol,
    }));
    await db.tokens.bulkPut(
      tokenArr.map((token: TokenMetadata) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        icon: token.icon,
      }))
    );
  };
  const contractView = ({
    methodName,
    args = {},
    contract,
  }: {
    methodName: string;
    args?: object;
    contract: string;
  }) => {
    return near.connection.provider
      .query({
        request_type: "call_function",
        finality: "final",
        account_id: contract,
        method_name: methodName,
        args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
      })
      .then(({ result }: any) => JSON.parse(Buffer.from(result).toString()));
  };
  const getStablePool = async (pool_id: number) => {
    if (isRatedPool(pool_id)) {
      const pool_info = await contractView({
        contract: REF_FI_CONTRACT_ID,
        methodName: "get_rated_pool",
        args: { pool_id },
      });
      return {
        ...pool_info,
        id: pool_id,
      };
    }
    const pool_info = await contractView({
      contract: REF_FI_CONTRACT_ID,
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
  const getPool = async (pool_id: number) => {
    const pool_info = await contractView({
      contract: REF_FI_CONTRACT_ID,
      methodName: "get_pool",
      args: { pool_id },
    });
    return {
      ...pool_info,
      id: pool_id,
    };
  };
  const get_list_seeds_info = async () => {
    return contractView({
      methodName: "list_seeds_info",
      contract: REF_FARM_BOOST_CONTRACT_ID,
    });
  };
  const getDclPools = async () => {
    const res = await contractView({
      methodName: "list_pools",
      contract: REF_UNI_V3_SWAP_CONTRACT_ID,
    });

    return res.filter((p: any) => !DCL_POOL_BLACK_LIST.includes(p.pool_id));
  };
  const get_list_seed_farms = async (seed_id: string) => {
    return contractView({
      methodName: "list_seed_farms",
      args: { seed_id },
      contract: REF_FARM_BOOST_CONTRACT_ID,
    });
  };
  const getPoolsByIds = async (pool_ids: string[]): Promise<PoolRPCView[]> => {
    const ids = pool_ids.join("|");
    if (!ids) return [];
    return fetch(config.indexerUrl + "/list-pools-by-ids?ids=" + ids, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/list-pools-by-ids"),
      },
    })
      .then((res) => res.json())
      .then((pools) => {
        return pools;
      })
      .catch(() => {
        return [];
      });
  };
  const cacheBoost_Seed_Farms_Pools = async () => {
    // get all seeds
    let list_seeds = await get_list_seeds_info();
    // not the classic and dcl seeds would be filtered
    list_seeds = list_seeds.filter((seed: Seed) => {
      const contract_id = seed.seed_id.split("@")?.[0];
      return (
        contract_id == REF_UNI_V3_SWAP_CONTRACT_ID ||
        contract_id == REF_FI_CONTRACT_ID
      );
    });
    // get all farms
    const farmsPromiseList: Promise<any>[] = [];
    // get all dcl pools
    const dcl_all_pools: IPoolDcl[] = await getDclPools();
    const poolIds = new Set<string>();
    const dcl_poolIds = new Set<string>();
    let pools: any[] = [];
    list_seeds.forEach((seed: Seed) => {
      const { seed_id } = seed;
      // seed type: [commonSeed, loveSeed, dclSeed]
      const [contractId, tempPoolId] = seed_id.split("@");
      if (tempPoolId && contractId !== REF_UNI_V3_SWAP_CONTRACT_ID) {
        poolIds.add(tempPoolId);
      } else if (tempPoolId && contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
        const [fixRange, dcl_pool_id, left_point, right_point] =
          tempPoolId.split("&");
        dcl_poolIds.add(dcl_pool_id);
      }
      farmsPromiseList.push(get_list_seed_farms(seed_id));
    });
    const list_farms: FarmBoost[][] = await Promise.all(farmsPromiseList);
    let cacheFarms: FarmBoost[] = [];
    list_farms.forEach((arr: FarmBoost[]) => {
      cacheFarms = cacheFarms.concat(arr);
    });
    pools = await getPoolsByIds(Array.from(poolIds));
    // cache farms
    const cacheFarmsData: FarmDexie[] = [];
    cacheFarms.forEach((farm: FarmBoost, index: number) => {
      const farm_id = farm.farm_id;
      cacheFarmsData.push({
        id: index.toString(),
        farm_id,
        pool_id: farm_id.slice(
          farm_id.indexOf("@") + 1,
          farm_id.lastIndexOf("#")
        ),
        status: farm.status,
      });
    });
    db.boostFarms.bulkPut(cacheFarmsData);
    // cache seeds farms pools
    const cacheSeedsFarmsPools: any[] = [];
    list_seeds.forEach((seed: Seed, index: number) => {
      let pool: any = null;
      const [contractId, tempPoolId] = seed.seed_id.split("@");
      if (tempPoolId) {
        if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
          const [fixRange, dcl_pool_id, left_point, right_point] =
            tempPoolId.split("&");
          pool = dcl_all_pools.find((p: IPoolDcl) => {
            if (p.pool_id == dcl_pool_id) return true;
          });
        } else {
          const id = tempPoolId;
          pool = pools.find((p: any) => {
            if (+p.id == +id) return true;
          });
        }
      }
      cacheSeedsFarmsPools.push({
        id: seed.seed_id,
        seed,
        farmList: list_farms[index],
        pool,
      });
    });
    db.cacheBoostSeeds(cacheSeedsFarmsPools);
  };
  const cacheTokenPrices = async (): Promise<any> => {
    const res = await fetch(config.indexerUrl + "/list-token-price", {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/list-token-price"),
      },
    });
    const tokenPriceList = await res.json();
    db.cacheTokenPrices(tokenPriceList);
  };
  const cacheTopPools = async () => {
    const topPools: PoolRPCView[] = await fetch(
      config.indexerUrl + "/list-top-pools",
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          ...getAuthenticationHeaders("/list-top-pools"),
        },
      }
    ).then((res) => res.json());
    db.cacheTopPools(topPools);
    const pools = topPools.map((p) => ({
      ...parsePool(p, p.id),
      Dex: "ref",
    }));
    db.cachePoolsByTokens(
      pools.filter(filterBlackListPools).filter((p: any) => isNotStablePool(p))
    );
  };
  const cacheStablePools = async () => {
    const pending = ALL_STABLE_POOL_IDS.map((pool_id) =>
      getStablePool(+pool_id)
    );
    const stablePools = await Promise.all(pending);
    db.cacheStablePools(stablePools);
  };
  const cacheStableBaseDataPools = async () => {
    const pending = ALL_STABLE_POOL_IDS.map((pool_id) => getPool(+pool_id));
    const stablePools = await Promise.all(pending);
    db.cacheStableBaseDataPools(stablePools);
  };
  const cacheDclPools = async () => {
    const dclPools = await getDclPools();
    db.cacheDclPools(dclPools);
  };

  cacheTokens();
  cacheTopPools();
  cacheStablePools();
  cacheStableBaseDataPools();
  cacheDclPools();
  cacheBoost_Seed_Farms_Pools();
  cacheTokenPrices();
};
