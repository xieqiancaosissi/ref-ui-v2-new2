import React, { useMemo, useContext } from "react";
import Big from "big.js";
import { toReadableNumber } from "../../utils/numbers";
import {
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "../../utils/uiNumber";
import CustomTooltip from "../customTooltip/customTooltip";
import { getMemeContractConfig } from "./memeConfig";
import { MemeContext } from "./context";
import { emptyObject, formatLineUi } from "./tool";
import { TokenMetadata } from "@/services/ft-contract";
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function YourRewards({ seed_id }: { seed_id: string }) {
  const xrefContractId = MEME_TOKEN_XREF_MAP[seed_id];
  const {
    tokenPriceList,
    memeFarmContractUserData,
    xrefFarmContractUserData,
    allTokenMetadatas,
  } = useContext(MemeContext)!;
  const yourRewardsData = useMemo(() => {
    if (
      memeFarmContractUserData &&
      xrefFarmContractUserData &&
      !emptyObject(allTokenMetadatas)
    ) {
      const memeUnclaimed =
        memeFarmContractUserData.unclaimed_rewards?.[seed_id] || {};
      const xrefUnclaimed =
        xrefFarmContractUserData[xrefContractId]?.unclaimed_rewards || {};
      const sumUnclaimed = Object.entries({
        ...memeUnclaimed,
        ...xrefUnclaimed,
      }).reduce((sum, [tokenId, amount]) => {
        const metadata = allTokenMetadatas[tokenId];
        const num = toReadableNumber(metadata.decimals, amount as string);
        return {
          ...sum,
          [tokenId]: Big(sum[tokenId] || 0)
            .plus(num)
            .toFixed(),
        };
      }, {} as Record<string, string>);
      const sumUnclaimedValue = Object.entries(sumUnclaimed)
        .reduce(
          (acc, [tokenId, amount]) =>
            acc.plus(
              Big(tokenPriceList[tokenId]?.price || 0).mul(amount as string)
            ),
          Big(0)
        )
        .toFixed();
      return {
        unclaimedTotalValue: sumUnclaimedValue,
        unclaimedRewards: sumUnclaimed,
      };
    }
    return {};
  }, [memeFarmContractUserData, xrefFarmContractUserData, tokenPriceList]);
  function getRewardsTip() {
    let result = "";
    if (emptyObject(yourRewardsData.unclaimedRewards || {})) return "";
    Object.entries(yourRewardsData.unclaimedRewards || {}).forEach(
      ([tokenId, amount]) => {
        const metadata: TokenMetadata = allTokenMetadatas[tokenId];
        result += `<div class="flex items-center justify-between text-xs text-farmText gap-5">
          <img src="${metadata?.icon}" class="h-4 rounded-full" />
          <span class="text-xs">${toInternationalCurrencySystem_number(
            amount
          )}</span>
      </div>`;
      }
    );
    return `<div class="flex flex-col gap-1">
      ${result}
    </div>`;
  }
  return (
    <div className="flex flex-col justify-between gap-0.5 ">
      {/* title */}
      <span className={`text-sm text-white relative -top-0.5`}>
        Your Reward
      </span>
      {/* content */}
      <div
        style={{ width: "90px" }}
        data-class="reactTip"
        data-tooltip-id={`rewards_${seed_id}`}
        data-place="top"
        data-tooltip-html={getRewardsTip()}
      >
        <span
          className={`text-xl text-white paceGrotesk-Bold ${
            emptyObject(yourRewardsData.unclaimedRewards || {})
              ? ""
              : "border-b border-dashed border-white "
          }`}
        >
          {formatLineUi(
            toInternationalCurrencySystem_usd(
              yourRewardsData.unclaimedTotalValue
            )
          )}
        </span>
        <CustomTooltip id={`rewards_${seed_id}`} />
      </div>
    </div>
  );
}
export default React.memo(YourRewards);
