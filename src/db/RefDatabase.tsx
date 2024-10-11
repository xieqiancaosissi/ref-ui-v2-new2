import Dexie from "dexie";
import _ from "lodash";
import moment from "moment";
import {
  PoolRPCView,
  Pool,
  IPoolsByTokens,
  StablePool,
} from "@/interfaces/swap";
import { IPoolDcl } from "@/interfaces/swapDcl";
import { parsePoolsByTokens } from "@/services/swap/swapUtils";
import { FarmBoost, Seed } from "@/services/farm";
import { TOP_POOLS_TOKEN_REFRESH_INTERVAL } from "@/utils/constant";

import getConfig from "../utils/config";
const checkCacheSeconds = 300;
interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  isRisk?: boolean;
}

export interface FarmDexie {
  id: string;
  farm_id: string;
  pool_id: string;
  status: string;
}

export interface TokenPrice {
  id?: string;
  decimal: number;
  price: string;
  symbol: string;
  update_time?: number;
}

export interface BoostSeeds {
  id?: string;
  seed: Seed;
  farmList: FarmBoost[];
  pool: PoolRPCView;
  update_time?: number;
}
export interface WatchList {
  id: string;
  account: string;
  pool_id: string;
  update_time: number;
}

class RefDatabase extends Dexie {
  public tokens: Dexie.Table<TokenMetadata>;
  public poolsTokens: Dexie.Table<IPoolsByTokens>;
  public topPools: Dexie.Table<PoolRPCView>;
  public boostFarms: Dexie.Table<FarmDexie>;
  public tokenPrices: Dexie.Table<TokenPrice>;
  public boostSeeds: Dexie.Table<BoostSeeds>;
  public stablePools: Dexie.Table<StablePool>;
  public stableBaseDataPools: Dexie.Table<PoolRPCView>;
  public dclPools: Dexie.Table<IPoolDcl & { id: string }>;
  public watchList: Dexie.Table<WatchList>;

  public constructor() {
    super("RefDatabase");

    this.version(1.0).stores({
      tokens: "id",
      pools_tokens: "id",
      topPools: "id",
      boostFarms: "id",
      tokenPrices: "id",
      boostSeeds: "id",
      stablePools: "id",
      stableBaseDataPools: "id",
      dclPools: "id",
      watchList: "id, account, pool_id, update_time",
    });

    this.tokens = this.table("tokens");
    this.poolsTokens = this.table("pools_tokens");
    this.topPools = this.table("topPools");
    this.boostFarms = this.table("boostFarms");
    this.tokenPrices = this.table("tokenPrices");
    this.boostSeeds = this.table("boostSeeds");
    this.stablePools = this.table("stablePools");
    this.stableBaseDataPools = this.table("stableBaseDataPools");
    this.dclPools = this.table("dclPools");
    this.watchList = this.table("watchList");
  }
  public allWatchList() {
    return this.watchList;
  }

  public allTokens() {
    return this.tokens;
  }

  public allPoolsTokens() {
    return this.poolsTokens;
  }

  public allTopPools() {
    return this.topPools;
  }
  public allBoostFarms() {
    return this.boostFarms;
  }
  public allBoostSeeds() {
    return this.boostSeeds;
  }

  public searchPools(args: any, pools: IPoolsByTokens[]): IPoolsByTokens[] {
    if (args.tokenName === "") return pools;
    return _.filter(pools, (pool: IPoolsByTokens) => {
      return (
        _.includes(pool.token1Id, args.tokenName) ||
        _.includes(pool.token2Id, args.tokenName)
      );
    });
  }

  public orderPools(args: any, pools: IPoolsByTokens[]): IPoolsByTokens[] {
    return _.orderBy(pools, [args.column], [args.order]);
  }

  public paginationPools(args: any, pools: IPoolsByTokens[]): IPoolsByTokens[] {
    return _.slice(
      pools,
      (args.page - 1) * args.perPage,
      args.page * args.perPage
    );
  }

  public uniquePools(args: any, pools: IPoolsByTokens[]): IPoolsByTokens[] {
    if (!args.uniquePairName) return pools;
    let obj: any[];
    return pools.reduce(
      (cur: any[], next: { token1Id: any; token2Id: any }) => {
        const pair_name: any = `${next.token1Id}--${next.token1Id}`;
        obj[pair_name] ? "" : (obj[pair_name] = true && cur.push(next));
        return cur;
      },
      []
    );
  }

  public async queryPools(args: any) {
    const pools = await this.allPoolsTokens().toArray();
    return this.paginationPools(
      args,
      this.orderPools(
        args,
        this.uniquePools(args, this.searchPools(args, pools))
      )
    );
  }

  public searchTokens(args: any, tokens: TokenMetadata[]): TokenMetadata[] {
    if (args.tokenName === "") return tokens;
    return _.filter(tokens, (token: TokenMetadata) => {
      return _.includes(token.name, args.tokenName);
    });
  }

  public async queryTokens(args: any) {
    const tokens = await this.allTokens().toArray();
    return this.searchTokens(args, tokens);
  }
  public async queryAllTokens() {
    const tokens = await this.allTokens().toArray();
    return tokens;
  }

  public async queryFarms() {
    const farms = await this.allBoostFarms().toArray();
    return farms;
  }

  public async checkPoolsByTokens(
    tokenInId: string,
    tokenOutId: string,
    forAurora?: boolean
  ) {
    let itemsTimeLimit = await this.queryPoolsByTokensTimeLimit(
      tokenInId,
      tokenOutId
    );

    if (forAurora) {
      itemsTimeLimit = itemsTimeLimit.filter((p) => p?.Dex === "tri");
    }

    let items = await this.queryPoolsByTokens(tokenInId, tokenOutId);

    if (forAurora) {
      items = items.filter((p) => p?.Dex === "tri");
    }

    return [items.length > 0, itemsTimeLimit.length > 0];
  }

  public async getAllPoolsTokens() {
    const items = await this.allPoolsTokens().toArray();

    return items.map((item) => ({
      id: item.id,
      fee: item.fee,
      tokenIds: [item.token1Id, item.token2Id],
      supplies: {
        [item.token1Id]: item.token1Supply,
        [item.token2Id]: item.token2Supply,
      },
      Dex: item.Dex,
      shareSupply: item.shares,
      tvl: item.tvl,
    }));
  }

  public async getPoolsByTokens(
    tokenInId: string,
    tokenOutId: string,
    forAurora?: boolean
  ) {
    let items = await this.queryPoolsByTokens(tokenInId, tokenOutId);

    if (forAurora) {
      items = items.filter((p) => p?.Dex === "tri");
    }

    return items.map((item) => ({
      id: item.id,
      fee: item.fee,
      tokenIds: [item.token1Id, item.token2Id],
      supplies: {
        [item.token1Id]: item.token1Supply,
        [item.token2Id]: item.token2Supply,
      },
      Dex: item.Dex,
      pairAdd: item?.pairAdd,
    }));
  }

  async queryPoolsByTokensTimeLimit(tokenInId: string, tokenOutId: string) {
    const normalItems = await this.poolsTokens
      .where("token1Id")
      .equals(tokenInId.toString())
      .and((item) => item.token2Id === tokenOutId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();
    const reverseItems = await this.poolsTokens
      .where("token1Id")
      .equals(tokenOutId.toString())
      .and((item) => item.token2Id === tokenInId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();

    return [...normalItems, ...reverseItems];
  }

  async queryPoolsByTokens(tokenInId: string, tokenOutId: string) {
    const normalItems = await this.poolsTokens
      .where("token1Id")
      .equals(tokenInId.toString())
      .and((item) => item.token2Id === tokenOutId.toString())
      .toArray();
    const reverseItems = await this.poolsTokens
      .where("token1Id")
      .equals(tokenOutId.toString())
      .and((item) => item.token2Id === tokenInId.toString())
      .toArray();

    return [...normalItems, ...reverseItems];
  }

  async queryAllPoolsByTokens() {
    const normalItems = await this.poolsTokens.toArray();

    return normalItems;
  }
  public async queryTopPools() {
    const pools = await this.topPools.toArray();

    return pools.map((pool) => {
      const { update_time, ...poolInfo } = pool;
      return poolInfo;
    });
  }

  public async queryWatchList() {
    const pools = await this.watchList.toArray();

    return pools;
  }

  public async queryTopPoolById(poolId: string) {
    const pool = (await this.topPools.where("id").equals(poolId).toArray())[0];
    const { update_time, ...poolInfo } = pool;
    return poolInfo;
  }
  public async queryStableBaseDataPoolById(poolId: string) {
    const pool = (
      await this.stableBaseDataPools
        .where("id")
        .equals(Number(poolId))
        .toArray()
    )[0];
    const { update_time, ...poolInfo } = pool;
    return poolInfo;
  }
  public async queryStablePools() {
    const pools = await this.stablePools.toArray();

    return pools.map((pool) => {
      const { update_time, ...poolInfo } = pool;
      return poolInfo;
    });
  }
  public async queryStableBaseDataPools() {
    const pools = await this.stableBaseDataPools.toArray();

    return pools.map((pool) => {
      const { update_time, ...poolInfo } = pool;
      return poolInfo;
    });
  }
  public async queryStablePoolById(stablePoolId: string) {
    const stablePool = (
      await this.stablePools.where("id").equals(Number(stablePoolId)).toArray()
    )[0];
    const { update_time, ...poolInfo } = stablePool;
    return poolInfo;
  }
  public async queryPoolsBytoken(tokenId: string) {
    const normalItems = await this.poolsTokens
      .where("token1Id")
      .equals(tokenId)
      .toArray();
    const reverseItems = await this.poolsTokens
      .where("token2Id")
      .equals(tokenId)
      .toArray();

    return [...normalItems, ...reverseItems].map((item) => ({
      id: item.id,
      fee: item.fee,
      tokenIds: [item.token1Id, item.token2Id],
      supplies: {
        [item.token1Id]: item.token1Supply,
        [item.token2Id]: item.token2Supply,
      },
      tvl: 0,
      shareSupply: item.shares,
    }));
  }
  public async queryBoostFarms() {
    const farms = await this.allBoostFarms().toArray();
    return farms;
  }
  public async queryTokenPrices() {
    return await this.tokenPrices.toArray();
  }
  public async queryBoostSeeds() {
    return await this.boostSeeds.toArray();
  }

  public async queryBoostSeedsBySeeds(seeds: string[]) {
    return (
      await this.boostSeeds
        .filter((seed) => seeds.includes(seed.id || ""))
        .toArray()
    ).reduce((acc, cur, i) => {
      return {
        ...acc,
        [(cur as any).id]: cur,
      };
    }, {});
  }
  public async queryDclPools() {
    const dclPools = await this.dclPools.toArray();
    return dclPools.map((pool) => {
      const { update_time, id, ...dclPoolInfo } = pool;
      return dclPoolInfo;
    });
  }
  public async checkTopPools() {
    const pools = await this.topPools.limit(10).toArray();
    return (
      pools.length > 0 &&
      pools.every(
        (pool) =>
          Number(pool.update_time) >=
          Number(moment().unix()) - Number(TOP_POOLS_TOKEN_REFRESH_INTERVAL)
      )
    );
  }
  public async checkTokenPrices() {
    try {
      const priceList = await this.tokenPrices.limit(2)?.toArray();
      return (
        priceList?.length > 0 &&
        priceList.every(
          (price) =>
            Number(price.update_time) >=
            Number(moment().unix()) - checkCacheSeconds
        )
      );
    } catch (error) {}
  }
  public async checkBoostSeeds() {
    const boostSeeds = await this.boostSeeds.limit(2).toArray();
    return (
      boostSeeds.length > 0 &&
      boostSeeds.every(
        (boostSeed) =>
          Number(boostSeed.update_time) >=
          Number(moment().unix()) - checkCacheSeconds
      )
    );
  }
  public async checkDclPools() {
    const pools = await this.dclPools.limit(10).toArray();
    return (
      pools.length > 0 &&
      pools.every(
        (pool) =>
          Number(pool.update_time) >=
          Number(moment().unix()) - Number(TOP_POOLS_TOKEN_REFRESH_INTERVAL)
      )
    );
  }
  public async checkStablePools() {
    const pools = await this.stablePools.limit(10).toArray();
    return (
      pools.length > 0 &&
      pools.every(
        (pool) =>
          Number(pool.update_time) >=
          Number(moment().unix()) - Number(TOP_POOLS_TOKEN_REFRESH_INTERVAL)
      )
    );
  }
  public async checkStableBaseDataPools() {
    const pools = await this.stableBaseDataPools.limit(10).toArray();
    return (
      pools.length > 0 &&
      pools.every(
        (pool) =>
          Number(pool.update_time) >=
          Number(moment().unix()) - Number(TOP_POOLS_TOKEN_REFRESH_INTERVAL)
      )
    );
  }
  public async cacheTokenPrices(tokenPriceMap: Record<string, TokenPrice>) {
    // await this.tokenPrices.clear();
    const cacheData: TokenPrice[] = [];
    const tokenIds = Object.keys(tokenPriceMap);
    tokenIds.forEach((tokenId: string) => {
      cacheData.push({
        ...tokenPriceMap[tokenId],
        id: tokenId,
        update_time: moment().unix(),
      });
    });
    this.tokenPrices.bulkPut(cacheData);
  }
  public async cacheBoostSeeds(boostSeeds: BoostSeeds[]) {
    // await this.boostSeeds.clear();
    await this.boostSeeds.bulkPut(
      boostSeeds.map((boostSeed: BoostSeeds) => ({
        ...boostSeed,
        update_time: moment().unix(),
      }))
    );
  }
  public async cacheTopPools(pools: PoolRPCView[]) {
    await this.topPools.clear();
    await this.topPools.bulkPut(
      pools.map((topPool: PoolRPCView) => ({
        ...topPool,
        id: topPool.id,
        update_time: moment().unix(),
        token1Id: topPool.token_account_ids[0],
        token2Id: topPool.token_account_ids[1],
      }))
    );
  }
  public async cachePoolsByTokens(pools: Pool[]) {
    // await this.poolsTokens.clear();
    const filtered_pools = pools.filter(function (pool: Pool) {
      return pool.tokenIds.length < 3;
    });
    const parsed_pools = parsePoolsByTokens(filtered_pools);
    await this.poolsTokens.bulkPut(parsed_pools);
  }
  public async cacheStablePools(pools: StablePool[]) {
    await this.stablePools.clear();
    await this.stablePools.bulkPut(
      pools.map((stablePool: StablePool) => ({
        ...stablePool,
        id: stablePool.id,
        update_time: moment().unix(),
      }))
    );
  }
  public async cacheStableBaseDataPools(pools: PoolRPCView[]) {
    await this.stableBaseDataPools.clear();
    await this.stableBaseDataPools.bulkPut(
      pools.map((stablePool: PoolRPCView) => ({
        ...stablePool,
        id: stablePool.id,
        update_time: moment().unix(),
      }))
    );
  }
  public async cacheDclPools(pools: IPoolDcl[]) {
    await this.dclPools.clear();
    await this.dclPools.bulkPut(
      pools.map((dclPool: IPoolDcl) => ({
        ...dclPool,
        id: dclPool.pool_id,
        update_time: moment().unix(),
      }))
    );
  }
  public async checkPoolsTokens() {
    const items = await this.poolsTokens.limit(10).toArray();
    return (
      items.length > 0 &&
      items.every(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) - Number(TOP_POOLS_TOKEN_REFRESH_INTERVAL)
      )
    );
  }
}
export default new RefDatabase();
