import BigNumber from "bignumber.js";
import { useState, useEffect, useCallback } from "react";
import { usePoolStore } from "@/stores/pool";
import { useAccountStore } from "@/stores/account";
import {
  getSearchResult,
  getClassicPoolSwapRecentTransaction,
  getClassicPoolLiquidtyRecentTransaction,
} from "@/services/pool";
import { ftGetTokenMetadata } from "@/services/token";
import {
  DCLPoolSwapTransaction,
  DCLPoolLiquidtyRecentTransaction,
  LimitOrderRecentTransaction,
  getDCLPoolSwapRecentTransaction,
  getDCLPoolLiquidtyRecentTransaction,
  getLimitOrderRecentTransaction,
} from "@/services/indexer";
import { getPoolDetails } from "@/services/pool_detail";
import { getSharesInPool } from "@/services/pool";
import { getStakedListByAccountId } from "@/services/farm";
import _ from "lodash";

import { PoolInfo } from "@/services/swapV3";
import { getAllTokenPrices } from "@/services/farm";
import { toReadableNumber } from "@/utils/numbers";
import getConfigV2 from "@/utils/configV2";
import getConfig from "@/utils/config";
import { refSwapV3ViewFunction } from "@/utils/contract";
import { useSwapStore } from "@/stores/swap";
import { StablePool } from "@/interfaces/swap";
import { getRemoveLiquidityByTokens } from "./useStableShares";
import { list_seed_farms } from "@/services/farm";
import { useTokenPriceList } from "./useTokenPriceList";
import { Pool } from "@/interfaces/swap";
import { isStablePool } from "@/services/swap/swapUtils";
import { getStablePoolDecimal } from "@/services/swap/swapUtils";
import db from "@/db/RefDatabase";
import { get_seed } from "@/services/farm";
import { get24hVolumes } from "@/services/indexer";
import { calculateFairShare, toPrecision, percentLess } from "@/utils/numbers";
import { removeLiquidityFromPool } from "@/services/pool";
//
type UsePoolSearchProps = {
  isChecked: boolean;
  sortKey: string;
  sortOrder: string;
  currentPage: number | null;
  isActive: string;
  searchValue: string;
  poolType?: string;
};

//
type UsePoolSearchResult = {
  poolList: any[];
  totalItems: number;
  isLoading: boolean;
};

export const usePoolSearch = ({
  isChecked,
  sortKey,
  sortOrder,
  currentPage,
  isActive,
  searchValue,
  poolType,
}: UsePoolSearchProps): UsePoolSearchResult => {
  //
  const [totalItems, setTotalItems] = useState(0);
  const [poolList, setPoolList] = useState([]);
  const poolStore = usePoolStore();
  // use debounce
  const debouncedHandleChange = useCallback(
    _.debounce(
      (sortKey, currentPage, isActive, isChecked, sortOrder, searchValue) => {
        getSearchResult({
          type: poolType || "classic",
          sort: sortKey,
          limit: "20",
          offset: currentPage ? (((currentPage - 1) * 20) as any) : "0",
          farm: isActive == "farm",
          hide_low_pool: isChecked,
          order: sortOrder,
          token_type: "",
          token_list: searchValue,
          pool_id_list: "",
          onlyUseId: false,
          labels: isActive, //all | farm | new | meme | other
        })
          .then((res: any) => {
            setTotalItems(res.total);
            setPoolList(res?.list?.length > 0 ? res.list : []);
          })
          .catch((error) => {
            console.error("Error fetching poollist results:", error);
          })
          .finally(() => {
            poolStore.setPoolListLoading(false);
          });
      },
      500,
      { leading: false }
    ),
    []
  ); //

  useEffect(() => {
    poolStore.setPoolListLoading(true);
    //
    debouncedHandleChange(
      sortKey,
      currentPage,
      isActive,
      isChecked,
      sortOrder,
      searchValue
    );
    //
  }, [currentPage, isChecked, sortKey, sortOrder, isActive, searchValue]);

  return { poolList, totalItems, isLoading: poolStore.getPoolListLoading() };
};

// deal list to get token src
export const useTokenMetadata = (list: Array<any>) => {
  const [isDealed, setIsDealed] = useState(false);
  const [updatedMapList, setUpdatedList] = useState<Array<any>>([]);
  useEffect(() => {
    let updatedList = [...list];
    setIsDealed(false);

    const promises = list.flatMap((item) =>
      item?.token_account_ids?.map((tokenId: string) => {
        return ftGetTokenMetadata(tokenId);
      })
    );

    Promise.all(promises)
      .then((metadataResults) => {
        const metadataMap = new Map(
          metadataResults.map((metadata) => [metadata?.id, metadata])
        );

        updatedList = updatedList.map((item) => ({
          ...item,
          token_account_ids: item?.token_account_ids?.map(
            (tokenId: string, index: number) => ({
              tokenId,
              id: tokenId,
              icon: metadataMap.get(tokenId)?.icon,
              decimals: metadataMap.get(tokenId)?.decimals,
              symbol:
                item?.token_symbols[index] == "wNEAR"
                  ? "NEAR"
                  : item?.token_symbols[index],
              name: metadataMap.get(tokenId)?.name,
            })
          ),
          rates: item?.rates ||
            item?.degens || [
              "1000000000000000000000000",
              "1000000000000000000000000",
              "1000000000000000000000000",
              "1000000000000000000000000",
            ],
          amp: item?.amp || 240,
          supplies: item?.amounts
            ? item.amounts.reduce(
                (
                  acc: { [tokenId: string]: string },
                  amount: string,
                  i: number
                ) => {
                  acc[item.token_account_ids[i]] = amount;
                  return acc;
                },
                {}
              )
            : {},
          token_symbols: item?.token_symbols.map((item: string) => {
            return item == "wNEAR" ? "NEAR" : item;
          }),
        }));
        setUpdatedList(updatedList);
      })
      .finally(() => {
        setIsDealed(true);
      })
      .catch((error) => {
        console.error("error:", error);
      });
  }, [list[0]]);

  return { isDealed, updatedMapList };
};

export const checkIsHighRisk = (pureIdList: any, arr: any) => {
  const returnMap: any = [];
  arr.token_account_ids?.map((item: any, index: number) => {
    if (pureIdList.includes(item.tokenId)) {
      const waitpushIte = item;
      Object.assign(waitpushIte, {
        symbol: arr.token_symbols[index],
      });
      returnMap.push(waitpushIte);
    }
  });
  if (returnMap.length == 1) {
    return {
      risk: true,
      symbol: returnMap[0].symbol,
      tips: `${returnMap[0].symbol} is uncertified token with high risk.`,
    };
  } else if (returnMap.length == 2) {
    return {
      risk: true,
      symbol: returnMap[0].symbol,
      symbol1: returnMap[1].symbol,
      tips: `${returnMap[0].symbol} and ${returnMap[1].symbol} are uncertified token with high risk.`,
    };
  } else {
    return {
      risk: false,
    };
  }
};

export const useClassicPoolTransaction = ({
  pool_id,
}: {
  pool_id: string | number;
}) => {
  const [swapRecent, setSwapRecent] = useState<any[]>([]);

  const [lqRecent, setLqRecent] = useState<any[]>([]);

  useEffect(() => {
    getClassicPoolSwapRecentTransaction({
      pool_id,
    }).then(setSwapRecent);

    getClassicPoolLiquidtyRecentTransaction({
      pool_id,
    }).then(setLqRecent);
  }, []);

  return { swapTransaction: swapRecent, liquidityTransactions: lqRecent };
};

export const useDCLPoolTransaction = ({
  pool_id,
}: {
  pool_id: string | number;
}) => {
  const [swapRecent, setSwapRecent] = useState<DCLPoolSwapTransaction[]>([]);

  const [lqRecent, setLqRecent] = useState<DCLPoolLiquidtyRecentTransaction[]>(
    []
  );

  const [limitOrderRecent, setLimitOrderRecent] = useState<
    LimitOrderRecentTransaction[]
  >([]);

  useEffect(() => {
    getDCLPoolSwapRecentTransaction({
      pool_id,
    }).then(setSwapRecent);

    getDCLPoolLiquidtyRecentTransaction({
      pool_id,
    }).then(setLqRecent);

    getLimitOrderRecentTransaction({
      pool_id,
    }).then(setLimitOrderRecent);
  }, []);
  return {
    swapTransactions: swapRecent,
    liquidityTransactions: lqRecent,
    limitOrderTransactions: limitOrderRecent,
  };
};

// get stable shares

export const usePool = (id: number | string) => {
  const accountStore = useAccountStore();

  const isSignedIn = accountStore.isSignedIn;

  const [pool, setPool] = useState<any>();
  const [shares, setShares] = useState<string>("0");
  const [stakeList, setStakeList] = useState<Record<string, string>>({});
  const [v2StakeList, setV2StakeList] = useState<Record<string, string>>({});

  const [finalStakeList, setFinalStakeList] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (isSignedIn && !isNaN(Number(id)) && id) {
      getPoolDetails(Number(id)).then((res) => {
        setPool(res);
      });
      getSharesInPool(Number(id))
        .then(setShares)
        .catch(() => setShares);

      getStakedListByAccountId({})
        .then(({ stakedList, finalStakeList, v2StakedList }) => {
          setStakeList(stakedList);
          setV2StakeList(v2StakedList);
          setFinalStakeList(finalStakeList);
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else if (!isSignedIn && !isNaN(Number(id)) && id) {
      getPoolDetails(Number(id)).then((res) => {
        setPool(res);
      });
    }
  }, [id, isSignedIn]);

  return {
    pool,
    shares,
    stakeList,
    v2StakeList,
    finalStakeList,
  };
};

export const listPools = async () => {
  const res = await refSwapV3ViewFunction({
    methodName: "list_pools",
  });
  return res;
};

export const useAllPoolsV2 = (forPool?: boolean) => {
  const [allPools, setAllPools] = useState<PoolInfo[]>();
  const swapStore = useSwapStore();
  const tokenPriceList = swapStore.getAllTokenPrices();
  useEffect(() => {
    getAllTokenPrices().then((res) => {
      swapStore.setAllTokenPrices(res);
    });
  }, []);

  useEffect(() => {
    if (!Object.keys(tokenPriceList || {}).length) return;

    listPools()
      .then((list: PoolInfo[]) => {
        let final = list;
        if (forPool) {
        } else {
          // final = list.filter((p: any) =>
          //   getConfigV2().WHITE_LIST_DCL_POOL_IDS_IN_LIMIT_ORDERS.includes(
          //     p.pool_id
          //   )
          // );
          final = list.filter(
            (p: any) => !getConfig().DCL_POOL_BLACK_LIST.includes(p.pool_id)
          );
        }
        return Promise.all(
          final.map(async (p: any) => {
            const token_x: any = p.token_x;
            const token_y: any = p.token_y;

            p.token_x_metadata = await ftGetTokenMetadata(token_x);
            p.token_y_metadata = await ftGetTokenMetadata(token_y);
            const pricex = tokenPriceList[token_x]?.price || 0;
            const pricey = tokenPriceList[token_y]?.price || 0;
            const {
              total_x,
              total_y,
              total_fee_x_charged,
              total_fee_y_charged,
            }: any = p;
            const totalX = new BigNumber(total_x)
              .minus(total_fee_x_charged)
              .toFixed();
            const totalY = new BigNumber(total_y)
              .minus(total_fee_y_charged)
              .toFixed();
            const tvlx =
              Number(toReadableNumber(p.token_x_metadata.decimals, totalX)) *
              Number(pricex);
            const tvly =
              Number(toReadableNumber(p.token_y_metadata.decimals, totalY)) *
              Number(pricey);

            p.tvl = tvlx + tvly;
            p.tvlUnreal = Object.keys(tokenPriceList).length === 0;

            return p;
          })
        );
      })
      .then(setAllPools);
  }, [Object.keys(tokenPriceList || {}).length]);
  return allPools;
};
export const useAllDclPools = () => {
  const [allPools, setAllPools] = useState<PoolInfo[]>();
  const [pricesDone, setPricesDone] = useState<boolean>(false);
  const swapStore = useSwapStore();
  const tokenPriceList = swapStore.getAllTokenPrices();
  useEffect(() => {
    getAllTokenPrices()
      .then((res) => {
        swapStore.setAllTokenPrices(res);
      })
      .catch()
      .finally(() => {
        setPricesDone(true);
      });
  }, []);

  useEffect(() => {
    if (Object.keys(tokenPriceList || {}).length > 0 || pricesDone) {
      listPools()
        .then((list: PoolInfo[]) => {
          // const final = list.filter((p: any) => {
          //   return getConfigV2().WHITE_LIST_DCL_POOL_IDS_IN_LIMIT_ORDERS.includes(
          //     p.pool_id
          //   );
          // });
          const final = list.filter(
            (p: any) => !getConfig().DCL_POOL_BLACK_LIST.includes(p.pool_id)
          );
          return Promise.all(
            final.map(async (p: any) => {
              const token_x: any = p.token_x;
              const token_y: any = p.token_y;

              p.token_x_metadata = await ftGetTokenMetadata(token_x);
              p.token_y_metadata = await ftGetTokenMetadata(token_y);
              const pricex = tokenPriceList[token_x]?.price || 0;
              const pricey = tokenPriceList[token_y]?.price || 0;
              const {
                total_x,
                total_y,
                total_fee_x_charged,
                total_fee_y_charged,
              }: any = p;
              const totalX = new BigNumber(total_x)
                .minus(total_fee_x_charged)
                .toFixed();
              const totalY = new BigNumber(total_y)
                .minus(total_fee_y_charged)
                .toFixed();
              const tvlx =
                Number(toReadableNumber(p.token_x_metadata.decimals, totalX)) *
                Number(pricex);
              const tvly =
                Number(toReadableNumber(p.token_y_metadata.decimals, totalY)) *
                Number(pricey);

              p.tvl = tvlx + tvly;
              p.tvlUnreal = Object.keys(tokenPriceList).length === 0;

              return p;
            })
          );
        })
        .then(setAllPools);
    }
  }, [Object.keys(tokenPriceList || {}).length, pricesDone]);
  return allPools;
};

export const usePredictRemoveShares = ({
  amounts,
  setError,
  shares,
  stablePool,
}: {
  amounts: string[];
  setError: (e: Error) => void;
  shares: string;
  stablePool: StablePool;
}) => {
  const [canSubmitByToken, setCanSubmitByToken] = useState<boolean>(false);

  const [predictedRemoveShares, setPredictedRemoveShares] =
    useState<string>("0");

  const zeroValidate = amounts.every((amount) => !(Number(amount) > 0));

  function validate(predictedShare: string) {
    if (new BigNumber(predictedShare).isGreaterThan(new BigNumber(shares))) {
      setCanSubmitByToken(false);
      setError(new Error("insufficient_shares"));
    } else {
      setCanSubmitByToken(true);
    }
  }

  useEffect(() => {
    setError(null as any);
    if (zeroValidate) {
      setPredictedRemoveShares("0");
      setCanSubmitByToken(false);
      return;
    }
    setCanSubmitByToken(false);

    try {
      const burn_shares = getRemoveLiquidityByTokens(
        amounts.map((amount) => amount || "0"),
        stablePool
      );
      console.log(burn_shares, "burn_shares");
      validate(burn_shares);
      setPredictedRemoveShares(burn_shares);
    } catch (error) {
      setError(new Error("insufficient_shares"));
      setCanSubmitByToken(false);
    }
  }, [...amounts]);

  return {
    predictedRemoveShares,
    canSubmitByToken,
  };
};

export const useSeedDetail = (pool_id: string | number) => {
  const seed_id = getConfig().REF_FI_CONTRACT_ID + "@" + pool_id.toString();
  const [seedDetail, setSeedDetail] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchSeed = async () => {
      setIsLoading(true);
      try {
        const res = await get_seed(seed_id);
        setSeedDetail(res);
      } catch (error) {
        // Handle error appropriately
        console.error("Failed to fetch seed detail:", error);
        setSeedDetail(null); // Or some error state
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeed();
  }, [seed_id]); // Note: seed_id is dependent on pool_id
  return { seedDetail, isLoading };
};

export const useSeedFarms = (pool_id: string | number) => {
  const [seedFarms, setSeedFarms] = useState<any>();

  const seed_id = getConfig().REF_FI_CONTRACT_ID + "@" + pool_id.toString();

  useEffect(() => {
    list_seed_farms(seed_id)
      .then(async (res) => {
        if (!res) return null;

        const parsedRes = res.filter((f: any) => f.status !== "Ended");

        const noRunning = res.every((f: any) => f.status !== "Running");

        if (!parsedRes || parsedRes.length === 0) {
          return;
        }

        return Promise.all(
          parsedRes
            // .filter((f: any) => noRunning || f.status === 'Running')
            .filter((f: any) => f.status != "Ended")
            .map(async (farm: any) => {
              const token_meta_data = await ftGetTokenMetadata(
                farm.terms.reward_token
              );

              const daily_reward = farm.terms.daily_reward;

              const readableNumber = toReadableNumber(
                token_meta_data.decimals,
                daily_reward
              );

              const yearReward = Number(readableNumber) * 365;

              return {
                ...farm,
                token_meta_data,
                yearReward,
              };
            })
        );
      })
      .then(setSeedFarms);
  }, [pool_id]);

  return seedFarms;
};

export const useSeedFarmsByPools = (pools: Pool[]) => {
  const tokenPriceList = useTokenPriceList();

  const [loadingSeedsDone, setLoadingSeedsDone] = useState<boolean>(false);

  const [farmAprById, setFarmAprById] = useState<Record<string, number>>();

  useEffect(() => {
    const ids = pools?.map((p) => p.id);

    if (!ids || !tokenPriceList) return;

    const seeds = ids.map(
      (pool_id) => getConfig().REF_FI_CONTRACT_ID + "@" + pool_id.toString()
    );

    db.queryBoostSeedsBySeeds(seeds)
      .then(async (res) => {
        if (!res) return;
        const seedFarmsById = await Promise.all(
          Object.values(res).map((seed: any) => {
            if (!seed) return null;

            const parsedRes = seed.farmList.filter(
              (f: any) => f.status !== "Ended"
            );

            const noRunning = seed.farmList.every(
              (f: any) => f.status !== "Running"
            );

            if (!parsedRes || parsedRes.length === 0) {
              return null;
            }

            return Promise.all(
              parsedRes
                .filter((f: any) => noRunning || f.status === "Running")
                .map(async (farm: any) => {
                  const token_meta_data = await ftGetTokenMetadata(
                    farm.terms.reward_token
                  );

                  const daily_reward = farm.terms.daily_reward;

                  const readableNumber = toReadableNumber(
                    token_meta_data.decimals,
                    daily_reward
                  );

                  const yearReward = Number(readableNumber) * 365;

                  return {
                    ...farm,
                    token_meta_data,
                    yearReward,
                  };
                })
            );
          })
        ).then((list) => {
          const seedFarmsById = list.reduce((acc, cur, i) => {
            return { ...acc, [Object.keys(res)[i]]: cur };
          }, {});

          return seedFarmsById;
        });

        return { seedFarmsById, cacheSeeds: res } as any;
      })
      .then(
        async ({
          seedFarmsById,
          cacheSeeds,
        }: {
          seedFarmsById: Record<string, any>;
          cacheSeeds: Record<string, any>;
        }) => {
          if (!seedFarmsById || !cacheSeeds) return;

          const ARPs = await Promise.all(
            Object.values(seedFarmsById).map((farms: any, i: number) => {
              const seedDetail = Object.values(cacheSeeds)[i].seed;

              const poolId = Object.keys(cacheSeeds)[i].split("@")[1];
              const pool: any = pools.find((p) => p.id.toString() === poolId);
              let totalReward = 0;

              if (!farms) return 0;

              farms.forEach((farm: any) => {
                const reward_token_price = Number(
                  tokenPriceList?.[farm.token_meta_data.id]?.price || 0
                );

                totalReward =
                  totalReward + Number(farm.yearReward) * reward_token_price;
              });

              const poolShares = Number(
                toReadableNumber(
                  isStablePool(pool.id) ? getStablePoolDecimal(pool.id) : 24,
                  pool.shareSupply
                )
              );

              const seedTvl =
                !poolShares || !seedDetail
                  ? 0
                  : (Number(
                      toReadableNumber(
                        seedDetail.seed_decimal,
                        seedDetail.total_seed_power
                      )
                    ) *
                      (pool.tvl || 0)) /
                    poolShares;

              const baseAprAll = !seedTvl ? 0 : totalReward / seedTvl;

              return !pool.tvl || !seedDetail || !farms || !pool
                ? 0
                : baseAprAll;
            })
          );

          const returnAPRs = ARPs.reduce((acc, cur, i) => {
            return {
              ...acc,
              [Object.keys(seedFarmsById)[i].split("@")[1]]: cur,
            };
          }, {});

          setFarmAprById(returnAPRs);

          return returnAPRs;
        }
      )

      .finally(() => {
        setLoadingSeedsDone(true);
      });
  }, [pools?.map((p) => p.id).join("-"), tokenPriceList]);

  return {
    farmAprById,
    loadingSeedsDone,
  };
};

export const useDayVolume = (pool_id: string) => {
  const [dayVolume, setDayVolume] = useState<string>();
  useEffect(() => {
    get24hVolumes([pool_id]).then((res) => {
      setDayVolume(res.join(""));
    });
  }, [pool_id]);
  return dayVolume;
};

export const useRemoveLiquidity = ({
  pool,
  shares,
  slippageTolerance,
}: {
  pool: Pool;
  shares: string;
  slippageTolerance: number;
}) => {
  const minimumAmounts = Object.entries(pool?.supplies).reduce<{
    [tokenId: string]: string;
  }>((acc, [tokenId, totalSupply]) => {
    acc[tokenId] = toPrecision(
      percentLess(
        slippageTolerance,
        calculateFairShare({
          shareOf: totalSupply,
          contribution: shares,
          totalContribution:
            pool?.shareSupply || (pool as any)?.shares_total_supply,
        })
      ),
      0
    );
    return acc;
  }, {});

  const removeLiquidity = () => {
    return removeLiquidityFromPool({
      id: +pool.id,
      shares,
      minimumAmounts,
    });
  };

  return {
    removeLiquidity,
    minimumAmounts,
  };
};
