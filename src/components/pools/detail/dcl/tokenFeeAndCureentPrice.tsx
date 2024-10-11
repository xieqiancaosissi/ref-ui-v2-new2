import React, { useState, useEffect } from "react";
import { SplitRectangleIcon } from "@/components/pools/icon";
import { formatPercentage } from "@/utils/uiNumber";
import { useDCLTopBinFee } from "@/hooks/useTopBinApr";

function TokenFeeAndCureentPrice({
  poolDetail,
  poolDetailV3,
}: {
  poolDetail: any;
  poolDetailV3: any;
}) {
  const topBinApr = useDCLTopBinFee({
    pool: poolDetailV3,
  });

  //
  return (
    <div className="flex items-center text-white h-10 lg:justify-around xsm:w-full lg:ml-9">
      <div className="text-sm">
        <h3 className="text-gray-50 font-normal">Fee</h3>
        <p>{formatPercentage(poolDetail?.total_fee * 100)}</p>
      </div>
      <SplitRectangleIcon className="mx-7" />
      <div className="text-sm lg:min-w-45">
        <h3 className="text-gray-50 font-normal">Top Bin APR(24h)</h3>
        <p>{topBinApr}</p>
      </div>
    </div>
  );
}
export default React.memo(TokenFeeAndCureentPrice);
