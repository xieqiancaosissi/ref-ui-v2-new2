import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Big from "big.js";
import _ from "lodash";
import { motion } from "framer-motion";
import {
  RefreshIcon,
  SWitchButton,
  CheckboxIcon,
  VersionOld,
} from "../components/swap/icons";
import Input from "../components/swap/Input";
import SwapDetail from "../components/swap/SwapDetail";
import swapStyles from "../components/swap/swap.module.css";
import {
  fetchPoolsAndCacheData,
  fetchStablePoolsAndCacheData,
  fetchStableBaseDataPoolsAndCacheData,
} from "@/services/swap/swap";
import { fetchDclPoolsAndCacheData } from "@/services/swap/swapDcl";
import {
  POOL_REFRESH_INTERVAL,
  PRICE_IMPACT_RED_VALUE,
} from "@/utils/constant";
import useMultiSwap from "@/hooks/useMultiSwap";
import {
  useSwapStore,
  usePersistSwapStore,
  IPersistSwapStore,
} from "@/stores/swap";
import { toPrecision } from "@/utils/numbers";
import GetPriceImpact from "@/components/swap/GetPriceImpact";
import { getTokenUIId, is_near_wnear_swap } from "@/services/swap/swapUtils";
import { WarnIcon } from "@/components/swap/icons";
import SkyWardModal from "@/components/swap/SkyWardModal";
import getConfigV2 from "@/utils/configV2";
import { DEFLATION_MARK } from "@/services/pool";
import { tokenFtMetadata } from "@/services/ft-contract";
import { openUrl } from "@/services/commonV3";
const configV2 = getConfigV2();
const SwapButton = dynamic(() => import("../components/swap/SwapButton"), {
  ssr: false,
});
const SetPopup = dynamic(() => import("../components/swap/SetPopup"), {
  ssr: false,
});
const InitData = dynamic(() => import("../components/swap/InitData"), {
  ssr: false,
});
const SwapPopup = dynamic(() => import("@/components/common/SwapPopup"), {
  ssr: false,
});
const AdSwiper = dynamic(() => import("@/components/common/Swiper"), {
  ssr: false,
});

export default function Swap() {
  const [isHighImpact, setIsHighImpact] = useState<boolean>(false);
  const [highImpactCheck, setHighImpactCheck] = useState<boolean>(false);
  const [pinLoading, setpinLoading] = useState<boolean>(false);
  const [showSkywardTip, setShowSkywardTip] = useState<boolean>(false);
  const swapStore = useSwapStore();
  const persistSwapStore = usePersistSwapStore() as IPersistSwapStore;
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const tokenOutAmount = swapStore.getTokenOutAmount();
  const priceImpact = swapStore.getPriceImpact();
  const tokenInAmount = swapStore.getTokenInAmount();
  const swapError = swapStore.getSwapError();
  const isnearwnearSwap = is_near_wnear_swap(tokenIn, tokenOut);
  useMultiSwap({ supportDclQuote: true, hideLowTvlPools: false });
  useEffect(() => {
    const id = setInterval(reloadPools, POOL_REFRESH_INTERVAL);
    return () => {
      clearInterval(id);
    };
  }, []);
  const debounceReloadPools = useCallback(
    _.debounce(() => {
      reloadPools();
    }, 500),
    []
  );
  useEffect(() => {
    if (tokenIn?.id == configV2.SKYWARDID) {
      setShowSkywardTip(true);
    }
  }, [tokenIn?.id]);
  useEffect(() => {
    if (tokenIn?.id) {
      if (tokenIn.id.includes(DEFLATION_MARK)) {
        getTokenDeflationRate();
      } else {
        swapStore.setDeflation({
          rate: 0,
          done: true,
        });
      }
    } else {
      swapStore.setDeflation(undefined);
    }
  }, [tokenIn?.id]);
  useEffect(() => {
    if (tokenOut?.id == configV2.SKYWARDID) {
      setShowSkywardTip(true);
    }
  }, [tokenOut?.id]);
  useEffect(() => {
    if (Number(priceImpact || 0) > PRICE_IMPACT_RED_VALUE) {
      setIsHighImpact(true);
    } else {
      setIsHighImpact(false);
    }
  }, [priceImpact]);
  useEffect(() => {
    if (
      Number(tokenInAmount || 0) == 0 ||
      (tokenIn?.id == tokenOut?.id && !isnearwnearSwap)
    ) {
      swapStore.setTokenOutAmount("");
      swapStore.setAvgFee("");
      swapStore.setBest("");
      swapStore.setPriceImpact("");
      swapStore.setEstimates(undefined);
      swapStore.setEstimatesServer(undefined);
      swapStore.setEstimatesDcl(undefined);
      swapStore.setEstimating(false);
      swapStore.setTrigger(false);
      setIsHighImpact(false);
      setHighImpactCheck(false);
      swapStore.setSwapError(undefined);
    }
  }, [tokenInAmount, tokenIn?.id, tokenOut?.id, isnearwnearSwap]);
  useEffect(() => {
    if (swapError?.message) {
      swapStore.setTokenOutAmount("");
    }
  }, [swapError?.message]);
  const showSwapDetail = useMemo(() => {
    return (
      tokenIn?.id &&
      tokenOut?.id &&
      tokenIn?.id !== tokenOut?.id &&
      !swapError?.message &&
      Big(tokenInAmount || 0).gt(0)
    );
  }, [tokenIn?.id, tokenOut?.id, tokenInAmount, swapError?.message]);
  const priceImpactDisplay = useMemo(() => {
    try {
      return GetPriceImpact(priceImpact, tokenInAmount);
    } catch (error) {
      return null;
    }
  }, [priceImpact, tokenInAmount]);
  function onCheck() {
    setHighImpactCheck(!highImpactCheck);
  }
  function onSwitch() {
    swapStore.setTokenIn(tokenOut);
    swapStore.setTokenOut(tokenIn);
    persistSwapStore.setTokenInId(getTokenUIId(tokenOut));
    persistSwapStore.setTokenOutId(getTokenUIId(tokenIn));
  }
  const variants = {
    static: { transform: "rotate(0deg)" },
    spin: {
      transform: "rotate(360deg)",
      transition: { duration: 1, repeat: Infinity, ease: "linear" },
    },
  };
  async function reloadPools() {
    if (pinLoading) return;
    setpinLoading(true);
    const topPoolsPending = fetchPoolsAndCacheData();
    const stablePoolsPending = fetchStablePoolsAndCacheData();
    const dclPoolPending = fetchDclPoolsAndCacheData();
    const stableBaseDataPoolsPending = fetchStableBaseDataPoolsAndCacheData();
    Promise.all([
      topPoolsPending,
      stablePoolsPending,
      dclPoolPending,
      stableBaseDataPoolsPending,
    ])
      .catch()
      .finally(() => {
        setpinLoading(false);
        if (!swapError) {
          swapStore.setTrigger(true);
        }
      });
  }
  async function getTokenDeflationRate() {
    swapStore.setDeflation(undefined);
    const tokenMeta = await tokenFtMetadata(tokenIn.id);
    const rate =
      ((tokenMeta?.deflation_strategy?.fee_strategy?.SellFee?.fee_rate ?? 0) +
        (tokenMeta?.deflation_strategy?.burn_strategy?.SellBurn?.burn_rate ??
          0)) /
      1000000;
    swapStore.setDeflation({
      rate,
      done: true,
    });
  }
  // select-none
  return (
    <main className="m-auto my-20 xsm:mt-4 xsm:w-95vw lg:w-[420px]">
      <div
        className="lg:hidden mt-[-40px] mb-[18px] bg-white bg-opacity-10 px-3 rounded border w-fit 
      border-gray-70 py-2 text-sm text-gray-10 frcc cursor-pointer"
        onClick={(e) => {
          openUrl(`https://old.app.ref.finance/`);
        }}
      >
        <VersionOld className="mr-1.5" />
        Version 1
      </div>
      <InitData />
      <SwapPopup />
      <div className="rounded-lg bg-dark-10 p-4">
        {/* set */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-xl bg-textWhiteGradient bg-clip-text text-transparent">
            Swap
          </span>
          <div className="flex items-center gap-2 z-20">
            <span
              className={swapStyles.swapControlButton}
              onClick={debounceReloadPools}
            >
              {pinLoading ? (
                <motion.span variants={variants} animate="spin">
                  <RefreshIcon className="text-white" />
                </motion.span>
              ) : (
                <RefreshIcon />
              )}
            </span>
            <SetPopup />
          </div>
        </div>
        {/* input part */}
        <div className="flex flex-col items-center mt-4">
          <Input token={tokenIn} isnearwnearSwap={isnearwnearSwap} isIn />
          <div
            className="flex items-center justify-center rounded w-7 h-7 cursor-pointer text-gray-50 hover:text-white  bg-dark-60 hover:bg-dark-10 -my-3.5 relative z-10 border-2 border-dark-10"
            onClick={onSwitch}
          >
            <SWitchButton />
          </div>
          <Input
            disable
            token={tokenOut}
            amountOut={
              isnearwnearSwap
                ? toPrecision(tokenOutAmount, 24)
                : toPrecision(
                    tokenOutAmount,
                    Math.min(8, tokenOut?.decimals ?? 8)
                  )
            }
            isOut
            className="mt-0.5"
          />
        </div>
        {/* swapError tip */}
        {swapError ? (
          <div className="flex items-start gap-2 rounded px-3 py-1 text-sm  bg-opacity-15 mt-3 bg-yellow-10 text-yellow-10">
            <WarnIcon className="relative top-1  flex-shrink-0" />
            <span>{swapError?.message}</span>
          </div>
        ) : null}

        {/* high price tip */}
        {isHighImpact ? (
          <div className="flexBetween rounded border border-red-10 border-opacity-45 bg-red-10 bg-opacity-10 text-xs text-red-10 p-2 mt-4">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center rounded-sm border border-red-10 cursor-pointer ${
                  highImpactCheck ? "bg-red-10" : ""
                }`}
                style={{ width: "14px", height: "14px" }}
                onClick={onCheck}
              >
                <CheckboxIcon
                  className={`${highImpactCheck ? "" : "hidden"}`}
                />
              </div>
              I accept the price impact
            </div>
            <span className="flex items-center gap-1 font-bold">
              {priceImpactDisplay}
              {tokenIn.symbol}
            </span>
          </div>
        ) : null}

        {/* submit button */}
        <SwapButton
          isHighImpact={isHighImpact}
          highImpactCheck={highImpactCheck}
        />
      </div>
      {/* detail */}
      {showSwapDetail ? <SwapDetail /> : null}
      {/* Ad */}
      <div className="lg:w-[420px] mt-5">
        <AdSwiper />
      </div>
      {/* skyward modal */}
      {showSkywardTip && (
        <SkyWardModal
          onRequestClose={() => {
            setShowSkywardTip(false);
          }}
          isOpen={showSkywardTip}
        />
      )}
      {/* v1 */}
      <div
        className="xsm:hidden fixed top-[50px] left-[18px] bg-white bg-opacity-10 px-3 rounded border 
      border-gray-70 py-2 text-sm text-gray-10 frcc cursor-pointer"
        onClick={(e) => {
          openUrl(`https://old.app.ref.finance/`);
        }}
      >
        <VersionOld className="mr-1.5" />
        Version 1
      </div>
    </main>
  );
}
