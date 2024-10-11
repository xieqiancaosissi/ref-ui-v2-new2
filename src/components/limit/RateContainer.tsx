import React, { useMemo } from "react";
import Big from "big.js";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { SubIcon, AddIcon, UnLockIcon, LockIcon } from "./icons";
import { ToggleIcon } from "./icons2";
import {
  useLimitStore,
  usePersistLimitStore,
  IPersistLimitStore,
  ILimitStore,
} from "@/stores/limitOrder";
import { regularizedPrice } from "@/services/swapV3";
import { toPrecision } from "@/utils/numbers";
import { getReverseRate } from "@/services/limit/limitUtils";

function RateContainer() {
  const limitStore = useLimitStore() as ILimitStore;
  const persistLimitStore = usePersistLimitStore() as IPersistLimitStore;
  const rate = limitStore.getRate();
  const reverseRate = limitStore.getReverseRate();
  const marketRate = limitStore.getMarketRate();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const isLock = limitStore.getLock();
  const tokenInAmount = limitStore.getTokenInAmount();
  const reverse = limitStore.getReverse();
  const dclPool = persistLimitStore.getDclPool();
  const symbolsArr = ["e", "E", "+", "-"];
  const rateDiffDom = useMemo(() => {
    if (Number(rate) > 0 && Number(marketRate) > 0) {
      if (Big(rate).eq(marketRate)) return null;
      const rateDiff = new Big(rate).minus(marketRate).div(marketRate).mul(100);
      const displayRateDiff = rateDiff.gt(1000)
        ? ">1000"
        : rateDiff.lt(-1000)
        ? "<-1000"
        : rateDiff.toFixed(2, 0);
      limitStore.setRateDiff(rateDiff.toFixed());
      return (
        <span
          className={`${
            rateDiff.gt(0)
              ? "text-primaryGreen"
              : rateDiff.lte(-10)
              ? "text-red-20"
              : "text-yellow-10"
          }`}
        >
          ({displayRateDiff}
          %)
        </span>
      );
    }
    return null;
  }, [rate, marketRate]);
  function changeAmount(e: any) {
    const amount = e.target.value;
    limitStore.onRateChangeTrigger({
      amount,
      tokenInAmount,
      limitStore,
      isReverse: reverse,
    });
  }
  function onBlurEvent() {
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
  function onLock() {
    limitStore.setLock(true);
  }
  function onUnLock() {
    limitStore.setLock(false);
  }
  function addOneSlot() {
    const regularizedRate = regularizedPrice(
      rate,
      tokenIn,
      tokenOut,
      dclPool.fee,
      1
    );
    limitStore.onRateChangeTrigger({
      amount: toPrecision(regularizedRate, 8),
      tokenInAmount,
      limitStore,
    });
  }
  function subOneSlot() {
    const regularizedRate = regularizedPrice(
      rate,
      tokenIn,
      tokenOut,
      dclPool.fee,
      -1
    );
    limitStore.onRateChangeTrigger({
      amount: toPrecision(regularizedRate, 8),
      tokenInAmount,
      limitStore,
    });
  }
  function fetch_market_price() {
    const reverseMarketRate = getReverseRate(marketRate);
    limitStore.setRate(marketRate);
    limitStore.setReverseRate(reverseMarketRate);
    limitStore.onRateChangeTrigger({
      amount: marketRate,
      tokenInAmount,
      limitStore,
    });
    limitStore.onFetchPool({
      limitStore,
      persistLimitStore,
    });
  }
  function lockTip() {
    return `
    <div class="text-gray-110 text-xs text-left break-all w-62">
    Lock the rate field to get your buy amount automatically adjusted when
          changing your sell amount.
    </div>
    `;
  }
  function toggle() {
    limitStore.setReverse(!reverse);
  }
  return (
    <div className="bg-dark-60 rounded border border-transparent hover:border-green-10 p-3.5 xsm:py-1.5 text-sm text-gray-50">
      <div className="flexBetween">
        <div className="flex items-center gap-0.5">
          <div className="flex items-center gap-2">
            <ToggleIcon className="cursor-pointer" onClick={toggle} />
            <span>Buy in rate</span>
          </div>
          {rateDiffDom}
        </div>
        <span
          className="underline hover:text-primaryGreen cursor-pointer"
          onClick={fetch_market_price}
        >
          Market Price
        </span>
      </div>
      <div className="flexBetween mt-2.5 gap-2">
        <SubIcon
          onClick={reverse ? addOneSlot : subOneSlot}
          className="cursor-pointer text-gray-60 hover:text-white"
        />
        <div className="flexBetween">
          <input
            value={(reverse ? reverseRate : rate) || "-"}
            type="number"
            className="text-white text-base font-bold text-center"
            onChange={changeAmount}
            placeholder="0.0"
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
            onBlur={onBlurEvent}
          />
          <span>{reverse ? tokenIn?.symbol : tokenOut?.symbol}</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="text-white text-right"
            data-class="reactTip"
            data-tooltip-id="lockTipId"
            data-place="top"
            data-tooltip-html={lockTip()}
          >
            {isLock ? (
              <LockIcon
                className="cursor-pointer text-primaryGreen hover:text-white"
                onClick={onUnLock}
              />
            ) : (
              <UnLockIcon
                className="cursor-pointer text-gray-60 hover:text-white"
                onClick={onLock}
              />
            )}
            <CustomTooltip id="lockTipId" />
          </div>

          <AddIcon
            onClick={reverse ? subOneSlot : addOneSlot}
            className="cursor-pointer text-gray-60 hover:text-white"
          />
        </div>
      </div>
    </div>
  );
}
export default React.memo(RateContainer);
