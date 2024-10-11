import Banner from "@/components/meme/Banner";
import MobileBanner from "@/components/meme/MobileBanner";
import Overview from "@/components/meme/Overview";
import SeedsBox from "@/components/meme/SeedsBox";
import Staking from "@/components/meme/Staking";
import WithdrawList from "@/components/meme/WithdrawList";
import { MemeContextProvider } from "@/components/meme/context";
import Countdown from "@/components/meme/countdown";
import { isMobile } from "@/utils/device";
import React, { useState } from "react";

function MemePage() {
  const is_mobile = isMobile();
  const [showCountdown, setShowCountdown] = useState(true);
  const handleCountdownFinish = () => {
    setShowCountdown(false);
  };
  return (
    <MemeContextProvider>
      <div className="-mt-8 mb-8 xsm:-mt-4">
        {is_mobile ? <MobileBanner /> : <Banner />}
        <div className="m-auto lg:w-5/6" style={{ maxWidth: "1100px" }}>
          <Overview />
          {showCountdown && (
            <Countdown onCountdownFinish={handleCountdownFinish} />
          )}
          <Staking />
          {/* <VoteXREF /> */}
          <SeedsBox />
          <WithdrawList />
        </div>
      </div>
    </MemeContextProvider>
  );
}
MemePage.isClientRender = true;
export default MemePage;
