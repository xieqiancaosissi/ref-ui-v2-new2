import { useEffect, useState } from "react";
import { useAccountStore } from "@/stores/account";
import { OrderTxType } from "@/interfaces/limit";
import { getHistoryOrder } from "@/services/indexer";
const useHistoryOrderTx = () => {
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const [txIds, setTxIds] = useState<OrderTxType[] | null>(null);

  useEffect(() => {
    if (!accountId) return;

    getHistoryOrder(accountId).then((res) => {
      //@ts-ignore

      setTxIds(res?.data === null ? [] : res);
    });
  }, [accountId]);

  return txIds;
};
export default useHistoryOrderTx;
