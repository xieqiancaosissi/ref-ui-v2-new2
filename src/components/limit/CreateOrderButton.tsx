import React, { useMemo, useState } from "react";
import Big from "big.js";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useAccountStore } from "@/stores/account";
import { useLimitStore } from "@/stores/limitOrder";
import { ButtonTextWrapper } from "@/components/common/Button";
import { getMax } from "@/services/swap/swapUtils";
import { IButtonStatus } from "@/interfaces/swap";
import ConfirmOrderModal from "./ConfirmOrderModal";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";

function CreateOrderButton() {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const accountStore = useAccountStore();
  const limitStore = useLimitStore();
  const appStore = useAppStore();
  const walletLoading = accountStore.getWalletLoading();
  const accountId = accountStore.getAccountId();
  const amountIn = limitStore.getTokenInAmount();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const rate = limitStore.getRate();
  const poolFetchLoading = limitStore.getPoolFetchLoading();
  const buttonStatus = useMemo(() => {
    return getButtonStatus();
  }, [
    walletLoading,
    accountId,
    JSON.stringify(tokenIn || {}),
    tokenOut?.id,
    rate,
    amountIn,
  ]);
  const loading = poolFetchLoading;
  function showModal() {
    setShowConfirmModal(true);
  }
  function hideModal() {
    setShowConfirmModal(false);
  }
  function getButtonStatus(): IButtonStatus {
    let status: IButtonStatus = "walletLoading";
    const availableAmountIn = Big(amountIn || 0).lte(getMax(tokenIn));
    if (walletLoading) {
      status = "walletLoading";
    } else if (!walletLoading && !accountId) {
      status = "unLogin";
    } else if (accountId && Number(amountIn || 0) > 0 && !availableAmountIn) {
      status = "insufficient";
    } else if (
      accountId &&
      tokenIn?.id &&
      tokenOut?.id &&
      Number(amountIn || 0) > 0 &&
      Number(rate || 0) > 0
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
      {buttonStatus == "unLogin" ? (
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
      {buttonStatus == "insufficient" ? (
        <div
          className="flex items-center justify-center bg-gray-40 rounded mt-4 text-gray-50 font-bold text-base cursor-not-allowed"
          style={{ height: "42px" }}
        >
          Insufficient Balance
        </div>
      ) : null}
      {buttonStatus == "disabled" ? (
        <div
          className="flex items-center justify-center bg-gray-40 rounded mt-4 text-gray-50 font-bold text-base cursor-not-allowed"
          style={{ height: "42px" }}
        >
          Create Order
        </div>
      ) : null}
      {buttonStatus == "available" ? (
        <div
          className={`flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base ${
            loading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
          }`}
          style={{ height: "42px" }}
          onClick={() => {
            if (!loading) {
              showModal();
            }
          }}
        >
          <ButtonTextWrapper
            loading={loading}
            Text={() => <> Create Order</>}
          />
        </div>
      ) : null}
      {showConfirmModal ? (
        <ConfirmOrderModal isOpen={true} onRequestClose={hideModal} />
      ) : null}
    </>
  );
}
export default React.memo(CreateOrderButton);
