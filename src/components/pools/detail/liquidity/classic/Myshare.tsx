import React from "react";
import BigNumber from "bignumber.js";
import { getVEPoolId } from "@/services/referendum";
import {
  percent,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystemLongString,
} from "@/utils/numbers";
import { LP_TOKEN_DECIMALS } from "@/services/m-token";

function MyShares({
  shares,
  totalShares,
  poolId,
  stakeList = {},
  decimal,
  lptAmount,
}: {
  shares: string;
  totalShares: string;
  poolId?: number;
  stakeList?: Record<string, string>;
  decimal?: number;
  yourLP?: boolean;
  lptAmount?: string;
}) {
  if (!shares || !totalShares) return <div>-</div>;
  const seedIdList: string[] = Object.keys(stakeList);
  let farmStake: string | number = "0";
  seedIdList.forEach((seed) => {
    const id = Number(seed.split("@")[1]);
    if (id == poolId) {
      farmStake = BigNumber.sum(farmStake, stakeList[seed]).valueOf();
    }
  });

  const userTotalShare = BigNumber.sum(
    shares,
    farmStake,
    Number(poolId) === Number(getVEPoolId()) ? lptAmount || "0" : "0"
  );
  const sharePercent = percent(userTotalShare.valueOf(), totalShares);

  let displayPercent;
  if (Number.isNaN(sharePercent) || sharePercent === 0) displayPercent = "0";
  else if (sharePercent < 0.01)
    displayPercent = `< ${
      decimal ? "0.".padEnd(decimal + 1, "0") + "1" : "0.01"
    }`;
  else displayPercent = toPrecision(String(sharePercent), decimal || 2);

  function displayValue() {
    const v = toReadableNumber(
      LP_TOKEN_DECIMALS,
      userTotalShare
        .toNumber()
        .toLocaleString("fullwide", { useGrouping: false })
    );
    const v_big = new BigNumber(v);
    if (v_big.isEqualTo("0")) {
      return 0;
    } else if (v_big.isLessThan(0.01)) {
      return "<0.01";
    } else {
      return toInternationalCurrencySystemLongString(v, 2);
    }
  }

  return (
    <div className="whitespace-nowrap">
      <span
        className="whitespace-nowrap font-bold"
        title={`${toPrecision(
          toReadableNumber(
            LP_TOKEN_DECIMALS,
            userTotalShare
              .toNumber()
              .toLocaleString("fullwide", { useGrouping: false })
          ),
          2
        )}`}
      >
        {displayValue()}
      </span>{" "}
      {`(${displayPercent}%)`}
    </div>
  );
}
export default React.memo(MyShares);
