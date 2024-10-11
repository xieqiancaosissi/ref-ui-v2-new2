import { useEffect, useState } from "react";
import {
  UserOrderInfo,
  list_active_orders,
  list_history_orders,
} from "@/services/swapV3";
import { useAccountStore } from "@/stores/account";
import { useLimitStore } from "@/stores/limitOrder";
const useMyOrders = () => {
  const [activeOrder, setActiveOrder] = useState<UserOrderInfo[]>();
  const [historyOrder, setHistoryOrder] = useState<UserOrderInfo[]>();
  const [activeOrderDone, setActiveOrderDone] = useState<boolean>(false);
  const [historyOrderDone, sethistoryOrderDone] = useState<boolean>(false);
  const accountStore = useAccountStore();
  const limitStore = useLimitStore();
  const walletInteractionStatusUpdatedLimit =
    limitStore.getWalletInteractionStatusUpdatedLimit();
  const isSignedIn = accountStore.getIsSignedIn();
  useEffect(() => {
    if (!isSignedIn) return;
    setActiveOrderDone(false);
    sethistoryOrderDone(false);
    list_active_orders().then((res) => {
      setActiveOrder(res);
      setActiveOrderDone(true);
    });
    list_history_orders().then((res) => {
      setHistoryOrder(res);
      sethistoryOrderDone(true);
    });
  }, [isSignedIn, walletInteractionStatusUpdatedLimit]);

  return {
    activeOrder,
    historyOrder,
    activeOrderDone,
    historyOrderDone,
  };
};
export default useMyOrders;
