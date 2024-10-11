import getConfig from "@/utils/config";
const config = getConfig();
export const BLACKLIST_POOL_IDS = config.BLACKLIST_POOL_IDS;

export const filterBlackListPools = (pool: any & { id: any }) =>
  !BLACKLIST_POOL_IDS.includes(pool.id.toString());
