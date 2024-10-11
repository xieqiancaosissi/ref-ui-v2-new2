import React, { useRef, useEffect, useState } from "react";
import * as charts from "echarts";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
} from "@/utils/uiNumber";
import { toInternationalCurrencySystem } from "@/utils/numbers";
import { toReadableNumber } from "@/utils/numbers";
import HoverTip from "@/components/common/Tips";
import BigNumber from "bignumber.js";
import { colorMap } from "@/utils/config";
function StablePoolRowCharts(props: any) {
  const chartRef = useRef(null);
  const { updatedMapList, poolDetail, tokenPriceList } = props;
  const [sumToken, setSumToken] = useState(0);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); //
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const chartInstanceNew = charts.init(chartRef.current);
    const waitSetList: any = updatedMapList;
    const chartsData: any = [];
    let sumToken = 0;

    waitSetList?.length > 0 &&
      waitSetList.map((item: any, index: number) => {
        item?.token_account_ids?.map((ite: any, ind: number) => {
          const tokenAmount = toReadableNumber(
            ite.decimals,
            item.supplies[ite.tokenId]
          );
          sumToken += +tokenAmount;
          chartsData.push({
            name: ite.symbol,
            value: tokenAmount,
            privateIcon: ite.icon,
            itemStyle: {
              color: colorMap[ite.symbol] || "black",
            }, //mobile do not use rgba(255,255,255,.3)
            label: {
              formatter(params: any) {
                return `{bg|}\n{title|${
                  params.data.name
                }}\n{amount|${toInternationalCurrencySystem(
                  params.data.value,
                  2
                )}}\n{percent|${params.percent}%}\n`;
              },
              rich: {
                bg: {
                  height: 18,
                  backgroundColor: {
                    image: ite.symbol == "NEAR" ? "/images/near.png" : ite.icon,
                  },
                },
                title: {
                  fontSize: "12px",
                  color: "#91A2AE",
                },
                amount: {
                  color: "#fff",
                  fontSize: "10px",
                },
                percent: {
                  fontSize: "10px",
                  color: "#fff",
                },
              },
            },
            emphasis: {
              itemStyle: {
                color: colorMap[ite.symbol] || "black",
              },
              label: {
                formatter(params: any) {
                  return `{bg|}${"\n"}{title|${
                    params.data.name
                  }}${"\n"}{amount|${toInternationalCurrencySystem(
                    params.data.value,
                    2
                  )}}\n{percent|${params.percent}%}\n`;
                },
                rich: {
                  bg: {
                    height: isMobile ? 18 : 24,
                    backgroundColor: {
                      image:
                        ite.symbol == "NEAR" ? "/images/near.png" : ite.icon,
                    },
                  },
                  title: {
                    fontSize: "12px",
                    color: "#91A2AE",
                  },
                  amount: {
                    color: "#fff",
                    fontSize: isMobile ? "10px" : "12px",
                  },
                  percent: {
                    fontSize: isMobile ? "10px" : "12px",
                    color: "#fff",
                  },
                },
              },
            },
          });
        });
      });
    setSumToken(sumToken);
    // charts option
    const options = {
      tooltip: {
        show: false,
      },
      animation: false,
      series: [
        {
          type: "pie",
          radius: ["40%", "50%"],
          avoidLabelOverlap: true,
          label: {
            show: true,
            position: "outside",
          },
          emphasis: {
            label: {
              show: true,
              color: "#fff",
            },
          },
          labelLine: {
            show: true,
          },
          itemStyle: {
            borderRadius: 1,
          },
          padAngle: 2,
          data: chartsData,
        },
      ],
    };
    chartInstanceNew.setOption(options);
    const handleResize = () => {
      if (chartInstanceNew) {
        chartInstanceNew.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstanceNew) {
        chartInstanceNew.dispose(); // 销毁ECharts实例
      }
    };
  }, [poolDetail, isMobile, updatedMapList]);

  //
  let utilisationDisplay;
  if (poolDetail?.tvl) {
    const utilisation = new BigNumber(poolDetail.volume_24h)
      .dividedBy(poolDetail.tvl)
      .multipliedBy(100);
    if (new BigNumber("0.01").isGreaterThan(utilisation)) {
      utilisationDisplay = "<0.01%";
    } else {
      utilisationDisplay = utilisation.toFixed(2) + "%";
    }
  }

  return (
    <div
      className="flex xsm:flex-col w-full lg:pl-20 xsm:mb-12 xsm:p-2 items-start xsm:rounded-md"
      style={{
        background: isMobile ? "rgba(33, 43, 53, 0.3)" : "",
      }}
    >
      <div
        ref={chartRef}
        style={{
          width: isMobile ? "100%" : "360px",
          height: "360px",
        }}
      ></div>
      {/* pc */}
      <div className="flex items-start lg:mt-16 xsm:w-full xsm:hidden">
        <div>
          {updatedMapList.map((item: any, index: number) => {
            // 提取tokenIds和对应的symbols，以及计算tokenAmounts
            const tokenIdsAndSymbols = item.token_account_ids?.map(
              (ite: any, ind: number) => {
                const tokenAmount = toReadableNumber(
                  ite.decimals,
                  item.supplies[ite.tokenId]
                );
                return {
                  tokenId: ite.tokenId,
                  symbol: item.token_symbols[ind],
                  tokenAmount,
                };
              }
            );

            // 根据tokenAmount进行排序
            tokenIdsAndSymbols?.sort(
              (a: any, b: any) => b.tokenAmount - a.tokenAmount
            ); // 降序排序

            return tokenIdsAndSymbols?.map((tokenInfo: any, ind: number) => {
              const { tokenId, symbol, tokenAmount } = tokenInfo;
              return (
                <div
                  className="flex items-center m-3 hover:opacity-90 text-sm font-normal"
                  key={tokenId + ind}
                >
                  {/* token */}
                  <h4 className="text-gray-60 text-left min-w-13">{symbol}</h4>
                  {/* amounts */}
                  {sumToken ? (
                    <div className="text-white lg:ml-6">
                      {+tokenAmount > 0 && +tokenAmount < 0.01
                        ? "< 0.01"
                        : toInternationalCurrencySystem(tokenAmount, 2) +
                          `  (${formatPercentage(
                            (+tokenAmount / sumToken) * 100
                          )})`}
                    </div>
                  ) : (
                    <div className="text-white lg:ml-6">0</div>
                  )}
                </div>
              );
            });
          })}
          <div className="flex items-center m-3 hover:opacity-90 text-sm font-normal">
            <h4 className=" text-gray-60  text-left w-13">TVL</h4>
            <div className="text-white  lg:ml-6">
              {toInternationalCurrencySystem_usd(poolDetail?.tvl)}
            </div>
          </div>
        </div>
        <div className="text-white ml-20 text-sm">
          <div className="flex m-3">
            <h4 className=" text-gray-60  text-left lg:w-40 flex items-center">
              Liquidity utilisation
              <HoverTip
                msg={"24H Volume / Liquidity ratio"}
                extraStyles={"w-43"}
              />
            </h4>
            <div className="text-white  lg:ml-6">
              {utilisationDisplay || "-"}
            </div>
          </div>
          <div className="flex m-3">
            <h4 className=" text-gray-60  text-left lg:w-40">Daily volume</h4>
            <div className="text-white  lg:ml-6">
              {toInternationalCurrencySystem_usd(poolDetail?.volume_24h)}
            </div>
          </div>
        </div>
      </div>

      {/* mobile */}
      <div className="flex flex-col items-start lg:mt-16 xsm:w-full lg:hidden">
        <div className="w-full">
          {updatedMapList.map((item: any, index: number) => {
            // 提取tokenIds、symbols和tokenAmounts
            const tokenInfos = item.token_account_ids?.map(
              (ite: any, ind: number) => {
                const tokenAmount = toReadableNumber(
                  ite.decimals,
                  item.supplies[ite.tokenId]
                );
                return {
                  tokenId: ite.tokenId,
                  symbol: item.token_symbols[ind],
                  tokenAmount,
                };
              }
            );

            // 根据tokenAmount进行排序（降序）
            tokenInfos?.sort((a: any, b: any) => b.tokenAmount - a.tokenAmount);

            return tokenInfos?.map((tokenInfo: any, ind: number) => {
              const { tokenId, symbol, tokenAmount } = tokenInfo;
              return (
                <div
                  className="flex items-center m-3 hover:opacity-90 text-sm font-normal justify-between"
                  key={tokenId + ind}
                >
                  {/* token */}
                  <h4 className="text-gray-60 text-left min-w-13">{symbol}</h4>
                  {/* amounts */}
                  {sumToken ? (
                    <div className="text-white lg:ml-6">
                      {+tokenAmount > 0 && +tokenAmount < 0.01
                        ? "< 0.01"
                        : toInternationalCurrencySystem(tokenAmount, 2) +
                          `  (${formatPercentage(
                            (+tokenAmount / sumToken) * 100
                          )})`}
                    </div>
                  ) : (
                    <div className="text-white lg:ml-6">0</div>
                  )}
                </div>
              );
            });
          })}
          <div className="flex items-center mx-3 hover:opacity-90 text-sm font-normal justify-between">
            <h4 className=" text-gray-60  text-left w-13">TVL</h4>
            <div className="text-white  lg:ml-6">
              {toInternationalCurrencySystem_usd(poolDetail?.tvl)}
            </div>
          </div>
        </div>
        <div className="text-white text-sm w-full">
          <div className="flex m-3 items-center justify-between">
            <h4 className=" text-gray-60  text-left lg:w-40 flex items-center">
              Liquidity utilisation
              <HoverTip
                msg={"24H Volume / Liquidity ratio"}
                extraStyles={"w-43"}
              />
            </h4>
            <div className="text-white  lg:ml-6">
              {utilisationDisplay || "-"}
            </div>
          </div>
          <div className="flex m-3 items-center justify-between">
            <h4 className=" text-gray-60  text-left lg:w-40">Daily volume</h4>
            <div className="text-white  lg:ml-6">
              {toInternationalCurrencySystem_usd(poolDetail?.volume_24h)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default React.memo(StablePoolRowCharts);
