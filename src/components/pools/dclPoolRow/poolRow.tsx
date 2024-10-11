import React, { useEffect, useState } from "react";
import styles from "./poolRow.module.css";
import Router, { useRouter } from "next/router";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { useTokenMetadata, checkIsHighRisk } from "@/hooks/usePools";
import { NearIcon, DangerousIcon } from "@/components/pools/icon";
import tokenIcons from "@/utils/tokenIconConfig";
import HoverTooltip from "@/components/common/HoverToolTip";
import { useWatchList } from "@/hooks/useWatchlist";
import { StartWatchList } from "@/components/pools/icon";
import { get_pool_name } from "@/services/commonV3";
import {
  sort_tokens_by_base,
  sort_tokens_by_base_onlysymbol,
} from "@/services/commonV3";

export default function PoolRow({
  list,
  loading,
  pureIdList,
}: {
  list: Array<any>;
  loading: boolean;
  pureIdList: any;
}) {
  const { isDealed, updatedMapList } = useTokenMetadata(list);
  const router = useRouter();
  const toDetail = (item: any) => {
    const pathname = get_pool_name(item.id);
    router.push(`/poolV2/${pathname}`);
  };
  const { currentwatchListId } = useWatchList();
  const [renderStarList, setRenderStarList] = useState<any>([]);
  useEffect(() => {
    if (currentwatchListId.length > 0) {
      setRenderStarList(currentwatchListId);
    }
  }, [currentwatchListId]);
  return (
    <div className="mb-2 min-h-90 overflow-auto hover:cursor-pointer xsm:w-full lg:w-[1104px]">
      {updatedMapList.map((item, index) => {
        const tokens = sort_tokens_by_base(item.token_account_ids);
        return (
          <div
            key={item.id + "_" + index}
            className={`${styles.poolContainer} ${
              item.is_farm ? styles.isfarm : styles.notfarm
            }`}
            onClick={() => toDetail(item)}
          >
            {/* tokens */}
            <div className={`${styles.pcdiv1} flex items-center`}>
              <div className={styles.tokenImgContainer}>
                {tokens.map((ite: any, ind: number) => {
                  // if tokenid in tokenIcons
                  return Reflect.has(tokenIcons, ite.tokenId) ? (
                    // if token is near use new icon
                    ite.tokenId != "wrap.near" ? (
                      <img
                        src={ite?.icon || tokenIcons[ite.tokenId]}
                        key={ite.tokenId + ind}
                      />
                    ) : (
                      <NearIcon />
                    )
                  ) : (
                    <img src={ite.icon} key={ite.tokenId + ind} />
                  );
                })}
              </div>
              <span className={styles.symbol}>
                {tokens.map((ite: any, ind: number) => {
                  // if tokenid in tokenIcons
                  return ind + 1 < tokens.length
                    ? ite.symbol + "-"
                    : ite.symbol;
                })}

                {/* {item.token_symbols.join("-")} */}
              </span>
              {/* is collect */}
              {renderStarList.includes(item.id.toString()) && (
                <StartWatchList className="mr-2" />
              )}
              {/* dangerous */}
              {checkIsHighRisk(pureIdList, item).risk && (
                <span className="mr-2 frcc">
                  <HoverTooltip
                    tooltipText={checkIsHighRisk(pureIdList, item).tips || ""}
                  >
                    <DangerousIcon />
                  </HoverTooltip>
                </span>
              )}
              {/* tag */}
              {item.is_new && (
                <div
                  className={`bg-primaryGreen text-black ${styles.tagPublicStyle}`}
                >
                  New
                </div>
              )}
              {item.is_farm && (
                <div
                  className={` bg-farmTagBg text-farmApyColor ${styles.tagPublicStyle}`}
                >
                  Farms
                </div>
              )}
            </div>

            <div className={`${styles.pcdiv2}`}>
              {/* fee */}
              <div>{formatPercentage(item.total_fee * 100)}</div>
              {/* apr */}
              <div>
                <span>{formatPercentage(item.apy)}</span>
                {item.farm_apy > 0 && (
                  <span className="text-farmApyColor text-xs mt-1">
                    +{formatPercentage(item.farm_apy)}
                  </span>
                )}
              </div>
              {/* 24h */}
              <div>{toInternationalCurrencySystem_usd(item.volume_24h)}</div>
              {/* tvl */}
              <div>${toInternationalCurrencySystem_number(item.tvl)}</div>
            </div>
            {/* PC END */}

            {/* Mobile Start */}
            <div
              className={`${styles.mobilediv1} flex items-center justify-between w-full  h-16 px-3 rounded-t-md`}
              style={{
                background:
                  "linear-gradient(to bottom, rgba(33, 43, 53, 0.5),rgba(61, 84, 108, 0.5))",
              }}
            >
              <div className={styles.tokenImgContainer}>
                {item?.token_account_ids?.map((ite: any, ind: number) => {
                  // if tokenid in tokenIcons
                  return Reflect.has(tokenIcons, ite.tokenId) ? (
                    // if token is near use new icon
                    ite.tokenId != "wrap.near" ? (
                      <img
                        src={ite?.icon || tokenIcons[ite.tokenId]}
                        key={ite.tokenId + ind}
                      />
                    ) : (
                      <NearIcon />
                    )
                  ) : (
                    <img src={ite.icon} key={ite.tokenId + ind} />
                  );
                })}
              </div>
              <div className="flex flex-col">
                <div className="frcc mb-1">
                  <span className={styles.symbol}>
                    {item.token_symbols.join("-")}
                  </span>
                  {/* dangerous */}
                  {checkIsHighRisk(pureIdList, item).risk && (
                    <span className="mr-2 frcc">
                      <HoverTooltip
                        tooltipText={
                          checkIsHighRisk(pureIdList, item).tips || ""
                        }
                      >
                        <DangerousIcon />
                      </HoverTooltip>
                    </span>
                  )}
                </div>
                <div className="frcc">
                  {/* is collect */}
                  {renderStarList.includes(item.id.toString()) && (
                    <StartWatchList className="mr-2" />
                  )}
                  {/* tag */}
                  {item.is_new && (
                    <div
                      className={`bg-primaryGreen text-black ${styles.tagPublicStyle}  `}
                    >
                      New
                    </div>
                  )}
                  {item.is_farm && (
                    <div
                      className={` bg-farmTagBg text-farmApyColor ${
                        styles.tagPublicStyle
                      } ${item.is_new ? "-ml-1.5" : ""}`}
                    >
                      Farms
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`${styles.mobilediv2}`}>
              {/* fee */}
              <div>
                <span className="text-gray-60 text-sm font-normal lg:hidden">
                  Fee:
                </span>
                {formatPercentage(item.total_fee * 100)}
              </div>
              {/* apr */}
              <div className="xsm:mt-2">
                <span className="text-gray-60 text-sm font-normal lg:hidden">
                  Top Bin APR(24h):
                </span>
                <div>
                  <span>{formatPercentage(item.apy)}</span>
                  {item.farm_apy > 0 && (
                    <span className="text-farmApyColor text-xs mt-1">
                      +{formatPercentage(item.farm_apy)}
                    </span>
                  )}
                </div>
              </div>
              {/* 24h */}
              <div className="xsm:mt-2">
                <span className="text-gray-60 text-sm font-normal lg:hidden">
                  Volume (24h):
                </span>
                {toInternationalCurrencySystem_usd(item.volume_24h)}
              </div>
              {/* tvl */}
              <div className="xsm:mt-2">
                <span className="text-gray-60 text-sm font-normal lg:hidden">
                  TVL:
                </span>
                ${toInternationalCurrencySystem_number(item.tvl)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
