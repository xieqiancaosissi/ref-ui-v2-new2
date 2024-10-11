import React, { useRef, useEffect, useState, useMemo } from "react";
import * as charts from "echarts";
import styles from "./style.module.css";
import { useV3MonthTVL, useV3MonthVolume } from "@/hooks/usePoolDetailCharts";
import {
  toInternationalCurrencySystem_number,
  toInternationalCurrencySystem_usd,
} from "@/utils/uiNumber";
import { SplitRectangleIcon, ExchangeIcon } from "@/components/pools/icon";
import moment from "moment";
import DclChart from "./d3Chart/DclChart";
import { TOKEN_LIST_FOR_RATE } from "@/services/commonV3";
import { beautifyNumber } from "@/components/common/beautifyNumber";
import { getPriceByPoint } from "@/services/commonV3";
import BigNumber from "bignumber.js";
import { formatWithCommas } from "@/utils/numbers";
import { toPrecision } from "@/utils/numbers";
import { get_pool } from "@/services/swapV3";
import { ftGetTokensMetadata } from "@/services/token";
import { reverse_price } from "@/services/commonV3";
import {
  sort_tokens_by_base,
  sort_tokens_by_base_onlysymbol,
} from "@/services/commonV3";

function TvlAndVolumeCharts(props: any) {
  const [rateDirection, setRateDirection] = useState(true);
  const [isActive, setActive] = useState("liquidity");
  const [isFinished, setIsFinished] = useState(false);
  const { poolDetail, tokenPriceList } = props;
  const { monthTVLById, xTvl, yTvl } = useV3MonthTVL(poolDetail.id);
  const { monthVolumeById, xMonth, yMonth } = useV3MonthVolume(poolDetail.id);
  const refDom: any = useRef(null);
  const [currentSort, setCurrenSort] = useState(
    !rateDirection ? [1, 0] : [0, 1]
  );
  const [isMobile, setIsMobile] = useState(false);
  const [poolDetailFromRPC, setPoolDetailRPC] = useState<any>({});
  const exchange = () => {
    const [a, b] = currentSort;
    setCurrenSort([b, a]);
  };
  const poolTypeList = [
    {
      key: "liquidity",
      value: "Liquidity",
    },
    {
      key: "tvl",
      value: "TVL",
    },
    {
      key: "24h",
      value: "Volume",
    },
  ];
  let timer: any;

  useEffect(() => {
    get_pool_detail();
  }, []);
  useEffect(() => {
    if (refDom.current) {
      setSvgWidth(refDom?.current?.clientWidth || svgDefaultWidth);
      window.onresize = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setSvgWidth(refDom?.current?.clientWidth || svgDefaultWidth);
        }, 50);
      };
    }
  }, [refDom.current]);

  useEffect(() => {
    if (poolDetail?.token_symbols) {
      console.log(poolDetail?.token_symbols);
      if (TOKEN_LIST_FOR_RATE.indexOf(poolDetail?.token_symbols[0]) > -1) {
        setRateDirection(false);
      } else {
        setRateDirection(true);
      }
    }
  }, [poolDetail]);

  useEffect(() => {
    // @ts-ignore
    if (monthVolumeById?.length > 0) {
      setIsFinished(true);
    }
  }, [monthVolumeById]);

  function switchRate() {
    setRateDirection(!rateDirection);
  }

  const svgDefaultWidth = isMobile
    ? document.documentElement.clientWidth - 32 || "330"
    : 736;
  const [svgWidth, setSvgWidth] = useState(svgDefaultWidth);

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

  const rateDOM = useMemo(() => {
    if (Object.values(poolDetailFromRPC).length < 1) return;
    const { current_point, token_x_metadata, token_y_metadata } =
      poolDetailFromRPC;
    const rate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);

    const price = getPriceByPoint(current_point, rate);
    return !rateDirection
      ? beautifyNumber({ num: reverse_price(price) })
      : beautifyNumber({ num: price });
  }, [poolDetailFromRPC, rateDirection]);

  async function get_pool_detail() {
    const detail: any = await get_pool(poolDetail.id);
    if (detail) {
      const { token_x, token_y } = detail;
      const metaData: Record<string, any> = await ftGetTokensMetadata([
        token_x,
        token_y,
      ]);
      detail.token_x_metadata = metaData[token_x];
      detail.token_y_metadata = metaData[token_y];
      setPoolDetailRPC(detail);
    }
  }

  const tokens = useMemo(() => {
    if (poolDetail) {
      return sort_tokens_by_base_onlysymbol(poolDetail.token_symbols);
    }
  }, [poolDetail]);

  const tokensIds = useMemo(() => {
    if (poolDetailFromRPC?.token_y_metadata) {
      return sort_tokens_by_base([
        poolDetailFromRPC.token_x_metadata,
        poolDetailFromRPC.token_y_metadata,
      ]);
    }
  }, [poolDetailFromRPC]);

  return (
    <div>
      {/* tab bar */}
      <div className="flex justify-between lg:mt-12 lg:mb-5">
        <div className={styles.chartsFilterPoolType}>
          {poolTypeList.map((item, index) => {
            return (
              <div
                key={item.key + index}
                className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-gray-100 rounded"
                      : "text-gray-60"
                  }
                   lg:w-18 xsm:w-1/3 h-8 frcc text-sm hover:text-white 
                `}
                onClick={() => {
                  setActive(item.key);
                }}
              >
                {item.value}
              </div>
            );
          })}
        </div>

        {/* pc current price */}
        {isActive == "liquidity" && (
          <div className="text-sm text-white xsm:hidden">
            <h3 className="text-gray-50 font-normal text-right">
              Current Price
            </h3>
            <p className="frcc">
              <ExchangeIcon
                className="mt-auto mr-1 mb-1 cursor-pointer opacity-40 hover:opacity-100"
                onClick={() => {
                  exchange();
                  switchRate();
                }}
              />
              {/* dom render in html formatter above: 1 Near($5.2) = 7Ref */}
              <span className="mr-1">1</span>
              {/* token left name */}
              {tokens[currentSort[0]] == "wNEAR"
                ? "NEAR"
                : tokens[currentSort[0]]}
              {/* usd price */}
              {/* {tokenPriceList && poolDetail && (
              <span className="text-gray-50 font-normal">
                (
                {toInternationalCurrencySystem_usd(
                  tokenPriceList[poolDetail.token_account_ids[currentSort[0]]]
                    .price
                )}
                )
              </span>
            )} */}
              <span className="mx-1">=</span>
              {/* token right amount */}
              <span className="mr-1">{rateDOM}</span>
              {/* token right name */}
              {tokens[currentSort[1]] == "wNEAR"
                ? "NEAR"
                : tokens[currentSort[1]]}
            </p>
          </div>
        )}
      </div>
      {/* mobile current price */}
      {isActive == "liquidity" && (
        <div className="text-sm text-white lg:hidden w-full">
          <h3 className="text-gray-50 font-normal">Current Price</h3>
          <p className="flex items-center">
            {/* dom render in html formatter above: 1 Near($5.2) = 7Ref */}
            <span className="mr-1">1</span>
            {/* token left name */}
            {tokens[currentSort[0]] == "wNEAR"
              ? "NEAR"
              : tokens[currentSort[0]]}
            {/* usd price */}
            {tokenPriceList && poolDetail && tokensIds?.length > 0 && (
              <span className="text-gray-50 font-normal">
                (
                {toInternationalCurrencySystem_usd(
                  tokenPriceList[tokensIds[currentSort[0]].id]?.price
                )}
                )
              </span>
            )}
            <span className="mx-1">=</span>
            {/* token right amount */}
            {tokenPriceList && poolDetail && (
              <span className="mr-1">{rateDOM}</span>
            )}
            {/* token right name */}
            {tokens[currentSort[1]] == "wNEAR"
              ? "NEAR"
              : tokens[currentSort[1]]}
            <ExchangeIcon
              className="ml-1"
              onClick={() => {
                exchange();
                switchRate();
              }}
            />
          </p>
        </div>
      )}

      {/* charts */}
      {isFinished && (
        <div className={styles.chartsContent} ref={refDom}>
          {isActive == "tvl" && poolDetail.id && (
            <TVlCharts {...{ poolId: poolDetail.id, xTvl, yTvl, isMobile }} />
          )}
          {isActive == "24h" && poolDetail.id && (
            <VolumeCharts
              {...{ poolId: poolDetail.id, xMonth, yMonth, isMobile }}
            />
          )}
          {isActive == "liquidity" && poolDetail.id && (
            <DclChart
              pool_id={poolDetail.id}
              config={{
                controlHidden: true,
                svgWidth,
                svgHeight: isMobile ? "250" : "450",
              }}
              reverse={!rateDirection}
            />
          )}
        </div>
      )}
    </div>
  );
}
export default React.memo(TvlAndVolumeCharts);
// tvl charts
export function TVlCharts(props: any) {
  const chartRef = useRef(null);
  const { xTvl, yTvl, isMobile } = props;
  const formatAxisLable = (str: string) => {
    const momentDate = moment(str, "MMM DD, YYYY");
    if (momentDate.isValid()) {
      const day = momentDate.format("DD");
      return day;
    } else {
      const regex = /(\d{2}),/;
      const match = str.match(regex);
      if (match) {
        return match[1];
      }
    }
  };

  useEffect(() => {
    const chartInstance = charts?.init(chartRef.current);
    const options = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xTvl,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          margin: 17,
          formatter(value: string) {
            return formatAxisLable(value);
          },
          color: "#91A2AE",
        },
      },
      yAxis: {
        type: "value",
        show: false,
      },
      tooltip: {
        trigger: "axis",
        alwaysShowContent: true,
        backgroundColor: "transparent",
        borderWidth: 0,
        borderColor: "transparent",
        position: isMobile ? [0, -100] : [600, -124],
        extraCssText: "z-index: 2;",
        formatter(params: any) {
          let result = `<div style="display:flex;justify-content: space-between;font-size:14px;"> ${params[0].axisValue} </div>`; //
          for (let i = 0, l = params.length; i < l; i++) {
            if (isMobile) {
              result += `<div style="display:flex;justify-content: space-between;margin-left:4px"><span style="color:#9efe01;font-size:16px;font-weight:700;">$${toInternationalCurrencySystem_number(
                params[i].value
              )}</span></div>`;
            } else {
              result += `<div style="display:flex;justify-content: space-between;"><span style="color:white;font-size:16px;font-weight:700;">$${toInternationalCurrencySystem_number(
                params[i].value
              )}</span></div>`;
            }
          }

          const formatDom = `<div style="height: 39px; width: 72px; ${
            isMobile
              ? "display:flex;align-items: center;"
              : "display:flex; flex-direction:column;justify-content: space-between;align-items: center;"
          }font-weight: 400;font-family:SpaceGrotesk">${result}</div>`;
          return formatDom;
        },
      },
      grid: {
        left: "-6%",
        right: "2%",
        bottom: "20%",
        containLabel: true,
      },
      axisPointer: {
        //
        type: "line", //
        axis: "y",
        label: {
          show: false,
        },
        lineStyle: {
          color: "#9EFE01",
        },
      },
      series: {
        data: yTvl,
        type: "line",
        areaStyle: {
          normal: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              global: false, //
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(158, 255, 0, 0.3)",
                },
                {
                  offset: 1,
                  color: "rgba(158, 254, 1, 0.1)", //
                },
              ],
            },
          },
        },
        lineStyle: {
          color: "#9EFE01",
          width: isMobile ? 1 : 2,
        },
        itemStyle: {
          normal: {
            color: "transparent", // hover
            opacity: 0,
          },
        },
        emphasis: {
          itemStyle: {
            color: "#9EFE01",
            opacity: 1,
          },
        },
      },
    };

    chartInstance.setOption(options);

    chartInstance.dispatchAction({
      type: "showTip",

      seriesIndex: 0,

      dataIndex: xTvl.length - 1,
    });

    // chartInstance.on("mouseout", function (params) {
    //   setTimeout(() => {
    //     chartInstance.dispatchAction({
    //       type: "showTip",
    //       seriesIndex: 0,
    //       dataIndex: xTvl.length - 1,
    //     });
    //   }, 100); // 延迟100毫秒
    // });

    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance) {
        chartInstance.dispose(); // 销毁ECharts实例
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        width: isMobile ? "100vw" : "100%",
        height: isMobile ? "360px" : "540px",
      }}
    ></div>
  );
}

// volume charts
export function VolumeCharts(props: any) {
  const chartRef = useRef(null);
  const { xMonth, yMonth, isMobile } = props;

  const formatAxisLable = (str: string) => {
    const momentDate = moment(str, "MMM DD, YYYY");
    if (momentDate.isValid()) {
      const day = momentDate.format("DD");
      return day;
    } else {
      const regex = /(\d{2}),/;
      const match = str.match(regex);
      if (match) {
        return match[1];
      }
    }
  };

  useEffect(() => {
    const chartInstance = charts?.init(chartRef.current);
    const options = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xMonth,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          margin: 17,
          formatter(value: string) {
            return formatAxisLable(value);
          },
          color: "#91A2AE",
        },
      },
      yAxis: {
        type: "value",
        show: false,
      },
      tooltip: {
        trigger: "axis",
        alwaysShowContent: true,
        backgroundColor: "transparent",
        borderWidth: 0,
        borderColor: "transparent",
        position: isMobile ? [0, -100] : [600, -124],
        extraCssText: "z-index: 2;",
        formatter(params: any) {
          let result = `<div style="display:flex;justify-content: space-between;font-size:14px;"> ${params[0].axisValue} </div>`; //
          for (let i = 0, l = params.length; i < l; i++) {
            if (isMobile) {
              result += `<div style="display:flex;justify-content: space-between;margin-left:4px"><span style="color:#9efe01;font-size:16px;font-weight:700;">$${toInternationalCurrencySystem_number(
                params[i].value
              )}</span></div>`;
            } else {
              result += `<div style="display:flex;justify-content: space-between;"><span style="color:white;font-size:16px;font-weight:700;">$${toInternationalCurrencySystem_number(
                params[i].value
              )}</span></div>`;
            }
          }

          const formatDom = `<div style="height: 39px; width: 72px; ${
            isMobile
              ? "display:flex;align-items: center;"
              : "display:flex; flex-direction:column;justify-content: space-between;align-items: center;"
          }font-weight: 400;font-family:SpaceGrotesk">${result}</div>`;
          return formatDom;
        },
      },
      grid: {
        left: "-6%",
        right: "2%",
        bottom: "20%",
        containLabel: true,
      },
      axisPointer: {
        //
        type: "line", //
        axis: "y",
        label: {
          show: false,
        },
        lineStyle: {
          color: "#8C9CA8",
        },
      },
      series: {
        data: yMonth,
        type: "bar",
        barWidth: isMobile ? 5 : 10,
        itemStyle: {
          normal: {
            color: "#1D2932", // hover
            opacity: 1,
          },
        },
        emphasis: {
          itemStyle: {
            color: "#9EFE01",
            opacity: 1,
          },
        },
      },
    };

    chartInstance.setOption(options);

    chartInstance.dispatchAction({
      type: "showTip",

      seriesIndex: 0,

      dataIndex: xMonth.length - 1,
    });

    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance) {
        chartInstance.dispose(); // 销毁ECharts实例
      }
    };
  }, []);
  return (
    <div
      ref={chartRef}
      style={{
        width: isMobile ? "100vw" : "100%",
        height: isMobile ? "360px" : "540px",
      }}
    ></div>
  );
}
