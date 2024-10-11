import getConfig from "@/utils/config";
import db, { BoostSeeds, TokenPrice } from "../db/RefDatabase";
import {
  ONE_YOCTO_NEAR,
  REF_FARM_BOOST_CONTRACT_ID,
  REF_FI_CONTRACT_ID,
  RefFiFunctionCallOptions,
  refFarmBoostFunctionCall,
  refFiViewFunction,
  refSwapV3ViewFunction,
  refFarmViewFunction,
} from "../utils/contract";
import { scientificNotationToString } from "../utils/numbers";
import { executeMultipleTransactions, viewFunction } from "../utils/near";
import { executeFarmMultipleTransactions } from "../utils/contract";
import { getAccountId, getCurrentWallet } from "../utils/wallet";
import { TokenMetadata, ftGetStorageBalance } from "./ft-contract";
import { getPoolsByIds, getTokenPriceList } from "./indexer";
import { getDclPools } from "../services/swap/swapDcl";
import { IPoolDcl } from "../interfaces/swapDcl";
import {
  STORAGE_TO_REGISTER_WITH_MFT,
  storageDepositAction,
} from "./creator/storage";
import { nearMetadata, nearWithdrawTransaction } from "./wrap-near";
import {
  toInternationalCurrencySystem,
  toReadableNumber,
} from "../utils/numbers";
import BigNumber from "bignumber.js";
import { Near, keyStores } from "near-api-js";
import { currentStorageBalanceOfFarm_boost } from "@/stores/account";
import { UserLiquidityInfo } from "./commonV3";
import Big from "big.js";
import { useEffect, useState } from "react";
import { PoolInfo } from "./swapV3";
import { filterSpecialChar } from "../utils/numbers";

const config = getConfig();
const {
  REF_VE_CONTRACT_ID,
  REF_UNI_V3_SWAP_CONTRACT_ID,
  WRAP_NEAR_CONTRACT_ID,
} = config;
export const DEFAULT_PAGE_LIMIT = 300;
const expand = 6;

export const classificationOfCoins_key = [
  "stablecoin",
  "near_ecosystem",
  "bridged_tokens",
  "gaming",
  "nft",
];
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
export interface FarmBoostTerm {
  daily_reward: string;
  reward_token: string;
  start_at: number;
}
export interface FarmBoost {
  amount_of_beneficiary: string;
  claimed_reward: string;
  distributed_at: string;
  distributed_reward: string;
  farm_id: string;
  status: string;
  terms: FarmBoostTerm;
  total_reward: string;
  token_meta_data?: TokenMetadata;
  apr?: string;
  baseApr?: string;
  yourNFTApr?: string;
}

export interface Seed {
  min_deposit: string;
  min_locking_duration_sec: number;
  next_index: number;
  seed_decimal: number;
  seed_id: string;
  slash_rate: number;
  total_seed_amount: string;
  total_seed_power: string;
  farmList?: FarmBoost[];
  pool?: PoolRPCView & PoolInfo;
  seedTvl?: string;
  hidden?: boolean;
  endedFarmsIsSplit?: boolean;
  base?: number;
  token_meta_data?: TokenMetadata;
  farmer_count: number;
}
export interface BoostConfig {
  affected_seeds: Record<string, number>;
  booster_decimal: number;
}

export interface UserSeedInfo {
  boost_ratios: any;
  duration_sec: number;
  free_amount: string;
  shadow_amount: string;
  locked_amount: string;
  unlock_timestamp: string;
  x_locked_amount: string;
}
interface FrontConfigBoost {
  [key: string]: string | number | undefined;
}

export interface Transaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

export interface MonthData {
  text: string;
  m: number;
  day: number;
  second: number;
  rate?: number;
}
interface StakeOptions {
  token_id?: string;
  amount: string;
  msg?: string;
  checkedList?: Record<string, any>;
}

interface StakeOptiones {
  amount: string;
  pool_id?: number;
  amountByTransferInFarm?: string | number;
  seed_id?: string;
  token_id?: string;
  msg?: string;
  checkedList?: Record<string, any>;
}

interface UnStakeOptions {
  seed_id: string;
  unlock_amount: string;
  withdraw_amount: string;
  checkedList?: Record<string, any>;
}

interface UnStakeOptiones {
  seed_id: string;
  unlock_amount: string;
  withdraw_amount: string;
  amountByTransferInFarm?: string | number;
  checkedList?: Record<string, any>;
}

export interface IStakeInfo {
  liquidities: UserLiquidityInfo[];
  total_v_liquidity?: string;
  withdraw_amount?: string;
  canStake?: boolean;
  seed_id?: string;
  checkedList?: Record<string, any>;
}

export const frontConfigBoost: FrontConfigBoost = {
  "4514": 102,
  "4179": 101,
  "79": "100",
  "3": "99",
  "4": "98",
  "phoenix-bonds.near|wrap.near|2000": "97",
};

export async function refFarmBoostViewFunction({
  methodName,
  args,
}: {
  contractId?: string;
  methodName: string;
  args?: object;
}) {
  return viewFunction({
    contractId: REF_FARM_BOOST_CONTRACT_ID,
    methodName,
    args,
  });
}
export const get_unWithDraw_rewards = async () => {
  const accountId = getAccountId();
  return await refFarmBoostViewFunction({
    methodName: "list_farmer_rewards",
    args: { farmer_id: accountId },
  });
};

export const getAllTokenPrices = async (): Promise<
  Record<string, TokenPrice>
> => {
  try {
    let tokenPrices: Record<string, TokenPrice> = {};
    const cacheData = await db.checkTokenPrices();
    if (cacheData) {
      const list: TokenPrice[] = await db.queryTokenPrices();
      list.forEach((price: TokenPrice) => {
        if (price.id) {
          const { id, update_time, ...priceInfo } = price;
          tokenPrices[id] = priceInfo;
        }
      });
      getBoostTokenPricesFromServer();
    } else {
      tokenPrices = await getBoostTokenPricesFromServer();
    }
    return tokenPrices;
  } catch (error) {
    return {};
  }
};

export const getBoostTokenPricesFromServer = async (): Promise<
  Record<string, TokenPrice>
> => {
  try {
    const tokenPrices: Record<string, TokenPrice> = await getTokenPriceList();
    await db.cacheTokenPrices(tokenPrices);
    return tokenPrices;
  } catch (error) {
    return {};
  }
};

export function getFarmClassification(): any {
  const env: string = process.env.NEXT_PUBLIC_NEAR_ENV || "";
  if (env == "pub-testnet") {
    return {
      near: [
        "usdt.fakes.testnet|wrap.testnet|2000",
        "usdt.fakes.testnet|wrap.testnet|100",
        "465",
      ],
      eth: ["phoenix-bonds.testnet|wrap.testnet|2000", "604"],
      stable: ["79"],
      meme: [],
    };
  } else if (env == "testnet") {
    return {
      near: [
        "usdt.fakes.testnet|wrap.testnet|2000",
        "usdt.fakes.testnet|wrap.testnet|100",
        "465",
      ],
      eth: ["phoenix-bonds.testnet|wrap.testnet|2000", "604"],
      stable: ["79"],
      meme: [],
    };
  } else {
    return {
      near: [
        "0",
        "1207",
        "1371",
        "1395",
        "2330",
        "2448",
        "2799",
        "3",
        "3019",
        "3097",
        "3474",
        "3514",
        "3515",
        "3519",
        "377",
        "4",
        "974",
        "1195",
        "1923",
        "3448",
        "553",
        "79",
        "2691",
        "2800",
        "3020",
        "3433",
        "3612",
        "2769",
        "2973",
        "3667",
        "3688",
        "3699",
        "3714",
        "3471",
        "3449",
        "3819",
        "3804",
        "3815",
        "phoenix-bonds.near|wrap.near|2000",
        "4276",
        "4314",
        "3807",
        "4276",
        "4369",
        "4514",
        "4771",
        "4479",
        "4820",
        "3411",
        "4729",
        "5391",
        "3411",
      ],
      eth: [
        "605",
        "1207",
        "2734",
        "1395",
        "1910",
        "2330",
        "2657",
        "2691",
        "2799",
        "2800",
        "3",
        "3020",
        "3433",
        "4",
        "974",
        "3097",
        "3636",
        "3815",
        "3804",
        "3471",
        "4479",
      ],
      stable: [
        "1910",
        "3020",
        "3433",
        "3514",
        "3515",
        "3688",
        "3689",
        "3699",
        "4179",
        "4514",
      ],
      meme: [
        "4314",
        "3807",
        "4276",
        "4369",
        "4771",
        "4820",
        "3411",
        "553",
        "5391",
        "3411",
      ],
    };
  }
}

export const list_seeds_info = async () => {
  return await refFarmBoostViewFunction({
    methodName: "list_seeds_info",
  });
};

export const getBoostSeeds = async (): Promise<{
  seeds: Seed[];
  farms: FarmBoost[][];
  pools: PoolRPCView[] & IPoolDcl[];
}> => {
  try {
    const seeds: Seed[] = [];
    const farms: FarmBoost[][] = [];
    const pools: PoolRPCView[] & IPoolDcl[] = [];
    const cacheData = await db.checkBoostSeeds();
    if (cacheData) {
      const list: BoostSeeds[] = await db.queryBoostSeeds();
      list.forEach((s: BoostSeeds) => {
        const { id, update_time, ...info } = s;
        const { seed, farmList, pool } = info as any;
        seeds.push(seed);
        farms.push(farmList);
        if (pool) {
          pools.push(pool);
        }
      });
      getBoostSeedsFromServer();
      return { seeds, farms, pools };
    } else {
      const result = await getBoostSeedsFromServer();
      return result;
    }
  } catch (error) {
    return { seeds: [], farms: [], pools: [] };
  }
};
export const list_seed_farms = async (seed_id: string) => {
  try {
    return await refFarmBoostViewFunction({
      methodName: "list_seed_farms",
      args: { seed_id },
    });
  } catch {
    return null;
  }
};
export const getBoostSeedsFromServer = async (): Promise<{
  seeds: Seed[];
  farms: FarmBoost[][];
  pools: PoolRPCView[] & IPoolDcl[];
}> => {
  try {
    // get all seeds
    let list_seeds = await list_seeds_info();
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
    const poolIds = new Set<string>();
    const dcl_poolIds = new Set<string>();
    // get all dcl pools
    const dcl_all_pools: IPoolDcl[] = await getDclPools();
    let pools: any[] = [];
    const both_normalPools_dclPools: any[] = [];
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
      farmsPromiseList.push(list_seed_farms(seed_id));
    });
    const list_farms: FarmBoost[][] = await Promise.all(farmsPromiseList);
    let cacheFarms: FarmBoost[] = [];
    list_farms.forEach((arr: FarmBoost[]) => {
      cacheFarms = cacheFarms.concat(arr);
    });
    pools = await getPoolsByIds({ pool_ids: Array.from(poolIds) });
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
      if (pool) {
        both_normalPools_dclPools.push(pool);
      }
    });
    db.cacheBoostSeeds(cacheSeedsFarmsPools);
    return {
      seeds: list_seeds,
      farms: list_farms,
      pools: both_normalPools_dclPools,
    };
  } catch (error) {
    return {
      seeds: [],
      farms: [],
      pools: [],
    };
  }
};

export const list_farmer_seeds = async () => {
  const accountId = getAccountId();
  return await refFarmBoostViewFunction({
    methodName: "list_farmer_seeds",
    args: { farmer_id: accountId },
  });
};

export const get_unclaimed_rewards = async (seed_id: string) => {
  const accountId = getAccountId();
  return await refFarmBoostViewFunction({
    methodName: "get_unclaimed_rewards",
    args: { farmer_id: accountId, seed_id },
  });
};

export const getVeSeedShare = async (): Promise<any> => {
  // REF_VE_CONTRACT_ID
  return await fetch(
    config.sodakiApiUrl + `/seed/v2.ref-finance.near@79/accounts`,
    {
      method: "GET",
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch(() => {
      return {};
    });
};

export const get_config = async () => {
  return await refFarmBoostViewFunction({
    methodName: "get_config",
  });
};

export const claimRewardBySeed_boost = async (
  seed_id: string,
  checkedList: Record<string, any>
): Promise<any> => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "claim_reward_by_seed",
          args: { seed_id },
        },
      ],
    },
  ];

  const { storageDepositTransactions, withdrawRewardTransactions } =
    await buildWithdrawRewardFunctionCalls(checkedList);
  transactions.push(
    ...storageDepositTransactions,
    ...withdrawRewardTransactions
  );

  const nearWithdrawTransactions = buildWithdrawNearTransactions(checkedList);
  transactions.push(...nearWithdrawTransactions);

  return executeMultipleTransactions(transactions, false);
};

export const getPoolIdBySeedId = (seed_id: string) => {
  const [contractId, temp_pool_id] = seed_id.split("@");
  if (temp_pool_id) {
    if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
      const [fixRange, dcl_pool_id, left_point, right_point] =
        temp_pool_id.split("&");
      return dcl_pool_id;
    } else {
      return temp_pool_id;
    }
  }
  return "";
};

export const toRealSymbol = (symbol: string) => {
  symbol = filterSpecialChar(symbol);
  if (!symbol) return "";
  const blackList = ["nUSDO", "nKOK"];

  if (!symbol) return symbol;

  if (symbol === "nWETH" || symbol === "WETH") return "wETH";
  if (symbol === "wNEAR") return "NEAR";
  if (blackList.includes(symbol)) return symbol;
  return symbol?.charAt(0) === "n" &&
    symbol.charAt(1) === symbol.charAt(1).toUpperCase()
    ? symbol.substring(1)
    : symbol;
};

export const getMftTokenId = (id: string) => {
  return ":" + id;
};

export const withdrawAllReward_boost = async (
  checkedList: Record<string, any>
) => {
  const transactions = [];

  const { storageDepositTransactions, withdrawRewardTransactions } =
    await buildWithdrawRewardFunctionCalls(checkedList);
  transactions.push(
    ...storageDepositTransactions,
    ...withdrawRewardTransactions
  );

  const nearWithdrawTransactions = buildWithdrawNearTransactions(checkedList);
  transactions.push(...nearWithdrawTransactions);

  return executeFarmMultipleTransactions(transactions);
};

export const mftGetBalance = async (token_id: string) => {
  const accountId = getAccountId();
  return await refFiViewFunction({
    methodName: "mft_balance_of",
    args: { account_id: accountId, token_id },
  });
};

export const handleNumber = (number: string) => {
  const temp = toInternationalCurrencySystem(number, 3);
  const length = temp.length;
  const left = temp.substring(0, length - 1);
  const right = temp.substring(length - 1);
  let result = temp;
  if (["K", "M", "B"].indexOf(right) > -1) {
    result = new BigNumber(left).toFixed() + right;
  }
  return result;
};

const near = new Near({
  keyStore: new keyStores.InMemoryKeyStore(),
  headers: {},
  ...config,
});

export const getServerTime = async () => {
  const result = await near.connection.provider
    .block({
      finality: "final",
    })
    .catch(() => {
      return {
        header: {
          timestamp: new Date().getTime() * 100000,
        },
      };
    });
  const timestamp = result?.header?.timestamp;
  return timestamp;
};

export const checkTokenNeedsStorageDeposit_boost = async () => {
  let storageNeeded;
  const balance = await currentStorageBalanceOfFarm_boost(getAccountId());

  if (!balance) {
    storageNeeded = "0.1";
  }
  return storageNeeded;
};

export const stake_boost = async ({
  token_id,
  amount,
  msg = "",
  checkedList,
}: StakeOptions) => {
  const transactions: Transaction[] = [];

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "mft_transfer_call",
        args: {
          receiver_id: REF_FARM_BOOST_CONTRACT_ID,
          token_id,
          amount,
          msg,
        },
        amount: ONE_YOCTO_NEAR,
        gas: "180000000000000",
      },
    ],
  });

  const neededStorage = await checkTokenNeedsStorageDeposit_boost();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  const { storageDepositTransactions, withdrawRewardTransactions } =
    await buildWithdrawRewardFunctionCalls(checkedList);
  transactions.push(
    ...storageDepositTransactions,
    ...withdrawRewardTransactions
  );

  const nearWithdrawTransactions = buildWithdrawNearTransactions(checkedList);
  transactions.push(...nearWithdrawTransactions);

  return executeFarmMultipleTransactions(transactions);
};

export const unStake_boost = async ({
  seed_id,
  unlock_amount,
  withdraw_amount,
  checkedList,
}: UnStakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "unlock_and_withdraw_seed",
          args: {
            seed_id,
            unlock_amount,
            withdraw_amount,
          },
          amount: ONE_YOCTO_NEAR,
          gas: "200000000000000",
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit_boost();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  if (checkedList) {
    const { storageDepositTransactions, withdrawRewardTransactions } =
      await buildWithdrawRewardFunctionCalls(checkedList);
    transactions.push(
      ...storageDepositTransactions,
      ...withdrawRewardTransactions
    );

    const nearWithdrawTransactions = buildWithdrawNearTransactions(checkedList);
    transactions.push(...nearWithdrawTransactions);
  }

  return executeFarmMultipleTransactions(transactions);
};

export const list_liquidities = async () => {
  const res = await refSwapV3ViewFunction({
    methodName: "list_liquidities",
    args: {
      account_id: getAccountId(),
    },
  });
  return res.filter(
    //@ts-ignore
    (item: any) => !getConfig().DCL_POOL_BLACK_LIST.includes(item.pool_id)
  );
};

export const dcl_mft_balance_of = (token_id: string) => {
  return refSwapV3ViewFunction({
    methodName: "mft_balance_of",
    args: {
      token_id,
      account_id: getAccountId(),
    },
  });
};

function liquidity_is_in_other_seed(seed_id: string, mft_id: string) {
  const [contractId, temp_pool_id] = seed_id.split("@");
  const [fixRange_s, pool_id_s, left_point_s, right_point_s] =
    temp_pool_id.split("&");
  const [fixRange_l, pool_id_l, left_point_l, right_point_l] =
    mft_id.split("&");
  const is_in_other_seed =
    left_point_s != left_point_l || right_point_s != right_point_l;
  return is_in_other_seed;
}

export const batch_stake_boost_nft = async ({
  liquidities,
  total_v_liquidity,
  withdraw_amount,
  seed_id,
  checkedList,
}: IStakeInfo) => {
  let need_split = false;
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  if (selectedWalletId == "ledger") {
    need_split = true;
  }
  const max_length = 2;
  if (!seed_id) {
    return;
  }
  const [contractId, temp_pool_id] = seed_id.split("@");
  const [fixRange, dcl_pool_id, left_point, right_point] =
    temp_pool_id.split("&");
  const transactions: Transaction[] = [];
  const mint_infos: any[] = [];
  if (!withdraw_amount) {
    return;
  }
  liquidities.forEach((l: UserLiquidityInfo) => {
    const { lpt_id, mft_id } = l;
    const functionCalls: any = [];
    if (!mft_id) {
      mint_infos.push([lpt_id, JSON.parse(fixRange)]);
    } else if (liquidity_is_in_other_seed(seed_id, mft_id)) {
      functionCalls.push(
        {
          methodName: "burn_v_liquidity",
          args: {
            lpt_id,
          },
          gas: "60000000000000",
        },
        {
          methodName: "mint_v_liquidity",
          args: {
            lpt_id,
            dcl_farming_type: JSON.parse(fixRange),
          },
          gas: "60000000000000",
        }
      );
    } else if (Big(withdraw_amount).gt(0)) {
      transactions.push({
        receiverId: REF_FARM_BOOST_CONTRACT_ID,
        functionCalls: [
          {
            methodName: "unlock_and_withdraw_seed",
            args: {
              seed_id,
              unlock_amount: "0",
              withdraw_amount,
            },
            amount: ONE_YOCTO_NEAR,
            gas: "200000000000000",
          },
        ],
      });
    }
    if (functionCalls.length > 0) {
      transactions.push({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls,
      });
    }
  });
  if (mint_infos.length) {
    if (need_split) {
      const num = Math.ceil(mint_infos.length / max_length);
      for (let i = 0; i < num; i++) {
        const startIndex = i * max_length;
        const endIndex = startIndex + max_length;
        const mint_infos_i = mint_infos.slice(startIndex, endIndex);
        transactions.push({
          receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
          functionCalls: [
            {
              methodName: "batch_mint_v_liquidity",
              args: { mint_infos: mint_infos_i },
              gas: "200000000000000",
            },
          ],
        });
      }
    } else {
      transactions.push({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls: [
          {
            methodName: "batch_mint_v_liquidity",
            args: { mint_infos },
            gas: "200000000000000",
          },
        ],
      });
    }
  }
  transactions.push({
    receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "mft_transfer_call",
        args: {
          receiver_id: REF_FARM_BOOST_CONTRACT_ID,
          token_id: `:${temp_pool_id}`,
          amount: total_v_liquidity,
          msg: JSON.stringify("Free"),
        },
        amount: ONE_YOCTO_NEAR,
        gas: "180000000000000",
      },
    ],
  });
  const neededStorage = await checkTokenNeedsStorageDeposit_boost();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  if (checkedList) {
    const { storageDepositTransactions, withdrawRewardTransactions } =
      await buildWithdrawRewardFunctionCalls(checkedList);
    transactions.push(
      ...storageDepositTransactions,
      ...withdrawRewardTransactions
    );

    const nearWithdrawTransactions = buildWithdrawNearTransactions(checkedList);
    transactions.push(...nearWithdrawTransactions);
  }

  return executeFarmMultipleTransactions(transactions);
};

export const batch_unStake_boost_nft = async ({
  seed_id,
  withdraw_amount,
  liquidities,
  checkedList,
}: IStakeInfo) => {
  let need_split = false;
  const max_length = 2;
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  if (selectedWalletId == "ledger") {
    need_split = true;
  }
  const transactions: Transaction[] = [];
  if (
    withdraw_amount !== undefined &&
    new BigNumber(withdraw_amount).isGreaterThan("0")
  ) {
    transactions.push({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "unlock_and_withdraw_seed",
          args: {
            seed_id,
            unlock_amount: "0",
            withdraw_amount,
          },
          amount: ONE_YOCTO_NEAR,
          gas: "200000000000000",
        },
      ],
    });
  }
  const lpt_ids: string[] = [];
  liquidities.forEach((l: UserLiquidityInfo) => {
    if (l.lpt_id !== undefined) {
      lpt_ids.push(l.lpt_id);
    }
  });
  if (lpt_ids.length) {
    if (need_split) {
      const num = Math.ceil(lpt_ids.length / max_length);
      for (let i = 0; i < num; i++) {
        const startIndex = i * max_length;
        const endIndex = startIndex + max_length;
        const lpt_ids_i = lpt_ids.slice(startIndex, endIndex);
        transactions.push({
          receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
          functionCalls: [
            {
              methodName: "batch_burn_v_liquidity",
              args: {
                lpt_ids: lpt_ids_i,
              },
              gas: "250000000000000",
            },
          ],
        });
      }
    } else {
      transactions.push({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls: [
          {
            methodName: "batch_burn_v_liquidity",
            args: {
              lpt_ids,
            },
            gas: "250000000000000",
          },
        ],
      });
    }
  }
  const neededStorage = await checkTokenNeedsStorageDeposit_boost();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  if (checkedList) {
    const { storageDepositTransactions, withdrawRewardTransactions } =
      await buildWithdrawRewardFunctionCalls(checkedList);
    transactions.push(
      ...storageDepositTransactions,
      ...withdrawRewardTransactions
    );

    const nearWithdrawTransactions = buildWithdrawNearTransactions(checkedList);
    transactions.push(...nearWithdrawTransactions);
  }

  return executeFarmMultipleTransactions(transactions);
};

export const getBoostTokenPrices = async (): Promise<
  Record<string, TokenPrice>
> => {
  try {
    let tokenPrices: Record<string, TokenPrice> = {};
    const cacheData = await db.checkTokenPrices();
    if (cacheData) {
      const list: TokenPrice[] = await db.queryTokenPrices();
      list.forEach((price: TokenPrice) => {
        const { id, update_time, ...priceInfo } = price;
        tokenPrices[id || ""] = priceInfo;
      });
      getBoostTokenPricesFromServer();
    } else {
      tokenPrices = await getBoostTokenPricesFromServer();
    }
    return tokenPrices;
  } catch (error) {
    return {};
  }
};

export const getStakedListByAccountId = async ({
  accountId = getAccountId(),
}) => {
  const [stakedList, v2StakedList] = await Promise.all([
    refFarmViewFunction({
      methodName: "list_user_seeds",
      args: { account_id: accountId },
    }),
    list_farmer_seeds().then((res) => {
      Object.keys(res).forEach((seed) => {
        res[seed] = scientificNotationToString(
          new Big(res[seed]?.free_amount || 0)
            .plus(new Big(res[seed]?.locked_amount || 0))
            .toString()
        );
      });

      return res;
    }),
  ]);
  const finalStakeSeedList = new Array(
    ...new Set(Object.keys(stakedList).concat(Object.keys(v2StakedList)))
  );

  const finalStakeList: any = {};
  finalStakeSeedList.forEach((seed) => {
    finalStakeList[seed] = scientificNotationToString(
      new BigNumber(stakedList[seed] || 0)
        .plus(new BigNumber(v2StakedList[seed] || 0))
        .toString()
    );
  });

  return { finalStakeList, v2StakedList, stakedList };
};

export const get_seed = async (seed_id: string) => {
  return await refFarmBoostViewFunction({
    methodName: "get_seed",
    args: { seed_id },
  });
};

export const useAllFarms = () => {
  const [v1Farm, setV1Farm] = useState<any>();
  const [v2Farm, setV2Farm] = useState<any>();

  const getAllFarms = async (version: "v1" | "v2") => {
    if (version === "v1") {
      return await db.queryFarms();
    } else if (version === "v2") {
      return await db.queryBoostFarms();
    }
  };

  useEffect(() => {
    getAllFarms("v1").then(setV1Farm);
    getAllFarms("v2").then(setV2Farm);
  }, []);

  return {
    v1Farm,
    v2Farm,
  };
};

export const checkFarmStake = ({
  poolId,
  stakeList,
}: {
  poolId: number;
  stakeList: Record<string, string>;
}) => {
  const farmStake: string | number = "0";

  const seedIdList: string[] = Object.keys(stakeList);
  let tempFarmStake: string | number = "0";
  seedIdList.forEach((seed) => {
    const id = Number(seed.split("@")[1]);
    if (id == poolId) {
      tempFarmStake = BigNumber.sum(farmStake, stakeList[seed]).valueOf();
    }
  });

  return tempFarmStake;
};

export const get_shadow_records = () => {
  return refFiViewFunction({
    methodName: "get_shadow_records",
    args: { account_id: getAccountId() },
  });
};

export const stake_boost_shadow = async ({
  pool_id,
  amount,
  amountByTransferInFarm,
  seed_id,
  checkedList,
}: StakeOptiones) => {
  const transactions: Transaction[] = [];
  let toFarmingAmount = amount;
  if (amountByTransferInFarm && Big(amountByTransferInFarm).gt(0)) {
    toFarmingAmount = Big(toFarmingAmount)
      .plus(amountByTransferInFarm)
      .toFixed();
    transactions.push({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "unlock_and_withdraw_seed",
          args: {
            seed_id,
            unlock_amount: "0",
            withdraw_amount: amountByTransferInFarm,
          },
          amount: ONE_YOCTO_NEAR,
          gas: "200000000000000",
        },
      ],
    });
  }
  const shadowRecords = await get_shadow_records();
  if (pool_id) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "shadow_action",
          args: {
            action: "ToFarming",
            pool_id,
            amount: toFarmingAmount,
            msg: "",
          },
          amount: shadowRecords[pool_id] ? ONE_YOCTO_NEAR : "0.01",
          gas: "300000000000000",
        },
      ],
    });
  }

  const neededStorage = await checkTokenNeedsStorageDeposit_boost();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  const { storageDepositTransactions, withdrawRewardTransactions } =
    await buildWithdrawRewardFunctionCalls(checkedList);
  transactions.push(
    ...storageDepositTransactions,
    ...withdrawRewardTransactions
  );

  const nearWithdrawTransactions = buildWithdrawNearTransactions(checkedList);
  transactions.push(...nearWithdrawTransactions);

  return executeFarmMultipleTransactions(transactions);
};

export const unStake_boost_shadow = async ({
  seed_id,
  unlock_amount,
  withdraw_amount,
  amountByTransferInFarm,
  checkedList,
}: UnStakeOptiones) => {
  const transactions: Transaction[] = [];
  if (amountByTransferInFarm && Big(amountByTransferInFarm).gt(0)) {
    transactions.push({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "unlock_and_withdraw_seed",
          args: {
            seed_id,
            unlock_amount,
            withdraw_amount: amountByTransferInFarm,
          },
          amount: ONE_YOCTO_NEAR,
          gas: "200000000000000",
        },
      ],
    });
  }
  const pool_id = +seed_id.split("@")[1];
  if (
    amountByTransferInFarm &&
    Big(withdraw_amount).gt(amountByTransferInFarm)
  ) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "shadow_action",
          args: {
            action: "FromFarming",
            pool_id,
            amount: Big(withdraw_amount)
              .minus(amountByTransferInFarm)
              .toFixed(0),
            msg: "",
          },
          amount: ONE_YOCTO_NEAR,
          gas: "300000000000000",
        },
      ],
    });
  } else if (
    amountByTransferInFarm &&
    Big(withdraw_amount).lt(amountByTransferInFarm)
  ) {
    const shadowRecords = await get_shadow_records();
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "shadow_action",
          args: {
            action: "ToFarming",
            pool_id,
            amount: Big(amountByTransferInFarm)
              .minus(withdraw_amount)
              .toFixed(0),
            msg: "",
          },
          amount: shadowRecords[pool_id] ? ONE_YOCTO_NEAR : "0.003",
          gas: "300000000000000",
        },
      ],
    });
  }
  const neededStorage = await checkTokenNeedsStorageDeposit_boost();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  if (checkedList) {
    const { storageDepositTransactions, withdrawRewardTransactions } =
      await buildWithdrawRewardFunctionCalls(checkedList);
    transactions.push(
      ...storageDepositTransactions,
      ...withdrawRewardTransactions
    );

    const nearWithdrawTransactions = buildWithdrawNearTransactions(checkedList);
    transactions.push(...nearWithdrawTransactions);
  }

  return executeFarmMultipleTransactions(transactions);
};

const buildWithdrawNearTransactions = (checkedList) => {
  const transactions = [];

  if (Object.keys(checkedList).includes(WRAP_NEAR_CONTRACT_ID)) {
    sessionStorage.setItem("near_with_draw_source", "farm_token");
    transactions.push(
      nearWithdrawTransaction(
        toReadableNumber(
          nearMetadata.decimals,
          checkedList[WRAP_NEAR_CONTRACT_ID].value
        )
      )
    );
  }

  return transactions;
};

const buildWithdrawRewardFunctionCalls = async (checkedList) => {
  const token_id_list = Object.keys(checkedList);
  const ftBalancePromiseList = [];
  const functionCallsList = [];

  // Group withdraw_reward function calls into chunks of 4
  for (let i = 0; i < token_id_list.length; i += 4) {
    const functionCalls = [];
    for (let j = i; j < i + 4 && j < token_id_list.length; j++) {
      const token_id = token_id_list[j];
      const ftBalance = ftGetStorageBalance(token_id);
      ftBalancePromiseList.push(ftBalance);
      functionCalls.push({
        methodName: "withdraw_reward",
        args: {
          token_id,
        },
        gas: "50000000000000",
      });
    }
    functionCallsList.push(functionCalls);
  }

  const resolvedBalanceList = await Promise.all(ftBalancePromiseList);
  const storageDepositTransactions = resolvedBalanceList
    .map((ftBalance, index) => {
      if (!ftBalance) {
        const token_id = token_id_list[index];
        return {
          receiverId: token_id,
          functionCalls: [
            storageDepositAction({
              registrationOnly: true,
              amount: STORAGE_TO_REGISTER_WITH_MFT,
            }),
          ],
        };
      }
      return null;
    })
    .filter(Boolean);

  const withdrawRewardTransactions = functionCallsList.map((functionCalls) => ({
    receiverId: REF_FARM_BOOST_CONTRACT_ID,
    functionCalls,
  }));

  return { storageDepositTransactions, withdrawRewardTransactions };
};
