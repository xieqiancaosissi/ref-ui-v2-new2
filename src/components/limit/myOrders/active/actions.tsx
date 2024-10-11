import { FormattedMessage } from "react-intl";
import React, { useState } from "react";
import { cancel_order, UserOrderInfo } from "@/services/swapV3";
import { ButtonTextWrapper } from "@/components/common/Button";
import { IExecutionResult } from "@/interfaces/wallet";
import failToast from "@/components/common/toast/failToast";
import { useAppStore } from "@/stores/app";
import {
  useLimitStore,
  usePersistLimitStore,
  IPersistLimitStore,
} from "@/stores/limitOrder";
import { updateTokensBalance } from "@/services/limit/limit";
import checkTxBeforeShowToast from "@/components/common/toast/checkTxBeforeShowToast";

function Actions({ order }: { order: UserOrderInfo }) {
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const limitStore = useLimitStore();
  const appStore = useAppStore();
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const walletInteractionStatusUpdatedLimit =
    limitStore.getWalletInteractionStatusUpdatedLimit();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const personalDataUpdatedSerialNumber =
    appStore.getPersonalDataUpdatedSerialNumber();
  function cancelOrder(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setCancelLoading(true);
    cancel_order({
      order_id: order.order_id,
    }).then((res: IExecutionResult | undefined) => {
      if (!res) return;
      if (res.status == "success") {
        checkTxBeforeShowToast({ txHash: res.txHash });
        updateTokensBalance([tokenIn, tokenOut], limitStore);
        limitStore.onFetchPool({
          limitStore,
          persistLimitStore,
        });
        limitStore.setWalletInteractionStatusUpdatedLimit(
          !walletInteractionStatusUpdatedLimit
        );
        appStore.setPersonalDataUpdatedSerialNumber(
          personalDataUpdatedSerialNumber + 1
        );
      } else if (res.status == "error") {
        failToast(res.errorResult?.message);
      }
      setCancelLoading(false);
    });
  }
  return (
    <button
      className={`border rounded xs:text-sm xs:w-full justify-self-end border-dark-190 text-dark-200 lg:h-[32px] lg:text-[13px] lg:w-[90px] xsm:text-sm xsm:flex-grow xsm:h-[38px]`}
      onClick={cancelOrder}
    >
      <ButtonTextWrapper
        Text={() => <FormattedMessage id="cancel" defaultMessage={"Cancel"} />}
        loading={cancelLoading}
        loadingColor="#BCC9D2"
      />
    </button>
  );
}
export default React.memo(Actions);
