import { get_shadow_records } from "@/services/farm";
import { isMobile } from "@/utils/device";
import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { FarmsContextData } from "./FarmsContext";
import { useAccountStore } from "@/stores/account";
import { BurrowIcon } from "../icon";
import ShadowTip from "./ShadowTip";

function LPTip({ seed_id }: { seed_id: string }) {
  const mobile = isMobile();
  const [hover, setHover] = useState<Boolean>(false);
  const [has_shadow_in_farm, set_has_shadow_in_farm] = useState(false);
  const [has_shadow_in_borrow, set_has_shadow_in_borrow] = useState(false);
  const poolId = seed_id?.split("@")[1];
  const shadow_id = `shadow_ref_v1-${poolId}`;
  const url = `https://app.burrow.finance/tokenDetail/${shadow_id}`;
  const contextData = useContext(FarmsContextData);
  const [amount, setAmount] = useState("0");
  const [showShadowTip, setShowShadowTip] = useState<boolean>(false);
  const [contentType, setContentType] = useState<"both" | "burrow" | "">();
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  useEffect(() => {
    const { free_amount } =
      contextData?.user_data?.user_seeds_map?.[seed_id] || {};
    setAmount(free_amount || "0");
  }, [contextData]);
  useEffect(() => {
    if (isSignedIn) {
      get_shadow_records().then((res) => {
        set_has_shadow_in_borrow(!!Number(res[poolId]?.shadow_in_burrow || 0));
        set_has_shadow_in_farm(!!Number(res[poolId]?.shadow_in_farm || 0));
      });
    }
  }, [isSignedIn]);
  useEffect(() => {
    if (has_shadow_in_farm && has_shadow_in_borrow) {
      setContentType("both");
    } else if (has_shadow_in_borrow) {
      setContentType("burrow");
    }
  }, [has_shadow_in_farm, has_shadow_in_borrow]);
  function BurrowClick() {
    if (+amount > 0) {
      setShowShadowTip(true);
    } else {
      window.open(url);
    }
  }
  return (
    <div
      className="flex items-center justify-center  relative ml-1.5 mr-0.5"
      onMouseEnter={() => {
        if (!mobile) {
          setHover(true);
        }
      }}
      onMouseLeave={() => {
        setHover(false);
        setShowShadowTip(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <span
        className={`flex justify-center items-center rounded cursor-pointer w-4 h-4 relative ${
          has_shadow_in_borrow ? "bg-yellow-30" : "bg-gray-40"
        }`}
        onClick={(e) => {
          if (mobile) {
            e.stopPropagation();
            setHover(!hover);
            if (hover) {
              setShowShadowTip(false);
            }
          } else {
            window.open(url);
          }
        }}
      >
        <BurrowIcon />
      </span>
      {/* {showShadowTip ? (
        <ShadowTip seed_id={seed_id} show={true} className="xsm:-right-8" />
      ) : null} */}
      <div
        className={`absolute bottom-0 pb-6 xsm:-right-8 z-10 ${
          hover && !showShadowTip ? "" : "hidden"
        }`}
      >
        <div className="text-xs text-gray-10 w-56 border border-gray-140 rounded-md px-2 py-1 bg-gray-40">
          Stake LP tokens as collateral on
          <a
            className="text-yellow-30 underline cursor-pointer ml-1"
            onClick={() => {
              const shadow_id = `shadow_ref_v1-${poolId}`;
              const url = `https://app.burrow.finance/tokenDetail/${shadow_id}`;
              window.open(url);
            }}
          >
            Burrow
          </a>{" "}
          .{" "}
        </div>
        {/* {contentType == "burrow" ? (
          <div className="text-xs text-gray-10 w-56 border border-gray-140 rounded-md px-2 py-1 bg-gray-40">
            You‘ve supplied this LP on Burrow
          </div>
        ) : null}
        {contentType == "both" ? (
          <div className="text-xs text-gray-10 w-56 border border-gray-140 rounded-md px-2 py-1 bg-gray-40">
            You are currently earning dual rewards from {`Ref's`} Farming and{" "}
            {`Burrow's`}
            Supply.
          </div>
        ) : null}
        {!contentType ? (
          <div className="text-xs text-gray-10 w-56 border border-gray-140 rounded-md px-2 py-1 bg-gray-40">
            Please navigate to{" "}
            <a
              className="text-yellow-30 underline cursor-pointer"
              onClick={BurrowClick}
            >
              Burrow
            </a>{" "}
            to perform a Supply action and secure extra rewards.
          </div>
        ) : null} */}
      </div>
    </div>
  );
}

export default React.memo(LPTip);
