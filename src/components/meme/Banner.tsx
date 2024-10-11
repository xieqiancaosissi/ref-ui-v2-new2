import React, { useState } from "react";
import { BannerCoreBtnIconBg } from "./icons";
import RuleModal from "./RuleModal";
import CheckInButtonPC from "./CheckInButtonPC";

const Banner = () => {
  const [isOpen, setIsOpen] = useState(false);
  function showRule() {
    setIsOpen(true);
  }
  function closeRule() {
    setIsOpen(false);
  }
  return (
    <div className="relative flex items-center justify-center w-full mb-16">
      <img
        className="relative w-full z-10"
        src="https://img.ref.finance/images/memeBannerPc_10months3.png"
      />
      <div
        className="absolute right-60 bottom-60 z-10 bg-greenGradient py-3.5 px-5 flex items-center cursor-pointer text-black"
        style={{ borderRadius: "54px" }}
        onClick={showRule}
      >
        <BannerCoreBtnIconBg />
        <div className="ml-5 paceGrotesk-Bold">
          <p className="text-xs leading-3">Meme</p>
          <p className="text-xs leading-3">Competition</p>
          <p className="text-base leading-4">Rules</p>
        </div>
      </div>
      <div className="absolute right-60 bottom-10 z-10">
        <CheckInButtonPC />
      </div>
      <RuleModal isOpen={isOpen} onRequestClose={closeRule} />
    </div>
  );
};

export default React.memo(Banner);
