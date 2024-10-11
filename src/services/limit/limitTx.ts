import { checkTransaction } from "@/utils/contract";
import limitOrderPopUp from "@/components/limit/limitOrderPopUp";
export async function checkLimitTx(txHash: string) {
  setTimeout(async () => {
    const res: any = await checkTransaction(txHash);
    await limitOrderPopUp(res, txHash);
  }, 1500);
}
