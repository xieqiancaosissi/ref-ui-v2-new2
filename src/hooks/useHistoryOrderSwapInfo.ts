import { useEffect, useState } from "react";
import { useAccountStore } from "@/stores/account";
import { HistoryOrderSwapInfo } from "@/interfaces/limit";
import { getHistoryOrderSwapInfo } from "@/services/indexer";
import { useLimitStore } from "@/stores/limitOrder";
const useHistoryOrderSwapInfo = ({
  start_at,
  end_at,
}: {
  start_at: number;
  end_at: number;
}) => {
  const [swapInfo, setSwapInfo] = useState<HistoryOrderSwapInfo[] | null>([]);
  const [historyOrderSwapInfoDone, setHistoryOrderSwapInfoDone] =
    useState<boolean>(false);
  const accountStore = useAccountStore();
  const limitStore = useLimitStore();
  const accountId = accountStore.getAccountId();
  const walletInteractionStatusUpdatedLimit =
    limitStore.getWalletInteractionStatusUpdatedLimit();
  useEffect(() => {
    if (!accountId) return;
    setHistoryOrderSwapInfoDone(false);
    getHistoryOrderSwapInfo(accountId).then((res) => {
      //@ts-ignore
      setSwapInfo(res?.data === null ? [] : res);
      setHistoryOrderSwapInfoDone(true);
    });
  }, [accountId, walletInteractionStatusUpdatedLimit]);

  return {
    historySwapInfo:
      swapInfo?.filter(
        (s) => Number(s.timestamp) >= start_at && Number(s.timestamp) <= end_at
      ) || [],
    historySwapInfoDone: historyOrderSwapInfoDone,
  };
};
export default useHistoryOrderSwapInfo;
