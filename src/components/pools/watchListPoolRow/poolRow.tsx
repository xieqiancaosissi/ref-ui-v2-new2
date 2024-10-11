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
import { PoolRouterGuard, PoolTypeGuard } from "@/utils/poolTypeGuard";
import { TokenIconComponent } from "../TokenIconWithTkn";
import { get_pool_name } from "@/services/commonV3";
import { TokenImgWithRiskTag } from "@/components/common/imgContainer";
function PoolRow({
  list,
  pureIdList,
  activeTab,
}: {
  list: Array<any>;
  pureIdList: any;
  activeTab: any;
}) {
  const { updatedMapList } = useTokenMetadata(list);
  const router = useRouter();
  const toDetail = (item: any) => {
    router.push(
      `${PoolRouterGuard(item, "")}/${
        item?.pool_kind == "DCL" ? get_pool_name(item.id) : item.id
      }`
    );
  };

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
                <div
                  className={`${styles.tokenImgContainer} ${
                    item?.token_account_ids?.length > 2 && "mt-2"
                  }`}
                >
                  {item?.token_account_ids?.map((ite: any, ind: number) => {
                    if (item.pool_kind == "SIMPLE_POOL") {
                      return (
                        <TokenImgWithRiskTag
                          token={ite}
                          withoutRisk={true}
                          key={ite.tokenId + ind}
                        />
                      );
                    }
                    const len = item?.token_account_ids?.length;
                    // if tokenid in tokenIcons
                    return Reflect.has(tokenIcons, ite.tokenId) ? (
                      // if token is near use new icon
                      ite.tokenId != "wrap.near" ? (
                        <img
                          src={tokenIcons[ite.tokenId]}
                          key={ite.tokenId + ind}
                          style={{
                            transform:
                              len == 3 && ind == 2
                                ? "translate(-4px, -8px)"
                                : "",
                          }}
                        />
                      ) : (
                        <NearIcon />
                      )
                    ) : (
                      <img
                        src={ite.icon}
                        key={ite.tokenId + ind}
                        style={{
                          transform:
                            len == 3 && ind == 2 ? "translate(-4px, -8px)" : "",
                        }}
                      />
                    );
                  })}
                </div>
                {/*  */}
                <span className={styles.symbol}>
                  {item.token_symbols.join("-")}
                </span>

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
                    className={` bg-farmTagBg text-farmApyColor ${styles.tagPublicStyle} ml-1`}
                  >
                    Farms
                  </div>
                )}

                <div className="border border-green-10 text-green-10 w-12 h-5 rounded-2xl frcc text-xs ml-1">
                  {PoolTypeGuard(item)}
                </div>
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
                <div>{toInternationalCurrencySystem_number(item.tvl)}</div>
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
                <div
                  className={`${styles.tokenImgContainer} ${
                    item?.token_account_ids?.length > 2 && "mt-2"
                  }`}
                >
                  {item?.token_account_ids?.map((ite: any, ind: number) => {
                    if (item.pool_kind == "SIMPLE_POOL") {
                      return (
                        <TokenImgWithRiskTag
                          token={ite}
                          withoutRisk={true}
                          key={ite.tokenId + ind}
                        />
                      );
                    }
                    const len = item?.token_account_ids?.length;
                    // if tokenid in tokenIcons
                    return Reflect.has(tokenIcons, ite.tokenId) ? (
                      // if token is near use new icon
                      ite.tokenId != "wrap.near" ? (
                        <img
                          src={tokenIcons[ite.tokenId]}
                          key={ite.tokenId + ind}
                          style={{
                            transform:
                              len == 3 && ind == 2
                                ? "translate(-4px, -8px)"
                                : "",
                          }}
                        />
                      ) : (
                        <NearIcon />
                      )
                    ) : (
                      <img
                        src={ite.icon}
                        key={ite.tokenId + ind}
                        style={{
                          transform:
                            len == 3 && ind == 2 ? "translate(-4px, -8px)" : "",
                        }}
                      />
                    );
                  })}
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

                    <div className="border border-green-10 text-green-10 w-12 h-5 rounded-2xl frcc text-xs ml-1">
                      {PoolTypeGuard(item)}
                    </div>
                  </div>
                </div>

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
                  {toInternationalCurrencySystem_number(item.tvl)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default React.memo(PoolRow);
