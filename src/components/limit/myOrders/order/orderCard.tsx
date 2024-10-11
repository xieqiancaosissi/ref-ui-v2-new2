import React, { useEffect, useState, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import _ from "lodash";
import { UserOrderInfo } from "@/services/swapV3";
import useTokens from "@/hooks/useTokens";
import { DownArrowVE, UpArrowVE } from "../../icons2";
import { toReadableNumber, scientificNotationToString } from "@/utils/numbers";
import { TokenMetadata } from "@/services/ft-contract";
import Big from "big.js";
import { sort_tokens_by_base } from "@/services/commonV3";
import { usePersistLimitStore, IPersistLimitStore } from "@/stores/limitOrder";
import useHistoryOrderTx from "@/hooks/useHistoryOrderTx";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { NoOrderCard } from "../widget";
import HistoryLine from "../history/historyLine";
import HistorySwapInfoLine from "../history/historySwapInfoLine";
import ActiveLine from "../active/activeLine";
import { HistoryOrderSwapInfo } from "@/interfaces/limit";
import SwitchTabItem from "../switchTabItem";
import OrderTab from "./orderTab";
const REF_FI_MY_ORDER_SHOW_HISTORY_SWAP_INFO =
  "REF_FI_MY_ORDER_SHOW_HISTORY_SWAP_INFO";
const ORDER_TYPE_KEY = "REF_FI_ORDER_TYPE_VALUE";
function OrderCard({
  activeOrder,
  historyOrder,
  tokensMap,
  historySwapInfo,
  activeOrderDone,
  historyOrderDone,
  historySwapInfoDone,
}: {
  activeOrder: UserOrderInfo[];
  historyOrder: UserOrderInfo[];
  tokensMap: { [key: string]: TokenMetadata };
  historySwapInfo: HistoryOrderSwapInfo[];
  activeOrderDone: boolean;
  historyOrderDone: boolean;
  historySwapInfoDone: boolean;
}) {
  const [activeSortBy, setActiveSortBy] = useState<"unclaim" | "created">(
    "created"
  );
  const [activeOrderHoverOn, setActiveOrderHoverOn] = useState<number>(-1);
  const [historyOrderHoverOn, setHistoryOrderHoverOn] = useState<number>(-1);
  const [historyInfoOrderHoverOn, setHistoryInfoOrderHoverOn] =
    useState<number>(-1);
  const [sortOrderActive, setSorOrderActive] = useState<"asc" | "desc">("desc");
  const [sortOrderHistory, setSorOrderHistory] = useState<"asc" | "desc">(
    "desc"
  );
  const [historySortBy, setHistorySortBy] = useState<"claimed" | "created">(
    "created"
  );
  const [select_type, set_select_type] = useState<"all" | "current">("all");
  const [activeOrderList, setActiveOrderList] = useState<UserOrderInfo[]>();
  const [historyOrderList, setHistoryOrderList] = useState<UserOrderInfo[]>();
  const [historySwapInfoList, setHistorySwapInfoList] =
    useState<HistoryOrderSwapInfo[]>();
  const [orderType, setOrderType] = useState<"active" | "history">(
    sessionStorage.getItem(ORDER_TYPE_KEY) ||
      activeOrder?.length > 0 ||
      !historyOrder ||
      historyOrder.length === 0
      ? "active"
      : "history"
  );
  const [showHistoryInfo, setShowHistoryInfo] = useState<boolean>(
    !!sessionStorage.getItem(REF_FI_MY_ORDER_SHOW_HISTORY_SWAP_INFO) || false
  );
  const intl = useIntl();
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const orderTxs = useHistoryOrderTx();
  const dclPool = persistLimitStore.getDclPool();
  const pool_id_in_cache = dclPool?.pool_id;
  const tokenIds = useMemo(() => {
    if (pool_id_in_cache) {
      const [token_x, token_y, fee] = pool_id_in_cache.split("|");
      return [token_x, token_y];
    }
    return [];
  }, [pool_id_in_cache]);
  const tokens = useTokens(tokenIds) || [];
  const current_pair_tokens_map = tokens.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.id]: cur,
    };
  }, {}) as any;
  useEffect(() => {
    if (activeOrderDone) {
      if (activeOrder.length) {
        if (select_type == "all") {
          setActiveOrderList(activeOrder);
        } else {
          setActiveOrderList(getCurrentPairOrders(activeOrder));
        }
      } else {
        setActiveOrderList([]);
      }
    }
  }, [activeOrder, select_type, pool_id_in_cache, activeOrderDone]);

  useEffect(() => {
    if (historyOrderDone) {
      if (historyOrder.length) {
        if (select_type == "all") {
          setHistoryOrderList(historyOrder);
        } else {
          setHistoryOrderList(getCurrentPairOrders(historyOrder));
        }
      } else {
        setHistoryOrderList([]);
      }
    }
  }, [historyOrder, select_type, pool_id_in_cache, historyOrderDone]);
  useEffect(() => {
    if (historySwapInfoDone) {
      if (historySwapInfo.length) {
        if (select_type == "all") {
          setHistorySwapInfoList(historySwapInfo);
        } else {
          setHistorySwapInfoList(getCurrentPairSwapOrders(historySwapInfo));
        }
      } else {
        setHistorySwapInfoList([]);
      }
    }
  }, [historySwapInfo, select_type, pool_id_in_cache, historySwapInfoDone]);
  const handleShowHistoryInfo = () => {
    setShowHistoryInfo(!showHistoryInfo);
    if (!showHistoryInfo) {
      sessionStorage.setItem(REF_FI_MY_ORDER_SHOW_HISTORY_SWAP_INFO, "true");
    } else {
      sessionStorage.removeItem(REF_FI_MY_ORDER_SHOW_HISTORY_SWAP_INFO);
    }
  };
  function getCurrentPairOrders(orders: UserOrderInfo[]) {
    return orders.filter((order: UserOrderInfo) => {
      return order.pool_id == pool_id_in_cache;
    });
  }
  function getCurrentPairSwapOrders(orders: HistoryOrderSwapInfo[]) {
    return orders.filter((order: HistoryOrderSwapInfo) => {
      return order.pool_id == pool_id_in_cache;
    });
  }
  const sellAmountToBuyAmount = (
    undecimaled_amount: string,
    order: UserOrderInfo,
    price: string
  ) => {
    const buy_amount = new Big(
      toReadableNumber(
        tokensMap[order.sell_token].decimals,
        undecimaled_amount || "0"
      )
    )
      .times(price)
      .toFixed(tokensMap[order.sell_token].decimals);

    return scientificNotationToString(buy_amount);
  };

  const historyOrderSorting = (a: UserOrderInfo, b: UserOrderInfo) => {
    if (historySortBy === "created") {
      return sortOrderHistory === "desc"
        ? Number(b.created_at) - Number(a.created_at)
        : Number(a.created_at) - Number(b.created_at);
    } else if (historySortBy === "claimed") {
      const claimA = toReadableNumber(
        tokensMap[a.buy_token].decimals,
        a.bought_amount || "0"
      );
      const claimB = toReadableNumber(
        tokensMap[b.buy_token].decimals,
        b.bought_amount || "0"
      );

      return sortOrderHistory === "desc"
        ? Number(claimB) - Number(claimA)
        : Number(claimA) - Number(claimB);
    }
    return 0;
  };

  const activeOrderSorting = (a: UserOrderInfo, b: UserOrderInfo) => {
    if (activeSortBy === "created") {
      return sortOrderActive === "desc"
        ? Number(b.created_at) - Number(a.created_at)
        : Number(a.created_at) - Number(b.created_at);
    } else if (activeSortBy === "unclaim") {
      const unclaimA = toReadableNumber(
        tokensMap[a.buy_token].decimals,
        a.unclaimed_amount
      );
      const unclaimB = toReadableNumber(
        tokensMap[b.buy_token].decimals,
        b.unclaimed_amount
      );

      return sortOrderActive === "desc"
        ? Number(unclaimB) - Number(unclaimA)
        : Number(unclaimA) - Number(unclaimB);
    }
    return 0;
  };

  function getRealTimeOrderTip() {
    return `<div class="rounded-md w-44 text-white text-xs text-left">
  
      ${intl.formatMessage({
        id: "real_time_executed_orders_tip",
        defaultMessage:
          "Real-time executed orders are orders placed using limit order function.  Here, you can check real-time executed orders that have been executed between the earliest displayed limit order in History up to the present time.",
      })}
  
    </div>`;
  }
  function get_current_pairs() {
    if (pool_id_in_cache && current_pair_tokens_map) {
      const [token_x, token_y, fee] = pool_id_in_cache.split("|");
      const token_x_meta = current_pair_tokens_map[token_x];
      const token_y_meta = current_pair_tokens_map[token_y];
      if (token_x_meta?.symbol && token_y_meta?.symbol) {
        const tokens = sort_tokens_by_base([token_x_meta, token_y_meta]);
        return `${tokens[0].symbol}-${tokens[1].symbol}`;
      }
    }
    return "";
  }
  const isActive = orderType === "active";
  const isHistory = orderType === "history";
  return (
    <div className="flex flex-col">
      {/* tab bar */}
      <div className="flex items-center justify-between xsm:flex-col xsm:items-end mb-6">
        <OrderTab
          activeOrderList={activeOrderList!}
          historyOrderList={historyOrderList!}
          orderType={orderType}
          setOrderType={setOrderType}
        />
        <div className="flex items-center gap-6 xsm:mt-4">
          <SwitchTabItem
            active={select_type == "current"}
            clickEvent={() => {
              set_select_type("current");
            }}
          >
            Current: {get_current_pairs()}
          </SwitchTabItem>
          <SwitchTabItem
            active={select_type == "all"}
            clickEvent={() => {
              set_select_type("all");
            }}
          >
            All
          </SwitchTabItem>
        </div>
      </div>
      {/* no data */}
      {isHistory && (!historyOrder || historyOrder.length === 0) && (
        <NoOrderCard text="history" />
      )}
      {isActive && (!activeOrder || activeOrder.length === 0) && (
        <NoOrderCard text="active" />
      )}
      {/* table */}
      <table
        className="border-separate xsm:block mb-8"
        style={{
          borderSpacing: 0,
        }}
        onMouseLeave={() => {
          setActiveOrderHoverOn(-1);
          setHistoryOrderHoverOn(-1);
        }}
      >
        {/* active head pc */}
        {isActive && (
          <>
            <tr
              className={`mb-2.5 px-4 xs:hidden ${
                !activeOrder || activeOrder.length === 0 ? "hidden" : ""
              } text-gray-60 grid-cols-7 whitespace-nowrap`}
              onMouseEnter={() => {
                setActiveOrderHoverOn(-1);
                setHistoryOrderHoverOn(-1);
              }}
              style={{
                fontSize: "13px",
              }}
            >
              <th className="col-span-1 pl-3 text-left">
                <FormattedMessage id="you_sell" defaultMessage={"You Sell"} />
              </th>

              <th></th>

              <th className="col-span-1 text-left">
                <FormattedMessage id="you_buy" defaultMessage={"You Buy"} />
              </th>

              <th className=""></th>

              <th className=""></th>

              <th className="col-span-1 text-left">
                <FormattedMessage id="@price" defaultMessage={"@Price"} />
              </th>

              <th>
                <button
                  className="col-span-2 flex items-center"
                  onClick={() => {
                    setActiveSortBy("created");
                    if (activeSortBy === "created") {
                      if (sortOrderActive === "asc") {
                        setSorOrderActive("desc");
                      } else {
                        setSorOrderActive("asc");
                      }
                    } else {
                      setSorOrderActive("desc");
                    }
                  }}
                >
                  <FormattedMessage id="created" defaultMessage={"Created"} />

                  <span
                    className={`ml-0.5 ${
                      activeSortBy === "created"
                        ? "text-primaryGreen"
                        : "hover:text-white"
                    }`}
                  >
                    {activeSortBy === "created" && sortOrderActive === "asc" ? (
                      <UpArrowVE />
                    ) : (
                      <DownArrowVE />
                    )}
                  </span>
                </button>
              </th>

              <th>
                <button
                  className="col-span-1 flex items-center  text-right"
                  onClick={() => {
                    setActiveSortBy("unclaim");
                    if (activeSortBy === "unclaim") {
                      if (sortOrderActive === "asc") {
                        setSorOrderActive("desc");
                      } else {
                        setSorOrderActive("asc");
                      }
                    } else {
                      setSorOrderActive("desc");
                    }
                  }}
                >
                  <FormattedMessage id="executed" defaultMessage={"Executed"} />
                  <span
                    className={`ml-0.5 ${
                      activeSortBy === "unclaim"
                        ? "text-primaryGreen"
                        : "hover:text-white"
                    }`}
                  >
                    {activeSortBy === "unclaim" && sortOrderActive === "asc" ? (
                      <UpArrowVE />
                    ) : (
                      <DownArrowVE />
                    )}
                  </span>
                </button>
              </th>
              <th className="text-right pr-4">Action</th>
            </tr>
          </>
        )}
        {/* history head pc */}
        {isHistory && (
          <>
            <tr
              className={`mb-2.5 px-4 xs:hidden ${
                !historyOrder || historyOrder.length === 0 ? "hidden" : ""
              } text-gray-60 whitespace-nowrap`}
              onMouseEnter={() => {
                setActiveOrderHoverOn(-1);
                setHistoryOrderHoverOn(-1);
              }}
              style={{
                fontSize: "13px",
              }}
            >
              <th className="pl-3 text-left">
                <FormattedMessage id="you_sell" defaultMessage={"You Sell"} />
              </th>

              <th></th>

              <th className="text-left">
                <FormattedMessage id="you_buy" defaultMessage={"You Buy"} />
              </th>

              <th className=""></th>

              <th className="col-span-1 text-left">
                <FormattedMessage id="@price" defaultMessage={"@Price"} />
              </th>

              <th>
                <button
                  className=" flex items-center"
                  onClick={() => {
                    setHistorySortBy("created");
                    if (historySortBy === "created") {
                      if (sortOrderHistory === "asc") {
                        setSorOrderHistory("desc");
                      } else {
                        setSorOrderHistory("asc");
                      }
                    } else {
                      setSorOrderHistory("desc");
                    }
                  }}
                >
                  <FormattedMessage id="created" defaultMessage={"Created"} />

                  <span
                    className={`ml-0.5 ${
                      historySortBy === "created"
                        ? "text-primaryGreen"
                        : "hover:text-white"
                    }`}
                  >
                    {historySortBy === "created" &&
                    sortOrderHistory === "asc" ? (
                      <UpArrowVE />
                    ) : (
                      <DownArrowVE />
                    )}
                  </span>
                </button>
              </th>

              <th>
                <button
                  className="col-span-2 flex items-center text-right"
                  onClick={() => {
                    setHistorySortBy("claimed");
                    if (historySortBy === "claimed") {
                      if (sortOrderHistory === "asc") {
                        setSorOrderHistory("desc");
                      } else {
                        setSorOrderHistory("asc");
                      }
                    } else {
                      setSorOrderHistory("desc");
                    }
                  }}
                >
                  <FormattedMessage id="executed" defaultMessage={"Executed"} />
                  <span
                    className={`ml-0.5 ${
                      historySortBy === "claimed"
                        ? "text-primaryGreen"
                        : "hover:text-white"
                    }`}
                  >
                    {historySortBy === "claimed" &&
                    sortOrderHistory === "asc" ? (
                      <UpArrowVE />
                    ) : (
                      <DownArrowVE />
                    )}
                  </span>
                </button>
              </th>

              <th className="col-span-1 text-right">
                <span className="pr-4">
                  <FormattedMessage id="status" defaultMessage={"Status"} />
                </span>
              </th>
            </tr>
          </>
        )}
        {/* active content */}
        {isActive &&
          activeOrderList?.sort(activeOrderSorting).map((order, index) => {
            return (
              <ActiveLine
                tokensMap={tokensMap}
                hoverOn={activeOrderHoverOn}
                setHoverOn={setActiveOrderHoverOn}
                sellAmountToBuyAmount={sellAmountToBuyAmount}
                index={index}
                key={order.order_id}
                order={order}
                orderTx={
                  orderTxs?.find((t) => t.order_id === order.order_id)
                    ?.receipt_id || ""
                }
              />
            );
          })}
        {/* history content*/}
        {isHistory &&
          historyOrderList?.sort(historyOrderSorting).map((order, index) => {
            return (
              <HistoryLine
                index={index}
                key={order.order_id}
                order={order}
                tokensMap={tokensMap}
                sellAmountToBuyAmount={sellAmountToBuyAmount}
                orderTx={
                  orderTxs?.find((t) => t.order_id === order.order_id)
                    ?.receipt_id || ""
                }
                setHoverOn={setHistoryOrderHoverOn}
                hoverOn={historyOrderHoverOn}
              />
            );
          })}
        {/* historySwapInfo head */}
        {isHistory && historySwapInfo && historySwapInfo.length > 0 && (
          <tr
            onMouseEnter={() => {
              setActiveOrderHoverOn(-1);
              setHistoryOrderHoverOn(-1);
            }}
          >
            <td colSpan={8}>
              <div
                className="inline-flex max-w-max items-center ml-4 text-gray-10 mt-7 mb-3 xsm:mt-0 xsm:ml-1 xsm:text-gray-10 xsm:text-sm"
                data-class="reactTip"
                data-tooltip-id={"real_time_order_tip"}
                data-place={"top"}
                data-tooltip-html={getRealTimeOrderTip()}
              >
                <span
                  className={`underline cursor-pointer ${"lg:hover:text-white"} `}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShowHistoryInfo();
                  }}
                  style={{
                    textDecorationThickness: "1px",
                  }}
                >
                  {intl.formatMessage({
                    id: showHistoryInfo ? "hide" : "show",
                    defaultMessage: showHistoryInfo ? "Hide" : "Show",
                  })}
                </span>

                <span className="ml-1">
                  {intl.formatMessage({
                    id: "real_time_executed_orders",
                    defaultMessage: "real-time executed orders",
                  })}
                </span>
                <CustomTooltip id={"real_time_order_tip"} place="top" />
              </div>
            </td>
          </tr>
        )}
        {/* historySwapInfo content  */}
        {isHistory &&
          showHistoryInfo &&
          historySwapInfoList &&
          historySwapInfoList.length > 0 &&
          historySwapInfoList
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
            .map((sf, i) => {
              return (
                <HistorySwapInfoLine
                  index={i}
                  tokensMap={tokensMap}
                  key={sf.receipt_id}
                  token_in={sf.token_in}
                  token_out={sf.token_out}
                  amount_in={sf.amount_in}
                  amount_out={sf.amount_out}
                  orderTx={sf.receipt_id}
                  timestamp={sf.timestamp}
                  point={sf.point}
                  pool_id={sf.pool_id}
                  hoverOn={historyInfoOrderHoverOn}
                  setHoverOn={setHistoryInfoOrderHoverOn}
                />
              );
            })}
      </table>
    </div>
  );
}
export default React.memo(OrderCard);
