import React, { useEffect, useState } from "react";
import Big from "big.js";
import { twMerge } from "tailwind-merge";
import dynamic from "next/dynamic";
import { ITokenMetadata } from "@/interfaces/tokens";
import { useSwapStore } from "@/stores/swap";
import { toPrecision } from "@/utils/numbers";
import {
  useLimitStore,
  usePersistLimitStore,
  IPersistLimitStore,
} from "@/stores/limitOrder";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { toInternationalCurrencySystemLongString_usd } from "@/utils/uiNumber";
import { getMax } from "@/services/swap/swapUtils";
import { regularizedPrice } from "@/services/swapV3";
import { beautifyNumber } from "@/components/common/beautifyNumber";

const SelectDclPoolButton = dynamic(() => import("./SelectDclPoolButton"), {
  ssr: false,
});
const SelectTokenBalance = dynamic(() => import("./SelectTokenBalance"), {
  ssr: false,
});
interface IInputProps {
  token: ITokenMetadata;
  className?: string;
  isIn?: boolean;
  isOut?: boolean;
}
function Input(props: IInputProps) {
  const { className, token, isIn, isOut } = props;
  const [showNearTip, setShowNearTip] = useState<boolean>(false);
  const swapStore = useSwapStore();
  const limitStore = useLimitStore();
  const persistLimitStore = usePersistLimitStore() as IPersistLimitStore;
  const rate = limitStore.getRate();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const dclPool = persistLimitStore.getDclPool();
  const tokenInAmount = limitStore.getTokenInAmount();
  const tokenOutAmount = limitStore.getTokenOutAmount();
  const isLock = limitStore.getLock();
  const allTokenPrices = swapStore.getAllTokenPrices();
  const isNEAR = getTokenUIId(token) == "near";
  const symbolsArr = ["e", "E", "+", "-"];
  useEffect(() => {
    if (
      tokenInAmount &&
      isIn &&
      token?.id &&
      isNEAR &&
      Big(tokenInAmount).gt(getMax(token))
    ) {
      setShowNearTip(true);
    } else {
      setShowNearTip(false);
    }
  }, [tokenInAmount, isIn, token?.id]);
  function changeAmount(e: any) {
    const amount = e.target.value;
    if (isIn) {
      limitStore.onAmountInChangeTrigger({
        amount,
        rate,
        limitStore,
      });
    } else {
      limitStore.onAmountOutChangeTrigger({
        amount,
        isLock,
        rate,
        tokenInAmount,
        limitStore,
      });
    }
  }
  function setMaxAmount() {
    if (token) {
      limitStore.onAmountInChangeTrigger({
        amount: getMax(token),
        rate,
        limitStore,
      });
    }
  }
  function getTokenValue() {
    const price = new Big(tokenInAmount || 0).mul(
      allTokenPrices[token?.id]?.price || 0
    );
    if (price.lt(1)) {
      return beautifyNumber({
        num: price.toFixed(),
        className: "text-gray-50",
        isUsd: true,
      });
    }
    return toInternationalCurrencySystemLongString_usd(price.toFixed());
  }
  function onBlurEvent() {
    if (isOut) {
      if (Big(rate || 0).eq(0)) {
        limitStore.setTokenOutAmount("0");
        limitStore.setRate("0");
        limitStore.setReverseRate("0");
      } else {
        const regularizedRate = regularizedPrice(
          rate,
          tokenIn,
          tokenOut,
          dclPool.fee
        );
        limitStore.onRateChangeTrigger({
          amount: toPrecision(regularizedRate, 8),
          tokenInAmount,
          limitStore,
        });
      }
    }
  }
  return (
    <div
      className={twMerge(
        `flex items-center flex-col bg-dark-60 rounded w-full p-3.5 border border-transparent hover:border-green-10 xsm:bg-black xsm:bg-opacity-20`,
        className
      )}
    >
      <span className="text-sm text-gray-50 self-start">
        {isIn ? "Selling" : "Buying"}
      </span>
      <div className="flex items-center justify-between w-full gap-2 mt-2">
        <input
          step="any"
          type="number"
          placeholder="0.0"
          value={isOut ? tokenOutAmount : tokenInAmount}
          className="flex-grow w-1 bg-transparent outline-none font-bold text-white text-2xl"
          onChange={changeAmount}
          onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
          onBlur={onBlurEvent}
        />
        <SelectDclPoolButton isIn={isIn} isOut={isOut} />
      </div>
      <div className="flex items-center justify-between w-full text-sm text-gray-50 mt-2.5">
        <span>{getTokenValue()}</span>
        <div className="flex items-center gap-0.5">
          Balance:
          <SelectTokenBalance
            isIn={isIn}
            setMaxAmount={setMaxAmount}
            token={token}
          />
        </div>
      </div>
      {/* near validation error tip */}
      <div
        className={`flex items-center px-2.5 py-1 bg-yellow-10 bg-opacity-15 rounded text-xs text-yellow-10 w-full mt-3 mb-1.5 ${
          showNearTip ? "" : "hidden"
        }`}
      >
        Must have 0.2N or more left in wallet for gas fee.
      </div>
    </div>
  );
}
export default React.memo(Input);
