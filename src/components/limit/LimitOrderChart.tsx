import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import Big from "big.js";
import { formatNumber, GEARS, isInvalid } from "@/services/limit/limitUtils";
import { IOrderPointItem, ISide } from "@/interfaces/limit";
import { useLimitOrderChartStore } from "@/stores/limitChart";
import { formatPriceWithCommas } from "@/components/pools/detail/dcl/d3Chart/utils";
function OrderChart() {
  const limitOrderChartStore = useLimitOrderChartStore();
  const buy_list = limitOrderChartStore.get_buy_list();
  const sell_list = limitOrderChartStore.get_sell_list();
  const cur_pairs = limitOrderChartStore.get_cur_pairs();
  const cur_token_symbol = limitOrderChartStore.get_cur_token_symbol();
  const zoom = limitOrderChartStore.get_zoom();

  const [foucsOrderPoint, setFoucsOrderPoint] = useState<IOrderPointItem>();
  const [side, setSide] = useState<ISide>();
  // CONST start
  const isMobile = false;
  const svg_width = isMobile ? 360 : 560;
  const svg_height = 400;
  const svg_padding = 20;
  const axisRightWidth = 60;
  const disFromHoverBoxToPointer = 20;
  const is_mobile = isMobile;
  // CONST end
  useEffect(() => {
    if (sell_list?.length || buy_list?.length) {
      drawChart();
    } else {
      clearChart();
    }
  }, [JSON.stringify(buy_list || []), JSON.stringify(sell_list || []), zoom]);
  function drawChart() {
    clearChart();
    const { price_range, amount_range, buy_list_new, sell_list_new } =
      get_data_for_drawing();
    // Create a horizontal axis
    const scaleBottom = d3
      .scaleLinear()
      .domain(price_range)
      .range([0, svg_width - svg_padding - axisRightWidth])
      .clamp(true);
    const axisBottom: any = d3.axisTop(scaleBottom).tickSize(0).tickPadding(10);
    d3.select(".axisBottom")
      .transition()
      .attr("transform", `translate(0, ${svg_height - svg_padding})`)
      .call(axisBottom)
      .selectAll("text")
      .attr("fill", "#7E8A93");
    d3.select(".axisBottom").select(".domain").attr("stroke", "transparent");

    // Create a vertical coordinate
    const scaleRight = d3
      .scaleLinear()
      .domain(amount_range)
      .range([0, svg_height - svg_padding * 2])
      .clamp(true);
    const axisRight: any = d3.axisLeft(scaleRight).tickSize(0).tickPadding(10);
    d3.select(".axisRight")
      .transition()
      .attr("transform", `translate(${svg_width - svg_padding}, 0)`)
      .call(axisRight)
      .selectAll("text")
      .attr("fill", "#7E8A93")
      .select(".domain");
    d3.select(".axisRight").select(".domain").attr("stroke", "transparent");

    // area path data builder
    const areaGenerator = d3
      .area()
      .x((d: any) => {
        return +Big(scaleBottom(+d.price)).toFixed(0);
      })
      .y0(() => {
        return svg_height - svg_padding * 2;
      })
      .y1((d: any) => {
        return +Big(
          scaleRight(+(d.accumulated_x_readable || d.accumulated_y_readable))
        ).toFixed(0);
      });

    // Broken line path data builder
    const lineGenerator = d3
      .line()
      .x((d: any) => {
        return +Big(scaleBottom(+d.price)).toFixed(0);
      })
      .y((d: any) => {
        return +Big(
          scaleRight(+(d.accumulated_x_readable || d.accumulated_y_readable))
        ).toFixed(0);
      });

    // Dotted line path data builder
    const dashLineGenerator = d3.line();

    /** Create left area */
    //  area
    if (buy_list?.length) {
      const area_path_data_left = areaGenerator(buy_list_new as any);
      d3.select(".areaLeft")
        .append("path")
        .attr("opacity", "0.3")
        .attr("d", area_path_data_left)
        .attr("fill", "url(#paint0_linear_7545_2924)");

      // gradient
      const max_y = buy_list_new[buy_list_new.length - 1];
      const y = +Big(
        scaleRight(
          +(max_y.accumulated_x_readable! || max_y.accumulated_y_readable!)
        )
      ).toNumber();
      d3.select(".greenLinearGradient")
        .attr("y1", y)
        .attr("y2", svg_height - svg_padding * 2);

      // Broken line
      const line_path_data_left = lineGenerator(buy_list_new as any);
      d3.select(".areaLeft")
        .append("path")
        .attr("d", line_path_data_left)
        .attr("stroke", "#9EFE01")
        .attr("strokeWidth", "2")
        .attr("fill", "none");

      // The rectangular area where mouse events are triggered
      const buy_list_first = buy_list_new[0];
      const buy_list_last = buy_list_new[buy_list_new.length - 1];
      d3.select(".rectLeft")
        .append("rect")
        .attr("width", () => {
          return (
            scaleBottom(+buy_list_first.price!) -
            scaleBottom(+buy_list_last.price!) +
            svg_padding
          );
        })
        .attr("height", () => {
          return svg_height;
        })
        .attr("x", () => {
          return scaleBottom(+buy_list_last.price!) - svg_padding;
        })
        .attr("y", `${-svg_padding}`)
        .attr("fill", "transparent")
        .on("mousemove", function (e) {
          const { offsetX, offsetY } = e;
          const list = buy_list.concat([]).reverse();
          const [targetX, targetY, targetItem] = searchNearCoordinate(
            list,
            e,
            scaleBottom,
            scaleRight
          );
          if (!isInvalid(targetX) && !isInvalid(targetY)) {
            showCrossDot({
              dashLineGenerator,
              targetX,
              targetY,
              offsetX,
              offsetY,
              dotFillColor: "#9EFE01",
            });
            setSide("buy");
            setFoucsOrderPoint(targetItem);
          }
        })
        .on("mouseleave", function (e, d) {
          hideCrossDot();
        });
    }

    /** Create right area */
    // area
    if (sell_list?.length) {
      const area_path_data_right = areaGenerator(sell_list_new as any);
      d3.select(".areaRight")
        .append("path")
        .attr("opacity", "0.3")
        .attr("d", area_path_data_right)
        .attr("fill", "url(#paint0_linear_7545_2926)");

      // gradient
      const max_y = sell_list_new[0];
      const y = +Big(
        scaleRight(
          +(max_y.accumulated_x_readable! || max_y.accumulated_y_readable!)
        )
      ).toNumber();
      d3.select(".redLinearGradient")
        .attr("y1", y)
        .attr("y2", svg_height - svg_padding * 2);

      // Broken line
      const line_path_data_right = lineGenerator(sell_list_new as any);
      d3.select(".areaRight")
        .append("path")
        .attr("d", line_path_data_right)
        .attr("stroke", "#FF6A8E")
        .attr("strokeWidth", "2")
        .attr("fill", "none");
      // The rectangular area where mouse events are triggered
      const sell_list_first = sell_list_new[0];
      const sell_list_last = sell_list_new[sell_list_new.length - 1];
      d3.select(".rectRight")
        .append("rect")
        .attr("width", () => {
          return (
            scaleBottom(+sell_list_first.price!) -
            scaleBottom(+sell_list_last.price!) +
            svg_padding
          );
        })
        .attr("height", () => {
          return svg_height;
        })
        .attr("x", () => {
          return scaleBottom(+sell_list_last.price!);
        })
        .attr("y", `${-svg_padding}`)
        .attr("fill", "transparent")
        .on("mousemove", function (e) {
          const { offsetX, offsetY } = e;
          const list = sell_list.concat([]).reverse();
          const [targetX, targetY, targetItem] = searchNearCoordinate(
            list,
            e,
            scaleBottom,
            scaleRight
          );
          if (!isInvalid(targetX) && !isInvalid(targetY)) {
            showCrossDot({
              dashLineGenerator,
              targetX,
              targetY,
              offsetX,
              offsetY,
              dotFillColor: "#FF6A8E",
            });
            setSide("sell");
            setFoucsOrderPoint(targetItem);
          }
        })
        .on("mouseleave", function (e, d) {
          hideCrossDot();
        });
    }
  }
  function gte_price_range_by_zoom() {
    // Acquisition price range
    let min_price: any;
    let max_price: any;
    if (buy_list.length == 0) {
      min_price = Big(sell_list[sell_list.length - 1].price || 0)
        .mul(0.9)
        .toFixed();
    } else if (buy_list.length == 1) {
      min_price = Big(buy_list[0].price!).mul(0.9).toFixed();
    } else {
      min_price = Big(buy_list[buy_list.length - 1].price!)
        .mul(0.9)
        .toFixed();
    }
    if (sell_list.length == 0) {
      max_price = Big(buy_list[0].price || 0)
        .mul(1.1)
        .toFixed();
    } else if (sell_list.length == 1) {
      max_price = Big(sell_list[0].price!).mul(1.1).toFixed();
    } else {
      max_price = Big(sell_list[0].price!).mul(1.1).toFixed();
    }
    const each_step_range = Big(max_price)
      .minus(min_price)
      .div(GEARS[0] * 2);
    const total_step_range = each_step_range.mul(GEARS[0] - zoom);
    const new_min_price = Big(min_price).plus(total_step_range).toFixed();
    const new_max_price = Big(max_price).minus(total_step_range).toFixed();
    return [new_min_price, new_max_price];
  }
  function get_data_for_drawing() {
    // get price range
    const [min_price, max_price] = gte_price_range_by_zoom();
    // git amount range
    const amounts: string[] = [];
    buy_list.concat(sell_list).forEach((item: IOrderPointItem) => {
      amounts.push(
        Big(
          item.accumulated_x_readable! || item.accumulated_y_readable!
        ).toFixed(0)
      );
    });
    amounts.sort((b, a) => {
      return Big(b).minus(a).toNumber();
    });

    // Add auxiliary point
    const buy_list_new: IOrderPointItem[] = [];
    if (buy_list.length == 1) {
      const ele = buy_list[0];
      buy_list_new.push(
        {
          price: ele.price,
          accumulated_x_readable: "0",
          accumulated_y_readable: "0",
        },
        ele,
        {
          price: min_price,
          accumulated_x_readable: ele.accumulated_x_readable,
          accumulated_y_readable: ele.accumulated_y_readable,
        }
      );
    } else {
      buy_list.forEach((item: IOrderPointItem, index) => {
        if (index == 0) {
          buy_list_new.push({
            price: item.price,
            accumulated_x_readable: "0",
            accumulated_y_readable: "0",
          });
        }
        buy_list_new.push(item);
        const nextItem = buy_list[index + 1];
        if (index < buy_list.length - 1) {
          buy_list_new.push({
            price: nextItem.price,
            accumulated_x_readable: item.accumulated_x_readable,
            accumulated_y_readable: item.accumulated_y_readable,
          });
        }
        if (index == buy_list.length - 1) {
          buy_list_new.push({
            price: min_price,
            accumulated_x_readable: item.accumulated_x_readable,
            accumulated_y_readable: item.accumulated_y_readable,
          });
        }
      });
    }
    const sell_list_new: IOrderPointItem[] = [];
    if (sell_list.length == 1) {
      const ele = sell_list[0];
      sell_list_new.push(
        {
          price: max_price,
          accumulated_x_readable: ele.accumulated_x_readable,
          accumulated_y_readable: ele.accumulated_y_readable,
        },
        ele,
        {
          price: ele.price,
          accumulated_x_readable: "0",
          accumulated_y_readable: "0",
        }
      );
    } else {
      sell_list.forEach((item: IOrderPointItem, index) => {
        if (index == 0) {
          sell_list_new.push({
            price: max_price,
            accumulated_x_readable: item.accumulated_x_readable,
            accumulated_y_readable: item.accumulated_y_readable,
          });
        }
        if (index < sell_list.length - 1) {
          const nextItem = sell_list[index + 1];
          sell_list_new.push(item, {
            price: item.price,
            accumulated_x_readable: nextItem.accumulated_x_readable,
            accumulated_y_readable: nextItem.accumulated_y_readable,
          });
        }
        if (index == sell_list.length - 1) {
          sell_list_new.push(item, {
            price: item.price,
            accumulated_x_readable: "0",
            accumulated_y_readable: "0",
          });
        }
      });
    }
    const price_range: number[] = [+min_price, +max_price];
    const amount_range: number[] = [+amounts[amounts.length - 1], 0];
    return {
      price_range,
      amount_range,
      buy_list_new,
      sell_list_new,
    };
  }
  function clearChart() {
    d3.selectAll(".axisBottom *").remove();
    d3.selectAll(".axisRight *").remove();
    d3.selectAll(".areaLeft *").remove();
    d3.selectAll(".areaRight *").remove();
    d3.selectAll(".rectLeft *").remove();
    d3.selectAll(".rectRight *").remove();
    d3.select(".verticalDashLine").attr("d", "");
    d3.select(".horizontalDashLine").attr("d", "");
  }
  // Find the data closest to this point
  function searchNearCoordinate(
    list: IOrderPointItem[],
    e: any,
    scaleBottom: Function,
    scaleRight: Function
  ) {
    const { offsetX } = e;
    const x = offsetX - svg_padding;
    let targetX;
    let targetY;
    let targetItem;
    let gtIndex = list.findIndex((item: IOrderPointItem) => {
      return scaleBottom(+item.price!) >= x;
    });
    if (gtIndex == -1) {
      gtIndex = list.length - 1;
    }
    const gtItem = list[gtIndex];
    const x1 = scaleBottom(+gtItem.price!);
    if (gtIndex == 0) {
      targetY = scaleRight(
        +(gtItem.accumulated_x_readable! || gtItem.accumulated_y_readable!)
      );
      targetX = x1;
      targetItem = gtItem;
    } else {
      const ltIndex = gtIndex - 1;
      const ltItem = list[ltIndex];
      const x0 = scaleBottom(+ltItem.price!);
      if (x1 - x > x - x0) {
        targetX = x0;
        targetY = scaleRight(
          +(ltItem.accumulated_x_readable! || ltItem.accumulated_y_readable!)
        );
        targetItem = ltItem;
      } else {
        targetX = x1;
        targetY = scaleRight(
          +(gtItem.accumulated_x_readable! || gtItem.accumulated_y_readable!)
        );
        targetItem = gtItem;
      }
    }
    return [targetX, targetY, targetItem];
  }
  function showCrossDot({
    dashLineGenerator,
    targetX,
    targetY,
    offsetX,
    offsetY,
    dotFillColor,
  }: {
    dashLineGenerator: Function;
    targetX: number;
    targetY: number;
    offsetX: number;
    offsetY: number;
    dotFillColor: string;
  }) {
    const pathDataX = dashLineGenerator([
      [targetX, -40],
      [targetX, 360],
    ]);
    const pathDataY = dashLineGenerator([
      [0, targetY],
      [520, targetY],
    ]);
    d3.select(".verticalDashLine").attr("d", pathDataX).attr("opacity", "1");
    d3.select(".horizontalDashLine").attr("d", pathDataY).attr("opacity", "1");
    d3.select(".dot")
      .attr("cx", targetX)
      .attr("cy", targetY)
      .attr("opacity", "1")
      .attr("fill", dotFillColor);
    let translate_x = offsetX + disFromHoverBoxToPointer;
    const translate_y = is_mobile
      ? offsetY + disFromHoverBoxToPointer
      : offsetY - disFromHoverBoxToPointer;
    if (offsetX > 380) {
      translate_x = offsetX - 235;
    }
    if (is_mobile) {
      translate_x = Math.min(140, translate_x);
    }
    d3.select(".hoverBox").attr(
      "style",
      `visibility:visible;transform:translate(${translate_x}px, ${translate_y}px)`
    );
  }
  function hideCrossDot() {
    d3.select(".verticalDashLine").attr("opacity", "0");
    d3.select(".horizontalDashLine").attr("opacity", "0");
    d3.select(".dot").attr("opacity", "0");
    d3.select(".hoverBox").attr("style", `visibility:invisible`);
  }
  return (
    <div
      className="relative xsm:flex xsm:flex-col xsm:w-full xsm:items-center"
      style={{ width: is_mobile ? "auto" : `${svg_width}px` }}
    >
      <svg width={`${svg_width}`} height={`${svg_height}`}>
        <g transform={`translate(${svg_padding}, ${svg_padding})`}>
          {/* Horizontal axis */}
          <g className="axisBottom"></g>
          {/* Vertical axis */}
          <g className="axisRight"></g>
          {/* Left side area map */}
          <g className="areaLeft"></g>
          {/* Right side area map */}
          <g className="areaRight"></g>
          {/* The left triggers the mouse event area */}
          <g className="rectLeft"></g>
          {/* The righe triggers the mouse event area */}
          <g className="rectRight"></g>
          {/* Vertical dotted line */}
          <path
            className="verticalDashLine"
            fill="none"
            stroke="#999"
            strokeDasharray="2,2"
          ></path>
          {/* Horizontal dashed line */}
          <path
            className="horizontalDashLine"
            fill="none"
            stroke="#999"
            strokeDasharray="2,2"
          ></path>
          {/* The point on the polyline */}
          <circle
            className="dot"
            r="5"
            stroke="#0D1A23"
            strokeWidth="2"
            opacity="0"
          />
        </g>
        {/* Gradient green */}
        <defs>
          <linearGradient
            className="greenLinearGradient"
            id="paint0_linear_7545_2924"
            x1="0"
            x2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00D6AF" />
            <stop offset="1" stopColor="#00D6AF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Gradient red */}
        <defs>
          <linearGradient
            className="redLinearGradient"
            id="paint0_linear_7545_2926"
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
          >
            <stop stopColor="#FF6A8E" />
            <stop offset="1" stopColor="#FF6A8E" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {/* lg:invisible xsm:hidden Floating frame */}
      <div className="hoverBox absolute px-2 py-3 invisible left-0 top-0 bg-dark-60 border border-gray-70 rounded">
        <div className="flex items-center justify-between gap-5 mb-3">
          <span className="text-xs text-gray-50">Side</span>
          <span
            className={`text-sm capitalize ${
              side == "buy" ? "text-primaryGreen" : "text-red-20"
            }`}
          >
            {side}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5 mb-3">
          <span className="text-xs text-gray-50">Price({cur_pairs})</span>
          <span className="text-sm text-white">
            {formatPriceWithCommas(foucsOrderPoint?.price || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5 mb-3">
          <span className="text-xs text-gray-50">Qty({cur_token_symbol})</span>
          <span className="text-sm text-white">
            {formatNumber(
              (foucsOrderPoint?.amount_x_readable ||
                foucsOrderPoint?.amount_y_readable)!
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="text-xs text-gray-50 whitespace-nowrap">
            Total Qty({cur_token_symbol})
          </span>
          <span className="text-sm text-white">
            {formatNumber(
              (foucsOrderPoint?.accumulated_x_readable ||
                foucsOrderPoint?.accumulated_y_readable)!
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
export default React.memo(OrderChart);
