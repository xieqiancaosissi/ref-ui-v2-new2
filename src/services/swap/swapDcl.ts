import { refSwapV3ViewFunction } from "@/utils/contract";
import { TokenMetadata } from "@/services/ft-contract";
import { IPoolDcl } from "@/interfaces/swapDcl";
import getConfig from "@/utils/config";
import { getV3PoolId } from "./swapDclUtils";
import { toNonDivisibleNumber } from "@/utils/numbers";
import db from "@/db/RefDatabase";
const { DCL_POOL_BLACK_LIST } = getConfig();
export const getDclPools = async () => {
  const res = await refSwapV3ViewFunction({
    methodName: "list_pools",
  });

  return res.filter((p: any) => !DCL_POOL_BLACK_LIST.includes(p?.pool_id));
};

export const fetchDclPoolsAndCacheData = async () => {
  const dclPools = await getDclPools();
  db.cacheDclPools(dclPools);
  return dclPools;
};

export const getAllDclPoolsFromCache = async (): Promise<IPoolDcl[]> => {
  const isLatest = await db.checkDclPools();
  if (isLatest) {
    return await db.queryDclPools();
  } else {
    return await fetchDclPoolsAndCacheData();
  }
};
export const getDclPoolByIdFromCache = async (dcl_pool_id: string) => {
  const allDclPools = await getAllDclPoolsFromCache();
  return allDclPools.find((dclPool) => dclPool.pool_id == dcl_pool_id);
};
export const quote = async ({
  pool_ids,
  input_amount,
  input_token,
  output_token,
  tag,
}: {
  pool_ids: string[];
  input_token: TokenMetadata;
  output_token: TokenMetadata;
  input_amount: string;
  tag?: string;
}) => {
  return refSwapV3ViewFunction({
    methodName: "quote",
    args: {
      pool_ids,
      input_token: input_token.id,
      output_token: output_token.id,
      input_amount: toNonDivisibleNumber(input_token.decimals, input_amount),
      tag,
    },
  }).catch(() => {
    return {
      amount: "0",
      tag: null,
    };
  });
};
export const getQuote = async ({
  fee,
  tokenIn,
  tokenOut,
  tokenInAmount,
  allDCLPools,
}: {
  fee: number;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenInAmount: string;
  allDCLPools: IPoolDcl[];
}) => {
  const pool_id = getV3PoolId(tokenIn.id, tokenOut.id, fee);

  const foundPool = allDCLPools.find((p) => p.pool_id === pool_id);

  const validator =
    foundPool &&
    Number(foundPool?.total_x || 0) + Number(foundPool?.total_y || 0) > 0;

  if (!validator) return null;

  if (foundPool && foundPool.state === "Paused") return null;

  if (getConfig().DCL_POOL_BLACK_LIST.includes(pool_id)) return null;

  return quote({
    pool_ids: [pool_id],
    input_token: tokenIn,
    output_token: tokenOut,
    input_amount: tokenInAmount,
    tag: `${tokenIn.id}|${fee}|${tokenInAmount}`,
  }).catch((e) => null);
};
