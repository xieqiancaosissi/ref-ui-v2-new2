import React, { useMemo, useState } from "react";
import Big from "big.js";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useAccountStore } from "@/stores/account";
import { ButtonTextWrapper } from "@/components/common/Button";
import { swap, swapFromServer } from "@/services/swap/executeSwap";
import nearSwap from "@/services/swap/executeNearSwap";
import dclSwap from "@/services/swap/executeDclSwap";
import { usePersistSwapStore, useSwapStore } from "@/stores/swap";
import { toReadableNumber, percentLess } from "@/utils/numbers";
import { getV3PoolId } from "@/services/swap/swapDclUtils";
import {
  getMax,
  is_near_wnear_swap,
  getTokenUIId,
} from "@/services/swap/swapUtils";
import { IButtonStatus } from "@/interfaces/swap";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import failToast from "@/components/common/toast/failToast";
import { IExecutionResult } from "@/interfaces/wallet";
import { setSwapTokenAndBalances } from "@/components/common/SelectTokenModal/tokenUtils";
import { useTokenStore, ITokenStore } from "@/stores/token";
import { checkSwapTx } from "@/services/swap/swapTx";
import checkTxBeforeShowToast from "@/components/common/toast/checkTxBeforeShowToast";

function SwapButton({
  isHighImpact,
  highImpactCheck,
}: {
  isHighImpact: boolean;
  highImpactCheck: boolean;
}) {
  const [swapLoading, setSwapLoading] = useState<boolean>(false);
  const appStore = useAppStore();
  const accountStore = useAccountStore();
  const swapStore = useSwapStore();
  const tokenStore = useTokenStore() as ITokenStore;
  const persistSwapStore = usePersistSwapStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const amountIn = swapStore.getTokenInAmount();
  const amountOut = swapStore.getTokenOutAmount();
  const estimatesDcl = swapStore.getEstimatesDcl();
  const estimating = swapStore.getEstimating();
  const swapError = swapStore.getSwapError();
  const best = swapStore.getBest();
  const estimates = swapStore.getEstimates();
  const estimatesServer = swapStore.getEstimatesServer();
  const walletInteractionStatusUpdatedSwap =
    swapStore.getWalletInteractionStatusUpdated();
  const slippageTolerance = persistSwapStore.getSlippage();
  const global_whitelisted_tokens_ids =
    tokenStore.get_global_whitelisted_tokens_ids();
  const personalDataUpdatedSerialNumber =
    appStore.getPersonalDataUpdatedSerialNumber();
  const isnearwnearSwap = is_near_wnear_swap(tokenIn, tokenOut);
  const buttonStatus = useMemo(() => {
    return getButtonStatus();
  }, [
    JSON.stringify(tokenIn),
    JSON.stringify(tokenOut),
    amountIn,
    amountOut,
    slippageTolerance,
    walletLoading,
    isHighImpact,
    highImpactCheck,
    accountId,
    swapError?.message,
    isnearwnearSwap,
  ]);
  const loading = useMemo(() => {
    return swapLoading || estimating;
  }, [swapLoading, estimating]);
  function doSwap() {
    setSwapLoading(true);
    if (isnearwnearSwap) {
      nearSwap({
        tokenIn,
        tokenOut,
        amountIn,
      }).then((res) => {
        handleDataAfterTranstion(res, 1);
      });
    } else if (best == "v1" && estimates) {
      swap({
        tokenIn,
        tokenOut,
        swapsToDo: swapStore.getEstimates(),
        slippageTolerance,
        amountIn,
      }).then((res) => {
        handleDataAfterTranstion(res, 2);
      });
    } else if (best == "v1" && estimatesServer) {
      const { estimatesFromServer } = estimatesServer;
      swapFromServer({
        swapsToDoServer: estimatesFromServer,
        tokenIn,
        tokenOut,
        amountIn,
      }).then((res) => {
        handleDataAfterTranstion(res, 2);
      });
    } else if (best == "v3") {
      const bestFee = Number(estimatesDcl?.tag?.split("|")?.[1] ?? 0);
      dclSwap({
        Swap: {
          pool_ids: [getV3PoolId(tokenIn.id, tokenOut.id, bestFee)],
          min_output_amount: percentLess(
            slippageTolerance,
            estimatesDcl?.amount as string
          ),
        },
        swapInfo: {
          tokenA: tokenIn,
          tokenB: tokenOut,
          amountA: amountIn,
          amountB: toReadableNumber(tokenOut.decimals, estimatesDcl?.amount),
        },
      }).then((res) => {
        handleDataAfterTranstion(res, 2);
      });
    }
  }
  function handleDataAfterTranstion(
    res: IExecutionResult | undefined,
    popupType: number
  ) {
    if (!res) return;
    if (res.status == "success") {
      // tx popup
      if (popupType == 2) {
        checkSwapTx(res.txHash);
      } else if (popupType == 1) {
        checkTxBeforeShowToast({
          txHash: res.txHash,
        });
      }
      // update balances
      setSwapTokenAndBalances({
        tokenInId: getTokenUIId(tokenIn),
        tokenOutId: getTokenUIId(tokenOut),
        accountId,
        swapStore,
        persistSwapStore,
        tokenStore,
        global_whitelisted_tokens_ids,
      });
      swapStore.setWalletInteractionStatusUpdated(
        !walletInteractionStatusUpdatedSwap
      );
      appStore.setPersonalDataUpdatedSerialNumber(
        personalDataUpdatedSerialNumber + 1
      );
    } else if (res.status == "error") {
      failToast(res.errorResult?.message);
    }
    setSwapLoading(false);
  }
  function getButtonStatus(): IButtonStatus {
    let status: IButtonStatus = "walletLoading";
    const availableAmountIn = Big(amountIn || 0).lte(getMax(tokenIn));
    if (walletLoading) {
      status = "walletLoading";
    } else if (!walletLoading && !accountId) {
      status = "unLogin";
    } else if ((isHighImpact && !highImpactCheck) || swapError?.message) {
      status = "disabled";
    } else if (accountId && Number(amountIn || 0) > 0 && !availableAmountIn) {
      status = "insufficient";
    } else if (tokenIn?.id == tokenOut?.id && !isnearwnearSwap) {
      status = "disabled";
    } else if (
      accountId &&
      tokenIn?.id &&
      tokenOut?.id &&
      Number(amountIn || 0) > 0 &&
      Number(amountOut || 0) > 0
    ) {
      status = "available";
    } else {
      status = "disabled";
    }
    return status;
  }
  return (
    <>
      {buttonStatus == "walletLoading" ? (
        <SkeletonTheme baseColor="#2A3643" highlightColor="#9EFF00">
          <Skeleton height={42} className="mt-4" />
        </SkeletonTheme>
      ) : null}
      {buttonStatus == "unLogin" && !loading ? (
        <div
          className="flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer"
          style={{ height: "42px" }}
          onClick={() => {
            showWalletSelectorModal(appStore.setShowRiskModal);
          }}
        >
          Connect Wallet
        </div>
      ) : null}
      {buttonStatus == "insufficient" && !loading ? (
        <div
          className="flex items-center justify-center bg-gray-40 rounded mt-4 text-gray-50 font-bold text-base cursor-not-allowed"
          style={{ height: "42px" }}
        >
          Insufficient Balance
        </div>
      ) : null}
      {buttonStatus == "disabled" && !loading ? (
        <div
          className="flex items-center justify-center bg-gray-40 rounded mt-4 text-gray-50 font-bold text-base cursor-not-allowed"
          style={{ height: "42px" }}
        >
          Swap
        </div>
      ) : null}
      {buttonStatus == "available" || loading ? (
        <div
          className={`flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base ${
            loading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
          }`}
          style={{ height: "42px" }}
          onClick={() => {
            if (!loading) {
              doSwap();
            }
          }}
        >
          <ButtonTextWrapper loading={loading} Text={() => <>Swap</>} />
        </div>
      ) : null}
    </>
  );
}
export default React.memo(SwapButton);
