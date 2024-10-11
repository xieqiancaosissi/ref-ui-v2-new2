import React, { useState } from "react";
import Modal from "react-modal";
import Big from "big.js";
import {
  useLimitStore,
  usePersistLimitStore,
  IPersistLimitStore,
} from "@/stores/limitOrder";
import failToast from "@/components/common/toast/failToast";
import { CloseIcon } from "../common/Icons";
import { RightArrowIcon } from "./icons";
import { ButtonTextWrapper } from "@/components/common/Button";
import { digitalProcess } from "@/utils/uiNumber";
import createOrder from "@/services/limit/limit";
import { sort_tokens_by_base } from "@/services/commonV3";
import { IExecutionResult } from "@/interfaces/wallet";
import { checkLimitTx } from "@/services/limit/limitTx";
import { updateTokensBalance } from "@/services/limit/limit";
import { useAppStore } from "@/stores/app";

function ConfirmOrderModal({
  isOpen,
  onRequestClose,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
}) {
  const [createOrderLoading, setCreateOrderLoading] = useState<boolean>(false);
  const limitStore = useLimitStore();
  const appStore = useAppStore();
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const amountIn = limitStore.getTokenInAmount();
  const amountOut = limitStore.getTokenOutAmount();
  const rateDiff = limitStore.getRateDiff();
  const rate = limitStore.getRate();
  const reverseRate = limitStore.getReverseRate();
  const personalDataUpdatedSerialNumber =
    appStore.getPersonalDataUpdatedSerialNumber();
  const tokens = sort_tokens_by_base([tokenIn, tokenOut]);
  const isReverse = tokens[0].symbol == tokenOut.symbol;
  const dclPool = persistLimitStore.getDclPool();
  const walletInteractionStatusUpdatedLimit =
    limitStore.getWalletInteractionStatusUpdatedLimit();
  function doCreateOrder() {
    setCreateOrderLoading(true);
    createOrder({
      tokenA: tokenIn,
      tokenB: tokenOut,
      amountA: amountIn,
      amountB: amountOut,
      pool_id: dclPool.pool_id,
    }).then((res: IExecutionResult | undefined) => {
      if (!res) return;
      if (res.status == "success") {
        onRequestClose();
        checkLimitTx(res.txHash);
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
      setCreateOrderLoading(false);
    });
  }
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="bg-dark-10 rounded-lg p-6" style={{ width: "430px" }}>
        {/* title */}
        <div className="flexBetween">
          <span className=" text-white text-lg font-bold">Confirm Order</span>
          <CloseIcon
            className="text-dark-80 hover:text-white cursor-pointer"
            onClick={onRequestClose}
          />
        </div>
        {/* details */}
        <div className="flex items-center justify-center gap-4 my-7">
          <Image icon={tokenIn.icon} />
          <RightArrowIcon />
          <Image icon={tokenOut.icon} />
        </div>
        <div className="flexBetween mb-4">
          <span className="text-sm text-gray-60">You Sell</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-white font-bold">
              {digitalProcess(amountIn, 8)}
            </span>
            <span className="flex items-center justify-center text-xs text-gray-10 rounded bg-gray-100 px-1 h-5">
              {tokenIn.symbol}
            </span>
          </div>
        </div>
        <div className="flexBetween mb-4">
          <span className="text-sm text-gray-60">to Buy</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-white font-bold">
              {digitalProcess(amountOut, 8)}
            </span>
            <span className="flex items-center justify-center text-xs text-gray-10 rounded bg-gray-100 px-1 h-5">
              {tokenOut.symbol}
            </span>
          </div>
        </div>
        <div className="flexBetween">
          <span className="text-sm text-gray-60">at Price</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-white font-bold">
              {digitalProcess(isReverse ? reverseRate : rate, 8)}
            </span>
            <span className="flex items-center justify-center text-xs text-gray-10 rounded bg-gray-100 px-1 h-5">
              {isReverse
                ? `${tokenIn.symbol}/${tokenOut.symbol}`
                : `${tokenOut.symbol}/${tokenIn.symbol}`}
            </span>
          </div>
        </div>
        <div className="mt-9">
          {/* red tip */}
          {Big(rateDiff || 0).lte(-10) ? (
            <div className="flex items-center justify-center rounded bg-red-10 bg-opacity-15 p-2 text-xs text-red-10 mb-4">
              Limit order price is{" "}
              {Big(rateDiff || 0)
                .abs()
                .toFixed(2, 0)}
              % below the market price
            </div>
          ) : null}

          {/* button */}
          <div
            className={`flex items-center justify-center bg-greenGradient rounded text-black font-bold text-base ${
              createOrderLoading
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            style={{ height: "42px" }}
            onClick={() => {
              if (!createOrderLoading) {
                doCreateOrder();
              }
            }}
          >
            <ButtonTextWrapper
              loading={createOrderLoading}
              Text={() => <>Confirm</>}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
function Image({ icon }: { icon: string }) {
  return (
    <img
      style={{ width: "34px", height: "34px" }}
      className="rounded-full"
      src={icon}
    />
  );
}
export default React.memo(ConfirmOrderModal);
