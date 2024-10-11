import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { TipIcon, SelectedIcon } from "./icons";
import { ArrowDownIcon } from "../../components/swap/icons";
import { V3_POOL_FEE_LIST } from "@/services/swapV3";
import { toInternationalCurrencySystem_usd } from "@/utils/uiNumber";
import { toPrecision, calculateFeePercent } from "@/utils/numbers";
import { usePersistLimitStore, IPersistLimitStore } from "@/stores/limitOrder";
import { isMobile } from "@/utils/device";

function FeeTiers() {
  const [showFeeTiers, setShowFeeTiers] = useState(false);
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const dclPool = persistLimitStore.getDclPool();
  useEffect(() => {
    const outClickEvent = (e: any) => {
      const path = e.composedPath();
      const el = path.find((el: any) => el.id == "feeTierId");
      if (!el) {
        hide();
      }
    };
    document.addEventListener("click", outClickEvent);
    return () => {
      document.removeEventListener("click", outClickEvent);
    };
  }, []);
  const feeDisplay = useMemo(() => {
    if (dclPool) {
      const feeDisplay = toPrecision(
        calculateFeePercent((dclPool?.fee || 0) / 100).toString(),
        2
      );
      return feeDisplay;
    }
    return "-";
  }, [dclPool?.pool_id]);
  function show() {
    setShowFeeTiers(true);
  }
  function hide() {
    setShowFeeTiers(false);
  }
  function switchStatus() {
    setShowFeeTiers(!showFeeTiers);
  }
  function feeTip() {
    return `
    <div class="text-gray-110 text-xs text-left  w-62">
      Please note: when the order is filled by instant swap, you will be a liquidity taker. Meanwhile, no fee will be charged when you are a liquidit maker.
    </div>
    `;
  }
  return (
    <div className="xsm:flex xsm:items-center xsm:justify-between bg-dark-60 rounded border border-transparent hover:border-green-10 p-3.5 xsm:py-2">
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-50 whitespace-nowrap">
          Fee Tiers
        </span>
        <div
          className="text-white text-right"
          data-class="reactTip"
          data-tooltip-id="feeTipId"
          data-place="top"
          data-tooltip-html={feeTip()}
        >
          <TipIcon className="text-gray-10 hover:text-white flex-shrink-0 cursor-pointer" />
          <CustomTooltip id="feeTipId" />
        </div>
      </div>
      <div
        className="relative flexBetween mt-2.5 cursor-pointer xsm:gap-1.5 xsm:mt-0"
        id="feeTierId"
        onClick={switchStatus}
      >
        <span className="text-white text-base font-bold">{feeDisplay}%</span>
        <ArrowDownIcon
          className={`${
            showFeeTiers
              ? "transform rotate-180 text-primaryGreen"
              : "text-white"
          }`}
        />
        {/* fee Tiers */}
        <FeeTiersSelector showFeeTiers={showFeeTiers} onHide={hide} />
      </div>
    </div>
  );
}

function FeeTiersSelector({
  showFeeTiers,
  onHide,
}: {
  showFeeTiers: boolean;
  onHide: any;
}) {
  const mobile = isMobile();
  if (mobile)
    return (
      <FeeTiersSelectorMobile showFeeTiers={showFeeTiers} onHide={onHide} />
    );
  return <FeeTiersSelectorPc showFeeTiers={showFeeTiers} onHide={onHide} />;
}
function FeeTiersSelectorMobile({
  showFeeTiers,
  onHide,
}: {
  showFeeTiers: boolean;
  onHide: any;
}) {
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const allDclPools = persistLimitStore.getAllDclPools();
  const dclPool = persistLimitStore.getDclPool();
  const [token_x, token_y] = dclPool?.pool_id?.split("|") || [];
  return (
    <Modal
      isOpen={showFeeTiers}
      onRequestClose={(e) => {
        e.stopPropagation();
        onHide();
      }}
    >
      <div className="w-screen rounded-t-lg bg-dark-10 p-4">
        {V3_POOL_FEE_LIST.map((fee) => {
          const feeDisplay = toPrecision(
            calculateFeePercent(fee / 100).toString(),
            2
          );
          const pool_id = `${token_x}|${token_y}|${fee}`;
          const pool = allDclPools?.find((p) => p.pool_id == pool_id);
          const isSelected = pool?.pool_id == dclPool?.pool_id;
          const isNoPool = !pool?.pool_id;
          return (
            <div
              key={fee}
              className={`flexBetween text-xs text-white text-opacity-40 gap-20 whitespace-nowrap hover:bg-dark-10 px-2.5 py-1.5 rounded-md select-none h-[50px] ${
                isNoPool ? "cursor-not-allowed" : "cursor-pointer"
              } ${isSelected ? "bg-gray-20" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isNoPool && fee !== dclPool.fee) {
                  persistLimitStore.setDclPool(pool);
                } else if (fee == dclPool.fee) {
                  onHide();
                }
              }}
            >
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm">
                  {feeDisplay}%
                </span>
                <span>
                  TVL{" "}
                  {!pool ? "-" : toInternationalCurrencySystem_usd(pool?.tvl)}
                </span>
              </div>
              <div>
                {isNoPool ? <span>No pool</span> : null}
                {isSelected ? (
                  <div className="flex items-center justify-center w-[18px] h-[18px] rounded-full border border-green-10">
                    <span className="w-3 h-3 rounded-full bg-green-10"></span>
                  </div>
                ) : !isNoPool ? (
                  <div className="flex items-center justify-center w-[18px] h-[18px] rounded-full border border-gray-70" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
function FeeTiersSelectorPc({
  showFeeTiers,
  onHide,
}: {
  showFeeTiers: boolean;
  onHide: any;
}) {
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const allDclPools = persistLimitStore.getAllDclPools();
  const dclPool = persistLimitStore.getDclPool();
  const [token_x, token_y] = dclPool?.pool_id?.split("|") || [];
  return (
    <div
      className={`absolute flex flex-col gap-1 -right-4 top-6 rounded-lg border border-gray-70 bg-dark-70 p-2.5 transform translate-y-5 ${
        showFeeTiers ? "" : "hidden"
      }`}
    >
      {V3_POOL_FEE_LIST.map((fee) => {
        const feeDisplay = toPrecision(
          calculateFeePercent(fee / 100).toString(),
          2
        );
        const pool_id = `${token_x}|${token_y}|${fee}`;
        const pool = allDclPools?.find((p) => p.pool_id == pool_id);
        const isSelected = pool?.pool_id == dclPool?.pool_id;
        const isNoPool = !pool?.pool_id;
        return (
          <div
            key={fee}
            className={`flexBetween text-xs text-white text-opacity-40 gap-20 whitespace-nowrap hover:bg-dark-10 px-2.5 py-1.5 rounded-md select-none ${
              isNoPool ? "cursor-not-allowed" : "cursor-pointer"
            } ${isSelected ? "bg-dark-10" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isNoPool && fee !== dclPool.fee) {
                persistLimitStore.setDclPool(pool);
              } else if (fee == dclPool.fee) {
                onHide();
              }
            }}
          >
            <div className="flex flex-col">
              <span>{feeDisplay}%</span>
              <span>
                TVL {!pool ? "-" : toInternationalCurrencySystem_usd(pool?.tvl)}
              </span>
            </div>
            <div>
              {isNoPool ? <span>No pool</span> : null}
              {isSelected ? <SelectedIcon /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default React.memo(FeeTiers);
