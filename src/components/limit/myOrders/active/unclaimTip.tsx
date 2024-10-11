import React from "react";
import getUnclaimAmountTip from "./unclaimAmountTip";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { UserOrderInfo } from "@/services/swapV3";
import { ONLY_ZEROS } from "@/utils/numbers";
import { TipIcon } from "../../icons2";
function UnClaimTip({
  claimedAmount,
  unClaimedAmount,
  pendingAmount,
  order,
  displayPercents,
}: {
  claimedAmount: string;
  unClaimedAmount: string;
  pendingAmount: string;
  order: UserOrderInfo;
  displayPercents: string[];
}) {
  return (
    <div
      className="text-xs xs:relative xs:bottom-2 mt-1 mr-1 w-20 xs:w-full flex items-center xs:flex-row-reverse"
      data-type="info"
      data-place="bottom"
      data-multiline={true}
      data-class="reactTip"
      data-tooltip-html={getUnclaimAmountTip({
        claimedAmount,
        unClaimedAmount,
        pendingAmount,
      })}
      data-tooltip-id={"unclaim_tip_" + order.order_id}
    >
      <span className="mr-1 xs:ml-2">
        <TipIcon className="text-gray-10 hover:text-white" />
      </span>
      <div className="flex items-center w-full">
        {displayPercents.map((p, i) => {
          if (ONLY_ZEROS.test(p)) return null;

          const bgColor =
            i === 0 ? "bg-primaryGreen" : i === 1 ? "bg-blue-10" : "bg-gray-60";

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
        id={"unclaim_tip_" + order.order_id}
        place="bottom"
      />
    </div>
  );
}

export default React.memo(UnClaimTip);
