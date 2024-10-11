import { Pool, PoolRPCView } from "@/interfaces/swap";
import {
  display_value,
  useBatchTotalShares,
  useStakeListByAccountId,
} from "@/services/aurora";
import { checkFarmStake, toRealSymbol, useAllFarms } from "@/services/farm";
import { getPoolsByIds, getYourPools } from "@/services/indexer";
import { LP_TOKEN_DECIMALS } from "@/services/m-token";
import { getVEPoolId, useAccountInfo } from "@/services/referendum";
import {
  ALL_STABLE_POOL_IDS,
  AllStableTokenIds,
  NEARX_POOL_ID,
} from "@/services/swap/swapConfig";
import {
  getStablePoolDecimal,
  isDegenPool,
  isStablePool,
  parsePool,
} from "@/services/swap/swapUtils";
import { ftGetTokensMetadata } from "@/services/token";
import { useAccountStore } from "@/stores/account";
import getConfig from "@/utils/config";
import { useClientMobile } from "@/utils/device";
import BigNumber from "bignumber.js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  UpDownButton,
  display_number_withCommas,
  getEndedFarmsCount,
  getFarmsCount,
  getRealEndedFarmsCount,
} from "../Tool";
import { TokenMetadata } from "@/services/ft-contract";
import { PortfolioContextType, PortfolioData } from "../RefPanelModal";
import {
  calculateFairShare,
  divide,
  multiply,
  percent,
  toInternationalCurrencySystem,
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from "@/utils/numbers";
import { openUrlLocal, openUrl } from "@/services/commonV3";
import { LinkIcon } from "@/components/farm/icon";
import { useFarmStake } from "@/hooks/useStableShares";
import { useLpLocker } from "@/services/lplock";
import { OrdersArrow } from "../icon";
import { getPoolDetails } from "@/services/pool_detail";
import { getSharesInPool } from "@/services/pool";
import {
  ONLY_ZEROS,
  toNonDivisibleNumber,
  scientificNotationToString,
} from "@/utils/numbers";
import { LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import Big from "big.js";
import { ArrowRightUpIcon } from "../icon";
import { useRouter } from "next/router";
import ClassicAdd from "@/components/pools/detail/liquidity/classic/ClassicAdd";
import ClassicRemove from "@/components/pools/detail/liquidity/classic/ClassicRemove";
import StableAdd from "@/components/pools/detail/liquidity/stable/StableAdd";
import StableRemove from "@/components/pools/detail/liquidity/stable/StableRemove";
import { getPoolsDetailById } from "@/services/pool";
import { useTokenMetadata } from "@/hooks/usePools";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import { useYourliquidity } from "@/hooks/useStableShares";
import { usePool } from "@/hooks/usePools";
import {
  ShareInFarm,
  ShareInBurrow,
  PoolAvailableAmount,
} from "@/components/pools/detail/stable/ShareInFarm";
import { FiArrowUpRight } from "react-icons/fi";
import { useFarmStakeAmount } from "@/hooks/useStableShares";
import getConfigV2 from "@/utils/configV2";
import getStablePoolTypeConfig from "@/utils/stablePoolConfig/stablePoolTypeConfig";
import { getBatchPoolDetailByIds } from "@/services/pool";
const { DEGEN_POOLS_IDS } = getStablePoolTypeConfig();

const { BLACK_TOKEN_LIST } = getConfig();
export const StakeListContext = createContext<any>(null);
export function YourLiquidityV1(props: any) {
  const {
    setYourLpValueV1,
    setLpValueV1Done,
    setLiquidityLoadingDone,
    setLiquidityQuantity,
    styleType,
    showV1EmptyBar,
  } = props;

  const router = useRouter();
  const [error, setError] = useState<Error>();
  const [pools, setPools] = useState<PoolRPCView[]>();
  const { v1Farm, v2Farm } = useAllFarms();
  const [generalAddLiquidity, setGeneralAddLiquidity] =
    useState<boolean>(false);
  const accountStore = useAccountStore();
  const [stablePools, setStablePools] = useState<PoolRPCView[]>();
  const [tvls, setTvls] = useState<Record<string, number>>();
  const [tokensMeta, setTokensMeta] = useState<{}>();
  const isClientMobile = useClientMobile();
  const [count, setCount] = useState(0);
  const isSignedIn = accountStore.isSignedIn;
  const { pureIdList } = useRiskTokens();

  const [addSuccess, setAddSuccess] = useState(0);

  //

  useEffect(() => {
    // get all stable pools;
    const ids = ALL_STABLE_POOL_IDS.concat(DEGEN_POOLS_IDS);
    getPoolsByIds({ pool_ids: ids }).then((res) => {
      setStablePools(res.filter((p) => p.id.toString() !== NEARX_POOL_ID));
    });
  }, []);
  useEffect(() => {
    if (!isSignedIn) return;
    // get all simple pools;
    getYourPools().then((res) => {
      setPools(res.filter((p) => !isStablePool(p.id.toString())));
    });
  }, [isSignedIn, addSuccess]);
  useEffect(() => {
    if (!pools) return;
    // get all tokens meta data both from simple pools and stable pools
    ftGetTokensMetadata(
      (pools.map((p) => p.token_account_ids).flat() || []).concat(
        AllStableTokenIds
      )
    ).then(setTokensMeta);
    // get all tvls of simple pools;(stable pools has tvl field， but simple pools doesn't,so need request again)
    getPoolsByIds({ pool_ids: pools.map((p) => p.id.toString()) }).then(
      (res) => {
        setTvls(
          res
            .map((p) => p.tvl)
            ?.reduce((pre, cur, i) => {
              return {
                ...pre,
                [res[i].id]: cur,
              };
            }, {})
        );
      }
    );
  }, [pools, addSuccess]);
  // get ve pool
  const vePool = pools?.find((p) => Number(p.id) === Number(getVEPoolId()));
  // get stake list in v1 farm and v2 farm
  const { finalStakeList, stakeList, v2StakeList, stakeListDone } =
    useStakeListByAccountId();
  // get lp amount locked in ve contract;
  const { lptAmount, accountInfoDone } = !!getConfig().REF_VE_CONTRACT_ID
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useAccountInfo()
    : { lptAmount: "0", accountInfoDone: true };
  // get the rest lp amount in pool and all lp amount  (in v1 farm, v2 farm, pool)
  const {
    batchTotalShares,
    shares: batchStableShares,
    sharesDone: stableSharesDone,
  } = useBatchTotalShares(
    stablePools?.map((p) => p.id) as (string | number)[],
    finalStakeList,
    stakeListDone
  );
  const {
    batchTotalShares: batchTotalSharesSimplePools,
    shares: batchShares,
    sharesDone: simpleSharesDone,
  } = useBatchTotalShares(
    pools?.map((p) => p.id) as (string | number)[],
    finalStakeList,
    stakeListDone
  );
  const data_fetch_status =
    !stablePools ||
    !pools ||
    !tokensMeta ||
    !v1Farm ||
    !v2Farm ||
    !stableSharesDone ||
    !simpleSharesDone ||
    !accountInfoDone;
  useEffect(() => {
    if (!data_fetch_status) {
      // get the number of pools which lp amount is greater than zero;
      const count =
        batchTotalSharesSimplePools
          .map((n, i) =>
            n + Number(pools?.[i].id) === Number(getVEPoolId())
              ? Number(lptAmount) + n
              : n
          )
          ?.reduce((acc, cur) => {
            return cur > 0 ? acc + 1 : acc;
          }, 0) +
        batchTotalShares?.reduce((acc, cur) => (cur > 0 ? acc + 1 : acc), 0);
      setLiquidityLoadingDone(true);
      setLiquidityQuantity(count);
      setCount(count);
      if (+count > 0 && tvls) {
        const allPools = pools.concat(stablePools);
        let total_value_final = "0";
        allPools.forEach((pool: PoolRPCView) => {
          // get total amount
          const { id, shares_total_supply, tvl } = pool;
          const is_stable_pool = isStablePool(id);
          const decimals = is_stable_pool
            ? getStablePoolDecimal(id)
            : LP_TOKEN_DECIMALS;
          let total_amount = 0;
          if (is_stable_pool) {
            const i = stablePools.findIndex(
              (p: PoolRPCView) => p.id === pool.id
            );
            total_amount = batchTotalShares?.[i];
          } else {
            const i = pools.findIndex((p: PoolRPCView) => p.id === pool.id);
            total_amount = batchTotalSharesSimplePools?.[i];
          }
          let lp_in_vote = "0";
          if (+id == +getVEPoolId()) {
            lp_in_vote = new BigNumber(lptAmount || 0).shiftedBy(-24).toFixed();
          }
          const read_total_amount = new BigNumber(total_amount)
            .shiftedBy(-decimals)
            .plus(lp_in_vote);
          // get single lp value
          const pool_tvl = tvls[id] || tvl || "0";
          if (+shares_total_supply > 0 && +pool_tvl > 0) {
            const read_total_supply = new BigNumber(
              shares_total_supply
            ).shiftedBy(-decimals);
            const single_lp_value = new BigNumber(pool_tvl).dividedBy(
              read_total_supply
            );
            const value = single_lp_value.multipliedBy(
              read_total_amount.toString() != "NaN" ? read_total_amount : 0
            );
            total_value_final = value.plus(total_value_final).toFixed();
          }
        });
        setLpValueV1Done(true);

        setYourLpValueV1(total_value_final);
      } else if (+count == 0) {
        setLpValueV1Done(true);
        setYourLpValueV1("0");
      }
    }
  }, [data_fetch_status, tvls, addSuccess]);
  if (data_fetch_status) return null;
  return (
    <>
      <StakeListContext.Provider
        value={{
          stakeList,
          v2StakeList,
          finalStakeList,
          error,
          vePool,
          batchTotalSharesSimplePools,
          batchTotalShares,
          isClientMobile,
          v1Farm,
          v2Farm,
          tvls,
          tokensMeta,
          lptAmount,
          batchShares,
          pools,
          stablePools,
          batchStableShares,
          generalAddLiquidity,
          setGeneralAddLiquidity,
          showV1EmptyBar,
          router,
          pureIdList,
          addSuccess,
          setAddSuccess,
        }}
      >
        <LiquidityContainerStyle2></LiquidityContainerStyle2>
      </StakeListContext.Provider>
    </>
  );
}

function LiquidityContainerStyle2() {
  const {
    vePool,
    pools,
    stablePools,
    batchTotalShares,
    batchTotalSharesSimplePools,
    stakeList,
    v2StakeList,
    router,
    pureIdList,
    addSuccess,
    setAddSuccess,
  } = useContext(StakeListContext)!;
  const simplePoolsFinal = useMemo(() => {
    const activeSimplePools: PoolRPCView[] = pools.filter(
      (p: PoolRPCView, i: number) => {
        if (!vePool || !getConfig().REF_VE_CONTRACT_ID) {
          return batchTotalSharesSimplePools[i] !== 0;
        } else {
          return batchTotalSharesSimplePools[i] !== 0 && p.id !== vePool?.id;
        }
      }
    );
    return activeSimplePools;
  }, [pools, batchTotalSharesSimplePools, addSuccess]);
  const stablePoolsFinal: PoolRPCView[] = useMemo(() => {
    const activeStablePools = stablePools.filter(
      (p: PoolRPCView, i: number) => {
        return batchTotalShares[i] !== 0;
      }
    );
    return activeStablePools;
  }, [batchTotalShares, addSuccess]);

  // const map = [];
  // simplePoolsFinal.concat(stablePoolsFinal).map((item:any)=> {
  //   map.push(item.id)
  // })
  // getBatchPoolDetailByIds(map).then((res:any)=>{
  //   console.log(res,'342222')
  // }).catch((err:any)=>{
  //   console.log(err, '3444')
  // })

  const [classicMap, setClassicMap] = useState<any>({});
  const [stableMap, setStableMap] = useState<any>({});

  useEffect(() => {
    if (simplePoolsFinal?.length > 0) {
      const simplePoolList = {};

      const map = [];
      simplePoolsFinal.map((item: any) => {
        map.push(item.id);
      });
      getBatchPoolDetailByIds(map)
        .then((res: any) => {
          res.map((item: any) => {
            simplePoolList[item.id] = item;
          });
          if (res.length > 0) setClassicMap(simplePoolList);
        })
        .catch((err: any) => {
          console.log(err, "simplePoolsFinal3444");
        });
    }
  }, [JSON.stringify(simplePoolsFinal || [])]);

  useEffect(() => {
    if (stablePoolsFinal?.length > 0) {
      const stablePoolList = {};

      const map = [];
      stablePoolsFinal.map((item: any) => {
        map.push(item.id);
      });
      getBatchPoolDetailByIds(map)
        .then((res: any) => {
          res.map((item: any) => {
            stablePoolList[item.id] = item;
          });
          if (res.length > 0) setStableMap(stablePoolList);
        })
        .catch((err: any) => {
          console.log(err, "stablePoolsFinal3444");
        });
    }
  }, [JSON.stringify(stablePoolsFinal) || []]);

  const titleList = [
    {
      name: "Pair",
      class: "col-span-2",
    },
    {
      name: "Token",
      class: "col-span-2",
    },
    {
      name: "LP Tokens(Shares)",
      class: "col-span-4",
    },
    {
      name: "USD Value",
      class: "col-span-2",
    },
    {
      name: "",
      class: "col-span-2",
    },
  ];

  return (
    <div>
      <div className="w-full grid grid-cols-12 px-4 xsm:hidden">
        {titleList.map((item: any, index: any) => {
          return (
            <span
              key={item.name + index}
              className={`text-gray-60 text-sm ${item.class}`}
            >
              {item.name}
            </span>
          );
        })}
      </div>
      {!vePool || !getConfig().REF_VE_CONTRACT_ID ? null : (
        <YourClassicLiquidityLine
          pool={vePool}
          listMap={classicMap}
        ></YourClassicLiquidityLine>
      )}
      {stablePoolsFinal.map((pool: PoolRPCView) => {
        return (
          <YourClassicLiquidityLine
            pool={pool}
            key={pool.id}
            type={
              DEGEN_POOLS_IDS.includes(pool.id.toString()) ? "degen" : "stable"
            }
            listMap={stableMap}
          ></YourClassicLiquidityLine>
        );
      })}
      {simplePoolsFinal.map((pool: PoolRPCView) => {
        return (
          <YourClassicLiquidityLine
            pool={pool}
            key={pool.id}
            listMap={classicMap}
          ></YourClassicLiquidityLine>
        );
      })}
    </div>
  );
}
const LiquidityContextData = createContext<any>(null);

function YourClassicLiquidityLine(props: any) {
  const {
    vePool,
    v1Farm,
    v2Farm,
    tvls,
    tokensMeta,
    lptAmount,
    pools,
    stablePools,
    batchTotalShares,
    batchStableShares,
    batchTotalSharesSimplePools,
    batchShares,
    finalStakeList,
    stakeList,
    v2StakeList,
    router,
    pureIdList,
    addSuccess,
    setAddSuccess,
  } = useContext(StakeListContext)!;

  const { set_your_classic_lp_all_in_farms } = useContext(
    PortfolioData
  ) as PortfolioContextType;

  const { pool, type, listMap } = props;
  const { token_account_ids, id: poolId } = pool;

  const tokens = token_account_ids.map((id: number) => tokensMeta[id]) || [];
  const [switch_off, set_switch_off] = useState<boolean>(true);

  const decimals = isStablePool(poolId)
    ? getStablePoolDecimal(poolId)
    : LP_TOKEN_DECIMALS;

  // image start
  let Images;
  if (tokens.length == 2) {
    Images = tokens.map((token: TokenMetadata, index: number) => {
      const { icon, id } = token;
      if (icon)
        return (
          <img
            key={id}
            className={`inline-block w-6 h-6 border border-black rounded-full ${
              index == 0 ? "" : "-ml-1"
            }`}
            src={icon}
          />
        );
      return (
        <div
          key={id}
          className={
            "inline-block w-6 h-6 border border-black rounded-full -ml-1"
          }
        ></div>
      );
    });
  }

  if (tokens.length == 3) {
    Images = (
      <div className="w-12 h-12 frcc flex-wrap">
        {tokens.map((token: TokenMetadata, index: number) => {
          const { icon, id } = token;
          if (icon)
            return (
              <img
                key={id}
                className={`inline-block w-6 h-6 border border-black rounded-full ${
                  index == 1 && "-ml-1"
                } ${index == 2 ? "flex-shrink-0 -mt-3" : ""}`}
                src={icon}
              />
            );
          return (
            <div
              key={id}
              className={`inline-block w-6 h-6 border border-black rounded-full ${
                index == 1 && "-ml-1"
              } ${index == 2 ? "flex-shrink-0 -mt-3" : ""}`}
            ></div>
          );
        })}
      </div>
    );
  }

  if (tokens.length == 4) {
    Images = (
      <div className="w-12 h-12 frcc flex-wrap">
        {tokens.map((token: TokenMetadata, index: number) => {
          const { icon, id } = token;
          if (icon)
            return (
              <img
                key={id}
                className={`inline-block w-6 h-6 border border-black rounded-full ${
                  (index == 1 || index == 3) && "-ml-1"
                } ${index == 2 ? "flex-shrink-0 -mt-3" : ""}
                ${index == 3 ? "flex-shrink-0 -mt-3" : ""}
                `}
                src={icon}
              />
            );
          return (
            <div
              key={id}
              className={`inline-block w-6 h-6 border border-black rounded-full ${
                index == 1 && "-ml-1"
              } ${index == 2 ? "flex-shrink-0 -mt-3" : ""}`}
            ></div>
          );
        })}
      </div>
    );
  }

  const ImagesMob = tokens.map((token: TokenMetadata, index: number) => {
    const { icon, id } = token;
    if (icon)
      return (
        <img
          key={id}
          className={`inline-block w-6 h-6 border border-black rounded-full ${
            index == 0 ? "" : "-ml-1"
          }`}
          src={icon}
        />
      );
    return (
      <div
        key={id}
        className={
          "inline-block w-6 h-6 border border-black rounded-full -ml-1"
        }
      ></div>
    );
  });
  // image end

  // token symbol start
  const { shares, pool: usePoolFullData } = usePool(+poolId);

  const [poolNew, setPoolNew] = useState<any>();
  const [sharesNew, setShares] = useState("");
  useEffect(() => {
    getPoolDetails(+poolId).then(setPoolNew);
    getSharesInPool(+poolId)
      .then(setShares)
      .catch(() => setShares);
  }, []);

  const farmStakeTotal = useFarmStake({ poolId, stakeList: finalStakeList });
  const LpLocked = useLpLocker(`:${poolId}`);
  const userTotalShare = BigNumber.sum(sharesNew, farmStakeTotal, LpLocked);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });

  const tokenAmountShare = (
    pool: Pool,
    token: TokenMetadata,
    shares: string
  ) => {
    const value = toRoundedReadableNumber({
      decimals: token.decimals,
      number: calculateFairShare({
        shareOf: poolNew.supplies[token.id],
        contribution: shares,
        totalContribution: poolNew.shareSupply,
      }),
      precision: 3,
      withCommas: false,
    });
    return Number(value) < 0.001 ? (
      <span className="whitespace-nowrap">{"< 0.001"}</span>
    ) : (
      toInternationalCurrencySystem(value, 3)
    );
  };

  const TokenInfoPC = ({ token }: { token: TokenMetadata }) => {
    return (
      <div className="flex items-center text-sm font-normal ">
        <div
          className="w-16 text-gray-10 overflow-hidden text-ellipsis whitespace-nowrap"
          title={toRealSymbol(token.symbol)}
        >
          {toRealSymbol(token.symbol)}
        </div>
        <div className="font-medium">
          {poolNew &&
            tokenAmountShare(
              pool,
              token,
              new BigNumber(userTotalShareToString)
                .plus(
                  Number(getVEPoolId()) === Number(poolId) ? lptAmount : "0"
                )
                .toNumber()
                .toFixed()
            )}
        </div>
      </div>
    );
  };

  const Symbols = (
    <div className="flex flex-col">
      {tokens.map((token: TokenMetadata, index: number) => {
        return TokenInfoPC({ token });
      })}
    </div>
  );

  const TokenInfoMob = ({ token }: { token: TokenMetadata }) => {
    return (
      <div className="flex items-center text-sm font-normal ">
        <div className="font-medium">
          {poolNew &&
            tokenAmountShare(
              pool,
              token,
              new BigNumber(userTotalShareToString)
                .plus(
                  Number(getVEPoolId()) === Number(poolId) ? lptAmount : "0"
                )
                .toNumber()
                .toFixed()
            )}
        </div>
        <div
          className="w-16 text-gray-10 overflow-hidden text-ellipsis whitespace-nowrap text-right text-sm"
          title={toRealSymbol(token.symbol)}
        >
          {toRealSymbol(token.symbol)}
        </div>
      </div>
    );
  };

  const TokenInfoMobWithoutNum = ({
    token,
    show,
  }: {
    token: TokenMetadata;
    show: boolean;
  }) => {
    return (
      <div
        className="max-w-16 text-white overflow-hidden text-ellipsis whitespace-nowrap text-right text-base"
        title={toRealSymbol(token.symbol)}
      >
        {toRealSymbol(token.symbol)}
        {show && <span>-</span>}
      </div>
    );
  };
  const SymbolsMob = (
    <div className="flex flex-col">
      {tokens.map((token: TokenMetadata, index: number) => {
        return TokenInfoMob({ token });
      })}
    </div>
  );

  const SymbolsMobWithoutNum = (
    <div className="frcc">
      {tokens.map((token: TokenMetadata, index: number) => {
        return TokenInfoMobWithoutNum({
          token,
          show: tokens.length - 1 > index,
        });
      })}
    </div>
  );
  // token symbol end

  // get lp amount in farm
  const lp_in_farm = useMemo(() => {
    let inFarmAmount = "0";
    Object.keys(finalStakeList).find((seed_id: string) => {
      const pool_id = seed_id.split("@")[1];
      if (+poolId == +pool_id) {
        const amount = finalStakeList[seed_id];
        inFarmAmount = new BigNumber(amount).shiftedBy(-decimals).toFixed();
        return true;
      }
    });
    return inFarmAmount;
  }, [finalStakeList]);
  // get lp amount in vote
  const lp_in_vote = useMemo(() => {
    let lpInVote = "0";
    if (+pool.id == vePool?.id) {
      lpInVote = lptAmount;
    }
    return new BigNumber(lpInVote).shiftedBy(-24).toFixed();
  }, [lptAmount]);
  // get lp amount in pool && total lp (pool + farm) && user lp percent
  const [lp_in_pool, lp_total, user_lp_percent] = useMemo(() => {
    const { id, shares_total_supply } = pool;
    const is_stable_pool = isStablePool(id) || isDegenPool(id);
    let amount_in_pool = "0";
    let total_amount = "0";
    if (is_stable_pool) {
      const i = stablePools.findIndex((p: PoolRPCView) => p.id === pool.id);
      amount_in_pool = batchStableShares?.[i];
      total_amount = batchTotalShares?.[i];
    } else {
      const i = pools.findIndex((p: PoolRPCView) => p.id === pool.id);
      amount_in_pool = batchShares?.[i];
      total_amount = batchTotalSharesSimplePools?.[i];
    }
    const read_amount_in_pool = new BigNumber(amount_in_pool)
      .shiftedBy(-decimals)
      .toFixed();
    const read_total_amount = new BigNumber(total_amount)
      .shiftedBy(-decimals)
      .plus(lp_in_vote);
    const read_shareSupply = new BigNumber(
      shares_total_supply || "0"
    ).shiftedBy(-decimals);
    let percent = "0";
    if (
      read_shareSupply.isGreaterThan(0) &&
      read_total_amount.isGreaterThan(0)
    ) {
      percent = read_total_amount.dividedBy(read_shareSupply).toFixed();
    }
    return [read_amount_in_pool, read_total_amount.toFixed(), percent];
  }, [
    batchShares,
    batchStableShares,
    batchTotalSharesSimplePools,
    batchTotalShares,
    lp_in_vote,
    addSuccess,
  ]);
  // get total lp value
  const lp_total_value = useMemo(() => {
    const { id, tvl, shares_total_supply } = pool;
    const pool_tvl = tvls?.[id] || tvl || 0;
    if (+shares_total_supply > 0) {
      const read_total_supply = new BigNumber(shares_total_supply).shiftedBy(
        -decimals
      );
      const single_lp_value = new BigNumber(pool_tvl).dividedBy(
        read_total_supply
      );
      return new BigNumber(single_lp_value || 0)
        .multipliedBy(lp_total || 0)
        .toFixed();
    }
    return "0";
  }, [lp_total, tvls, addSuccess]);
  // get seed status
  const seed_status = useMemo(() => {
    const allFarmV2_count = getFarmsCount(poolId.toString(), v2Farm);
    const endedFarmV2_count = getRealEndedFarmsCount(poolId.toString(), v2Farm);
    if (allFarmV2_count == endedFarmV2_count) return "e";
    return "r";
  }, [v2Farm, addSuccess]);
  function display_percent(percent: string) {
    const p = new BigNumber(percent).multipliedBy(100);
    if (p.isEqualTo(0)) {
      return "0%";
    } else if (p.isLessThan(0.01)) {
      return "<0.01%";
    } else {
      return toPrecision(p.toFixed(), 2) + "%";
    }
  }
  useEffect(() => {
    if (
      new BigNumber(lp_in_pool).isGreaterThan(0) ||
      new BigNumber(lp_in_vote).isGreaterThan(0)
    ) {
      set_your_classic_lp_all_in_farms(false);
    }
  }, [lp_in_pool, lp_in_vote, addSuccess]);
  return (
    <LiquidityContextData.Provider
      value={{
        switch_off,
        Images,
        ImagesMob,
        Symbols,
        SymbolsMob,
        SymbolsMobWithoutNum,
        TokenInfoPC,
        TokenInfoMob,
        pool,
        lp_total_value,
        set_switch_off,
        lp_total,
        display_percent,
        user_lp_percent,
        lp_in_vote,
        lp_in_pool,
        lp_in_farm,
        seed_status,
        sharesNew,
        LpLocked,
        lptAmount,
        v1Farm,
        v2Farm,
        stakeList,
        v2StakeList,
        router,
        pureIdList,
        poolNew,
        usePoolFullData,
        addSuccess,
        setAddSuccess,
      }}
    >
      <YourClassicLiquidityLinePage
        type={type || ""}
        listMap={listMap}
      ></YourClassicLiquidityLinePage>
    </LiquidityContextData.Provider>
  );
}
function YourClassicLiquidityLinePage(props: any) {
  const {
    switch_off,
    Images,
    ImagesMob,
    Symbols,
    SymbolsMob,
    SymbolsMobWithoutNum,
    pool,
    lp_total_value,
    set_switch_off,
    lp_total,
    display_percent,
    user_lp_percent,
    lp_in_vote,
    lp_in_pool,
    lp_in_farm,
    seed_status,
    TokenInfoPC,
    sharesNew,
    LpLocked,
    lptAmount,
    v1Farm,
    v2Farm,
    stakeList,
    v2StakeList,
    router,
    pureIdList,
    poolNew,
    usePoolFullData,
    addSuccess,
    setAddSuccess,
  } = useContext(LiquidityContextData)!;
  const lpDecimal =
    pool?.id && isStablePool(pool.id.toString())
      ? getStablePoolDecimal(pool.id.toString())
      : 24;
  const supportFarmV1 = getFarmsCount(pool.id.toString(), v1Farm);
  const supportFarmV2 = getFarmsCount(pool.id.toString(), v2Farm);
  const endedFarmV1 = getEndedFarmsCount(pool.id.toString(), v1Farm);
  const endedFarmV2 = getEndedFarmsCount(pool.id.toString(), v2Farm);

  const { shares, shadowBurrowShare } = useYourliquidity(pool.id);
  const farmStakeV1 = useFarmStake({ poolId: pool.id, stakeList });
  const farmStakeV2 = useFarmStake({ poolId: pool.id, stakeList: v2StakeList });

  const [poolDetail, setPoolDetail] = useState<any>(null);
  const { updatedMapList } = useTokenMetadata([poolDetail]);

  const farmStakeTotal = useFarmStake({ poolId: Number(pool.id), stakeList });

  const userTotalShare = BigNumber.sum(sharesNew, farmStakeTotal);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });

  const haveShare = Number(userTotalShareToString) > 0;
  const { listMap } = props;
  useEffect(() => {
    if (pool.id && Object.keys(listMap).length > 0) {
      setPoolDetail(listMap[pool.id]);
      // getPoolsDetailById({ pool_id: pool.id as any }).then((res) => {
      //   setPoolDetail(res);
      // });
    }
  }, [pool, addSuccess, listMap]);

  const [showAdd, setShowAdd] = useState(false);
  const hideAdd = () => {
    setShowAdd(false);
  };

  const [showRemove, setShowRemove] = useState(false);
  const hideRemove = () => {
    setShowRemove(false);
  };

  const [showAddStable, setShowAddStable] = useState(false);
  const hideAddStable = () => {
    setShowAddStable(false);
  };

  const [showRemoveStable, setShowRemoveStable] = useState(false);
  const hideRemoveStable = () => {
    setShowRemoveStable(false);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); //
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div
      className={`rounded-xl mt-3 lg:px-4 bg-gray-20 bg-opacity-30 hover:cursor-pointer ${
        switch_off ? "" : "pb-4"
      }`}
    >
      {/* pc */}
      {!isMobile && (
        <div
          className="w-full min-h-17 grid grid-cols-12 py-4 xsm:hidden"
          onClick={() => {
            router.push(
              props?.type == "stable"
                ? `/sauce/${pool.id}`
                : props?.type == "degen"
                ? `/sauce/${pool.id}`
                : `/pool/${pool.id}`
            );
          }}
        >
          <div className="flex items-center  col-span-2">
            <div className="flex flex-col justify-center">
              <div className="flex pl-2">{Images}</div>
              <span className="text-xs text-gray-10 mt-1">
                {props?.type == "stable"
                  ? "Stable Pool"
                  : props?.type == "degen"
                  ? "Degen Pool"
                  : ""}
              </span>
            </div>
            <div className="ml-2">
              {(supportFarmV1 > endedFarmV1 ||
                Number(farmStakeV1) > 0 ||
                supportFarmV2 > endedFarmV2 ||
                Number(farmStakeV2) > 0) && (
                <div
                  className={` bg-farmTagBg text-farmApyColor   border-farmApyColor w-11 h-5 rounded-2xl frcc italic font-normal`}
                  style={{
                    border: "0.5px solid ",
                    fontSize: "10px",
                  }}
                >
                  Farms
                </div>
              )}
            </div>
          </div>
          {/*  */}
          <div className="col-span-2 flex justify-start items-center">
            <div className="flex flex-col items-start ">{Symbols}</div>
          </div>

          {/*  */}
          <div className="flex  items-center text-xs text-white col-span-4">
            <div className="w-30">
              <span className="text-base font-medium">
                {display_number_withCommas(lp_total)}
              </span>
              <span className="text-sm text-gray-10 font-normal ml-1.5">
                ({display_percent(user_lp_percent)})
              </span>
            </div>

            <div className="flex flex-col text-xs ml-9 text-gray-10 relative z-10">
              {supportFarmV1 > endedFarmV1 ||
                (Number(farmStakeV1) > 0 && (
                  <PoolFarmAmount
                    pool={pool}
                    farmVersion={"v1"}
                    supportFarmV1={supportFarmV1}
                    endedFarmV1={endedFarmV1}
                    farmStakeV1={farmStakeV1}
                    lpDecimal={lpDecimal}
                    supportFarmV2={supportFarmV2}
                    endedFarmV2={endedFarmV2}
                    farmStakeV2={farmStakeV2}
                  />
                ))}

              {(supportFarmV2 > endedFarmV2 || Number(farmStakeV2) > 0) && (
                <PoolFarmAmount
                  pool={pool}
                  farmVersion={"v2"}
                  supportFarmV1={supportFarmV1}
                  endedFarmV1={endedFarmV1}
                  farmStakeV1={farmStakeV1}
                  lpDecimal={lpDecimal}
                  supportFarmV2={supportFarmV2}
                  endedFarmV2={endedFarmV2}
                  farmStakeV2={farmStakeV2}
                />
              )}
              {shadowBurrowShare?.stakeAmount &&
                pool &&
                getConfigV2().SUPPORT_SHADOW_POOL_IDS.includes(
                  pool?.id?.toString()
                ) && (
                  <div
                    className={`cursor-pointer ${
                      !(supportFarmV2 > endedFarmV2) ? "hidden" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const shadow_id = `shadow_ref_v1-${pool?.id}`;
                      const url = `https://app.burrow.finance/tokenDetail/${shadow_id}`;
                      window.open(url);
                    }}
                  >
                    <ShareInBurrow
                      farmStake={shadowBurrowShare?.stakeAmount}
                      userTotalShare={userTotalShare}
                      inStr={"Burrow"}
                      forStable
                      onlyShowStake
                      poolId={pool.id}
                      hideIcon
                    />
                  </div>
                )}
              {Big(LpLocked).gt(0) ? (
                <div className="text-gray-10 mb-1">
                  <span className="text-white">
                    {toPrecision(
                      toReadableNumber(
                        lpDecimal,
                        scientificNotationToString(LpLocked.toString())
                      ),
                      2
                    )}
                  </span>
                  <span className="mx-1">in</span>
                  <span>Locked</span>
                </div>
              ) : null}
              {Number(getVEPoolId()) === Number(pool.id) &&
              !!getConfig().REF_VE_CONTRACT_ID ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    router.push("/referendum");
                  }}
                  className="text-gray-10 mb-1.5 flex whitespace-nowrap items-center"
                >
                  <span className="text-white">
                    {toPrecision(
                      ONLY_ZEROS.test(
                        toNonDivisibleNumber(
                          LOVE_TOKEN_DECIMAL,
                          toReadableNumber(24, lptAmount || "0")
                        )
                      )
                        ? "0"
                        : toReadableNumber(24, lptAmount || "0"),
                      2
                    )}
                  </span>
                  <span className="mx-1">locked</span>
                  <span className="mr-1">in</span>
                  <div className="text-gray-10 flex items-center hover:text-gradientFrom flex-shrink-0">
                    <span>VOTE</span>
                  </div>
                </div>
              ) : null}

              {ONLY_ZEROS.test(sharesNew) ||
              (supportFarmV1 === 0 && supportFarmV2 === 0 && pool) ? null : (
                <div className="flex items-center">
                  <PoolAvailableAmount
                    shares={sharesNew}
                    pool={pool}
                    className={"text-white"}
                  />
                  &nbsp;available
                </div>
              )}
            </div>
          </div>
          {/*  */}
          <div className="flex items-center col-span-2">
            <span className="text-base text-white font-medium">
              {display_value(lp_total_value)}
            </span>
          </div>

          {/* btn */}
          <div className="col-span-2 frcc">
            <div className={`pr-2 w-1/2 `}>
              <div
                className={`border-green-10 border font-bold rounded frcc w-21 h-8  mr-2.5 text-sm cursor-pointer hover:opacity-80 text-green-10 `}
                onClick={(e) => {
                  e.stopPropagation();
                  props?.type == "stable" || props?.type == "degen"
                    ? setShowAddStable(true)
                    : setShowAdd(true);
                }}
                // disabled={disable_add}
              >
                Add
              </div>
            </div>
            {
              <div className="pl-2 w-1/2">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (+userTotalShareToString == 0) return;
                    props?.type == "stable" || props?.type == "degen"
                      ? setShowRemoveStable(true)
                      : setShowRemove(true);
                  }}
                  // disabled={Number(userTotalShareToString) == 0}
                  className={`w-full ${
                    Number(userTotalShareToString) == 0 || !haveShare
                      ? "text-dark-200 border-gray-190  cursor-not-allowed opacity-40"
                      : "text-dark-200 cursor-pointer border-dark-190"
                  } w-21 h-8 frcc text-sm font-bold border  rounded hover:text-white`}
                >
                  Remove
                </div>
              </div>
            }
          </div>
        </div>
      )}

      {/* mobile */}
      {isMobile && (
        <div
          className="w-full min-h-17 lg:hidden"
          onClick={() => {
            router.push(
              props?.type == "stable"
                ? `/sauce/${pool.id}`
                : props?.type == "degen"
                ? `/sauce/${pool.id}`
                : `/pool/${pool.id}`
            );
          }}
        >
          <div
            className="flex justify-between items-center rounded-md h-16 p-4"
            style={{
              background:
                "linear-gradient(to right, rgba(33, 43, 53, 0.5), rgba(61, 84, 108, 0.5))",
            }}
          >
            <div className="flex flex-col justify-center items-center">
              <div className="flex z-10">{ImagesMob}</div>
              {props?.type == "stable" && (
                <div
                  className={`-mt-1 border border-dark-40 frcc italic px-1 rounded-2xl z-0`}
                  style={{
                    background: "#25445A",
                    color: "#6F98B7",
                    fontSize: "10px",
                    zIndex: 0,
                  }}
                >
                  Stable Pool
                </div>
              )}

              {props?.type == "degen" && (
                <div
                  className={`-mt-1 border border-dark-40 frcc italic px-1 rounded-2xl z-0`}
                  style={{
                    background: "#25445A",
                    color: "#6F98B7",
                    fontSize: "10px",
                    zIndex: 0,
                  }}
                >
                  Degen Pool
                </div>
              )}
            </div>
            <div className="flex flex-col items-end">
              {SymbolsMobWithoutNum}

              <div className="ml-auto">
                {(supportFarmV1 > endedFarmV1 ||
                  Number(farmStakeV1) > 0 ||
                  supportFarmV2 > endedFarmV2 ||
                  Number(farmStakeV2) > 0) && (
                  <div
                    className={` bg-farmTagBg text-farmApyColor   border-farmApyColor w-11 h-5 rounded-2xl frcc italic font-normal`}
                    style={{
                      border: "0.5px solid ",
                      fontSize: "10px",
                    }}
                  >
                    Farms
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Token */}
          <div className="flex justify-between mt-4 px-4">
            <span className="text-gray-60 text-sm">Token:</span>
            <div>{SymbolsMob}</div>
          </div>

          {/* USD Value */}
          <div className="flex justify-between mt-4 px-4">
            <span className="text-gray-60 text-sm">USD Value:</span>
            <span className="text-sm text-white font-normal">
              {display_value(lp_total_value)}
            </span>
          </div>

          {/*LP Token  */}
          <div className="flex  justify-between text-xs text-white mt-4 px-4">
            <span className="text-gray-60 text-sm">LP Token(shares):</span>
            <div className="flex flex-col items-end">
              <div className="">
                <span className="text-sm text-white font-normal">
                  {display_number_withCommas(lp_total)}
                </span>
                <span className="text-sm text-white font-normal ml-0.5">
                  ({display_percent(user_lp_percent)})
                </span>
              </div>

              <div className="flex flex-col text-xs  text-gray-10 relative z-10 mt-2">
                {supportFarmV1 > endedFarmV1 ||
                  (Number(farmStakeV1) > 0 && (
                    <PoolFarmAmount
                      pool={pool}
                      farmVersion={"v1"}
                      supportFarmV1={supportFarmV1}
                      endedFarmV1={endedFarmV1}
                      farmStakeV1={farmStakeV1}
                      lpDecimal={lpDecimal}
                      supportFarmV2={supportFarmV2}
                      endedFarmV2={endedFarmV2}
                      farmStakeV2={farmStakeV2}
                    />
                  ))}

                {(supportFarmV2 > endedFarmV2 || Number(farmStakeV2) > 0) && (
                  <PoolFarmAmount
                    pool={pool}
                    farmVersion={"v2"}
                    supportFarmV1={supportFarmV1}
                    endedFarmV1={endedFarmV1}
                    farmStakeV1={farmStakeV1}
                    lpDecimal={lpDecimal}
                    supportFarmV2={supportFarmV2}
                    endedFarmV2={endedFarmV2}
                    farmStakeV2={farmStakeV2}
                  />
                )}

                {shadowBurrowShare?.stakeAmount &&
                  pool &&
                  getConfigV2().SUPPORT_SHADOW_POOL_IDS.includes(
                    pool?.id?.toString()
                  ) && (
                    <div
                      className={`cursor-pointer flex items-end justify-end ${
                        !(supportFarmV2 > endedFarmV2) ? "hidden" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const shadow_id = `shadow_ref_v1-${pool?.id}`;
                        const url = `https://app.burrow.finance/tokenDetail/${shadow_id}`;
                        window.open(url);
                      }}
                    >
                      <ShareInBurrow
                        farmStake={shadowBurrowShare?.stakeAmount}
                        userTotalShare={userTotalShare}
                        inStr={"Burrow"}
                        forStable
                        onlyShowStake
                        poolId={pool.id}
                        hideIcon
                      />
                    </div>
                  )}

                {Big(LpLocked).gt(0) ? (
                  <div className="text-gray-10 mb-1">
                    <span className="text-white">
                      {toPrecision(
                        toReadableNumber(
                          lpDecimal,
                          scientificNotationToString(LpLocked.toString())
                        ),
                        2
                      )}
                    </span>
                    <span className="mx-1">in</span>
                    <span>Locked</span>
                  </div>
                ) : null}

                {Number(getVEPoolId()) === Number(pool.id) &&
                !!getConfig().REF_VE_CONTRACT_ID ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push("/referendum");
                    }}
                    className="text-gray-10 mb-1.5 flex whitespace-nowrap items-center"
                  >
                    <span className="text-white">
                      {toPrecision(
                        ONLY_ZEROS.test(
                          toNonDivisibleNumber(
                            LOVE_TOKEN_DECIMAL,
                            toReadableNumber(24, lptAmount || "0")
                          )
                        )
                          ? "0"
                          : toReadableNumber(24, lptAmount || "0"),
                        2
                      )}
                    </span>
                    <span className="mx-1">locked</span>
                    <span className="mr-1">in</span>
                    <div className="text-gray-10 flex items-center hover:text-gradientFrom flex-shrink-0">
                      <span>VOTE</span>
                    </div>
                  </div>
                ) : null}

                {ONLY_ZEROS.test(sharesNew) ||
                (supportFarmV1 === 0 && supportFarmV2 === 0 && pool) ? null : (
                  <div className="flex items-center justify-end">
                    <PoolAvailableAmount
                      shares={sharesNew}
                      pool={pool}
                      className={"text-white"}
                    />
                    &nbsp;available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* btn */}
          <div className="flex items-center justify-between mt-4 p-4">
            <div className={`w-1/2 mx-1`}>
              <div
                className={`border-green-10 border font-bold rounded frcc h-8 text-sm cursor-pointer hover:opacity-80 text-green-10 `}
                onClick={(e) => {
                  e.stopPropagation();
                  props?.type == "stable"
                    ? setShowAddStable(true)
                    : setShowAdd(true);
                }}
                // disabled={disable_add}
              >
                Add
              </div>
            </div>
            {
              <div className="w-1/2 mx-1">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (+userTotalShareToString == 0) return;
                    props?.type == "stable"
                      ? setShowRemoveStable(true)
                      : setShowRemove(true);
                  }}
                  // disabled={Number(userTotalShareToString) == 0}
                  className={`w-full ${
                    Number(userTotalShareToString) == 0 || !haveShare
                      ? "text-dark-200 border-gray-190  cursor-not-allowed opacity-40"
                      : "text-dark-200 cursor-pointer border-dark-190"
                  }  h-8 frcc text-sm font-bold border  rounded hover:text-white`}
                >
                  Remove
                </div>
              </div>
            }
          </div>
        </div>
      )}

      {updatedMapList[0]?.token_account_ids &&
        poolDetail &&
        usePoolFullData?.id && (
          <>
            <ClassicAdd
              isOpen={showAdd}
              onRequestClose={hideAdd}
              poolDetail={poolDetail}
              pureIdList={pureIdList}
              updatedMapList={updatedMapList}
              addSuccess={addSuccess}
              setAddSuccess={setAddSuccess}
              fromYours
              pool={usePoolFullData}
              shares={shares}
              isMobile={isMobile}
            />

            <ClassicRemove
              isOpen={showRemove}
              onRequestClose={hideRemove}
              poolDetail={poolDetail}
              pureIdList={pureIdList}
              updatedMapList={updatedMapList}
              addSuccess={addSuccess}
              setAddSuccess={setAddSuccess}
              fromYours
              pool={usePoolFullData}
              shares={shares}
              isMobile={isMobile}
            />

            <>
              <StableAdd
                isOpen={showAddStable}
                onRequestClose={hideAddStable}
                poolDetail={poolDetail}
                pureIdList={pureIdList}
                updatedMapList={updatedMapList}
                isMobile={isMobile}
                addSuccess={addSuccess}
                setAddSuccess={setAddSuccess}
                fromYours
              />

              <StableRemove
                isOpen={showRemoveStable}
                onRequestClose={hideRemoveStable}
                poolDetail={poolDetail}
                pureIdList={pureIdList}
                updatedMapList={updatedMapList}
                isMobile={isMobile}
                pool={usePoolFullData}
                addSuccess={addSuccess}
                shares={shares}
                setAddSuccess={setAddSuccess}
                fromYours
              />
            </>
          </>
        )}
    </div>
  );
}
export const REF_FI_YOUR_LP_VALUE = "REF_FI_YOUR_LP_VALUE";

export const REF_FI_YOUR_LP_VALUE_V1_COUNT = "REF_FI_YOUR_LP_VALUE_V1_COUNT";

export const PoolFarmAmount = ({
  pool,
  farmVersion,
  supportFarmV1,
  endedFarmV1,
  farmStakeV1,
  lpDecimal,
  supportFarmV2,
  endedFarmV2,
  farmStakeV2,
  onRequestClose,
  setIsOpen,
}: {
  pool: any;
  farmVersion: string;
  supportFarmV1: any;
  endedFarmV1: any;
  farmStakeV1: any;
  lpDecimal: any;
  supportFarmV2: any;
  endedFarmV2: any;
  farmStakeV2: any;
  onRequestClose?: () => void;
  setIsOpen?: any;
}) => {
  const router = useRouter();
  const farmStakeAmount =
    useFarmStakeAmount({
      poolId: Number(pool.id),
      farmVersion,
    }) || 0;

  return (
    <div>
      {farmVersion == "v1" &&
        (supportFarmV1 > endedFarmV1 ||
          (Number(farmStakeV1) > 0 && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/v2farms`);
                onRequestClose && onRequestClose();
                setIsOpen && setIsOpen(false);
              }}
              className="text-gray-10 mb-1.5 flex"
            >
              <span className="text-white">
                {toPrecision(
                  toReadableNumber(
                    lpDecimal,
                    scientificNotationToString(farmStakeAmount.toString())
                  ),
                  2
                )}
              </span>
              <span className="mx-1">in</span>
              <div className="text-gray-10 flex items-center hover:cursor-pointer flex-shrink-0">
                <span className="mr-1 underline">Legacy Farms</span>
                <ArrowRightUpIcon className="text-green-10"></ArrowRightUpIcon>
              </div>
            </div>
          )))}

      {farmVersion == "v2" &&
        (supportFarmV2 > endedFarmV2 || Number(farmStakeV2) > 0) && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                `/v2farms/${pool.id}-${
                  endedFarmV2 === supportFarmV2 ? "e" : "r"
                }`
              );
              onRequestClose && onRequestClose();
              setIsOpen && setIsOpen(false);
            }}
            className="text-gray-10 mb-1.5 flex"
          >
            <span className="text-white">
              {toPrecision(
                toReadableNumber(
                  lpDecimal,
                  scientificNotationToString(farmStakeAmount.toString())
                ),
                2
              )}
            </span>
            <span className="mx-1">in</span>
            <div className="text-gray-10 flex items-center hover:cursor-pointer flex-shrink-0">
              <span className="mr-1 underline">Classic Farms</span>
              <FiArrowUpRight className="text-green-10" />
              {/* <span className="ml-0.5">
        <VEARROW />
      </span> */}
            </div>
          </div>
        )}
    </div>
  );
};
