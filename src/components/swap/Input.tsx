import React, { useEffect, useState } from "react";
import Big from "big.js";
import { twMerge } from "tailwind-merge";
import dynamic from "next/dynamic";
import { ITokenMetadata } from "@/interfaces/tokens";
import { useSwapStore } from "@/stores/swap";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { toInternationalCurrencySystemLongString_usd } from "@/utils/uiNumber";
import { getMax } from "@/services/swap/swapUtils";
import { beautifyNumber } from "@/components/common/beautifyNumber";

const SelectTokenButton = dynamic(() => import("./SelectTokenButton"), {
  ssr: false,
});
const SelectTokenBalance = dynamic(() => import("./SelectTokenBalance"), {
  ssr: false,
});
interface IInputProps {
  className?: string;
  disable?: boolean;
  token: ITokenMetadata;
  isIn?: boolean;
  isOut?: boolean;
  amountOut?: string;
  isnearwnearSwap?: boolean;
}
function Input(props: IInputProps) {
  const { className, disable, token, isIn, isOut, amountOut, isnearwnearSwap } =
    props;
  const [amount, setAmount] = useState<string>("1");
  const [showNearTip, setShowNearTip] = useState<boolean>(false);
  const swapStore = useSwapStore();
  const tokenOutAmount = swapStore.getTokenOutAmount();
  const allTokenPrices = swapStore.getAllTokenPrices();
  const isNEAR = getTokenUIId(token) == "near";
  // const precision = isnearwnearSwap && isIn && !isNEAR ? 24 : undefined;
  const symbolsArr = ["e", "E", "+", "-"];
  useEffect(() => {
    if (isIn) {
      swapStore.setTokenInAmount(amount);
    }
  }, [amount, isIn]);
  useEffect(() => {
    if (isOut) {
      setAmount(tokenOutAmount);
    }
  }, [tokenOutAmount, isOut]);
  useEffect(() => {
    if (
      amount &&
      isIn &&
      token?.id &&
      isNEAR &&
      Big(amount).gt(getMax(token))
    ) {
      setShowNearTip(true);
    } else {
      setShowNearTip(false);
    }
  }, [amount, isIn, token?.id]);
  function changeAmount(e: any) {
    setAmount(e.target.value);
  }
  function setMaxAmount() {
    if (token) {
      setAmount(getMax(token));
    }
  }
  function getTokenValue() {
    const price = new Big(amount || 0).mul(
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
  return (
    <div
      className={twMerge(
        `flex items-center flex-col bg-dark-60 rounded w-full p-3.5 border border-transparent ${
          disable ? "" : "hover:border-green-10"
        }`,
        className
      )}
    >
      <div className="flex items-center justify-between w-full gap-2">
        <input
          step="any"
          type="number"
          placeholder="0.0"
          disabled={disable}
          value={isOut ? amountOut : amount}
          className="flex-grow w-1 bg-transparent outline-none font-bold text-white text-2xl"
          onChange={changeAmount}
          onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
        />
        <SelectTokenButton isIn={isIn} isOut={isOut} />
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
