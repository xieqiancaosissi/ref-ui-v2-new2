import { Pool, PoolRPCView } from "@/interfaces/swap";
import {
  display_value,
  useBatchTotalShares,
  useStakeListByAccountId,
} from "@/services/aurora";
import { checkFarmStake, toRealSymbol, useAllFarms } from "@/services/farm";
import { getPoolsByIds, getYourPools } from "@/services/indexer";
import { LP_TOKEN_DECIMALS } from "@/services/m-token";
import {
  getVEPoolId,
  LOVE_TOKEN_DECIMAL,
  useAccountInfo,
} from "@/services/referendum";
import {
  ALL_STABLE_POOL_IDS,
  AllStableTokenIds,
  NEARX_POOL_ID,
} from "@/services/swap/swapConfig";
import {
  getStablePoolDecimal,
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
} from "../../../components/portfolioMobile/components/Tool";
import { TokenMetadata } from "@/services/ft-contract";
import {
  calculateFairShare,
  divide,
  multiply,
  ONLY_ZEROS,
  percent,
  scientificNotationToString,
  toInternationalCurrencySystem,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from "@/utils/numbers";
import { openUrl, openUrlLocal } from "@/services/commonV3";
import { LinkIcon } from "@/components/farm/icon";
import { useFarmStake, useYourliquidity } from "@/hooks/useStableShares";
import { useLpLocker } from "@/services/lplock";
import {
  PortfolioContextType,
  PortfolioData,
} from "../../../pages/portfolioMobile";
import { OrdersArrow } from "@/components/portfolio/components/icon";
import { getPoolDetails } from "@/services/pool_detail";
import { getSharesInPool } from "@/services/pool";
import { usePool } from "@/hooks/usePools";
import { PoolFarmAmount } from "@/components/yours/components/modal/YourLiquidityV1";
import getConfigV2 from "@/utils/configV2";
import {
  PoolAvailableAmount,
  ShareInBurrow,
} from "@/components/pools/detail/stable/ShareInFarm";
import Big from "big.js";
import React from "react";

const { BLACK_TOKEN_LIST } = getConfig();
export const StakeListContext = createContext<any>(null);
function YourLiquidityV1(props: any) {
  const {
    setYourLpValueV1,
    setLpValueV1Done,
    setLiquidityLoadingDone,
    setLiquidityQuantity,
    styleType,
    showV1EmptyBar,
  } = props;
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
  useEffect(() => {
    // get all stable pools;
    const ids = ALL_STABLE_POOL_IDS;
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
  }, [isSignedIn]);
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
  }, [pools]);
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
            const value = single_lp_value.multipliedBy(read_total_amount);
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
  }, [data_fetch_status, tvls]);
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
  }, [pools, batchTotalSharesSimplePools]);
  const stablePoolsFinal: PoolRPCView[] = useMemo(() => {
    const activeStablePools = stablePools.filter(
      (p: PoolRPCView, i: number) => {
        return batchTotalShares[i] !== 0;
      }
    );
    return activeStablePools;
  }, [batchTotalShares]);
  return (
    <div>
      {!vePool || !getConfig().REF_VE_CONTRACT_ID ? null : (
        <YourClassicLiquidityLine pool={vePool}></YourClassicLiquidityLine>
      )}
      {stablePoolsFinal.map((pool: PoolRPCView) => {
        return (
          <YourClassicLiquidityLine
            pool={pool}
            key={pool.id}
          ></YourClassicLiquidityLine>
        );
      })}
      {simplePoolsFinal.map((pool: PoolRPCView) => {
        return (
          <YourClassicLiquidityLine
            pool={pool}
            key={pool.id}
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
  } = useContext(StakeListContext)!;
  const { set_your_classic_lp_all_in_farms } = useContext(
    PortfolioData
  ) as PortfolioContextType;
  const { pool } = props;
  const { token_account_ids, id: poolId } = pool;
  const tokens = token_account_ids.map((id: number) => tokensMeta[id]) || [];
  const [switch_off, set_switch_off] = useState<boolean>(true);
  const [poolNew, setPoolNew] = useState<any>();
  const [sharesNew, setShares] = useState("");
  const [addSuccess, setAddSuccess] = useState(0);
  useEffect(() => {
    getPoolDetails(+poolId).then(setPoolNew);
    getSharesInPool(+poolId)
      .then(setShares)
      .catch(() => setShares);
  }, []);
  const decimals = isStablePool(poolId)
    ? getStablePoolDecimal(poolId)
    : LP_TOKEN_DECIMALS;
  const Images = tokens.map((token: TokenMetadata, index: number) => {
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
  const Symbols = tokens.map((token: TokenMetadata, index: number) => {
    const { symbol } = token;
    if (index == tokens.length - 1) {
      return <label key={symbol}>{symbol}</label>;
    } else {
      return <label key={symbol}>{symbol}/</label>;
    }
  });
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
    const is_stable_pool = isStablePool(id);
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
  }, [lp_total, tvls]);
  // get seed status
  const seed_status = useMemo(() => {
    const allFarmV2_count = getFarmsCount(poolId.toString(), v2Farm);
    const endedFarmV2_count = getRealEndedFarmsCount(poolId.toString(), v2Farm);
    if (allFarmV2_count == endedFarmV2_count) return "e";
    return "r";
  }, [v2Farm]);
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
  }, [lp_in_pool, lp_in_vote]);

  const { shares, pool: usePoolFullData } = usePool(+poolId);
  useEffect(() => {
    getPoolDetails(+poolId).then(setPoolNew);
    getSharesInPool(+poolId)
      .then(setShares)
      .catch(() => setShares);
  }, [addSuccess]);
  const farmStakeTotal = useFarmStake({ poolId, stakeList: finalStakeList });
  const LpLocked = useLpLocker(`:${poolId}`);
  const userTotalShare = BigNumber.sum(sharesNew, farmStakeTotal, LpLocked);
  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });
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
  const SymbolsMob = (
    <div className="flex flex-col">
      {tokens.map((token: TokenMetadata, index: number) => {
        return TokenInfoMob({ token });
      })}
    </div>
  );

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
      <YourClassicLiquidityLinePage></YourClassicLiquidityLinePage>
    </LiquidityContextData.Provider>
  );
}
function YourClassicLiquidityLinePage() {
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
  const { shares, shadowBurrowShare } = useYourliquidity(pool.id);
  const farmStakeTotal = useFarmStake({ poolId: Number(pool.id), stakeList });
  const userTotalShare = BigNumber.sum(sharesNew, farmStakeTotal);
  const supportFarmV1 = getFarmsCount(pool.id.toString(), v1Farm);
  const supportFarmV2 = getFarmsCount(pool.id.toString(), v2Farm);
  const endedFarmV1 = getEndedFarmsCount(pool.id.toString(), v1Farm);
  const endedFarmV2 = getEndedFarmsCount(pool.id.toString(), v2Farm);
  const farmStakeV2 = useFarmStake({ poolId: pool.id, stakeList: v2StakeList });
  const farmStakeV1 = useFarmStake({ poolId: pool.id, stakeList });
  const lpDecimal = isStablePool(pool.id) ? getStablePoolDecimal(pool.id) : 24;
  const farmShare = Number(shadowBurrowShare?.stakeAmount).toLocaleString(
    "fullwide",
    {
      useGrouping: false,
    }
  );
  const farmSharePercent = userTotalShare.isGreaterThan(0)
    ? percent(
        farmShare,
        userTotalShare
          .toNumber()
          .toLocaleString("fullwide", { useGrouping: false })
      ).toString()
    : "0";
  const link = `https://app.burrow.finance/tokenDetail/shadow_ref_v1-${pool.id}`;
  return (
    <div className="mb-4">
      <div
        className={`rounded-lg bg-dark-270 mb-0.5 ${switch_off ? "" : "pb-4"}`}
      >
        <div className="bg-portfolioMobileBg pt-4 pb-2.5 pl-3 pr-3 rounded-t-lg">
          <div className="frcb flex-shrink-0 mr-2.5">
            <div className="flex items-center">{Images}</div>
            <div>
              <span className="text-sm text-white paceGrotesk-Bold">
                {Symbols}
              </span>
              <div className="w-full flex items-center justify-end ">
                <span className="w-16 frcc text-xs text-gray-10 px-1 rounded-md border border-gray-90">
                  Classic
                  <span
                    className="ml-1.5"
                    onClick={() => {
                      router.push(`/pool/${pool.id}`);
                    }}
                  >
                    <OrdersArrow></OrdersArrow>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-3.5">
          <div className="frcb mb-5">
            <p className="text-sm text-gray-60">Your liquidity:</p>
            <p className="text-xl text-white paceGrotesk-Bold">
              {display_value(lp_total_value)}
            </p>
          </div>
          <div className="frcb mb-3">
            <p className="text-sm text-gray-60">Your LP Tokens (Share)</p>
            <p className="text-sm text-white frcc">
              {display_number_withCommas(lp_total)} (
              {display_percent(user_lp_percent)})
            </p>
          </div>
          <div className="frcb">
            <p className="text-sm text-gray-60">Usage</p>
            <p className="text-xs text-white">
              <div className="flex flex-col justify-end items-end text-xs text-white">
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
                      className={`cursor-pointer ml-2  ${
                        !(supportFarmV2 > endedFarmV2) ? "hidden" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        openUrl(`https://app.burrow.finance/`);
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
                  <div className="text-gray-10 ml-2">
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
                    className="text-gray-10 ml-2 flex whitespace-nowrap items-center mb-1.5"
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
                  <div className="flex items-center text-gray-10  pl-2 ml-2 mb-1.5">
                    <PoolAvailableAmount
                      shares={sharesNew}
                      pool={pool}
                      className={"text-white"}
                    />
                    &nbsp;Holding
                  </div>
                )}
              </div>
            </p>
          </div>
          {/* <span className="text-sm text-white paceGrotesk-Bold mr-5">
            {display_value(lp_total_value)}
          </span>
          <UpDownButton
            set_switch_off={() => {
              set_switch_off(!switch_off);
            }}
            switch_off={switch_off}
          ></UpDownButton> */}
        </div>
      </div>
      {/* <div className={`${switch_off ? "hidden" : ""}`}>
        <div className="bg-dark-210 rounded-xl px-3.5 py-5 bg-opacity-70 mt-2">
          <div className="frcb mb-4">
            <span className="text-xs text-gray-10">
              Your Liquidity (USD value)
            </span>
            <span className="text-xs text-white">
              {display_value(lp_total_value)}
            </span>
          </div>
          <div className="frcb mb-4">
            <span className="text-xs text-gray-10">
              Your LP Tokens (Shares)
            </span>
            <span className="text-xs text-white">
              {display_number_withCommas(lp_total)} (
              {display_percent(user_lp_percent)})
            </span>
          </div>
          <div className="frcb">
            <span className="text-xs text-gray-10">Usage</span>
            <div className="flex items-center text-xs text-white">
              <div
                className={`flex items-center pl-3.5 ${
                  +lp_in_vote > 0 || +lp_in_pool > 0
                    ? "border-r border-gray-10 pr-3.5"
                    : ""
                } ${+lp_in_farm > 0 ? "" : "hidden"}`}
              >
                {display_number_withCommas(lp_in_farm)} in{" "}
                <span
                  className="flex items-center"
                  onClick={() => {
                    openUrlLocal(`/v2farms/${pool.id}-${seed_status}`);
                  }}
                >
                  <label className="underline cursor-pointer mx-1">farm</label>{" "}
                  <OrdersArrow className="cursor-pointer text-primaryText hover:text-white"></OrdersArrow>
                </span>
              </div>
              <div
                className={`flex items-center pl-3.5 ${
                  +lp_in_pool > 0 ? "pr-3.5 border-r border-orderTypeBg" : ""
                } ${+lp_in_vote > 0 ? "" : "hidden"}`}
              >
                {display_number_withCommas(lp_in_vote)} locked in{" "}
                <span
                  className="flex items-center"
                  onClick={() => {
                    openUrlLocal("/referendum");
                  }}
                >
                  <label className="underline cursor-pointer mx-1">VOTE</label>{" "}
                  <OrdersArrow className="cursor-pointer text-primaryText hover:text-white"></OrdersArrow>
                </span>
              </div>
              <div
                className={`flex items-center pl-3.5 ${
                  +lp_in_pool > 0 ? "" : "hidden"
                }`}
              >
                {display_number_withCommas(lp_in_pool)} Holding
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
export const REF_FI_YOUR_LP_VALUE = "REF_FI_YOUR_LP_VALUE";

export const REF_FI_YOUR_LP_VALUE_V1_COUNT = "REF_FI_YOUR_LP_VALUE_V1_COUNT";

export default React.memo(YourLiquidityV1);
