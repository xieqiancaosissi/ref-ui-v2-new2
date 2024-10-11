import React, { useEffect, useState, createContext } from "react";
import _ from "lodash";
import useMyOrders from "@/hooks/useMyOrders";
import { refSwapV3OldVersionViewFunction } from "@/utils/contract";
import { UserOrderInfo } from "@/services/swapV3";
import useTokens from "@/hooks/useTokens";
import Loading from "./loading";
import { useAccountStore } from "@/stores/account";
import useHistoryOrderSwapInfo from "@/hooks/useHistoryOrderSwapInfo";
import OrderCard from "./order/orderCard";

function MyOrder() {
  const [oldOrders, setOldOrders] = useState<UserOrderInfo[]>();
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const { activeOrder, historyOrder, activeOrderDone, historyOrderDone } =
    useMyOrders();
  const { historySwapInfo, historySwapInfoDone } = useHistoryOrderSwapInfo({
    start_at: Number(
      _.minBy(historyOrder, (o) => o.created_at)?.created_at || 0
    ),
    end_at: Date.now() * 1000000,
  });
  useEffect(() => {
    if (accountId) {
      refSwapV3OldVersionViewFunction({
        methodName: "list_active_orders",
        args: {
          account_id: accountId,
        },
      }).then((res) => {
        setOldOrders(res);
      });
    }
  }, [accountId]);
  const ActiveTokenIds = activeOrder
    ?.map((order) => [order.sell_token, order.buy_token])
    .flat();

  const HistoryTokenIds = historyOrder
    ?.map((order) => [order.sell_token, order.buy_token])
    .flat();

  const OldActiveTokenIds =
    oldOrders?.map((order) => [order.sell_token, order.buy_token]).flat() || [];

  const HistorySwapInfoTokenIds =
    historySwapInfo?.map((hs) => [hs.token_in, hs.token_out]).flat() || [];
  const tokenIds =
    !activeOrder || !historyOrder
      ? null
      : [
          ...new Set([
            ...ActiveTokenIds!,
            ...HistoryTokenIds!,
            ...OldActiveTokenIds,
            ...HistorySwapInfoTokenIds,
          ]),
        ];

  const tokens = useTokens(tokenIds || []);

  if (!accountId) return null;

  if (
    !tokenIds ||
    !activeOrder ||
    !historyOrder ||
    (tokenIds?.length > 0 && tokens?.length === 0) ||
    !activeOrderDone ||
    !historyOrderDone ||
    !historySwapInfoDone ||
    (tokenIds?.length > 0 && tokenIds.length !== tokens?.length)
  ) {
    return <Loading />;
  }

  const tokensMap = tokens?.reduce((acc, cur, index) => {
    return {
      ...acc,
      [cur.id]: cur,
    };
  }, {});

  return (
    <div className="max-w-7xl mx-auto flex flex-col xs:w-full md:5/6 lg:w-full mt-8">
      <OrderCard
        tokensMap={tokensMap!}
        activeOrder={activeOrder}
        historyOrder={historyOrder}
        historySwapInfo={historySwapInfo}
        activeOrderDone={activeOrderDone}
        historyOrderDone={historyOrderDone}
        historySwapInfoDone={historySwapInfoDone}
      />
    </div>
  );
}
export default React.memo(MyOrder);
