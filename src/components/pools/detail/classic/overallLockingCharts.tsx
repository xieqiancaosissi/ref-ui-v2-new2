import React, { useRef, useEffect } from "react";
import * as charts from "echarts";

function OverallLockingPie({ percent }: { percent: number }) {
  const chartRef = useRef(null);
  useEffect(() => {
    const chartInstance = charts.init(chartRef.current);

    // charts option
    const options = {
      tooltip: {
        show: false,
      },
      animation: false,
      series: [
        {
          type: "pie",
          radius: ["40%", "60%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            scale: false,
            label: {
              show: false,
            },
          },
          labelLine: {
            show: false,
          },

          data: [
            {
              value: percent,
              name: "Search Engine",
              itemStyle: {
                color: "#9eff00",
              },
            },
            {
              value: 1 - percent,
              name: "Search Engine",
              itemStyle: {
                color: "#91A2AE",
              },
            },
          ],
        },
      ],
    };
    chartInstance.setOption(options);

    // clear
    return () => {
      chartInstance.dispose();
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        width: "26px",
        height: "26px",
      }}
    ></div>
  );
}
export default React.memo(OverallLockingPie);
