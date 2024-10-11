import React from "react";
import { FormattedMessage } from "react-intl";
import _ from "lodash";
import { UserOrderInfo } from "@/services/swapV3";
import { IOrderType } from "@/interfaces/limit";
import { isMobile } from "@/utils/device";
const ORDER_TYPE_KEY = "REF_FI_ORDER_TYPE_VALUE";

function OrderTab({
  activeOrderList,
  historyOrderList,
  orderType,
  setOrderType,
}: {
  activeOrderList: UserOrderInfo[];
  historyOrderList: UserOrderInfo[];
  orderType: IOrderType;
  setOrderType: (orderType: IOrderType) => void;
}) {
  const isHistoryTab = orderType === "history";
  const isActiveTab = orderType === "active";
  if (isMobile()) {
    return (
      <div className="frcb w-full">
        <div className="text-white font-gothamBold text-lg underline underline-offset-[12px]">
          <FormattedMessage
            id="your_orders"
            defaultMessage={"Your orders"}
          ></FormattedMessage>
        </div>

        <div className="flex text-[13px] p-1 rounded text-white border border-gray-70">
          <button
            className={`px-3 rounded py-1 relative ${
              orderType === "active" ? "text-white bg-gray-100" : "text-gray-10"
            } `}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              sessionStorage.setItem(ORDER_TYPE_KEY, "active");
              setOrderType("active");
            }}
          >
            <div className="flex items-center">
              <FormattedMessage id="active" defaultMessage={"Active"} />
              {activeOrderList && activeOrderList.length > 0
                ? `(${activeOrderList.length})`
                : null}
            </div>
          </button>

          <button
            className={`px-3 py-1 rounded ${
              orderType === "history"
                ? "text-white bg-gray-100"
                : "text-gray-10"
            } `}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOrderType("history");
              sessionStorage.setItem(ORDER_TYPE_KEY, "history");
            }}
          >
            <div className="frcs">
              <FormattedMessage id="history" defaultMessage={"History"} />
              {historyOrderList && historyOrderList.length > 0
                ? `(${historyOrderList.length})`
                : null}
            </div>
          </button>
        </div>
      </div>
    );
  }
  const isActive = orderType === "active";
  const isHistory = orderType === "history";
  return (
    <div className="flex whitespace-nowrap  text-white">
      <button
        className={`mr-7  xs:mr-10 flex items-center gap-1.5 font-extrabold text-lg outline-none ${
          isActive ? "text-white" : "text-gray-50"
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          sessionStorage.setItem(ORDER_TYPE_KEY, "active");
          setOrderType("active");
        }}
      >
        <span
          className={`${isActive ? " underline" : ""}`}
          style={{ textUnderlineOffset: "12px" }}
        >
          <FormattedMessage
            id="active_orders"
            defaultMessage={"Active Orders"}
          />
        </span>
        {activeOrderList?.length > 0 ? (
          <span
            className={`flex items-center justify-center min-w-5 h-5 text-sm text-gray-210 rounded bg-gray-40 px-1 ${
              !isActive ? "opacity-30" : ""
            }`}
          >
            {activeOrderList.length}
          </span>
        ) : null}
      </button>

      <button
        className={`flex items-center gap-1.5 font-extrabold text-lg outline-none ${
          isHistory ? "text-white" : "text-gray-50"
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOrderType("history");
          sessionStorage.setItem(ORDER_TYPE_KEY, "history");
        }}
      >
        <span
          className={`${isHistory ? " underline" : ""}`}
          style={{ textUnderlineOffset: "12px" }}
        >
          <FormattedMessage id="history" defaultMessage={"History"} />
        </span>
        {historyOrderList?.length > 0 ? (
          <span
            className={`flex items-center justify-center min-w-5 h-5 text-sm text-gray-210 rounded bg-gray-40 px-1 ${
              !isHistory ? "opacity-30" : ""
            }`}
          >
            {historyOrderList.length}
          </span>
        ) : null}
      </button>
    </div>
  );
}
export default React.memo(OrderTab);
