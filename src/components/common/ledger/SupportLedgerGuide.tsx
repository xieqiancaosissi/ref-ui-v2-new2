import React from "react";
import { CloseIconBold } from "../Icons";
import { isMobile } from "@/utils/device";
export default function SupportLedgerGuide({
  handleClose,
}: {
  handleClose: any;
}) {
  return (
    <div
      className={`flex xs:items-end xs:flex-col xs:right-0 xs:top-8 absolute flex-row-reverse`}
      style={{
        left: "230px",
        top: "147px",
      }}
    >
      <AnchorText handleClose={handleClose} />
      <AnchorDash />
      <AnchorDot />
    </div>
  );
}

function AnchorDot() {
  return (
    <div className="w-6 h-6 rounded-full relative flex items-center justify-center bg-primaryGreen  bg-opacity-20">
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
    <div className="xs:transform xs:rotate-90 xs:w-8 xs:top-2 xs:left-1.5 w-11 h-1 relative top-2 border-b border-dashed border-primaryGreen"></div>
  );
}
function AnchorText({ handleClose }: { handleClose?: () => any }) {
  return (
    <div
      className="
    
      px-3 pb-3 gotham_font text-sm xs:absolute relative lg:bottom-6 xs:top-12 pt-5 bg-primaryGreen rounded-2xl 
      text-black
    "
      style={{
        width: isMobile() ? "90vw" : "275px",
        left: isMobile() ? "-5vw" : "",
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose && handleClose();
        }}
        className="absolute right-3 top-3"
      >
        <CloseIconBold></CloseIconBold>
      </button>
      To successfully use your Ledger wallet for transactions, the "
      <span className="font-extrabold">Support Ledger</span>" feature has been
      automatically activated.
      <span className="font-extrabold mx-1">Please be aware</span>
      that due to Ledger wallet constraints, the current rate provided by the
      swap function
      <span className="font-extrabold ml-1">may not be the best price</span>.
    </div>
  );
}
