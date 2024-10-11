import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPoolsDetailById } from "@/services/pool";
import styles from "./style.module.css";
import TokenDetail from "@/components/pools/detail/dcl/tokenDetail";
import { CollectStar, DCLIcon } from "@/components/pools/icon";
import TokenFeeAndCureentPrice from "@/components/pools/detail/dcl/tokenFeeAndCureentPrice";
import { getAllTokenPrices } from "@/services/farm";
import Charts from "@/components/pools/detail/dcl/Charts";
import OverallLocking from "@/components/pools/detail/dcl/overallLocking";
import PoolComposition from "@/components/pools/detail/dcl/PoolComposition";
import { useTokenMetadata } from "@/hooks/usePools";
import RecentTransaction from "@/components/pools/detail/dcl/RecentTransaction";
import RecentTransactionMobile from "@/components/pools/detail/dcl/RecentTransactionMobile";
import { addPoolToWatchList, removePoolFromWatchList } from "@/services/pool";
import NoLiquidity from "@/components/pools/detail/liquidity/NoLiquidity";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import NoContent from "@/components/common/NoContent";
import { useWatchList } from "@/hooks/useWatchlist";
import {
  PoolInfo,
  get_pool,
  list_liquidities,
  get_liquidity,
} from "@/services/swapV3";
import { ftGetTokensMetadata } from "@/services/token";
import BigNumber from "bignumber.js";
import { toReadableNumber } from "@/utils/numbers";
import { usePoolStore } from "@/stores/pool";
import {
  get_pool_name,
  allocation_rule_liquidities,
  get_matched_seeds_for_dcl_pool,
  UserLiquidityInfo,
  get_all_seeds,
} from "@/services/commonV3";
import { useAccountStore } from "@/stores/account";
import { list_farmer_seeds, get_seed } from "@/services/farm";
import { Seed } from "@/services/farm";
import getConfig from "@/utils/config";
import dynamic from "next/dynamic";
import { UnclaimedFeesBox } from "@/components/pools/detail/liquidity/UnclaimedFeesBox";
import { RelatedFarmsBox } from "@/components/pools/detail/liquidity/RelatedFarmsBox";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import NoLiquidityMobile from "@/components/pools/detail/liquidity/NoLiquidityMobile";
import YourLiqAndClaimMobile from "@/components/pools/detail/liquidity/dclYourLiquidity/YourLiqAndClaimMobile";
import { openUrlLocal } from "@/services/commonV3";
import { PoolRouterGuard } from "@/utils/poolTypeGuard";
import { get_pool_id } from "@/services/commonV3";
import {
  sort_tokens_by_base,
  sort_tokens_by_base_onlysymbol,
} from "@/services/commonV3";

const YourLiquidityBox = dynamic(
  () =>
    import(
      "@/components/pools/detail/liquidity/dclYourLiquidity/YourLiquidity"
    ),
  {
    ssr: false,
  }
);

const { REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();

function DCLPoolDetail() {
  const router = useRouter();
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.getIsSignedIn();
  const poolId = router.query.id || "";
  const poolStore = usePoolStore();
  const { currentwatchListId, accountId } = useWatchList();
  const [poolDetail, setPoolDetail] = useState<any>(null);
  const [poolDetailV3, setPoolDetailV3] = useState<PoolInfo | any>(null);
  const [tokens, setTokens] = useState([]);
  const [user_liquidities, set_user_liquidities] = useState<
    UserLiquidityInfo[]
  >([]);
  const [addSuccess, setAddSuccess] = useState(0);
  const [matched_seeds, set_matched_seeds] = useState<Seed[]>([]);

  const [sole_seed, set_sole_seed] = useState<Seed>();
  const [isCollect, setIsCollect] = useState(false);
  const [tokenPriceList, setTokenPriceList] = useState<any>(null);
  const { updatedMapList } = useTokenMetadata([poolDetail]);
  const TransactionTabList = [
    { key: "swap", value: "Swap" },
    { key: "liquidity", value: "Liquidity" },
    { key: "order", value: "Limit Order" },
  ];
  const [transactionActive, setTransactionActive] = useState("swap");
  const appStore = useAppStore();

  const [pID, setPID] = useState<string>("");

  // useEffect(() => {
  //   if (router?.query?.errorCode) {
  //     router.push("/pools");
  //   }
  // }, [JSON.stringify(router)]);

  useEffect(() => {
    if (poolId) {
      setPID(get_pool_id(poolId.toString()));
    }
  }, [poolId]);
  useEffect(() => {
    const fetchPoolDetails = async (poolId) => {
      try {
        const res = await getPoolsDetailById({ pool_id: poolId });
        if (res) {
          setPoolDetail(res);
          if (PoolRouterGuard(res, "DCL")) {
            router.push(`${PoolRouterGuard(res, "DCL")}/${poolId}`);
          }
        } else {
          let attempts = 0;
          const intervalId = setInterval(async () => {
            attempts++;
            const res = await getPoolsDetailById({ pool_id: poolId });
            if (res) {
              clearInterval(intervalId); // 清除轮询定时器
              setPoolDetail(res);
              if (PoolRouterGuard(res, "DCL")) {
                router.push(`${PoolRouterGuard(res, "DCL")}/${poolId}`);
              }
            } else if (
              attempts * 3 >= 30 ||
              (attempts > 3 && router?.query?.errorCode)
            ) {
              // 如果已经轮询了10次（每次3秒），则停止
              clearInterval(intervalId);
              router.push("/pools");
            }
          }, 3000); // 每3秒轮询一次

          // const detail = await get_pool(poolId);
          // if (detail) {
          //   const r = {
          //     id: poolId,
          //     amp: 0,
          //     rates: null,
          //     c_amounts: null,
          //     shares_total_supply: "",
          //     pool_kind: "DCL",
          //     token_account_ids: [poolId.split("|")[0], poolId.split("|")[1]],
          //     amounts: null,
          //     token_symbols: ["", ""],
          //     tvl: "0",
          //     volume_24h: "0",
          //     fee_volume_24h: "0",
          //     apy: "0",
          //     total_fee: "",
          //     farm_apy: "0",
          //     is_farm: false,
          //     is_new: false,
          //     is_meme: false,
          //     farm_is_multi_currency: false,
          //     top: false,
          //     degens: null,
          //   };
          //   const { token_x, token_y } = detail;
          //   const metaData = await ftGetTokensMetadata([token_x, token_y]);
          //   r.token_symbols = metaData.map((meta) => meta.symbol);
          //   Object.assign(r, detail);
          //   setPoolDetail(r);
          // } else {
          //   router.push("/pools");
          // }
        }
      } catch (error) {
        console.error("Failed to fetch pool details:", error);
      }
    };

    if (pID || addSuccess > 0) {
      fetchPoolDetails(pID);
    }
  }, [pID, addSuccess]);

  useEffect(() => {
    if (pID && currentwatchListId.length > 0) {
      setIsCollect(currentwatchListId.includes(pID));
    }
  }, [pID, currentwatchListId, addSuccess]);

  useEffect(() => {
    getAllTokenPrices().then((res) => {
      setTokenPriceList(res);
    });
    poolStore.setPoolActiveTab("dcl");
  }, []);

  useEffect(() => {
    if (poolDetail || addSuccess > 0) {
      get_pool_detail();
    }
  }, [poolDetail, addSuccess]);

  const collectPool = () => {
    if (!accountId) showWalletSelectorModal(appStore.setShowRiskModal);
    if (isCollect) {
      removePoolFromWatchList({ pool_id: pID.toString() });
    } else {
      addPoolToWatchList({ pool_id: pID.toString() });
    }
    setIsCollect((previos) => !previos);
  };

  async function get_pool_detail() {
    const detail: PoolInfo | any = await get_pool(poolDetail.id);
    if (detail) {
      const { token_x, token_y } = detail;
      const metaData: Record<string, any> = await ftGetTokensMetadata([
        token_x,
        token_y,
      ]);
      detail.token_x_metadata = metaData[token_x];
      detail.token_y_metadata = metaData[token_y];
      setPoolDetailV3(detail);
    }
  }

  useEffect(() => {
    if (
      addSuccess > 0 ||
      (poolDetailV3?.token_x && Object.keys(tokenPriceList || {}).length > 0)
    ) {
      const {
        token_x,
        token_y,
        total_x,
        total_y,
        token_x_metadata,
        token_y_metadata,
        total_fee_x_charged,
        total_fee_y_charged,
      } = poolDetailV3;
      const pricex = tokenPriceList[token_x]?.price || 0;
      const pricey = tokenPriceList[token_y]?.price || 0;
      const totalX = new BigNumber(total_x)
        .minus(total_fee_x_charged)
        .toFixed();
      const totalY = new BigNumber(total_y)
        .minus(total_fee_y_charged)
        .toFixed();
      const amountx = toReadableNumber(token_x_metadata.decimals, totalX);
      const amounty = toReadableNumber(token_y_metadata.decimals, totalY);
      const tvlx = Number(amountx) * Number(pricex);
      const tvly = Number(amounty) * Number(pricey);
      const temp_list: any = [];
      const temp_tokenx = {
        meta: token_x_metadata,
        amount: amountx,
        tvl: tvlx,
      };
      const temp_tokeny = {
        meta: token_y_metadata,
        amount: amounty,
        tvl: tvly,
      };
      temp_list.push(temp_tokenx, temp_tokeny);
      setTokens(temp_list);
    }
  }, [poolDetailV3, addSuccess]);

  // add liquidity

  const addLiquidity = () => {
    const pool_name = get_pool_name(poolDetail.id);
    router.push(`/liquidity/${pool_name}`);
  };

  const [all_seeds, set_all_seeds] = useState<any>({});
  async function get_matched_seeds() {
    let all_seeds;
    try {
      all_seeds = await get_all_seeds();
      set_all_seeds(all_seeds);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (all_seeds?.length > 0) {
      const matched_seeds = get_matched_seeds_for_dcl_pool({
        seeds: all_seeds,
        pool_id: pID.toString(),
      });
      set_matched_seeds(matched_seeds);
    }
  }, [JSON.stringify(all_seeds || {})]);

  useEffect(() => {
    if (matched_seeds?.length > 0) {
      const target = matched_seeds[0];
      if (target) {
        set_sole_seed(target);
        set_matched_seeds(matched_seeds);
      }
    }
  }, [matched_seeds]);

  const [showSkection, setShowSkection] = useState(false);
  async function get_user_list_liquidities() {
    setShowSkection(true);
    let user_liquiditys_in_pool: UserLiquidityInfo[] = [];
    const liquidities = await list_liquidities();
    user_liquiditys_in_pool = liquidities.filter(
      (liquidity: UserLiquidityInfo) => {
        const { lpt_id }: any = liquidity;
        const pool_id = lpt_id.split("#")[0];
        if (pool_id == pID) return true;
      }
    );
    const liquiditiesPromise = user_liquiditys_in_pool.map(
      (liquidity: UserLiquidityInfo) => {
        return get_liquidity((liquidity as any).lpt_id);
      }
    );
    const user_liqudities_final = await Promise.all(liquiditiesPromise);

    // get user seeds
    if (user_liqudities_final.length > 0) {
      const user_seeds_map = await list_farmer_seeds();
      const target_seed_ids = Object.keys(user_seeds_map).filter(
        (seed_id: string) => {
          const [contractId, mft_id] = seed_id.split("@");
          if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
            const [fixRange, pool_id, left_point, right_point] =
              mft_id.split("&");
            return pool_id == pID;
          }
        }
      );
      if (target_seed_ids.length > 0) {
        const seedsPromise = target_seed_ids.map((seed_id: string) => {
          return get_seed(seed_id);
        });
        const target_seeds = await Promise.all(seedsPromise);
        target_seeds.forEach((seed: Seed) => {
          const { free_amount, locked_amount } = user_seeds_map[seed.seed_id];
          const user_seed_amount = new BigNumber(free_amount)
            .plus(locked_amount)
            .toFixed();
          allocation_rule_liquidities({
            list: user_liqudities_final,
            user_seed_amount,
            seed,
          });
        });
      }
    }
    set_user_liquidities(user_liqudities_final);
    setShowSkection(false);
  }

  useEffect(() => {
    get_matched_seeds();
  }, [addSuccess]);

  //
  useEffect(() => {
    if (!isSignedIn) return;
    get_user_list_liquidities();
  }, [isSignedIn, pID, addSuccess]);

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

  const [showAdd, setShowAdd] = useState(false);
  const hideAdd = () => {
    setShowAdd(false);
  };

  const [showYourLiq, setShowYourLiq] = useState(false);
  const [showYourLiqType, setShowYourLiqType] = useState("liq");
  const hideYourLiq = () => {
    setShowYourLiq(false);
  };

  return (
    <div className="w-full fccc h-full  px-3">
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

      {/*pc title */}
      <div className="lg:w-270  min-h-10 flex items-center xsm:hidden">
        {poolDetail && poolDetailV3 && updatedMapList?.length > 0 && (
          <>
            <TokenDetail {...poolDetail} updatedMapList={updatedMapList} />
            {/*  */}
            <span className=" text-2xl text-white font-bold ml-1 mr-2">
              {sort_tokens_by_base_onlysymbol(poolDetail?.token_symbols)
                ?.map((item: any) => (item == "wNEAR" ? (item = "NEAR") : item))
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
            <CollectStar
              iscollect={!accountId ? "false" : isCollect.toString()}
              className="cursor-pointer"
              onClick={() => collectPool()}
            />

            {/* pc fee */}
            <TokenFeeAndCureentPrice
              poolDetail={poolDetail}
              poolDetailV3={poolDetailV3}
            />
          </>
        )}
      </div>

      {/* mobile title */}
      <div className="xsm:w-full min-h-10 flex items-center lg:hidden">
        {poolDetail && updatedMapList?.length > 0 && (
          <div className="flex items-center justify-between w-full">
            <div className="frcc">
              <TokenDetail {...poolDetail} updatedMapList={updatedMapList} />
              {/*  */}
              <span className=" text-2xl text-white font-bold ml-1 mr-2">
                {sort_tokens_by_base_onlysymbol(poolDetail?.token_symbols)
                  ?.map((item: any) =>
                    item == "wNEAR" ? (item = "NEAR") : item
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
        updatedMapList[0]?.token_account_ids &&
        isMobile &&
        poolDetail &&
        poolDetailV3 && (
          <TokenFeeAndCureentPrice
            poolDetail={poolDetail}
            poolDetailV3={poolDetailV3}
          />
        )}

      {/* main */}
      <div className="flex lg:w-270 xsm:w-full mt-2">
        {/* left */}

        <div className="lg:w-183 xsm:w-full">
          {/* charts */}
          <div className="lg:min-h-135 xsm:min-h-100">
            {poolDetail && updatedMapList?.length > 0 ? (
              <Charts poolDetail={poolDetail} tokenPriceList={tokenPriceList} />
            ) : (
              <NoContent tips="Chart is Loading..." h="h-90" />
            )}
          </div>

          {/* tvl & Overall locking */}
          <div className="lg:-mt-20">
            {poolDetail && updatedMapList?.length > 0 && (
              <OverallLocking
                poolDetail={poolDetail}
                updatedMapList={updatedMapList}
                isMobile={isMobile}
              />
            )}
          </div>

          {/* Pool composition */}
          <div>
            <h3 className="mt-12 mb-4 text-lg lg:text-gray-50 xsm:text-white font-bold">
              <span className="text-with-custom-underline">
                Pool Composition
              </span>
              {/* <div className="h-0.5 w-38 bg-white mt-1 lg:hidden"></div> */}
            </h3>
            {poolDetail && tokens.length > 0 && updatedMapList?.length > 0 ? (
              <PoolComposition
                poolDetail={poolDetail}
                tokenPriceList={tokenPriceList}
                updatedMapList={updatedMapList}
                tokens={tokens}
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
          <div className="mb-8 xsm:mb-40">
            <div className="mt-12 mb-4 flex justify-between">
              <span className="text-lg lg:text-gray-50 xsm:text-white font-bold">
                <span className="text-with-custom-underline">
                  Recent Transaction
                </span>
                {/* <div className="h-0.5 w-42 bg-white mt-1 lg:hidden"></div> */}
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
                      } ${index == 1 ? "mx-2" : ""}`}
                    >
                      {item.value}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center lg:hidden border border-gray-230 p-1 rounded  my-4">
              {TransactionTabList.map((item, index) => {
                return (
                  <div
                    key={item.key + "_" + index}
                    onClick={() => setTransactionActive(item.key)}
                    className={`cursor-pointer  frcc text-sm font-medium  rounded w-1/3 h-10 ${
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
            {/*  */}
            {poolDetail &&
              tokens.length > 0 &&
              updatedMapList?.length > 0 &&
              !isMobile && (
                <RecentTransaction
                  activeTab={transactionActive}
                  poolId={pID}
                  updatedMapList={updatedMapList}
                  tokens={tokens.map((t: any) => t.meta)}
                />
              )}

            {poolDetail &&
              tokens.length > 0 &&
              updatedMapList?.length > 0 &&
              isMobile && (
                <RecentTransactionMobile
                  activeTab={transactionActive}
                  poolId={pID}
                  updatedMapList={updatedMapList}
                  tokens={tokens.map((t: any) => t.meta)}
                />
              )}
          </div>
        </div>

        {/* right liquidity */}
        <div className="w-80 ml-auto pt-12 xsm:hidden">
          {user_liquidities.length == 0 || !accountId ? (
            <NoLiquidity add={() => addLiquidity()} isLoading={showSkection} />
          ) : (
            poolDetailV3?.token_x && (
              <>
                <YourLiquidityBox
                  poolDetail={poolDetailV3}
                  tokenPriceList={tokenPriceList}
                  liquidities={user_liquidities}
                  matched_seeds={matched_seeds}
                  setAddSuccess={setAddSuccess}
                  addSuccess={addSuccess}
                />
                <UnclaimedFeesBox
                  poolDetail={poolDetailV3}
                  tokenPriceList={tokenPriceList}
                  liquidities={user_liquidities}
                  setAddSuccess={setAddSuccess}
                />
              </>
            )
          )}
          {!isMobile && poolDetailV3 && sole_seed && tokenPriceList ? (
            <RelatedFarmsBox
              poolDetail={poolDetailV3}
              tokenPriceList={tokenPriceList}
              sole_seed={sole_seed}
            ></RelatedFarmsBox>
          ) : null}
        </div>
      </div>

      {(user_liquidities.length == 0 || !pID || !accountId) && isMobile && (
        <NoLiquidityMobile add={() => setShowYourLiq(true)} isLoading={false} />
      )}

      {user_liquidities.length >= 1 && accountId && pID && isMobile && (
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
              setShowYourLiqType("liq");
            }}
          >
            Your Liquidity
          </div>

          <div
            className="w-full frcc h-12 ml-1 text-green-10 border border-green-10 rounded text-base"
            onClick={() => {
              setShowYourLiq(true);
              setShowYourLiqType("claim");
            }}
          >
            Unclaimed Fees
          </div>
        </div>
      )}

      {isMobile && poolDetailV3 && (
        <YourLiqAndClaimMobile
          isOpen={showYourLiq}
          onRequestClose={hideYourLiq}
          showYourLiqType={showYourLiqType}
          setShowYourLiqType={setShowYourLiqType}
          poolDetailV3={poolDetailV3}
          tokenPriceList={tokenPriceList}
          user_liquidities={user_liquidities}
          matched_seeds={matched_seeds}
          sole_seed={sole_seed}
          setAddSuccess={setAddSuccess}
        />
      )}
    </div>
  );
}

export default React.memo(DCLPoolDetail);
