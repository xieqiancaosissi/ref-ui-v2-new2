import React from "react";
import getClaimAmountTip from "./claimAmountTip";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { UserOrderInfo } from "@/services/swapV3";
import { TipIcon } from "../../icons2";
import { ONLY_ZEROS } from "@/utils/numbers";
function ClaimTip({
  claimedAmount,
  cancelAmount,
  order,
  displayPercents,
}: {
  claimedAmount: string;
  cancelAmount: string;
  order: UserOrderInfo;
  displayPercents: string[];
}) {
  return (
    <div
      className="text-xs relative xs:bottom-2 mt-1 mr-1 w-20 xs:w-full flex items-center xs:flex-row-reverse "
      data-type="info"
      data-place="bottom"
      data-multiline={true}
      data-class="reactTip"
      data-tooltip-html={getClaimAmountTip({
        claimedAmount,
        cancelAmount,
      })}
      data-tooltip-id={"claim_tip_" + order.order_id}
    >
      <span className="mr-1 xs:ml-2">
        <TipIcon className="text-gray-10 hover:text-white" />
      </span>
      <div className="flex items-center w-full">
        {displayPercents.map((p, i) => {
          if (ONLY_ZEROS.test(p)) return null;

          const bgColor = i === 0 ? "bg-primaryGreen" : "bg-gray-60";

          return (
            <div
              key={i}
              className={`mx-px h-1 xs:h-2 rounded-lg ${bgColor}`}
              style={{
                width: p + "%",
              }}
            />
          );
        })}
      </div>
      <CustomTooltip
        className="w-20"
        id={"claim_tip_" + order.order_id}
        place="bottom"
      />
    </div>
  );
}

export default React.memo(ClaimTip);
