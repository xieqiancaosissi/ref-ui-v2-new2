import React, { useRef, useEffect, useState } from "react";
import * as charts from "echarts";
import styles from "./style.module.css";
import { useMonthTVL, useMonthVolume } from "@/hooks/usePoolDetailCharts";
import { toInternationalCurrencySystem_number } from "@/utils/uiNumber";
import moment from "moment";

function TvlAndVolumeCharts(props: any) {
  const [isActive, setActive] = useState("24h");
  const [isFinished, setIsFinished] = useState(false);
  const { monthTVLById, xTvl, yTvl } = useMonthTVL(props.poolId);
  const { monthVolumeById, xMonth, yMonth } = useMonthVolume(props.poolId);
  const poolTypeList = [
    {
      key: "tvl",
      value: "TVL",
    },
    {
      key: "24h",
      value: "Volume",
    },
  ];

  useEffect(() => {
    // @ts-ignore
    if (monthVolumeById?.length > 0) {
      setIsFinished(true);
    }
  }, [monthVolumeById]);

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

  return (
    <div>
      {/* tab bar */}
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
                   lg:w-18 xsm:w-1/2 h-8 frcc text-sm hover:text-white 
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

      {/* charts */}
      {isFinished && (
        <div className={styles.chartsContent}>
          {isActive == "tvl" ? (
            <TVlCharts {...{ poolId: props.poolId, xTvl, yTvl, isMobile }} />
          ) : (
            <VolumeCharts
              {...{ poolId: props.poolId, xMonth, yMonth, isMobile }}
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
        position: isMobile ? [0, -10] : [630, -72],
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
        left: "-8%",
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
        extraCssText: "z-index: 2;",
        borderColor: "transparent",
        position: isMobile ? [0, -10] : [630, -72],
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
