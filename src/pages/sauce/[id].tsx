import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPoolsDetailById } from "@/services/pool";
import styles from "./style.module.css";
import TokenDetail from "@/components/pools/detail/stable/tokenDetail";
import { CollectStar } from "@/components/pools/icon";
import { getAllTokenPrices } from "@/services/farm";
import { useTokenMetadata } from "@/hooks/usePools";
import RecentTransaction from "@/components/pools/detail/stable/RecentTransaction";
import { addPoolToWatchList, removePoolFromWatchList } from "@/services/pool";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import NoContent from "@/components/common/NoContent";
import { useWatchList } from "@/hooks/useWatchlist";
import { usePoolStore } from "@/stores/pool";
import ShareContainer from "@/components/pools/detail/stable/ShareContainer";
import PieEcharts from "@/components/pools/detail/stable/PieEcharts";
import StableAdd from "@/components/pools/detail/liquidity/stable/StableAdd";
import StableRemove from "@/components/pools/detail/liquidity/stable/StableRemove";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import RecentTransactionMobile from "@/components/pools/detail/stable/RecentTransactionMobile";
import { PoolRouterGuard } from "@/utils/poolTypeGuard";
import { openUrlLocal } from "@/services/commonV3";
import { usePool } from "@/hooks/usePools";
import { getPoolDetails } from "@/services/pool_detail";
import { getSharesInPool } from "@/services/pool";
import getStablePoolTypeConfig from "@/utils/stablePoolConfig/stablePoolTypeConfig";
const { DEGEN_POOLS_IDS } = getStablePoolTypeConfig();

function StablePoolDetail() {
  const appStore = useAppStore();
  const router = useRouter();
  const poolId = router.query.id || "";
  const poolStore = usePoolStore();
  const { pureIdList } = useRiskTokens();
  const { currentwatchListId, accountId } = useWatchList();
  const [poolDetail, setPoolDetail] = useState<any>(null);
  const [isCollect, setIsCollect] = useState(false);
  const [tokenPriceList, setTokenPriceList] = useState<any>(null);
  const { updatedMapList } = useTokenMetadata([poolDetail]);
  const TransactionTabList = [
    { key: "swap", value: "Swap" },
    { key: "liquidity", value: "Liquidity" },
  ];
  const [transactionActive, setTransactionActive] = useState("swap");
  const [addSuccess, setAddSuccess] = useState(0);

  // part
  const [newPool, setNewPool] = useState<any>();
  const [newShares, setNewShares] = useState<string>("0");
  const [newFinalStakeList, setNewFinalStakeList] = useState<
    Record<string, string>
  >({});
  const [newhaveShare, setnewhaveShare] = useState(false);
  const [newTotalFarmStake, setNewTotalFarmStake] = useState("0");
  const [newUserTotalShareToString, setNewUserTotalShareToString] =
    useState("0");
  const { shares, pool } = usePool(poolDetail?.id);

  useEffect(() => {
    if (poolId) {
      getPoolsDetailById({ pool_id: poolId as any }).then((res) => {
        PoolRouterGuard(res, "", true) &&
          router.push(`${PoolRouterGuard(res, "", true)}/${poolId}`);
        setPoolDetail(res);
      });
    }
  }, [poolId]);

  useEffect(() => {
    if (currentwatchListId.length > 0) {
      setIsCollect(currentwatchListId.includes(poolId));
    }
  }, [currentwatchListId]);

  useEffect(() => {
    getAllTokenPrices().then((res) => {
      setTokenPriceList(res);
    });
    DEGEN_POOLS_IDS.includes(poolId.toString())
      ? poolStore.setPoolActiveTab("degen")
      : poolStore.setPoolActiveTab("stable");
  }, []);

  const collectPool = () => {
    if (!accountId) showWalletSelectorModal(appStore.setShowRiskModal);
    if (isCollect) {
      removePoolFromWatchList({ pool_id: poolId.toString() });
    } else {
      addPoolToWatchList({ pool_id: poolId.toString() });
    }
    setIsCollect((previos) => !previos);
  };

  const [showAdd, setShowAdd] = useState(false);
  const hideAdd = () => {
    setShowAdd(false);
  };

  const [showRemove, setShowRemove] = useState(false);
  const hideRemove = () => {
    setShowRemove(false);
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

  useEffect(() => {
    if (addSuccess > 0) {
      const PoolFn = (id: number | string) => {
        getPoolDetails(Number(id)).then((res) => {
          console.log(res);
          setNewPool(res);
        });
        getSharesInPool(Number(id))
          .then((res) => {
            console.log(res, "newSharesnewShares");
            setNewShares(res);
          })
          .catch(() => setNewShares);
      };
      PoolFn(poolId.toString());
    }
  }, [addSuccess]);
  return (
    <div className="w-full fccc h-full ">
      <div
        className="w-full fccc  lg:mt-3 xsm:px-3"
        style={{
          background: isMobile ? "transparent" : "rgba(33, 43, 53, 0.4)",
        }}
      >
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
        <div className="lg:w-270 xsm:w-full min-h-10 flex items-center">
          {poolDetail && updatedMapList?.length > 0 && (
            <>
              <TokenDetail {...poolDetail} updatedMapList={updatedMapList} />
              {/*  */}
              <span className=" text-2xl text-white font-bold ml-1 mr-2 flex-wrap">
                {poolDetail?.token_symbols
                  ?.map((item: any) =>
                    item == "wNEAR" ? (item = "NEAR") : item
                  )
                  .join("-")}
              </span>

              {/* farm tag */}
              {poolDetail.is_farm && (
                <div
                  className={` bg-farmTagBg text-farmApyColor frcc text-xs italic w-13 h-5 rounded-xl mr-2 xsm:px-1`}
                >
                  Farms
                </div>
              )}

              {/* watchlist */}
              <div className="xsm:flex-1 xsm:flex xsm:justify-end">
                <CollectStar
                  iscollect={!accountId ? "false" : isCollect.toString()}
                  className="cursor-pointer"
                  onClick={() => collectPool()}
                />
              </div>
            </>
          )}
        </div>

        {/* share and liquidity action */}
        {poolDetail && (
          <ShareContainer
            key={addSuccess}
            poolDetail={poolDetail}
            setShowAdd={setShowAdd}
            setShowRemove={setShowRemove}
          />
        )}
      </div>
      {/* main */}
      <div className="fccc lg:w-270 xsm:w-full mt-2 px-3">
        {poolDetail && updatedMapList?.length > 0 ? (
          <PieEcharts
            poolDetail={poolDetail}
            tokenPriceList={tokenPriceList}
            updatedMapList={updatedMapList}
            isMobile={isMobile}
          />
        ) : (
          <NoContent tips="Chart is Loading..." h="lg:h-90" />
        )}

        {/* Recent Transaction */}
        <div className="mb-10 xsm:mb-40 xsm:w-full">
          <div className="mb-4 flex justify-between lg:w-215 xsm:w-full">
            <span className="text-lg lg:text-gray-50 xsm:text-white font-bold text-with-custom-underline">
              Recent Transaction
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
          {poolDetail && updatedMapList?.length > 0 && !isMobile && (
            <RecentTransaction
              activeTab={transactionActive}
              poolId={poolId}
              updatedMapList={updatedMapList}
            />
          )}
          {/* : (
            <SkeletonTheme
              baseColor="rgba(33, 43, 53, 0.3)"
              highlightColor="rgba(33, 43, 53, 0.4)"
            >
              <Skeleton width={860} height={50} count={10}></Skeleton>
            </SkeletonTheme>
          ) */}

          {poolDetail && updatedMapList?.length > 0 && isMobile && (
            <RecentTransactionMobile
              activeTab={transactionActive}
              poolId={poolId}
              updatedMapList={updatedMapList}
            />
          )}
        </div>
      </div>
      <div
        className="h-24 frcc p-4 fixed bottom-8 z-10 lg:hidden"
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
            setShowAdd(true);
          }}
        >
          Add Liquidity
        </div>

        <div
          className="w-full frcc h-12 ml-1 text-green-10 border border-green-10 rounded text-base"
          onClick={() => {
            setShowRemove(true);
          }}
        >
          Remove Liquidity
        </div>
      </div>

      {/* add */}
      {updatedMapList?.length > 0 &&
        updatedMapList[0]?.token_account_ids &&
        poolDetail && (
          <>
            <StableAdd
              isOpen={showAdd}
              onRequestClose={hideAdd}
              poolDetail={poolDetail}
              pureIdList={pureIdList}
              updatedMapList={updatedMapList}
              isMobile={isMobile}
              tokenPriceList={tokenPriceList}
              setAddSuccess={setAddSuccess}
              addSuccess={addSuccess}
            />

            <StableRemove
              isOpen={showRemove}
              onRequestClose={hideRemove}
              poolDetail={poolDetail}
              pureIdList={pureIdList}
              updatedMapList={updatedMapList}
              isMobile={isMobile}
              setAddSuccess={setAddSuccess}
              shares={addSuccess > 0 ? newShares : shares}
              pool={addSuccess > 0 ? newPool : pool}
              addSuccess={addSuccess}
            />
          </>
        )}
    </div>
  );
}

export default React.memo(StablePoolDetail);
