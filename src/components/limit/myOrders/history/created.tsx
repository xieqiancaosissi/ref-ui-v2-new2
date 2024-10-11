import React from "react";
import moment from "moment";
import { UserOrderInfo } from "@/services/swapV3";
import { TIMESTAMP_DIVISOR } from "@/utils/constant";
function Created({ order }: { order: UserOrderInfo }) {
  return (
    <span className=" relative  whitespace-nowrap    text-gray-10 xs:text-xs flex flex-col   xsm:justify-center  text-left xs:opacity-50">
      <span className="xsm:hidden">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format("YYYY-MM-DD")}
      </span>
      <span className="xsm:hidden">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format("HH:mm")}
      </span>

      <span className="lg:hidden text-center">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format("YYYY-MM-DD HH:mm")}
      </span>
    </span>
  );
}

export default React.memo(Created);
