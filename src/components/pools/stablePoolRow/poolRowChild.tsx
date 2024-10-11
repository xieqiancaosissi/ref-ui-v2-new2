import React, { useEffect, useState } from "react";
import styles from "./poolRow.module.css";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { NearIcon, NearIconMini } from "@/components/pools/icon";
import StablePoolRowCharts from "@/components/pools/stablePoolRowCharts/index";
import tokenIcons from "@/utils/tokenIconConfig";
import { useRouter } from "next/router";
import { formatePoolData } from "../detail/stable/FormatterPool";
import { useYourliquidity } from "@/hooks/useStableShares";
import { useWatchList } from "@/hooks/useWatchlist";
import { StartWatchList } from "@/components/pools/icon";
import { openUrlLocal, openUrl } from "@/services/commonV3";
import getConfigV2 from "@/utils/configV2";
import {
  ShareInFarm,
  ShareInFarmV2,
  ShareInBurrow,
} from "../detail/stable/ShareInFarm";
import { useCanFarmV1, useCanFarmV2 } from "@/hooks/useStableShares";

function PoolRow(props: any) {
  const { item, index } = props;
  const router = useRouter();
  const {
    farmStakeV1,
    farmStakeV2,
    userTotalShare,
    shares,
    shadowBurrowShare,
  } = useYourliquidity(item.id);
  const formatePool = formatePoolData(item, userTotalShare);
  const toDetail = (item: any) => {
    router.push(`/sauce/${item.id}`);
  };
  const { currentwatchListId } = useWatchList();
  const [renderStarList, setRenderStarList] = useState<any>([]);
  useEffect(() => {
    if (currentwatchListId.length > 0) {
      setRenderStarList(currentwatchListId);
    }
  }, [currentwatchListId]);
  const [legendJson, setLegendJson] = useState<any>({
    item: null,
    ind: 0,
    index: 0,
  });
  const legendMouseEnter = (id: any, ind: number, index: number) => {
    setLegendJson({
      id,
      index,
      ind,
    });
  };

  const { farmCount: countV1, endedFarmCount: endedFarmCountV1 } = useCanFarmV1(
    item.id,
    true
  );

  const { farmCount: countV2, endedFarmCount: endedFarmCountV2 } = useCanFarmV2(
    item.id,
    true
  );

  return (
    <div>
      {
        <div
          className={`${styles.poolContainer} ${
            item.is_farm ? styles.isfarm : styles.notfarm
          }`}
          onClick={() => toDetail(item)}
        >
          {/* pools---first child */}
          <div className="flex items-center xsm:hidden">
            <div className={styles.tokenImgContainer}>
              {item?.token_account_ids?.map((ite: any, ind: number) => {
                const len = item?.token_account_ids?.length;
                // if tokenid in tokenIcons
                return Reflect.has(tokenIcons, ite.tokenId) ? (
                  // if token is near use new icon
                  ite.tokenId != "wrap.near" ? (
                    <img
                      src={ite.icon || tokenIcons[ite.tokenId]}
                      key={ite.tokenId + ind}
                      style={{
                        transform:
                          len == 3 && ind == 2 ? "translate(-4px, -8px)" : "",
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
            <span className={styles.symbol}>
              {item.token_symbols.join("-")}
            </span>
            {/* dangerous */}
            {renderStarList.includes(item.id.toString()) && (
              <StartWatchList className="mr-2" />
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

          {/* pools---first child for mobile*/}
          <div
            className="flex items-center justify-between w-full h-16 lg:hidden px-3 rounded-t-md"
            style={{
              background:
                "linear-gradient(to bottom, rgba(33, 43, 53, 0.5), rgba(61, 84, 108, 0.5))",
            }}
          >
            <div className={styles.tokenImgContainer}>
              {item?.token_account_ids?.map((ite: any, ind: number) => {
                // if tokenid in tokenIcons
                return Reflect.has(tokenIcons, ite.tokenId) ? (
                  // if token is near use new icon
                  ite.tokenId != "wrap.near" ? (
                    <img
                      src={tokenIcons[ite.tokenId]}
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
            <div>
              <span className={`${styles.symbol}`}>
                {item.token_symbols.join("-")}
              </span>
              <div className="w-full flex items-center justify-end mt-1">
                {/* dangerous */}
                {renderStarList.includes(item.id.toString()) && (
                  <StartWatchList className="mr-2" />
                )}
                {/* tag */}

                {item.is_new && (
                  <div
                    className={`bg-primaryGreen  text-black ${styles.tagPublicStyle} border border-dark-270`}
                  >
                    New
                  </div>
                )}

                {item.top && (
                  <div
                    className={`bg-topLinearGradient  ${
                      item.is_new ? "-ml-1.5" : ""
                    } text-black ${
                      styles.topStyle
                    } mx-1 border border-dark-270`}
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
                    } border border-dark-270`}
                  >
                    Farms
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* last child */}
          <div className={`${styles.poolLast} xsm:hidden`}>
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
            <div>
              <div>${toInternationalCurrencySystem_number(item.tvl)}</div>

              {/* tvl token amounts */}
              <div className={styles.tokenCharts}>
                {item?.token_account_ids?.map((ite: any, ind: number) => {
                  return (
                    <div
                      key={ite + ind}
                      className="flex my-1 rounded-xl cursor-pointer border border-transparent hover:border-chartsPink"
                      style={{
                        padding: "0 2px",
                      }}
                      onMouseEnter={() => legendMouseEnter(item.id, ind, index)}
                      onMouseLeave={() => {
                        legendMouseEnter(null, 0, 0);
                      }}
                    >
                      {/* token images */}
                      {ite.tokenId != "wrap.near" ? (
                        <img
                          src={ite.icon}
                          key={ite.tokenId + ind}
                          className="w-4 h-4 rounded-full flex-shrink-0 border-dark-90 border"
                        />
                      ) : (
                        <NearIconMini className="flex-shrink-0" />
                      )}
                      {/* token name */}
                      <span className="ml-1">
                        {toInternationalCurrencySystem_number(
                          item.amounts[ind].substring(
                            0,
                            item.amounts[ind].length - ite.decimals
                          )
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* pie charts */}
            <div className={styles.stableCharts}>
              {item.id && (
                <StablePoolRowCharts
                  jsonMap={item}
                  legendJson={legendJson}
                  highlight={legendJson.id === item.id}
                />
              )}
            </div>
          </div>

          {/* last child for mobile*/}
          <div className={`${styles.poolLastForMobile} lg:hidden`}>
            {/* apr */}
            <div>
              <div className="text-sm text-gray-60 font-normal">APR:</div>
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
            <div>
              <div className="text-sm text-gray-60 font-normal">
                Volume (24h):
              </div>
              <div>{toInternationalCurrencySystem_usd(item.volume_24h)}</div>
            </div>

            {/* tvl */}
            <div>
              <div className="text-sm text-gray-60 font-normal">TVL:</div>
              <div>${toInternationalCurrencySystem_number(item.tvl)}</div>
            </div>

            <div>
              <div></div>
              {/* tvl token amounts */}
              <div className={styles.tokenCharts}>
                {item?.token_account_ids?.map((ite: any, ind: number) => {
                  return (
                    <div key={ite + ind} className="frcc">
                      <div
                        className="flex my-1 rounded-xl cursor-pointer border border-transparent hover:border-chartsPink"
                        style={{
                          padding: "2px 0",
                        }}
                        onMouseEnter={() =>
                          legendMouseEnter(item.id, ind, index)
                        }
                        onMouseLeave={() => {
                          legendMouseEnter(null, 0, 0);
                        }}
                      >
                        {/* token images */}
                        {ite.tokenId != "wrap.near" ? (
                          <img
                            src={ite.icon}
                            key={ite.tokenId + ind}
                            className="w-4 h-4 rounded-full flex-shrink-0 border-dark-90 border"
                          />
                        ) : (
                          <NearIconMini className="flex-shrink-0" />
                        )}
                        {/* token name */}
                        <span className="ml-1">
                          {toInternationalCurrencySystem_number(
                            item.amounts[ind].substring(
                              0,
                              item.amounts[ind].length - ite.decimals
                            )
                          )}
                        </span>
                      </div>
                      {ind < item?.token_account_ids.length - 1 && (
                        <span className="ml-1">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* hide farm div */}
          <div className={`${styles.farmContainer}`}>
            <div>
              <div className="frcc">
                <span className=" text-gray-60">Shares:</span>
                <span className="mx-2">{formatePool.displayMyShareAmount}</span>
                <span className="text-gray-60">
                  {formatePool.displaySharePercent}
                </span>
              </div>
              <div className="frcc">
                {/* <div className={`${styles.btnStyle} ${styles.lightBtn}`}>
                  Add
                </div>
                <div className={`${styles.btnStyle} ${styles.darkBtn}`}>
                  Remove
                </div> */}
              </div>

              <div className="lg:frcc lg:ml-10 xsm:flex xsm:mt-auto">
                {countV1 > endedFarmCountV1 || Number(farmStakeV1) > 0 ? (
                  <ShareInFarmV2
                    farmStake={farmStakeV1}
                    userTotalShare={userTotalShare}
                    version={"Legacy"}
                    useMx={true}
                  />
                ) : null}
                {countV2 > endedFarmCountV2 || Number(farmStakeV2) > 0 ? (
                  <ShareInFarmV2
                    farmStake={farmStakeV2}
                    userTotalShare={userTotalShare}
                    version={"Classic"}
                    poolId={item.id}
                    onlyEndedFarm={countV2 === endedFarmCountV2}
                    useMx={true}
                  />
                ) : null}
              </div>
              {shadowBurrowShare?.stakeAmount &&
                getConfigV2().SUPPORT_SHADOW_POOL_IDS.includes(
                  item.id?.toString()
                ) && (
                  <div
                    className={`cursor-pointer ${
                      !(countV2 > endedFarmCountV2) ? "hidden" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const shadow_id = `shadow_ref_v1-${item?.id}`;
                      const url = `https://app.burrow.finance/tokenDetail/${shadow_id}`;
                      window.open(url);
                    }}
                  >
                    <ShareInBurrow
                      farmStake={shadowBurrowShare?.stakeAmount}
                      userTotalShare={userTotalShare}
                      inStr={"Burrow"}
                      forStable
                      from={"stable"}
                      poolId={item.id}
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
      }
    </div>
  );
}
export default React.memo(PoolRow);
