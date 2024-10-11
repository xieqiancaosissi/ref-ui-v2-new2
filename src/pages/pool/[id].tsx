import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import TokenDetail from "@/components/pools/detail/classic/tokenDetail";
import { CollectStar } from "@/components/pools/icon";
import TokenFeeAndCureentPrice from "@/components/pools/detail/classic/tokenFeeAndCureentPrice";
import { getAllTokenPrices } from "@/services/farm";
import TvlAndVolumeCharts from "@/components/pools/detail/classic/TvlAndVolumeCharts";
import OverallLocking from "@/components/pools/detail/classic/overallLocking";
import PoolComposition from "@/components/pools/detail/classic/PoolComposition";
import RecentTransaction from "@/components/pools/detail/classic/RecentTransaction";
import RecentTransactionMobile from "@/components/pools/detail/classic/RecentTransactionMobile";
import {
  addPoolToWatchList,
  removePoolFromWatchList,
  getPoolsDetailById,
} from "@/services/pool";
import { getPoolDetails } from "@/services/pool_detail";
import NoLiquidity from "@/components/pools/detail/liquidity/NoLiquidity";
import NoLiquidityMobile from "@/components/pools/detail/liquidity/NoLiquidityMobile";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import NoContent from "@/components/common/NoContent";
import { useWatchList } from "@/hooks/useWatchlist";
import { usePoolStore } from "@/stores/pool";
import BigNumber from "bignumber.js";
import { useFarmStake } from "@/hooks/useStableShares";
import { toRealSymbol } from "@/services/farm";
import { Icon } from "@/components/pools/detail/liquidity/IconCom";
import { useAccountStore } from "@/stores/account";
import { Pool } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import {
  calculateFairShare,
  toInternationalCurrencySystem,
  divide,
  multiply,
  toRoundedReadableNumber,
  toReadableNumber,
  toPrecision,
} from "@/utils/numbers";
import { getVEPoolId, useAccountInfo } from "@/services/referendum";
import getConfig from "@/utils/config";
import MyShares from "@/components/pools/detail/liquidity/classic/Myshare";
import {
  useSeedFarms,
  useSeedDetail,
  usePool,
  useTokenMetadata,
} from "@/hooks/usePools";
import {
  getEffectiveFarmList,
  openUrl,
  openUrlLocal,
} from "@/services/commonV3";
import { FarmBoost } from "@/services/farm";
import { Fire } from "@/components/pools/detail/liquidity/icon";
import { Images } from "@/components/pools/detail/liquidity/components/liquidityComComp";
import ClassicAdd from "@/components/pools/detail/liquidity/classic/ClassicAdd";
import ClassicRemove from "@/components/pools/detail/liquidity/classic/ClassicRemove";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import { GradientFarmBorder } from "@/components/pools/icon";
import { format_apy } from "@/utils/uiNumber";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import YourLiqMobile from "@/components/pools/detail/liquidity/classic/YourLiqMobile";
import { PoolRouterGuard } from "@/utils/poolTypeGuard";
import { ftGetTokenMetadata } from "@/services/token";

import { getSharesInPool } from "@/services/pool";
import { getStakedListByAccountId } from "@/services/farm";
import { getURLInfo } from "@/utils/transactionsPopup";
import { checkTransactionStatus } from "@/utils/contract";
import { REF_FI_CONTRACT_ID } from "@/utils/contract";
import { checkTransaction } from "@/utils/contract";
import { filterSpecialChar } from "@/utils/numbers";

function ClassicPoolDetail() {
  const router = useRouter();
  const { pureIdList } = useRiskTokens();
  const appStore = useAppStore();
  const poolId = router.query.id || "";
  const poolStore = usePoolStore();
  const accountStore = useAccountStore();
  const { currentwatchListId, accountId } = useWatchList();
  const [poolDetail, setPoolDetail] = useState<any>(null);
  const [isCollect, setIsCollect] = useState(false);
  const [tokenPriceList, setTokenPriceList] = useState<any>(null);
  const [addSuccess, setAddSuccess] = useState(0);
  const { updatedMapList } = useTokenMetadata([poolDetail]);
  const TransactionTabList = [
    { key: "swap", value: "Swap" },
    { key: "liquidity", value: "Liquidity" },
  ];
  const [transactionActive, setTransactionActive] = useState("swap");

  // part refresh
  const [newPool, setNewPool] = useState<any>();
  const [newShares, setNewShares] = useState<string>("0");
  const [newFinalStakeList, setNewFinalStakeList] = useState<
    Record<string, string>
  >({});
  const [newhaveShare, setnewhaveShare] = useState(false);
  const [newTotalFarmStake, setNewTotalFarmStake] = useState("0");
  const [newUserTotalShareToString, setNewUserTotalShareToString] =
    useState("0");
  //
  const [otherTokens, setOtherTokens] = useState<any>([]);
  useEffect(() => {
    if (poolId) {
      getPoolsDetailById({ pool_id: poolId as any }).then((res) => {
        if (!res || addSuccess > 0) {
          fetchPoolDetails(+poolId);
        } else {
          res &&
            PoolRouterGuard(res, "SIMPLE_POOL") &&
            router.push(`${PoolRouterGuard(res, "SIMPLE_POOL")}/${poolId}`);
          setPoolDetail(res);
        }
      });
    }
  }, [poolId, addSuccess]);

  useEffect(() => {
    if (currentwatchListId.length > 0 && poolId) {
      setIsCollect(currentwatchListId.includes(poolId));
    }
  }, [poolId, currentwatchListId, addSuccess]);

  useEffect(() => {
    getAllTokenPrices().then((res) => {
      setTokenPriceList(res);
    });
    poolStore.setPoolActiveTab("classic");
  }, [addSuccess]);

  const collectPool = () => {
    if (!accountId) showWalletSelectorModal(appStore.setShowRiskModal);
    if (isCollect) {
      removePoolFromWatchList({ pool_id: poolId.toString() });
    } else {
      addPoolToWatchList({ pool_id: poolId.toString() });
    }
    setIsCollect((previos) => !previos);
  };

  async function fetchPoolDetails(poolId: number) {
    try {
      const poolDetails: any = await getPoolDetails(poolId);
      const backEndPoolDetails = await getPoolsDetailById({
        pool_id: poolId as any,
      });
      const k: any = backEndPoolDetails
        ? {}
        : {
            amounts: ["0", "0"],
            amp: 0,
            apy: "0",
            c_amounts: null,
            degens: null,
            farm_apy: "0",
            farm_is_multi_currency: false,
            fee_volume_24h: "0",
            id: poolId,
            is_farm: false,
            is_meme: false,
            is_new: true,
            pool_kind: "",
            rates: null,
            shares_total_supply: "0",
            token_account_ids: [],
            token_symbols: [],
            top: false,
            total_fee: "0",
            tvl: "0",
            volume_24h: "0",
          };

      Object.assign(k, poolDetails);
      backEndPoolDetails && Object.assign(k, backEndPoolDetails);
      k.token_account_ids = [...poolDetails.tokenIds];
      k.pool_kind = poolDetails.pool_kind;
      k.total_fee = poolDetails.fee / 10000; // 假设保留四位小数
      const tokenMetadataPromises = poolDetails.tokenIds.map((id: any) =>
        ftGetTokenMetadata(id)
      );
      const tokenMetadatas = await Promise.all(tokenMetadataPromises);

      k.token_symbols = tokenMetadatas.map((meta) => meta.symbol);
      k.amounts = tokenMetadatas.map(
        (meta, index) => poolDetails.supplies[meta.id]
      );

      setPoolDetail(k);
    } catch (error) {
      console.error("Error fetching pool details:", error);
    }
  }

  const {
    pool,
    shares,
    finalStakeList: stakeList,
  } = usePool(poolId.toString());

  const farmStakeTotal = useFarmStake({ poolId: Number(poolId), stakeList });

  const userTotalShare = BigNumber.sum(shares, farmStakeTotal);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });

  const haveShare = Number(userTotalShareToString) > 0;

  const tokenAmountShareRaw = (
    pool: Pool,
    token: TokenMetadata,
    shares: string
  ) => {
    return toRoundedReadableNumber({
      decimals: token.decimals,
      number: calculateFairShare({
        shareOf: pool.supplies[token.id],
        contribution: shares,
        totalContribution: pool.shareSupply,
      }),
      precision: 3,
      withCommas: false,
    });
  };

  const tokenAmountShare = (
    pool: Pool,
    token: TokenMetadata,
    shares: string
  ) => {
    const value = toRoundedReadableNumber({
      decimals: token.decimals,
      number: calculateFairShare({
        shareOf: pool.supplies[token.id],
        contribution: shares,
        totalContribution: pool.shareSupply,
      }),
      precision: 3,
      withCommas: false,
    });

    return Number(value) == 0
      ? "0"
      : Number(value) < 0.001 && Number(value) > 0
      ? "< 0.001"
      : toInternationalCurrencySystem(value, 3);
  };

  const tokenInfoPC = ({ token }: { token: TokenMetadata }) => {
    return tokenAmountShare(
      pool,
      token,
      new BigNumber(
        addSuccess > 0 ? newUserTotalShareToString : userTotalShareToString
      )
        .plus(Number(getVEPoolId()) === Number(pool.id) ? lptAmount : "0")
        .toNumber()
        .toFixed()
    );
  };

  const { lptAmount, fetchDoneVOTEAccountInfo } =
    !!getConfig().REF_VE_CONTRACT_ID && +poolId === Number(getVEPoolId())
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useAccountInfo()
      : { lptAmount: "0", fetchDoneVOTEAccountInfo: true };

  const usdValue = useMemo(() => {
    try {
      if (
        (addSuccess > 0
          ? !newUserTotalShareToString
          : !userTotalShareToString) ||
        !pool
      )
        return "-";
      const rawRes = multiply(
        new BigNumber(
          addSuccess > 0 ? newUserTotalShareToString : userTotalShareToString
        )
          .plus(
            Number(getVEPoolId()) === Number(pool.id) ? lptAmount || "0" : "0"
          )
          .toNumber()
          .toFixed(),
        divide(
          poolDetail?.tvl?.toString(),
          addSuccess > 0 ? newPool?.shareSupply : pool?.shareSupply
        )
      );
      return `$${
        Number(rawRes) == 0 ? "0" : toInternationalCurrencySystem(rawRes, 2)
      }`;
    } catch (error) {
      return "-";
    }
  }, [
    poolDetail?.tvl,
    userTotalShareToString,
    newUserTotalShareToString,
    pool,
  ]);

  // farm
  const [seedId, setSeedId] = useState("");
  const seedFarms = useSeedFarms(seedId);
  const { seedDetail, isLoading: seedIsLoading } = useSeedDetail(seedId);
  useEffect(() => {
    if (poolDetail?.id) {
      setSeedId(poolDetail?.id.toString());
    }
  }, [JSON.stringify(poolDetail || {})]);

  function totalTvlPerWeekDisplay() {
    const farms = seedFarms;
    const rewardTokenIconMap: any = {};
    let totalPrice = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    effectiveFarms.forEach((farm: FarmBoost) => {
      const { id, decimals, icon }: any = farm.token_meta_data;
      const { daily_reward } = farm.terms;
      rewardTokenIconMap[id] = icon;
      const tokenPrice = tokenPriceList?.[id]?.price;
      if (tokenPrice && tokenPrice != "N/A") {
        const tokenAmount = toReadableNumber(decimals, daily_reward);
        totalPrice += +new BigNumber(tokenAmount)
          .multipliedBy(tokenPrice)
          .toFixed();
      }
    });
    totalPrice = +new BigNumber(totalPrice).multipliedBy(7).toFixed();
    const totalPriceDisplay =
      totalPrice == 0
        ? "-"
        : "$" + toInternationalCurrencySystem(totalPrice.toString(), 2);
    return totalPriceDisplay;
  }
  const [getBaseApr, setBaseApr] = useState({
    displayApr: "",
    rawApr: 0,
  });
  function BaseApr() {
    if (pool?.shareSupply && !seedIsLoading) {
      const farms = seedFarms;

      let totalReward = 0;
      const effectiveFarms = getEffectiveFarmList(farms);
      effectiveFarms.forEach((farm: any) => {
        const reward_token_price = Number(
          tokenPriceList?.[farm.token_meta_data.id]?.price || 0
        );

        totalReward =
          totalReward + Number(farm.yearReward) * reward_token_price;
      });

      const poolShares = Number(toReadableNumber(24, pool.shareSupply));

      const seedTvl =
        !poolShares || !seedDetail
          ? 0
          : (Number(
              toReadableNumber(
                seedDetail.seed_decimal,
                seedDetail.total_seed_power
              )
            ) *
              (poolDetail?.tvl || 0)) /
            poolShares;

      const baseAprAll = !seedTvl ? 0 : totalReward / seedTvl;
      setBaseApr({
        displayApr:
          !seedDetail || !seedFarms
            ? "-"
            : `${toPrecision((baseAprAll * 100).toString(), 2)}%`,
        rawApr: !poolDetail?.tvl || !seedDetail || !seedFarms ? 0 : baseAprAll,
      });
    }
  }

  useEffect(() => {
    if (seedDetail && seedFarms) BaseApr();
  }, [seedDetail, seedFarms]);

  const [showAdd, setShowAdd] = useState(false);
  const hideAdd = () => {
    setShowAdd(false);
  };

  const [showRemove, setShowRemove] = useState(false);
  const hideRemove = () => {
    setShowRemove(false);
  };

  const [showYourLiq, setShowYourLiq] = useState(false);
  const hideYourLiq = () => {
    setShowYourLiq(false);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // ipad pro
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // const { txHash } = getURLInfo();

  // addsuccess  for part generate

  useEffect(() => {
    if (addSuccess > 0) {
      const PoolFn = (id: number | string) => {
        getPoolDetails(Number(id)).then((res) => {
          console.log(res);
          setNewPool(res);
        });
        getSharesInPool(Number(id))
          .then((res) => {
            setNewShares(res);
          })
          .catch(() => setNewShares);

        getStakedListByAccountId({})
          .then(({ stakedList, finalStakeList, v2StakedList }) => {
            setNewFinalStakeList(finalStakeList);
          })
          .catch((err: any) => {
            console.log(err);
          });
      };
      PoolFn(poolId.toString());
    }
  }, [addSuccess]);

  useEffect(() => {
    if (newPool?.id && newShares) {
      let totalFarmStake = new BigNumber("0"); //
      Object.keys(stakeList).forEach((seed) => {
        const id = Number(seed.split("@")[1]);
        if (id == Number(poolId)) {
          totalFarmStake = totalFarmStake.plus(new BigNumber(stakeList[seed])); //
        }
      });
      setNewTotalFarmStake(totalFarmStake.toString());

      setNewUserTotalShareToString(
        BigNumber.sum(newShares, totalFarmStake.toString())
          .toNumber()
          .toLocaleString("fullwide", { useGrouping: false })
      );
      console.log(newPool, pool, "xxx");
      const newhaveShare =
        Number(
          BigNumber.sum(newShares, totalFarmStake.toString())
            .toNumber()
            .toLocaleString("fullwide", { useGrouping: false })
        ) > 0;
      setnewhaveShare(newhaveShare);
    }
  }, [newPool, newShares]);

  return (
    <div className="w-full fccc h-full px-3">
      {/* return */}
      <div className="lg:w-270 xsm:w-full cursor-pointer text-base text-gray-60 mb-3 lg:mt-8 ">
        <span
          className="xsm:hidden hover:text-white"
          onClick={() => router.push("/pools")}
        >{`<  Pools`}</span>
        <span
          className="lg:hidden hover:text-white"
          onClick={() => router.push("/pools")}
        >
          {`Pools >`} <span className="text-white">Details</span>
        </span>
      </div>

      {/* title */}
      <div className="lg:w-270 xsm:w-full min-h-10 flex items-center xsm:hidden">
        <div className="w-183 flex flex-wrap items-center">
          {poolDetail && updatedMapList?.length > 0 && (
            <>
              <TokenDetail {...poolDetail} updatedMapList={updatedMapList} />
              {/*  */}
              <span className="text-2xl text-white font-bold ml-1 mr-2">
                {poolDetail?.token_symbols
                  ?.map((item: any) =>
                    item == "wNEAR" ? (item = "NEAR") : filterSpecialChar(item)
                  )
                  .join("-")}
              </span>

              {/* farm tag */}
              {poolDetail.is_farm && (
                <div
                  className={` bg-farmTagBg text-farmApyColor frcc text-xs italic w-13 h-5 rounded-xl mr-2`}
                >
                  Farms
                </div>
              )}

              {/* watchlist */}
              <div className="lg:mr-9">
                <CollectStar
                  iscollect={!accountId ? "false" : isCollect.toString()}
                  className="cursor-pointer"
                  onClick={() => collectPool()}
                />
              </div>

              {/* pc fee */}
              {updatedMapList &&
                pool &&
                Object.values(pool?.supplies).length > 0 &&
                updatedMapList[0]?.token_account_ids?.length > 0 &&
                !isMobile && (
                  <TokenFeeAndCureentPrice
                    poolDetail={poolDetail}
                    tokenPriceList={tokenPriceList}
                    updatedMapList={updatedMapList}
                    pool={pool}
                    share={shares}
                  />
                )}
            </>
          )}
        </div>
      </div>

      <div className="xsm:w-full min-h-10 flex items-center lg:hidden">
        {poolDetail && updatedMapList?.length > 0 && (
          <div className="flex items-center justify-between w-full">
            <div className="frcc">
              <TokenDetail {...poolDetail} updatedMapList={updatedMapList} />
              {/*  */}
              <span className=" text-2xl text-white font-bold ml-1 mr-2 text-ellipsis overflow-hidden whitespace-nowrap">
                {poolDetail?.token_symbols
                  ?.map((item: any) =>
                    item == "wNEAR" ? (item = "NEAR") : filterSpecialChar(item)
                  )
                  .join("-")}
              </span>

              {/* farm tag */}
              {poolDetail.is_farm && (
                <div
                  className={` bg-farmTagBg text-farmApyColor frcc text-xs italic w-13 h-5 rounded-xl mr-2`}
                >
                  Farms
                </div>
              )}
            </div>
            {/* watchlist */}
            <CollectStar
              iscollect={!accountId ? "false" : isCollect.toString()}
              className="cursor-pointer"
              onClick={() => collectPool()}
            />
          </div>
        )}
      </div>

      {/* mobile */}
      {updatedMapList &&
        pool &&
        Object.values(pool?.supplies).length > 0 &&
        updatedMapList[0]?.token_account_ids?.length > 0 &&
        isMobile && (
          <TokenFeeAndCureentPrice
            poolDetail={poolDetail}
            tokenPriceList={tokenPriceList}
            updatedMapList={updatedMapList}
            pool={pool}
            share={shares}
          />
        )}

      {/* farm pc hidden*/}
      {seedFarms && isMobile && (
        <div
          className="flex flex-col mt-4 relative z-30 rounded lg:hidden w-full mr-auto p-4"
          style={{
            backgroundImage: 'url("/images/fram.png")',
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          {/* <GradientFarmBorderMobile className="absolute -z-10 left-2"></GradientFarmBorderMobile> */}
          <div className="flex items-center  justify-between">
            <div className="text-white whitespace-nowrap text-base font-normal">
              Farm APR
            </div>

            <div className="rounded-lg flex items-center px-2 py-0.5">
              <Images
                className="mr-1"
                tokens={seedFarms?.map((farm: any) => farm.token_meta_data)}
                size="4"
                isRewardDisplay
              />
              <span className="text-xs text-white">
                {totalTvlPerWeekDisplay()}
                /week
              </span>
            </div>
          </div>

          <div className="flex items-center mt-1 justify-between">
            <div className="flex items-center text-lg farmTextGradient">
              <span className="mr-2">{format_apy(poolDetail.farm_apy)}</span>
              <Fire />
            </div>

            <div
              className=" rounded text-white frcc w-28 h-8 text-sm cursor-pointer hover:opacity-90"
              style={{
                background: "linear-gradient(to bottom, #9EFF01, #5F9901)",
              }}
              onClick={() => {
                router.push(`/v2farms/${poolId}-r`);
              }}
            >
              Farm Now!
            </div>
          </div>
        </div>
      )}
      {/* main */}
      <div className="flex lg:w-270 xsm:w-full lg:mt-2">
        {/* left */}

        <div className="lg:w-183 xsm:w-full">
          {/* charts */}
          <div className="lg:min-h-135 xsm:min-h-100">
            {poolDetail ? (
              <TvlAndVolumeCharts poolId={poolId} />
            ) : (
              <NoContent tips="Chart is Loading..." h="h-90" />
            )}
          </div>

          {/* tvl & Overall locking */}
          <div className="lg:-mt-20 xsm:-mt-10">
            {poolDetail && updatedMapList?.length > 0 && (
              <OverallLocking
                poolDetail={poolDetail}
                updatedMapList={updatedMapList}
                setAddSuccess={setAddSuccess}
                shares={addSuccess > 0 ? newShares : shares}
                addSuccess={addSuccess}
              />
            )}
          </div>

          {/* Pool composition */}
          <div>
            <h3 className="mt-12 mb-4 text-lg lg:text-gray-50 xsm:text-white font-bold">
              <span className="text-with-custom-underline">
                Pool Composition
              </span>
              {/* <div className="h-0.5 w-full bg-white mt-1 lg:hidden"></div> */}
            </h3>

            {poolDetail && updatedMapList?.length > 0 ? (
              <PoolComposition
                poolDetail={poolDetail}
                tokenPriceList={tokenPriceList}
                updatedMapList={updatedMapList}
              />
            ) : (
              <SkeletonTheme
                baseColor="rgba(106, 114, 121, 0.3)"
                highlightColor="#9eff00"
              >
                <Skeleton
                  width={isMobile ? "100%" : 732}
                  height={60}
                  count={2}
                />
              </SkeletonTheme>
            )}
          </div>

          {/* Recent Transaction */}
          <div className="xsm:mb-40">
            <div className="mt-12 mb-4 flex justify-between">
              <span className="text-lg lg:text-gray-50 xsm:text-white font-bold">
                <span className="text-with-custom-underline">
                  Recent Transaction
                </span>
              </span>
              <div className="flex items-center mr-0.5 xsm:hidden">
                {TransactionTabList.map((item, index) => {
                  return (
                    <div
                      key={item.key + "_" + index}
                      onClick={() => setTransactionActive(item.key)}
                      className={`cursor-pointer border border-gray-40 frcc text-sm font-medium px-2 py-1 rounded hover:text-white ${
                        item.key == transactionActive
                          ? "text-white bg-gray-40"
                          : "text-gray-60 bg-transparent"
                      } ${index == 0 ? "mr-2" : ""}`}
                    >
                      {item.value}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center mr-0.5 lg:hidden border border-gray-230 px-0.5 rounded">
                {TransactionTabList.map((item, index) => {
                  return (
                    <div
                      key={item.key + "_" + index}
                      onClick={() => setTransactionActive(item.key)}
                      className={`cursor-pointer  frcc text-sm font-medium px-2 py-1 rounded hover:text-white ${
                        item.key == transactionActive
                          ? "text-white bg-gray-40"
                          : "text-gray-60 bg-transparent"
                      } ${index == 0 ? "mr-2" : ""}`}
                    >
                      {item.value}
                    </div>
                  );
                })}
              </div>
            </div>
            {/*  */}
            {poolDetail &&
              updatedMapList?.length > 0 &&
              updatedMapList[0]?.token_account_ids &&
              !isMobile && (
                <RecentTransaction
                  activeTab={transactionActive}
                  poolId={poolId}
                  updatedMapList={updatedMapList}
                />
              )}

            {poolDetail &&
              updatedMapList?.length > 0 &&
              updatedMapList[0]?.token_account_ids &&
              isMobile && (
                <RecentTransactionMobile
                  activeTab={transactionActive}
                  poolId={poolId}
                  updatedMapList={updatedMapList}
                />
              )}
          </div>
        </div>

        {/* right liquidity mobile hidden*/}
        <div className="lg:w-80 ml-auto xsm:hidden">
          {((addSuccess > 0 ? !newhaveShare : !haveShare) ||
            !poolId ||
            !accountId) && (
            <NoLiquidity add={() => setShowAdd(true)} isLoading={false} />
          )}
          {accountId &&
            (addSuccess > 0 ? newhaveShare : haveShare) &&
            pool?.id &&
            updatedMapList?.length > 0 && (
              <div className="w-80 h-58 p-4 rounded bg-refPublicBoxDarkBg flex flex-col ">
                <div className="flex items-center justify-between text-white">
                  <span className="whitespace-nowrap">Your Liquidity</span>

                  <MyShares
                    shares={addSuccess > 0 ? newShares : shares}
                    totalShares={
                      addSuccess > 0 ? newPool?.shareSupply : pool.shareSupply
                    }
                    poolId={pool.id}
                    stakeList={addSuccess > 0 ? newFinalStakeList : stakeList}
                    lptAmount={lptAmount}
                  />
                </div>

                <div className="w-full text-right text-sm mb-7 ">
                  {!accountStore.isSignedIn ? (
                    "-"
                  ) : usdValue === "-" ? (
                    "-"
                  ) : (
                    <div className="flex items-center relative top-1.5 justify-between">
                      <span className="whitespace-nowrap text-gray-50">
                        Estimate Value
                      </span>

                      <span className="text-gray-50 font-normal">
                        {usdValue}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col text-center text-base">
                  {updatedMapList[0]?.token_account_ids?.map(
                    (token: any, index: number) => (
                      <div
                        key={index + "classic" + token.symbol}
                        className="flex items-center justify-between mb-3"
                      >
                        <div className="flex items-center">
                          <Icon icon={token.icon} className="h-7 w-7 mr-2" />
                          <div className="flex items-start flex-col">
                            <div className="flex items-center text-gray-10 text-sm">
                              {toRealSymbol(token.symbol)}
                            </div>
                          </div>
                        </div>
                        <div
                          className="flex items-center text-gray-10 text-sm"
                          title={tokenAmountShareRaw(
                            addSuccess > 0 ? newPool : pool,
                            token,
                            new BigNumber(
                              addSuccess > 0
                                ? newUserTotalShareToString
                                : userTotalShareToString
                            )
                              .plus(
                                Number(getVEPoolId()) === Number(poolId)
                                  ? lptAmount
                                  : "0"
                              )
                              .toNumber()
                              .toFixed()
                          )}
                        >
                          {tokenInfoPC({ token })}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex items-center w-full mt-2">
                  <div
                    className={`pr-2 ${
                      (addSuccess > 0 ? newhaveShare : haveShare)
                        ? "w-1/2"
                        : "w-full"
                    } `}
                  >
                    <div
                      className={`poolBtnStyleBase w-35 h-10  mr-2.5 text-sm cursor-pointer hover:opacity-90 `}
                      onClick={() => setShowAdd(true)}
                      // disabled={disable_add}
                    >
                      Add
                    </div>
                  </div>
                  {(addSuccess > 0 ? newhaveShare : haveShare) && (
                    <div className="pl-2 w-1/2">
                      <div
                        onClick={() => {
                          if (
                            addSuccess > 0
                              ? +newUserTotalShareToString == 0
                              : +userTotalShareToString == 0
                          )
                            return;
                          setShowRemove(true);
                        }}
                        // disabled={Number(userTotalShareToString) == 0}
                        className={`w-full ${
                          Number(
                            addSuccess > 0
                              ? newUserTotalShareToString
                              : userTotalShareToString
                          ) == 0
                            ? "border-gray-90 text-gray-60 cursor-not-allowed"
                            : "border-green-10 text-green-10 cursor-pointer "
                        }  border rounded-md frcc w-35 h-10 text-sm hover:opacity-80 `}
                      >
                        Remove
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* farm */}
          {seedFarms && (
            <div className="flex flex-col mt-4 relative z-30 rounded">
              <GradientFarmBorder className="absolute -z-10 left-2"></GradientFarmBorder>
              <div className="flex items-center px-6 pt-4 justify-between">
                <div className="text-white whitespace-nowrap text-base font-normal">
                  Farm APR
                </div>

                <div className="rounded-lg flex items-center px-2 py-0.5">
                  <Images
                    className="mr-1"
                    tokens={seedFarms?.map((farm: any) => farm.token_meta_data)}
                    size="4"
                    isRewardDisplay
                  />
                  <span className="text-xs text-white">
                    {totalTvlPerWeekDisplay()}
                    /week
                  </span>
                </div>
              </div>

              <div className="flex items-center px-6 pt-1 justify-between">
                <div className="flex items-center text-lg farmTextGradient">
                  <span className="mr-2">
                    {format_apy(poolDetail.farm_apy)}
                  </span>
                  <Fire />
                </div>

                <div
                  className=" rounded text-white frcc w-28 h-8 text-sm cursor-pointer hover:opacity-90"
                  style={{
                    background: "linear-gradient(to bottom, #9EFF01, #5F9901)",
                  }}
                  onClick={() => {
                    router.push(`/v2farms/${poolId}-r`);
                  }}
                >
                  Farm Now!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {((addSuccess > 0 ? !newhaveShare : !haveShare) ||
        !poolId ||
        !accountId) &&
        isMobile && (
          <NoLiquidityMobile add={() => setShowAdd(true)} isLoading={false} />
        )}

      {accountId &&
        (addSuccess > 0 ? newhaveShare : haveShare) &&
        pool?.id &&
        updatedMapList?.length > 0 &&
        isMobile && (
          <div
            className="h-24 frcc p-4 fixed bottom-8 z-10"
            style={{
              background: "#16232E",
              width: "100vw",
            }}
          >
            <div
              className="w-full frcc h-12 text-black rounded text-base"
              style={{
                background: "linear-gradient(to right, #9EFF00, #5F9900)",
              }}
              onClick={() => {
                setShowYourLiq(true);
              }}
            >
              Your Liquidity
            </div>
          </div>
        )}
      {accountId &&
        (addSuccess > 0 ? newhaveShare : haveShare) &&
        pool?.id &&
        updatedMapList?.length > 0 &&
        isMobile && (
          <YourLiqMobile
            isOpen={showYourLiq}
            onRequestClose={hideYourLiq}
            shares={addSuccess > 0 ? newShares : shares}
            totalShares={pool.shareSupply}
            poolId={pool.id}
            pool={pool}
            stakeList={stakeList}
            lptAmount={lptAmount}
            usdValue={usdValue}
            haveShare={addSuccess > 0 ? newhaveShare : haveShare}
            userTotalShareToString={
              addSuccess > 0
                ? newUserTotalShareToString
                : userTotalShareToString
            }
            tokenInfoPC={tokenInfoPC}
            setShowRemove={setShowRemove}
            setShowAdd={setShowAdd}
            tokenAmountShareRaw={tokenAmountShareRaw}
            updatedMapList={updatedMapList}
          ></YourLiqMobile>
        )}

      {/* add */}
      {updatedMapList[0]?.token_account_ids &&
        poolDetail &&
        (addSuccess > 0 ? newPool : pool) && (
          <>
            <ClassicAdd
              isOpen={showAdd}
              onRequestClose={hideAdd}
              poolDetail={poolDetail}
              pureIdList={pureIdList}
              updatedMapList={updatedMapList}
              isMobile={isMobile}
              setAddSuccess={setAddSuccess}
              addSuccess={addSuccess}
              shares={addSuccess > 0 ? newShares : shares}
              pool={addSuccess > 0 ? newPool : pool}
            />

            <ClassicRemove
              isOpen={showRemove}
              onRequestClose={hideRemove}
              poolDetail={poolDetail}
              pureIdList={pureIdList}
              updatedMapList={updatedMapList}
              isMobile={isMobile}
              setAddSuccess={setAddSuccess}
              addSuccess={addSuccess}
              shares={addSuccess > 0 ? newShares : shares}
              pool={addSuccess > 0 ? newPool : pool}
            />
          </>
        )}
    </div>
  );
}

export default React.memo(ClassicPoolDetail);
