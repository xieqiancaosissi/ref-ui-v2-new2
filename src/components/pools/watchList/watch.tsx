import React, { useState, useEffect } from "react";
import { tabList, classicHeader } from "./config";
import styles from "./watch.module.css";
import { DownArrow, UpArrow, DownArrowSelect } from "../icon";
import PoolRow from "../watchListPoolRow/poolRow";
import Pagination from "@/components/pagination/pagination";
import { usePoolSearch } from "@/hooks/usePools";
import PoolDocTips from "@/components/pools/poolDocTips/index";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useWatchList } from "@/hooks/useWatchlist";
import { getPoolsByIds } from "@/services/indexer";
import { getPoolsDetailByIds } from "@/services/pool";

import NoContent from "@/components/common/NoContent/index";
import { error } from "console";

function WatchList({
  searchValue,
  pureIdList,
  mobilePros,
}: {
  searchValue: string;
  pureIdList: any;
  mobilePros: any;
}) {
  const [sortMap, setSortMap] = useState({ key: "tvl", sort: "desc" });
  const { currentwatchListId } = useWatchList();
  const [list, setList] = useState([]);
  const [shortSaveList, setShortSaveList] = useState([]);
  useEffect(() => {
    if (currentwatchListId?.length > 0) {
      getPoolsDetailByIds({ pool_ids: currentwatchListId }).then((res: any) => {
        setList(res);
        setShortSaveList(res);
      });
    }
  }, [currentwatchListId]);

  useEffect(() => {
    // value change
    if (mobilePros?.which == "watchListTabSortChange") {
      setSortMap(mobilePros?.sortMap);
    }

    // sort arrow change
    if (mobilePros?.which == "watchListTabSortArrowChange") {
      setSortMap({ key: sortMap.key, sort: mobilePros?.sort });
    }
  }, [mobilePros]);

  useEffect(() => {
    if (!searchValue) return setList(shortSaveList);
    const filteredList = list.filter((item: any) => {
      return item.token_symbols.some((ite: any) => {
        return (
          ite.toLocaleLowerCase().indexOf(searchValue.toLocaleLowerCase()) !==
          -1
        );
      });
    });

    setList(filteredList);
  }, [searchValue]);

  return (
    <>
      <div className="flex flex-col items-center  w-full mt-8">
        {/* pool header */}
        <header className={styles.headDiv}>
          <div>Pair</div>
          <div>
            {classicHeader.map((item, index) => {
              return (
                <div
                  key={item.key + Math.random() + index}
                  className="frcc select-none cursor-pointer"
                >
                  <span>{item.value}</span>
                </div>
              );
            })}
          </div>
        </header>

        {list.length > 0 ? (
          <PoolRow list={list} pureIdList={pureIdList} activeTab={sortMap} />
        ) : (
          <NoContent />
        )}
      </div>
    </>
  );
}

export default React.memo(WatchList);
