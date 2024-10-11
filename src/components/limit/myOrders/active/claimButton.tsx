import React, { useState } from "react";
import { ONLY_ZEROS } from "@/utils/numbers";
import { cancel_order } from "@/services/swapV3";
import { FormattedMessage } from "react-intl";
import { UserOrderInfo } from "@/services/swapV3";
import { IExecutionResult } from "@/interfaces/wallet";
import failToast from "@/components/common/toast/failToast";
import checkTxBeforeShowToast from "@/components/common/toast/checkTxBeforeShowToast";
import {
  useLimitStore,
  usePersistLimitStore,
  IPersistLimitStore,
} from "@/stores/limitOrder";
import { updateTokensBalance } from "@/services/limit/limit";
import { ButtonTextWrapper } from "@/components/common/Button";
import { useAppStore } from "@/stores/app";
function ClaimButton({
  unClaimedAmount,
  order,
}: {
  unClaimedAmount: string;
  order: UserOrderInfo;
}) {
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
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

    setClaimLoading(true);

    cancel_order({
      order_id: order.order_id,
      undecimal_amount: "0",
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
      setClaimLoading(false);
    });
  }
  return (
    <button
      className={`rounded border xs:text-sm xs:w-full ml-1.5 lg:h-[32px] lg:text-[13px] lg:w-[90px] xsm:text-sm xsm:flex-grow xsm:h-[38px] ${
        ONLY_ZEROS.test(unClaimedAmount)
          ? "border-dark-190 text-dark-200 cursor-not-allowed opacity-40"
          : `border-green-10 text-green-10`
      }`}
      type="button"
      disabled={ONLY_ZEROS.test(unClaimedAmount)}
      onClick={cancelOrder}
    >
      <ButtonTextWrapper
        Text={() => <FormattedMessage id="claim" defaultMessage={"Claim"} />}
        loading={claimLoading}
        loadingColor="#9EFE01"
      ></ButtonTextWrapper>
    </button>
  );
}
export default React.memo(ClaimButton);
