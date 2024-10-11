import React from "react";
import { LiquidityEmptyIcon } from "./icon";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

function NoLiquidity({
  add,
  isLoading,
}: {
  add: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="w-80 h-56 rounded-md bg-modalGrayBg p-4 fccc">
      <LiquidityEmptyIcon />
      <div className="text-gray-10 text-sm my-7">
        {isLoading ? "Content is loading..." : " No positions in this pool yet"}
      </div>
      {isLoading ? (
        <SkeletonTheme
          baseColor="rgba(106, 114, 121, 0.3)"
          highlightColor="#9eff00"
        >
          <Skeleton width={300} height={44} count={1} />
        </SkeletonTheme>
      ) : (
        <div className="poolBtnStyle cursor-pointer" onClick={() => add()}>
          Add Liquidity
        </div>
      )}
    </div>
  );
}
export default React.memo(NoLiquidity);
