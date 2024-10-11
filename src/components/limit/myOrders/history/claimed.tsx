import React from "react";
import { TokenMetadata } from "@/services/ft-contract";
import { toReadableNumber, toPrecision } from "@/utils/numbers";
import ClaimTip from "./claimTip";
import { UserOrderInfo } from "@/services/swapV3";

function Claimed({
  buyToken,
  order,
  claimedAmount,
  cancelAmount,
  displayPercents,
}: {
  buyToken: TokenMetadata;
  order: UserOrderInfo;
  claimedAmount: string;
  cancelAmount: string;
  displayPercents: string[];
}) {
  return (
    <span className="whitespace-nowrap  xs:flex-col flex items-center ">
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
              order.bought_amount || "0"
            )}
          >
            {Number(
              toReadableNumber(buyToken.decimals, order.bought_amount || "0")
            ) > 0 &&
            Number(
              toReadableNumber(buyToken.decimals, order.bought_amount || "0")
            ) < 0.001
              ? "< 0.001"
              : toPrecision(
                  toReadableNumber(
                    buyToken.decimals,
                    order.bought_amount || "0"
                  ),
                  3
                )}
          </span>
        </div>
        <div className="xs:hidden">
          <ClaimTip
            claimedAmount={claimedAmount}
            cancelAmount={cancelAmount}
            order={order}
            displayPercents={displayPercents}
          />
        </div>
      </div>
    </span>
  );
}
export default React.memo(Claimed);
