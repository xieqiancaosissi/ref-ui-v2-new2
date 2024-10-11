import React, { useState, useEffect } from "react";
import { dclHeader } from "./config";
import styles from "./dcl.module.css";
import { DownArrow, UpArrow, DownArrowSelect } from "../icon";
import { ExclamationIcon } from "@/components/common/Icons";
import PoolRow from "../dclPoolRow/poolRow";
import Pagination from "@/components/pagination/pagination";
import { usePoolSearch } from "@/hooks/usePools";
import HoverTip from "@/components/common/Tips/index";
import PoolDocTips from "@/components/pools/poolDocTips/index";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import NoContent from "@/components/common/NoContent";
import { useRouter } from "next/router";
import { usePoolStore } from "@/stores/pool";

export default function Classic({
  searchValue,
  pureIdList,
  mobilePros,
}: {
  searchValue: string;
  pureIdList: any;
  mobilePros: any;
}) {
  const router = useRouter();
  const poolStore = usePoolStore();
  const [isActive, setActive] = useState("");
  const [sortMap, setSortMap] = useState({ key: "tvl", sort: "desc" });
  const [isChecked, setIsChecked] = useState(true);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const handleCheckboxChange = (event: any) => {
    setIsChecked(event.target.checked);
    poolStore.setDclHideLowTVL(event.target.checked);
  };
  const handlePageChange = (newPage: number, newSize: number) => {
    setCurrentPage(newPage);
    !isLoading &&
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
  };
  const handleSizeChange = (newSize: number) => {
    setPageSize(newSize);
  };
  // pagination end
  const [toFirst, setToFirst] = useState(false);
  const handleSort = (key: string) => {
    if (key === sortMap.key) {
      setSortMap((prevSortMap) => ({
        key: prevSortMap.key,
        sort: prevSortMap.sort === "desc" ? "asc" : "desc",
      }));
    } else {
      setSortMap({ key, sort: "desc" });
    }
    setToFirst(true);
  };

  const { poolList, totalItems, isLoading } = usePoolSearch({
    isChecked,
    sortKey: sortMap.key,
    sortOrder: sortMap.sort,
    currentPage,
    isActive,
    searchValue,
    poolType: "dcl",
  });

  useEffect(() => {
    if (poolStore) {
      setIsChecked(poolStore?.dclHideLowTVL);
    }
  }, [JSON.stringify(poolStore || {})]);
  // depency change init currentpage
  useEffect(() => {
    setCurrentPage(1);
  }, [sortMap.key, sortMap.sort, isChecked, isActive, searchValue]);

  useEffect(() => {
    // value change
    if (mobilePros?.which == "dclTabSortChange") {
      setSortMap(mobilePros?.sortMap);
    }

    // sort arrow change
    if (mobilePros?.which == "dclTabSortArrowChange") {
      setSortMap({ key: sortMap.key, sort: mobilePros?.sort });
    }
  }, [mobilePros]);

  useEffect(() => {
    if (router?.query?.vault == "true") {
      // setIsVault(true)
      setSortMap({ key: "apr", sort: "desc" });
      // setIsChecked(true);
    }
  }, [JSON.stringify(router || {})]);

  return (
    <>
      <div className="xsm:hidden">
        <PoolDocTips
          tips="Discretized Concentrated Liquidity (DCL) pools."
          src="https://guide.ref.finance/products/guides/liquidity-management/ref-v2-pools"
        />
      </div>
      <div className="flex flex-col items-center  w-full lg:mt-8">
        {/*  */}
        <div className="frc lg:w-[1104px] xsm:w-full justify-between">
          {/* head tab & hide low tvl pools*/}
          <div className="text-xs cursor-pointer frcc"></div>
          <div className="text-white text-xs cursor-pointer">
            <label className={styles.customCheckbox}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  handleCheckboxChange(event);
                  setCurrentPage(1);
                }}
              />
              <span className={styles.checkmark}></span>
              <span className={`${styles.checkPlaceholder} text-sm`}>
                Hide low TVL pools
              </span>
            </label>
          </div>
        </div>
        {/* pool header */}
        <header className={styles.headDiv}>
          <div>Pair</div>
          <div>
            {dclHeader.map((item, index) => {
              return (
                <div
                  key={item.key}
                  className="frcc select-none cursor-pointer"
                  onClick={() => handleSort(item.key)}
                >
                  {item.tip && (
                    <HoverTip msg={item.tipMsg} extraStyles={"w-78"} />
                  )}
                  <span>{item.value}</span>
                  <span className="ml-2">
                    {sortMap.key === item.key ? (
                      sortMap.sort === "desc" ? (
                        <DownArrowSelect />
                      ) : (
                        <UpArrow />
                      )
                    ) : (
                      <DownArrow />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </header>

        {/* pool row */}
        {/* {isLoading ? (
          <SkeletonTheme
            baseColor="rgba(33, 43, 53, 0.3)"
            highlightColor="#2A3643"
          >
            <Skeleton width={1100} height={56} count={5} className="mt-4" />
          </SkeletonTheme>
        ) : (
          <PoolRow
            list={poolList}
            loading={isLoading}
            pureIdList={pureIdList}
          />
        )} */}

        {poolList.length > 0 ? (
          <PoolRow
            list={poolList}
            loading={isLoading}
            pureIdList={pureIdList}
          />
        ) : (
          <NoContent />
        )}

        {/* pagination */}
        <div className="lg:w-[1104px] xsm:w-full mt-4 mb-12">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={20}
            onChangePage={handlePageChange}
            onPageSizeChange={handleSizeChange}
            toFirst={toFirst}
          />
        </div>
      </div>
    </>
  );
}
