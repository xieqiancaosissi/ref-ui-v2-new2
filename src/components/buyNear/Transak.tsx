// @ts-ignore
import transakSDK from "@transak/transak-sdk";
import getTransakConfig from "./transakConfig";
import { isClientMobie } from "../../utils/device";
import { normalFailToast, normalSuccessToast } from "./transactionTipPopUp";

const successMarker = "REF_FI_TRANSAL_TIP";

export function openTransak(accountId: string) {
  const isMobile = isClientMobie();

  const modalSize = {
    widgetWidth: isMobile ? "90%" : getTransakConfig(accountId).widgetWidth,
    widgetHeight: isMobile ? "95%" : getTransakConfig(accountId).widgetHeight,
  };

  const transak = new transakSDK({
    ...getTransakConfig(accountId),
    ...modalSize,
  });

  transak.init();

  transak.on(transak.EVENTS.TRANSAK_WIDGET_OPEN, () => {
    sessionStorage.setItem(successMarker, "true");
  });

  transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
    transak.close();
    setTimeout(() => {
      document.documentElement.style.overflow = "";
    }, 30);
  });
  transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, () => {
    const el =
      document.getElementsByClassName("Toastify__toast-container")?.length > 0;
    if (!el) {
      normalFailToast("Transaction order was failed.");
    }
    document.documentElement.style.overflow = "";
  });

  transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (successData: any) => {
    const fiatCurrency = successData?.status?.fiatCurrency;
    const fiatAmount = successData?.status?.fiatAmount;
    const cryptoCurrency = successData?.status?.cryptoCurrency;
    const cryptoAmount = successData?.status?.cryptoAmount;

    const marker = sessionStorage.getItem(successMarker);

    const el =
      document.getElementsByClassName("Toastify__toast-container")?.length > 0;
    if (!el && marker) {
      normalSuccessToast(
        `Purchase of ${cryptoAmount} ${cryptoCurrency} complete. Please wait 1-3 minutes for the transaction to be finalised.`
      );
      sessionStorage.removeItem(successMarker);
    }
    document.documentElement.style.overflow = "";

    transak.close();
  });
}
