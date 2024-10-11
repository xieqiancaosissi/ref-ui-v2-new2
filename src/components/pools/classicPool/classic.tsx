import React, { useState, useEffect } from "react";
import { tabList, classicHeader } from "./config";
import styles from "./classic.module.css";
import { DownArrow, UpArrow, DownArrowSelect } from "../icon";
import PoolRow from "../classicPoolRow/poolRow";
import Pagination from "@/components/pagination/pagination";
import { usePoolSearch } from "@/hooks/usePools";
import PoolDocTips from "@/components/pools/poolDocTips/index";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import NoContent from "@/components/common/NoContent/index";
import ClassicFilterTabModal from "./classicFilterTabModal";
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
  const [isVault, setIsVault] = useState<boolean>(false);
  const [isActive, setActive] = useState("");
  const [sortMap, setSortMap] = useState({ key: "tvl", sort: "desc" });
  const [isChecked, setIsChecked] = useState(false);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
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

  const handleCheckboxChange = (event: any) => {
    setIsChecked(event.target.checked);
    poolStore.setClassicHideLowTVL(event.target.checked);
  };
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
  });

  const [classicOpen, setClassicOpen] = useState(false);

  useEffect(() => {
    if (poolStore) {
      setIsChecked(poolStore?.classicHideLowTVL);
    }
  }, [JSON.stringify(poolStore || {})]);

  useEffect(() => {
    if (router?.query?.vault == "true") {
      // setIsVault(true)
      setSortMap({ key: "apr", sort: "desc" });
      // setIsChecked(true);
    }
  }, [JSON.stringify(router || {})]);

  // depency change init currentpage
  useEffect(() => {
    console.log(searchValue, "search");
    setCurrentPage(1);
  }, [sortMap.key, sortMap.sort, isChecked, isActive, searchValue]);

  useEffect(() => {
    if (mobilePros?.which == "classicTabChange") {
      setActive(mobilePros.key.key);
    }

    // value change
    if (mobilePros?.which == "classicTabSortChange") {
      setSortMap(mobilePros?.sortMap);
    }

    // sort arrow change
    if (mobilePros?.which == "classicTabSortArrowChange") {
      setSortMap({ key: sortMap.key, sort: mobilePros?.sort });
    }
  }, [mobilePros]);

  return (
    <>
      <div className="xsm:hidden">
        <PoolDocTips
          tips="Classic pools are based on the Uniswap v2 algorithm."
          src="https://guide.ref.finance/products/guides/liquidity-management/classic-pools"
        />
      </div>
      <div className="flex flex-col items-center  w-full mt-8">
        {/*  */}
        <div className="frc lg:w-[1104px] xsm:w-full justify-between">
          {/* head tab & hide low tvl pools*/}
          <div className="text-xs cursor-pointer lg:frcc xsm:hidden">
            {tabList.map((item, index) => {
              return (
                <div
                  key={item.key + index}
                  className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-gray-100 "
                      : "text-gray-60 bg-poolTabBgOpacity15"
                  }
                  ${styles.tab}
                `}
                  onClick={() => {
                    setActive(item.key);
                    setCurrentPage(1);
                  }}
                >
                  {item.value}
                </div>
              );
            })}
          </div>

          <div className="flex items-center lg:hidden">
            {tabList.map((item, index) => {
              return (
                <div
                  key={item.key + "_stablepool_" + index}
                  className={`w-10 h-5 frcc border border-gray-40 rounded-xl text-xs p-1 mx-0.5 ${
                    isActive == item.key
                      ? "bg-gray-100 text-white"
                      : "text-gray-10 "
                  }`}
                  onClick={() => {
                    setActive(item.key);
                    setCurrentPage(1);
                  }}
                >
                  {item.value}
                </div>
              );
            })}
          </div>

          <div className="text-white text-xs  cursor-pointer">
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
              <span className={`${styles.checkPlaceholder}`}>
                Hide low TVL pools
              </span>
            </label>
          </div>
        </div>
        {/*  */}
        {/* <div className="text-white text-xs cursor-default ml-auto lg:hidden">
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
            <span className={styles.checkPlaceholder}>Hide low TVL</span>
          </label>
        </div> */}
        {/* pool header */}
        <header className={styles.headDiv}>
          <div>Pair</div>
          <div>
            {classicHeader.map((item, index) => {
              return (
                <div
                  key={item.key + Math.random() + index}
                  className="frcc select-none cursor-pointer"
                  onClick={() => handleSort(item.key)}
                >
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

        {poolList.length > 0 ? (
          <PoolRow
            list={poolList}
            loading={isLoading}
            pureIdList={pureIdList}
            activeTab={sortMap}
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
