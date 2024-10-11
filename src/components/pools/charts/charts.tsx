import React, { useRef, useEffect, useState } from "react";
import * as charts from "echarts";
import Big from "big.js";
import styles from "./charts.module.css";
import {
  colorStop24H,
  colorStopTvl,
  chartsOtherConfig,
  timeTabList,
} from "./config";
import {
  addThousandSeparator,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { getPoolIndexTvlOR24H, getAllPoolData } from "@/services/pool";

import { BlueCircleLoading } from "../icon";
import { MobileArrowUp } from "../icon";

export default function Charts({
  title,
  type,
  all,
}: {
  title: string;
  type: string;
  all?: any;
}) {
  const chartRef = useRef(null);
  const [isActive, setActive] = useState(30);
  const [chartsData, setChartsData] = useState<any>(null);
  const [allTVL, setAllTVL] = useState<string>();

  const [allVolume24h, setAllVolume24h] = useState<string>();
  // init charts
  useEffect(() => {
    const chartInstance = charts.init(chartRef.current);

    const options = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: chartsData?.date,
        show: false,
      },
      yAxis: chartsOtherConfig(type).yAxis,
      tooltip: Object.assign(chartsOtherConfig(type).tooltip, {
        textStyle: {
          color: type == "tvl" ? "#9EFE01" : "#657EFF",
        },
      }),
      grid: chartsOtherConfig(type).grid,
      axisPointer: {
        ...chartsOtherConfig(type).axisPointer,
        lineStyle: {
          color: type == "tvl" ? "#9EFE01" : "#657EFF",
        },
      },
      series: [
        {
          data: chartsData?.list,
          type: "line",
          areaStyle: {
            normal: {
              color: {
                ...chartsOtherConfig(type).series.areaStyle.normal.color,
                colorStops: type == "tvl" ? colorStopTvl : colorStop24H,
              },
            },
          },
          lineStyle: {
            color: type == "tvl" ? "#9EFE01" : "#657EFF",
            width: 1,
          },
          itemStyle: chartsOtherConfig(type).series.itemStyle,
          emphasis: {
            itemStyle: {
              color: type == "tvl" ? "#9EFE01" : "#657EFF",
              opacity: 1,
            },
          },
        },
      ],
    };
    chartInstance.setOption(options);

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
  }, [chartsData]);

  // mock data
  useEffect(() => {
    getPoolIndexTvlOR24H(type, isActive).then((res) => {
      setChartsData(res);
    });
    if (all?.allTVL || all?.allVolume24h) {
      setAllTVL(all.allTVL);
      setAllVolume24h(all.allVolume24h);
    } else {
      getAllPoolData().then((res) => {
        setAllTVL(res.tvl);
        setAllVolume24h(res.volume_24h);
      });
    }
  }, [isActive]);

  const [showTime, setShowTime] = useState(false);
  const modalRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowTime(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div className="relative">
      {/* title & tab */}
      <div className={styles.chartsTitle}>
        <div className="xsm: mb-10">
          <div className="text-gray-50 text-sm">{title}</div>
          <div className="text-white text-xl">
            $
            {toInternationalCurrencySystem_number(
              type == "tvl"
                ? new Big(allTVL || "0").toFixed(2)
                : new Big(allVolume24h || "0").toFixed(2)
            )}
          </div>
        </div>
        <div className="text-xs cursor-pointer relative top-4">
          {/* Mobile */}
          <div
            className="flex items-center justify-between text-white w-24 h-6 rounded px-3 text-sm font-normal xsm:bg-dark-70 lg:hidden"
            onClick={() => {
              setShowTime((pre) => !pre);
            }}
          >
            {isActive}D<MobileArrowUp></MobileArrowUp>
          </div>
          {showTime && (
            <div
              ref={modalRef}
              className="absolute top-7 lg:hidden"
              style={{
                zIndex: 49,
              }}
            >
              {timeTabList.map((item, index) => {
                return (
                  <div
                    key={item.key + index}
                    className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-gray-100 rounded"
                      : "text-gray-60"
                  }
                   lg:w-8 xsm:w-24 h-5 flex items-center justify-center lg:ml-2
                `}
                    onClick={() => {
                      setActive(item.key);
                      setShowTime(false);
                    }}
                  >
                    {item.value}
                  </div>
                );
              })}
            </div>
          )}
          {/* Mobile End */}

          {/* PC */}
          <div
            className="frcc xsm:hidden"
            style={{
              zIndex: 49,
            }}
          >
            {timeTabList.map((item, index) => {
              return (
                <div
                  key={item.key + index}
                  className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-gray-100 rounded"
                      : "text-gray-60"
                  }
                   lg:w-8 xsm:w-16 h-5 flex items-center justify-center lg:ml-2
                `}
                  onClick={() => {
                    setActive(item.key);
                    setShowTime(false);
                  }}
                >
                  {item.value}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* main charts */}
      <div className={styles.chartsContent}>
        <div
          ref={chartRef}
          className="xsm:w-full xsm:h-full lg:w-full lg:h-65"
        ></div>
      </div>
      {!chartsData && (
        <div
          className="frcc absolute bottom-10"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <BlueCircleLoading
            color={type == "tvl" ? "#9EFE01" : "#657EFF"}
          ></BlueCircleLoading>
        </div>
      )}
    </div>
  );
}
