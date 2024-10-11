import React, { useContext, useMemo } from "react";
import Big from "big.js";
import { MemeContext } from "./context";
import { formatPercentage } from "../../utils/uiNumber";
import { getSeedApr, isPending, isEnded, emptyObject } from "./tool";
import { FarmBoost } from "@/services/farm";
import CustomTooltip from "../customTooltip/customTooltip";
function APY({ seed_id }: { seed_id: string }) {
  const { seeds } = useContext(MemeContext)!;
  const seed = seeds?.[seed_id];
  const meme_is_pending = isPending(seed);
  const meme_is_ended = isEnded(seed);
  const noShowMeme = meme_is_pending || meme_is_ended;
  const totalApr = useMemo(() => {
    if (!emptyObject(seed)) {
      return noShowMeme ? "-" : formatPercentage(getSeedApr(seed));
    }
  }, [seed]);
  function getApyTip() {
    const farmList = seed.farmList || [];
    let farmStr = "";
    farmList.forEach((farm: FarmBoost) => {
      farmStr += `<div class="flex items-center justify-between text-xs text-white mt-1">
          <img src="${farm?.token_meta_data?.icon}" class="h-4 rounded-full" />
          <span class="text-xs">${
            noShowMeme
              ? "-"
              : formatPercentage(
                  Big(farm.apr || 0)
                    .mul(100)
                    .toFixed()
                )
          }</span>
      </div>`;
    });
    const result =
      `<div class="px-2">
       <div>
        <div class="flex items-center justify-between text-xs text-white gap-3.5">
          <span>Staking APR</span>
          <span class="text-white text-sm">${noShowMeme ? "-" : totalApr}</span>
        </div>` +
      farmStr +
      `</div>
    </div>`;
    return result;
  }
  return (
    <div className="flex flex-col justify-between gap-0.5 ">
      {/* title */}
      <span className="text-sm text-white  relative -top-0.5">APY</span>
      {/* content */}
      <div
        style={{ width: "40px" }}
        data-class="reactTip"
        data-tooltip-id={`apyId_${seed_id}`}
        data-place="top"
        data-tooltip-html={getApyTip()}
      >
        <span className="text-xl text-white paceGrotesk-Bold border-b border-dashed border-white">
          {totalApr}
        </span>
        <CustomTooltip id={`apyId_${seed_id}`} />
      </div>
    </div>
  );
}
export default APY;
