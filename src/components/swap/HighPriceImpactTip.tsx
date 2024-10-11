import React from "react";
import { WarnIcon } from "@/components/swap/icons";
import { CloseIcon } from "@/components/common/Icons";
function HighPriceImpactTip({ handleClose }: { handleClose: any }) {
  return (
    <div
      className="absolute right-0 lg:w-[390px] xsm:w-[340px]"
      style={{ top: "100px" }}
    >
      <AnchorText handleClose={handleClose} />
      <AnchorDash />
      <AnchorDot />
    </div>
  );
}
export default React.memo(HighPriceImpactTip);

function AnchorDot() {
  return (
    <div
      className="absolute w-6 h-6 rounded-full flex items-center justify-center bg-primaryGreen  bg-opacity-20"
      style={{ right: "-20px", top: "-98px" }}
    >
      <div
        className=" rounded-full bg-primaryGreen"
        style={{
          height: "14px",
          width: "14px",
        }}
      ></div>
    </div>
  );
}
function AnchorDash() {
  return (
    <>
      <div
        className="absolute border-r border-dashed border-primaryGreen"
        style={{
          width: "1px",
          height: "122px",
          top: "-75px",
          right: "-9px",
        }}
      ></div>
      <div
        className="absolute  border-b border-dashed border-primaryGreen"
        style={{
          width: "10px",
          height: "1px",
          top: "47px",
          right: "-9px",
        }}
      ></div>
    </>
  );
}
function AnchorText({ handleClose }: { handleClose: () => any }) {
  return (
    <div
      className="rounded-lg border border-green-10 p-4 bg-gray-40"
      style={{ borderWidth: "0.5px" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <WarnIcon className="text-red-10" />
          <span className="text-white font-extrabold text-base">
            Excessive price impact
          </span>
        </div>
        <CloseIcon
          className="cursor-pointer text-gray-60"
          onClick={handleClose}
        />
      </div>
      <div className="text-gray-150 text-sm pl-6 mt-2.5">
        The current price risk may be too high because you have{" "}
        <span className="text-white font-extrabold">disabled Smart Router</span>
        , if you want to get a better price, try{" "}
        <span className="text-white font-extrabold">turning it off</span>.
      </div>
    </div>
  );
}
