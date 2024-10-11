import React from "react";
import { TokenMetadata } from "@/services/ft-contract";
import { toReadableNumber, toPrecision } from "@/utils/numbers";
import UnclaimTip from "./unclaimTip";
import { UserOrderInfo } from "@/services/swapV3";

function Unclaim({
  buyToken,
  order,
  claimedAmount,
  unClaimedAmount,
  displayPercents,
  pendingAmount,
}: {
  buyToken: TokenMetadata;
  order: UserOrderInfo;
  claimedAmount: string;
  unClaimedAmount: string;
  pendingAmount: string;
  displayPercents: string[];
}) {
  return (
    <span className="whitespace-nowrap col-span-2 flex xs:flex-col items-center ">
      <div>
        <div className="flex items-center xs:justify-end">
          <img
            src={buyToken.icon}
            className="border border-gradientFrom rounded-full w-4 h-4"
            alt=""
          />
          <span
            className="text-white text-sm mx-1"
            title={toReadableNumber(
              buyToken.decimals,
              order.unclaimed_amount || "0"
            )}
          >
            {Number(
              toReadableNumber(buyToken.decimals, order.unclaimed_amount || "0")
            ) > 0 &&
            Number(
              toReadableNumber(buyToken.decimals, order.unclaimed_amount || "0")
            ) < 0.001
              ? "< 0.001"
              : toPrecision(
                  toReadableNumber(
                    buyToken.decimals,
                    order.unclaimed_amount || "0"
                  ),
                  3
                )}
          </span>
        </div>
        <div className="xs:hidden">
          <UnclaimTip
            claimedAmount={claimedAmount}
            unClaimedAmount={unClaimedAmount}
            pendingAmount={pendingAmount}
            order={order}
            displayPercents={displayPercents}
          />
        </div>
      </div>
    </span>
  );
}

export default React.memo(Unclaim);
