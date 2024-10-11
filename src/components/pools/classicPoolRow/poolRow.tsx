import React, { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import styles from "./poolRow.module.css";
import { StartWatchList } from "@/components/pools/icon";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { useTokenMetadata, checkIsHighRisk } from "@/hooks/usePools";
import { NearIcon, DangerousIcon, TknIcon } from "@/components/pools/icon";
import tokenIcons from "@/utils/tokenIconConfig";
import HoverTooltip from "@/components/common/HoverToolTip";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn/index";
import { useWatchList } from "@/hooks/useWatchlist";
import { TokenImgWithRiskTag } from "@/components/common/imgContainer";
export default function PoolRow({
  list,
  loading,
  pureIdList,
  activeTab,
}: {
  list: Array<any>;
  loading: boolean;
  pureIdList: any;
  activeTab: any;
}) {
  const { isDealed, updatedMapList } = useTokenMetadata(list);
  const router = useRouter();
  const toDetail = (item: any) => {
    router.push(`/pool/${item.id}`);
  };
  const { currentwatchListId } = useWatchList();
  const [renderStarList, setRenderStarList] = useState<any>([]);
  useEffect(() => {
    if (currentwatchListId.length > 0) {
      setRenderStarList(currentwatchListId);
    }
  }, [currentwatchListId]);

  return (
    <>
      <div className="mb-2 min-h-90 overflow-auto hover:cursor-pointer xsm:hidden">
        {updatedMapList.map((item, index) => {
          return (
            <div
              key={item.id + "_" + index}
              className={`${styles.poolContainer} ${
                item.is_farm ? styles.isfarm : styles.notfarm
              }`}
              onClick={() => toDetail(item)}
            >
              {/* tokens */}
              <div className="flex items-center">
                {/*render token icon */}
                <div className={styles.tokenImgContainer}>
                  {item?.token_account_ids?.map((ite: any, ind: number) => (
                    <TokenImgWithRiskTag
                      token={ite}
                      withoutRisk={true}
                      key={ite.tokenId + ind}
                    />
                  ))}
                </div>
                {/*  */}
                <span
                  className={styles.symbol}
                  title={item.token_symbols.join("-")}
                >
                  {item.token_symbols.join("-")}
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

                {item.top && (
                  <div
                    className={`bg-topLinearGradient text-black ${styles.topStyle} mx-1`}
                  >
                    Top
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
              <div>
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
            </div>
          );
        })}
      </div>

      <div className="mb-2 min-h-90 overflow-auto hover:cursor-pointer xsm:w-full lg:hidden">
        {updatedMapList.map((item, index) => {
          return (
            <div
              key={item.id + "_" + index}
              className={`${styles.poolContainer} ${
                item.is_farm ? styles.isfarm : styles.notfarm
              }`}
              onClick={() => toDetail(item)}
            >
              {/* tokens */}
              <div className="flex items-center">
                {/*render token icon */}
                <div className={styles.tokenImgContainer}>
                  {item?.token_account_ids?.map((ite: any, ind: number) => (
                    <TokenImgWithRiskTag
                      token={ite}
                      withoutRisk={true}
                      key={ite.tokenId + ind}
                    />
                  ))}
                </div>
                {/*  */}
                <div className={`${styles.symbol} flex flex-col`}>
                  {item.token_symbols.join("-")}
                  <div className="flex mt-1">
                    {/* tag */}

                    {item.is_new && (
                      <div
                        className={`bg-primaryGreen  text-black ${styles.tagPublicStyle}`}
                      >
                        New
                      </div>
                    )}

                    {item.top && (
                      <div
                        className={`bg-topLinearGradient  ${
                          item.is_new ? "-ml-1.5" : ""
                        } text-black ${styles.topStyle} mx-1`}
                      >
                        Top
                      </div>
                    )}

                    {item.is_farm && (
                      <div
                        className={`${
                          item.is_new || item.top ? "-ml-1.5" : ""
                        } bg-farmTagBg text-farmApyColor ${
                          styles.tagPublicStyle
                        }`}
                      >
                        Farms
                      </div>
                    )}
                  </div>
                </div>
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
              </div>
              <div>
                {/* fee */}
                <div className={`${activeTab.key != "fee" && "xsm:hidden"}`}>
                  {formatPercentage(item.total_fee * 100)}
                </div>
                {/* apr */}
                <div className={`${activeTab.key != "apr" && "xsm:hidden"}`}>
                  <span>{formatPercentage(item.apy)}</span>
                  {item.farm_apy > 0 && (
                    <span className="text-farmApyColor text-xs mt-1">
                      +{formatPercentage(item.farm_apy)}
                    </span>
                  )}
                </div>
                {/* 24h */}
                <div className={`${activeTab.key != "24h" && "xsm:hidden"}`}>
                  {toInternationalCurrencySystem_usd(item.volume_24h)}
                </div>
                {/* tvl */}
                <div className={`${activeTab.key != "tvl" && "xsm:hidden"}`}>
                  ${toInternationalCurrencySystem_number(item.tvl)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
