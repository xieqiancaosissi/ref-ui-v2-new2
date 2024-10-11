import { isMobile } from "@/utils/device";
import {
  addThousandSeparator,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";

export const timeTabList = [
  {
    key: 7,
    value: "7D",
  },
  {
    key: 30,
    value: "30D",
  },
  {
    key: 90,
    value: "90D",
  },
  {
    key: 180,
    value: "180D",
  },
];

// echarts config above
export const colorStopTvl = [
  {
    offset: 0,
    color: "rgba(158, 255, 0, 0.3)",
  },
  {
    offset: 1,
    color: "rgba(158, 254, 1, 0.1)", //
  },
];

export const colorStop24H = [
  {
    offset: 0,
    color: "rgba(101, 126, 255, 0.3)",
  },
  {
    offset: 1,
    color: "rgba(101, 126, 255, 0.1)", //
  },
];

export const chartsOtherConfig = (chartsKind: string) => {
  return {
    yAxis: {
      type: "value",
      show: false,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#141C22",
      borderWidth: 1,
      borderColor: "#2D343D",
      extraCssText: "z-index: 2;",
      position(pos: any, params: any, dom: any, rect: any, size: any) {
        const posObj = { top: "10%", left: 0 };
        posObj.left = pos[0] + [-200, 50][+(pos[0] < size.viewSize[0] / 2)];
        return posObj;
      },
      formatter(params: any) {
        let result = `<div style="display:flex;justify-content: space-between;"><span style="color:#6A7279;">${
          chartsKind == "tvl" ? "TVL" : "Volume"
        }:</span>$${toInternationalCurrencySystem_number(
          params[0].value
        )}</div>`; //
        for (let i = 0, l = params.length; i < l; i++) {
          result += `<div style="display:flex;justify-content: space-between;"><span style="color:#6A7279;">Date:</span> <span style="color: white"> ${params[i].axisValue}  </span></div>`;
        }
        const formatDom = `<div style="height: 49px; width: 143px;display:flex; flex-direction:column;justify-content: space-between;padding:0 2px;font-size:12px;font-weight: 400;font-family:SpaceGrotesk">${result}</div>`;
        return formatDom;
      },
    },
    grid: {
      left: "-8%",
      right: "8%",
      bottom: isMobile() ? "20%" : "30%",
      containLabel: true,
    },
    axisPointer: {
      //
      type: "line", //
      axis: "y",
      label: {
        show: false,
      },
    },
    series: {
      areaStyle: {
        normal: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            global: false, //
          },
        },
      },
      itemStyle: {
        normal: {
          color: "transparent", // hover
          opacity: 0,
        },
      },
    },
  };
};
