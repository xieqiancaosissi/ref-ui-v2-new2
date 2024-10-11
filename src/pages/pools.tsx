import React, { Component, useEffect, useRef, useState } from "react";
import { useAccountStore } from "@/stores/account";
import { getAccountNearBalance } from "@/services/token";
import poolStyle from "@/components/pools/pool.module.css";
import {
  SearchIcon,
  Star,
  MobileArrowUp,
  DownArrowSelect,
  DownArrow,
  UpArrow,
} from "@/components/pools/icon";
import { ArrowDownIcon } from "@/components/swap/icons";
import Charts from "@/components/pools/charts/charts";
import Classic from "@/components/pools/classicPool/classic";
import Stable from "@/components/pools/stablePool/stablePool";
import Dcl from "@/components/pools/dclPool/dcl";
import Degen from "@/components/pools/degenPool/degenPool";
import WatchList from "@/components/pools/watchList/watch";
import CreatePool from "@/components/pools/createPoolModal/index";
import CreateDclPool from "@/components/pools/createDclPoolModal/index";
import _ from "lodash";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import { usePoolStore } from "@/stores/pool";
import ClassicFilterTabModal from "@/components/pools/classicPool/classicFilterTabModal";
import {
  classicHeader,
  stableHeader,
} from "@/components/pools/classicPool/config";
import SearchModalForMobile from "@/components/pools/searchModalForMobile/searchModalForMobile";
import { getPoolsDetailById } from "@/services/pool";
import { useRouter } from "next/router";
import DocTips from "@/components/pools/poolDocTips";
import { dclHeader } from "@/components/pools/dclPool/config";
import { getAllPoolData } from "@/services/pool";
import {
  addThousandSeparator,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import Big from "big.js";
import { get_pool_name } from "@/services/commonV3";

function Pools() {
  const router = useRouter();
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const poolStore = usePoolStore();
  const [isActive, setActive] = useState(poolStore.poolActiveTab);
  const poolTypeList = [
    {
      key: "classic",
      value: "Classic",
    },
    {
      key: "stable",
      value: "Stable",
    },
    {
      key: "degen",
      value: "Degen",
    },
    {
      key: "dcl",
      value: "DCL",
    },
    {
      key: "watchlist",
      value: "Watchlist",
    },
  ];
  useEffect(() => {
    if (poolStore?.poolActiveTab) {
      setActive(poolStore.poolActiveTab);
    }
  }, [JSON.stringify(poolStore || {})]);

  const [keyWordsType, setKeyWordsType] = useState("token");
  const [searchValue, setSearchValue] = useState("");
  const [mobilePros, setMobilePros] = useState<any>({});
  const originalSendSearchValue = (e: any) => {
    // setSearchValue(e.target.value);
  };

  const debouncedSendSearchValue = _.debounce(originalSendSearchValue, 500);

  const sendSearchValue = (e: any) => {
    setSearchValue(e.target.value);
    debouncedSendSearchValue(e);
  };
  // create pool
  const [isOpen, setIsOpen] = useState<boolean>(false);
  function showModal() {
    setIsOpen(true);
  }
  function hideModal() {
    setIsOpen(false);
  }

  // create dcl pool
  const [isDclOpen, setIsDclOpen] = useState<boolean>(false);
  function showDCLModal() {
    setIsDclOpen(true);
  }
  function hideDCLModal() {
    setIsDclOpen(false);
  }

  // map render pool components
  const searchValueToUse = keyWordsType === "token" ? searchValue : "";

  const components = [
    {
      id: "classic",
      Component: Classic,
    },
    {
      id: "stable",
      Component: Stable,
    },
    {
      id: "degen",
      Component: Degen,
    },
    {
      id: "dcl",
      Component: Dcl,
    },
    {
      id: "watchlist",
      Component: WatchList,
    },
  ];

  const { pureIdList } = useRiskTokens();
  const pure = pureIdList;
  const componentElements = components.map(({ id, Component }) => (
    <div
      key={id}
      className={`${isActive !== id ? "opacity-0 fixed" : "opacity-100"}`}
      style={{ zIndex: isActive !== id ? -100 : undefined }}
    >
      <Component
        searchValue={searchValueToUse}
        pureIdList={pure}
        mobilePros={mobilePros}
      />
    </div>
  ));
  // mobile search modal
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [classicOpen, setClassicOpen] = useState(false);

  const [sortMap, setSortMap] = useState({ key: "tvl", sort: "desc" });
  const [showClassHeader, setShowClassHeader] = useState(false);
  const [classHeaderVal, setClassHeaderVal] = useState("TVL");
  const handleSort = (item: any) => {
    setSortMap({ key: item.key, sort: "desc" });
    setShowClassHeader(false);
    setClassHeaderVal(
      item.value == "Top Bin APR(24h)" ? "Top Bin APR" : item.value
    );
    if (isActive == "classic") {
      setMobilePros({
        which: "classicTabSortChange",
        sortMap: {
          key: item.key,
          sort: sortMap.sort,
        },
      });
    }
    if (isActive == "stable") {
      setMobilePros({
        which: "stableTabSortChange",
        sortMap: {
          key: item.key,
          sort: sortMap.sort,
        },
      });
    }
    if (isActive == "degen") {
      setMobilePros({
        which: "degenTabSortChange",
        sortMap: {
          key: item.key,
          sort: sortMap.sort,
        },
      });
    }

    if (isActive == "dcl") {
      setMobilePros({
        which: "dclTabSortChange",
        sortMap: {
          key: item.key,
          sort: sortMap.sort,
        },
      });
    }

    if (isActive == "watchlist") {
      setMobilePros({
        which: "watchListTabSortChange",
        sortMap: {
          key: item.key,
          sort: sortMap.sort,
        },
      });
    }
  };

  const BlinkById = async () => {
    if (keyWordsType == "id") {
      const k = await getPoolsDetailById({ pool_id: searchValue });
      if (k.id) {
        if (k.pool_kind == "SIMPLE_POOL") {
          router.push(`/pool/${k.id}`);
        }
        if (k.pool_kind == "DCL") {
          const params_str = get_pool_name(k.id.toString());
          router.push(`/poolV2/${params_str}`);
        }

        if (
          k.pool_kind == "RATED_SWAP" ||
          k.pool_kind == "STABLE_SWAP" ||
          k.pool_kind == "DEGEN_SWAP"
        ) {
          router.push(`/sauce/${k.id}`);
        }
      }
    }
  };

  useEffect(() => {
    if (router?.query?.vault == "true") {
      setSortMap({ key: "apr", sort: "desc" });
      setClassHeaderVal(isActive == "dcl" ? "Top Bin APR" : "APR");
    }
  }, [JSON.stringify(router || {})]);

  useEffect(() => {
    if (isActive == "dcl" && classHeaderVal == "APR") {
      setClassHeaderVal("Top Bin APR");
    } else if (isActive != "dcl" && classHeaderVal == "Top Bin APR") {
      setClassHeaderVal("APR");
    }
  }, [isActive]);

  // drop
  const modalRef = useRef<any>(null);
  const [allTVL, setAllTVL] = useState("");
  const [allVolume24h, setAllVolume24h] = useState("");
  useEffect(() => {
    getAllPoolData().then((res) => {
      setAllTVL(res.tvl);
      setAllVolume24h(res.volume_24h);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowClassHeader(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const handleKeyDown = (e: any) => {
    if (e.code == "Enter" && keyWordsType == "id" && searchValue) {
      BlinkById();
    }
  };

  return (
    <>
      {/* PC Start */}
      <div className="xsm:hidden">
        {/* charts & pools filter */}
        <div className={poolStyle.chartsContainter}>
          {/* charts */}
          {(allTVL || allVolume24h) && (
            <div className="w-full frcc">
              <Charts
                title="TVL(Total Value Locked)"
                type="tvl"
                all={{ allTVL, allVolume24h }}
              ></Charts>
              <div className="ml-4 mr-4"></div>
              <Charts
                title="Volume(24h)"
                type="24h"
                all={{ allTVL, allVolume24h }}
              ></Charts>
            </div>
          )}

          {/* search input */}
          <div className="w-full frcc mt-4">
            <div className="w-270 flex justify-between">
              {/* pool tab */}
              <div className={poolStyle.filterPoolType}>
                {poolTypeList.map((item, index) => {
                  return (
                    <div
                      key={item.key + index}
                      className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-poolsTypelinearGrayBg rounded"
                      : "text-gray-60"
                  }
                   w-25 h-8 frcc text-base 
                `}
                      onClick={() => {
                        setActive(item.key);
                        poolStore.setPoolActiveTab(item.key);
                        if (item.key == "dcl") {
                          setKeyWordsType("token");
                          setSearchValue("");
                        }
                      }}
                    >
                      {item.key == "watchlist" && <Star />}
                      {item.value}
                    </div>
                  );
                })}
              </div>

              {/* search & create pool */}
              <div className="frcc">
                {isActive != "watchlist" && (
                  <div className={poolStyle.filterSeacrhInputContainer}>
                    <div
                      onClick={() => {
                        keyWordsType == "token"
                          ? isActive != "dcl"
                            ? setKeyWordsType("id")
                            : setKeyWordsType("token")
                          : setKeyWordsType("token");
                        setSearchValue("");
                      }}
                      className={`${poolStyle.filterSearchInputBefore} ${
                        keyWordsType == "token"
                          ? "bg-gray-20 text-gray-50"
                          : "bg-green-10 text-white"
                      }`}
                    >
                      #
                    </div>
                    <input
                      type="text"
                      className={poolStyle.filterSearchInput}
                      placeholder={`Search pool by ${keyWordsType}`}
                      onChange={sendSearchValue}
                      onKeyDown={(e) => handleKeyDown(e)}
                      value={searchValue}
                    />
                    <span
                      className="hover:scale-110 cursor-pointer"
                      onClick={() => BlinkById()}
                    >
                      <SearchIcon />
                    </span>
                  </div>
                )}
                {isActive != "watchlist" && (
                  <div
                    className={`${poolStyle.createPoolButton} ${
                      accountId && ["classic", "dcl"].includes(isActive)
                        ? "bg-createPoolLinear text-black cursor-pointer hover:opacity-85"
                        : "text-gray-50 bg-gray-40 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      accountId && isActive == "classic" && showModal();
                      accountId && isActive == "dcl" && showDCLModal();
                    }}
                  >
                    + Create Pool
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* classic dcl stable */}
        <>{componentElements}</>

        {/* watchlist */}

        {/* create pool */}
        <CreatePool
          isOpen={isOpen}
          onRequestClose={hideModal}
          pureIdList={pureIdList}
        />

        {/* create dcl pool */}
        <CreateDclPool
          isOpen={isDclOpen}
          onRequestClose={hideDCLModal}
          pureIdList={pureIdList}
        />
      </div>
      {/* PC End */}

      {/* Mobile Start */}
      <div className="lg:hidden  my-4 px-4 box-border">
        <div className="frcc w-full mb-5">
          <div
            className="w-1/2 mr-1 p-4 rounded-md"
            style={{
              background: "rgba(33, 43, 53, 0.6)",
              color: "#7C8791",
            }}
          >
            <p className="text-sm">TVL</p>
            <p className="text-lg text-white mt-2 overflow-hidden text-ellipsis whitespace-nowrap">
              $
              {toInternationalCurrencySystem_number(
                new Big(allTVL || "0").toFixed(2)
              )}
            </p>
          </div>

          <div
            className="w-1/2 ml-1 p-4 rounded-md"
            style={{
              background: "rgba(33, 43, 53, 0.6)",
              color: "#7C8791",
            }}
          >
            <p className="text-sm">Volume(24h)</p>
            <p className="text-lg text-white mt-2">
              $
              {toInternationalCurrencySystem_number(
                new Big(allVolume24h || "0").toFixed(2)
              )}
            </p>
          </div>
        </div>

        <div className="w-full flex items-center">
          <div className={poolStyle.filterPoolType}>
            {poolTypeList.map((item, index) => {
              return (
                <>
                  <div
                    key={item.key + index}
                    className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-poolsTypelinearGrayBg rounded"
                      : "text-gray-60"
                  }
                   w-1/4  h-8 frcc text-base 
                  
                   ${item.key == "watchlist" && "xsm:hidden"}
                `}
                    onClick={() => {
                      setActive(item.key);
                      poolStore.setPoolActiveTab(item.key);
                      if (item.key == "dcl") {
                        setKeyWordsType("token");
                        setSearchValue("");
                      }
                    }}
                  >
                    {item.key == "watchlist" && <Star />}
                    {item.value}
                  </div>
                </>
              );
            })}
          </div>
          <div
            className={`lg:hidden w-9 h-9 frcc border border-gray-90 rounded ml-0.5  flex-shrink-0 ${
              isActive == "watchlist"
                ? "text-white bg-poolsTypelinearGrayBg rounded"
                : "text-gray-60"
            }`}
            onClick={() => {
              poolStore.setPoolActiveTab("watchlist");
              setActive("watchlist");
            }}
          >
            <Star />
          </div>
        </div>
        {/* search & create pool */}
        <div className="flex items-center justify-between my-4">
          <div className="flex-1 flex items-center justify-between">
            {isActive != "watchlist" && (
              <div className={poolStyle.filterSeacrhInputContainerForMobile}>
                <div
                  onClick={() => {
                    keyWordsType == "token"
                      ? isActive != "dcl" && setKeyWordsType("id")
                      : setKeyWordsType("token");
                  }}
                  className={`${poolStyle.filterSearchInputBefore} ${
                    keyWordsType == "token"
                      ? "bg-gray-20 text-gray-50"
                      : "bg-green-10 text-white"
                  }`}
                >
                  #
                </div>
                <input
                  type="text"
                  className={poolStyle.filterSearchInput}
                  placeholder={`Search pool by ${keyWordsType}`}
                  onChange={sendSearchValue}
                  onKeyDown={(e) => handleKeyDown(e)}
                  value={searchValue}
                />
                {/* <span className="hover:scale-110" onClick={() => BlinkById()}>
                <SearchIcon />
              </span> */}
              </div>
            )}
            {/* sort */}
            {isActive == "classic" && (
              <header
                className="relative  w-1/2 h-9 text-white border border-gray-40 rounded text-sm flex items-center mx-1"
                style={{
                  background: "rgba(126, 138, 147, 0.1)",
                }}
                ref={modalRef}
              >
                <div className="w-full h-full flex justify-between items-center pl-1 pr-2">
                  <div className="frcc flex-1">
                    <div
                      className="bg-gray-20 frcc w-7 h-7 rounded mr-1"
                      onClick={() => {
                        setMobilePros({
                          which: "classicTabSortArrowChange",
                          sort: sortMap.sort === "desc" ? "asc" : "desc",
                        });
                        setSortMap((prevSortMap) => ({
                          key: prevSortMap.key,
                          sort: prevSortMap.sort === "desc" ? "asc" : "desc",
                        }));
                      }}
                    >
                      {sortMap.sort === "desc" ? <DownArrow /> : <UpArrow />}
                    </div>
                    <div
                      className="flex-1 h-full"
                      onClick={() => {
                        setShowClassHeader((prev) => !prev);
                      }}
                    >
                      {classHeaderVal}
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setShowClassHeader((prev) => !prev);
                    }}
                    className="frcc h-full"
                  >
                    <ArrowDownIcon></ArrowDownIcon>
                  </div>
                </div>
                {showClassHeader && (
                  <div
                    className="absolute top-9 left-0 w-full bg-dark-70 rounded-b-md py-2 text-gray-50 text-sm"
                    style={{
                      zIndex: "99",
                    }}
                  >
                    {classicHeader.map((item, index) => {
                      return (
                        <div
                          key={item.key + Math.random() + index}
                          className={`frcc select-none h-7  ${
                            sortMap.key == item.key
                              ? "text-white bg-gray-100 rounded"
                              : "text-gray-60"
                          }`}
                          onClick={() => handleSort(item)}
                        >
                          <span>{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </header>
            )}

            {/*stable sort */}
            {isActive == "stable" && (
              <header
                className="relative  flex-1 h-9 text-white border border-gray-40 rounded text-sm flex items-center mx-1"
                style={{
                  background: "rgba(126, 138, 147, 0.1)",
                }}
                ref={modalRef}
              >
                <div className="w-full h-full flex justify-between items-center pl-1 pr-2">
                  <div className="frcc flex-1">
                    <div
                      className="bg-gray-20 frcc w-7 h-7 rounded mr-1"
                      onClick={() => {
                        setMobilePros({
                          which: "stableTabSortArrowChange",
                          sort: sortMap.sort === "desc" ? "asc" : "desc",
                        });
                        setSortMap((prevSortMap) => ({
                          key: prevSortMap.key,
                          sort: prevSortMap.sort === "desc" ? "asc" : "desc",
                        }));
                      }}
                    >
                      {sortMap.sort === "desc" ? <DownArrow /> : <UpArrow />}
                    </div>
                    <div
                      className="flex-1 h-full"
                      onClick={() => {
                        setShowClassHeader((prev) => !prev);
                      }}
                    >
                      {classHeaderVal}
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setShowClassHeader((prev) => !prev);
                    }}
                    className="frcc h-full"
                  >
                    <ArrowDownIcon></ArrowDownIcon>
                  </div>
                </div>
                {showClassHeader && (
                  <div
                    className="absolute top-9 left-0 w-full bg-dark-70 rounded-b-md py-2 text-gray-50 text-sm"
                    style={{
                      zIndex: "99",
                    }}
                  >
                    {stableHeader.map((item, index) => {
                      return (
                        <div
                          key={item.key + Math.random() + index}
                          className={`frcc select-none h-7  ${
                            sortMap.key == item.key
                              ? "text-white bg-gray-100 rounded"
                              : "text-gray-60"
                          }`}
                          onClick={() => handleSort(item)}
                        >
                          <span>{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </header>
            )}

            {/*stable sort */}
            {isActive == "degen" && (
              <header
                className="relative  flex-1 h-9 text-white border border-gray-40 rounded text-sm flex items-center mx-1"
                style={{
                  background: "rgba(126, 138, 147, 0.1)",
                }}
                ref={modalRef}
              >
                <div className="w-full h-full flex justify-between items-center pl-1 pr-2">
                  <div className="frcc flex-1">
                    <div
                      className="bg-gray-20 frcc w-7 h-7 rounded mr-1"
                      onClick={() => {
                        setMobilePros({
                          which: "degenTabSortArrowChange",
                          sort: sortMap.sort === "desc" ? "asc" : "desc",
                        });
                        setSortMap((prevSortMap) => ({
                          key: prevSortMap.key,
                          sort: prevSortMap.sort === "desc" ? "asc" : "desc",
                        }));
                      }}
                    >
                      {sortMap.sort === "desc" ? <DownArrow /> : <UpArrow />}
                    </div>
                    <div
                      className="flex-1 h-full"
                      onClick={() => {
                        setShowClassHeader((prev) => !prev);
                      }}
                    >
                      {classHeaderVal}
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setShowClassHeader((prev) => !prev);
                    }}
                    className="frcc h-full"
                  >
                    <ArrowDownIcon></ArrowDownIcon>
                  </div>
                </div>
                {showClassHeader && (
                  <div
                    className="absolute top-9 left-0 w-full bg-dark-70 rounded-b-md py-2 text-gray-50 text-sm"
                    style={{
                      zIndex: "99",
                    }}
                  >
                    {stableHeader.map((item, index) => {
                      return (
                        <div
                          key={item.key + Math.random() + index}
                          className={`frcc select-none h-7  ${
                            sortMap.key == item.key
                              ? "text-white bg-gray-100 rounded"
                              : "text-gray-60"
                          }`}
                          onClick={() => handleSort(item)}
                        >
                          <span>{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </header>
            )}

            {/*dcl sort */}
            {isActive == "dcl" && (
              <header
                className="relative  flex-1 h-9 text-white border border-gray-40 rounded text-sm flex items-center mx-1"
                style={{
                  background: "rgba(126, 138, 147, 0.1)",
                }}
                ref={modalRef}
              >
                <div className="w-full h-full flex justify-between items-center pl-1 pr-2">
                  <div className="frcc flex-1">
                    <div
                      className="bg-gray-20 frcc w-7 h-7 rounded mr-1"
                      onClick={() => {
                        setMobilePros({
                          which: "dclTabSortArrowChange",
                          sort: sortMap.sort === "desc" ? "asc" : "desc",
                        });
                        setSortMap((prevSortMap) => ({
                          key: prevSortMap.key,
                          sort: prevSortMap.sort === "desc" ? "asc" : "desc",
                        }));
                      }}
                    >
                      {sortMap.sort === "desc" ? <DownArrow /> : <UpArrow />}
                    </div>
                    <div
                      className="flex-1 h-full"
                      onClick={() => {
                        setShowClassHeader((prev) => !prev);
                      }}
                    >
                      {classHeaderVal}
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setShowClassHeader((prev) => !prev);
                    }}
                    className="frcc h-full"
                  >
                    <ArrowDownIcon></ArrowDownIcon>
                  </div>
                </div>
                {showClassHeader && (
                  <div
                    className="absolute top-9 left-0 w-full bg-dark-70 rounded-b-md py-2 text-gray-50 text-sm"
                    style={{
                      zIndex: "99",
                    }}
                  >
                    {dclHeader.map((item, index) => {
                      return (
                        <div
                          key={item.key + Math.random() + index}
                          className={`frcc select-none h-7  ${
                            sortMap.key == item.key
                              ? "text-white bg-gray-100 rounded"
                              : "text-gray-60"
                          }`}
                          onClick={() => handleSort(item)}
                        >
                          <span>{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </header>
            )}

            {/* watch sort */}
            {isActive == "watchlist" && (
              <header
                className="relative  w-1/2 h-9 text-white border border-gray-40 rounded text-sm flex items-center "
                style={{
                  background: "rgba(126, 138, 147, 0.1)",
                }}
                ref={modalRef}
              >
                <div className="w-full h-full flex justify-between items-center pl-1 pr-2">
                  <div className="frcc flex-1">
                    {/* <div
                      className="bg-gray-20 frcc w-7 h-7 rounded mr-1"
                      onClick={() => {
                        setMobilePros({
                          which: "watchListTabSortArrowChange",
                          sort: sortMap.sort === "desc" ? "asc" : "desc",
                        });
                        setSortMap((prevSortMap) => ({
                          key: prevSortMap.key,
                          sort: prevSortMap.sort === "desc" ? "asc" : "desc",
                        }));
                      }}
                    >
                      {sortMap.sort === "desc" ? <DownArrow /> : <UpArrow />}
                    </div> */}
                    <div
                      className="flex-1 h-full ml-2"
                      onClick={() => {
                        setShowClassHeader((prev) => !prev);
                      }}
                    >
                      {classHeaderVal}
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setShowClassHeader((prev) => !prev);
                    }}
                    className="frcc h-full"
                  >
                    <ArrowDownIcon></ArrowDownIcon>
                  </div>
                </div>
                {showClassHeader && (
                  <div
                    className="absolute top-9 left-0 w-full bg-dark-70 rounded-b-md py-2 text-gray-50 text-sm"
                    style={{
                      zIndex: "99",
                    }}
                  >
                    {classicHeader.map((item, index) => {
                      return (
                        <div
                          key={item.key + Math.random() + index}
                          className={`frcc select-none h-7  ${
                            sortMap.key == item.key
                              ? "text-white bg-gray-100 rounded"
                              : "text-gray-60"
                          }`}
                          onClick={() => handleSort(item)}
                        >
                          <span>{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </header>
            )}
          </div>

          {/* create pool */}
          {(isActive == "classic" || isActive == "dcl") && (
            <div
              className={`frcc w-9 h-9 border border-gray-40 rounded text-2xl ml-0.5 font-normal ${
                accountId && ["classic", "dcl"].includes(isActive)
                  ? "text-gray-60 cursor-pointer"
                  : "text-gray-50 bg-gray-40 cursor-not-allowed"
              }`}
              onClick={() => {
                accountId && isActive == "classic" && showModal();
                accountId && isActive == "dcl" && showDCLModal();
              }}
            >
              +
            </div>
          )}
        </div>

        {/* classic dcl stable components */}
        <>{componentElements}</>

        {/* <div className={`${poolStyle.chartsContainter} xsm:mt-10`}>
          <div className="w-full fccc">
            <Charts title="TVL(Total Value Locked)" type="tvl"></Charts>
            <div className="my-4"></div>
            <Charts title="Volume(24h)" type="24h"></Charts>
          </div>
        </div> */}

        {/* watchlist */}

        {/* create pool */}
        <CreatePool
          isOpen={isOpen}
          onRequestClose={hideModal}
          pureIdList={pureIdList}
        />

        {/* create dcl pool */}
        <CreateDclPool
          isOpen={isDclOpen}
          onRequestClose={hideDCLModal}
          pureIdList={pureIdList}
        />
      </div>

      {/* Mobile End */}

      {/* learn more tips */}
      {isActive == "classic" && (
        <div className="sticky bottom-8 lg:hidden">
          <DocTips
            tips="Classic pools are based on the Uniswap v2 algorithm."
            src="https://guide.ref.finance/products/guides/liquidity-management/classic-pools"
          />
        </div>
      )}

      {(isActive == "stable" || isActive == "degen") && (
        <div className="sticky bottom-8 lg:hidden">
          <DocTips
            tips="Stable pools, which can contain two or more tokens, use Curve's StableSwap algorithm."
            src="https://guide.ref.finance/products/guides/liquidity-management/stable-and-rated-pools"
          />
        </div>
      )}

      {isActive == "dcl" && (
        <div className="sticky bottom-8 lg:hidden">
          <DocTips
            tips="Discretized Concentrated Liquidity (DCL) pools."
            src="https://guide.ref.finance/products/guides/liquidity-management/ref-v2-pools"
          />
        </div>
      )}

      {/* classic mobile tab change */}
      <ClassicFilterTabModal
        isOpen={classicOpen}
        onRequestClose={() => {
          setClassicOpen(false);
        }}
        setMobilePros={setMobilePros}
      />

      {/* search modal for mobile */}
      <SearchModalForMobile
        isOpen={searchModalOpen}
        onRequestClose={() => {
          setSearchModalOpen(false);
        }}
      />
    </>
  );
}

export default React.memo(Pools);
