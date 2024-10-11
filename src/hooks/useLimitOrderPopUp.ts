import { useEffect } from "react";
import { useRouter } from "next/router";
import { getURLInfo } from "@/utils/transactionsPopup";
import { useAccountStore } from "@/stores/account";
import { checkTransaction } from "@/utils/contract";
import limitOrderPopUp from "@/components/limit/limitOrderPopUp";

const useLimitOrderPopUp = () => {
  const { txHash, pathname } = getURLInfo();
  const router = useRouter();
  const accountStore = useAccountStore();
  const account_id = accountStore.getAccountId();
  useEffect(() => {
    if (txHash && account_id) {
      setTimeout(() => {
        checkTransaction(txHash).then(async (res: any) => {
          await limitOrderPopUp(res, txHash);
          router.replace(pathname);
        });
      }, 1500);
    }
  }, [txHash, account_id]);
};
export default useLimitOrderPopUp;
