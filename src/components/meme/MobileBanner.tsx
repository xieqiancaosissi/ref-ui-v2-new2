import React, { useState } from "react";
import { MobileBannerCoreBtnIconBg } from "./ani_mobile";
import RuleModal from "./RuleModal";
import CheckInButtonMobile from "./CheckInButtonMobile";

const Banner = () => {
  const [isOpen, setIsOpen] = useState(false);
  function showRule() {
    setIsOpen(true);
  }
  function closeRule() {
    setIsOpen(false);
  }
  return (
    <div>
      <div className="relative flex items-center justify-center w-full">
        <img src="https://img.ref.finance/images/memeBannerMobile_10months3.png" />
        <div className="absolute right-6 bottom-10 z-10" onClick={showRule}>
          <MobileBannerCoreBtnIconBg />
        </div>
        <RuleModal isOpen={isOpen} onRequestClose={closeRule} />
      </div>
      <div className="flex justify-center mt-4 mb-10">
        <CheckInButtonMobile />
      </div>
    </div>
  );
};

export default React.memo(Banner);
