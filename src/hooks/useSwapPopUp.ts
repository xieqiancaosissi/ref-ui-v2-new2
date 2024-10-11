import { useEffect } from "react";
import { useRouter } from "next/router";
import { getURLInfo } from "@/utils/transactionsPopup";
import { useAccountStore } from "@/stores/account";
import { checkSwapTx } from "@/services/swap/swapTx";

const useSwapPopUp = () => {
  const { txHash, pathname, errorType } = getURLInfo();
  const router = useRouter();
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.getIsSignedIn();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkSwapTx(txHash, errorType).then(() => {
        router.replace(pathname);
      });
    }
  }, [txHash, isSignedIn]);
};
export default useSwapPopUp;
