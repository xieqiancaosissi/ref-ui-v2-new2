import React from "react";
import { LiquidityEmptyIcon, AddLiqRightIcon } from "./icon";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

function NoLiquidityMobile({
  add,
  isLoading,
}: {
  add: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      className="h-24 bg-modalGrayBg p-4 flex items-center fixed bottom-8"
      style={{
        width: "100vw",
        zIndex: "12",
      }}
    >
      <LiquidityEmptyIcon />
      <div className="flex flex-col ml-4">
        <div className="text-gray-10 text-sm mb-2">
          {isLoading
            ? "Content is loading..."
            : " No positions in this pool yet"}
        </div>
        {isLoading ? (
          <SkeletonTheme
            baseColor="rgba(106, 114, 121, 0.3)"
            highlightColor="#9eff00"
          >
            <Skeleton width={300} height={44} count={1} />
          </SkeletonTheme>
        ) : (
          <div
            className="text-green-10 underline text-sm flex items-center"
            onClick={() => add()}
          >
            Add Liquidity <AddLiqRightIcon className="ml-1" />
          </div>
        )}
      </div>
    </div>
  );
}
export default React.memo(NoLiquidityMobile);
