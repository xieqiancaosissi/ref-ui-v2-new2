import React, { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import _ from "lodash";
import { AddLiqTitleIcon } from "../icon";
import { LpModalCloseIcon } from "@/components/pools/icon";
import { Icon } from "../IconCom";
import { ftGetBalance, ftGetTokenMetadata } from "@/services/token";
import { disPlayBalance } from "@/utils/uiNumber";
import { useAccountStore } from "@/stores/account";
import BigNumber from "bignumber.js";
import { RATED_POOL_LP_TOKEN_DECIMALS } from "@/utils/constant";
import {
  percentLess,
  scientificNotationToString,
  toReadableNumber,
  percent,
  toPrecision,
  toNonDivisibleNumber,
  calculateFairShare,
} from "@/utils/numbers";
import { ButtonTextWrapper } from "@/components/common/Button";
import { addLiquidityToPool } from "@/services/pool";
import AddLiqTip from "../../addLiqTip";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import { toRealSymbol } from "@/services/farm";
import { getVEPoolId } from "@/services/referendum";
import YourLiquidityBox from "./YourLiquidity";
import { UnclaimedFeesBox } from "../UnclaimedFeesBox";
import { RelatedFarmsBox } from "../RelatedFarmsBox";

function YourLiqAndClaimMobile(props: any) {
  const accountStore = useAccountStore();
  const {
    isOpen,
    onRequestClose,
    pool,
    poolId,
    shares,
    stakeList,
    updatedMapList,
    tokenInfoPC,
    lptAmount,
    usdValue,
    tokenAmountShareRaw,
    setShowAdd,
    haveShare,
    setShowRemove,
    userTotalShareToString,
    showYourLiqType,
    setShowYourLiqType,
    poolDetailV3,
    tokenPriceList,
    user_liquidities,
    matched_seeds,
    sole_seed,
    setAddSuccess,
  } = props;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); //
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        onRequestClose();
      }}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          overflow: "auto",
        },
        content: isMobile
          ? {
              transform: "translateX(-50%)",
              top: "auto",
              bottom: "32px",
              width: "100vw",
            }
          : {
              outline: "none",
              transform: "translate(-50%, -50%)",
            },
      }}
    >
      <div
        className={`w-full ${
          user_liquidities?.length > 0 ? "min-h-[444px]" : "min-h-[200px]"
        } py-4 rounded bg-dark-10 flex flex-col`}
      >
        {/* title */}
        <div className="flex items-center justify-center text-white text-lg border border-b-gray-60">
          <div className="w-1/2 fccc">
            <span
              className={`whitespace-nowrap  ${
                showYourLiqType == "liq"
                  ? "text-white text-with-custom-underline"
                  : "text-gray-60"
              }`}
              onClick={() => setShowYourLiqType("liq")}
            >
              Your Liquidity
            </span>
            {/* {showYourLiqType == "liq" ? (
              <div className="w-35 bg-white h-0.5 mt-4"></div>
            ) : (
              <div className="w-30 bg-transparent h-0.5 mt-4"></div>
            )} */}
            <div className="w-30 bg-transparent h-[3px] mt-[4.5px]"></div>
          </div>
          <div className="w-1/2 fccc">
            {user_liquidities?.length > 0 && (
              <>
                {" "}
                <span
                  className={`whitespace-nowrap ${
                    showYourLiqType == "claim"
                      ? "text-white text-with-custom-underline"
                      : "text-gray-60"
                  }`}
                  onClick={() => setShowYourLiqType("claim")}
                >
                  Unclaimed Fees
                </span>
                <div className="w-30 bg-transparent h-[3px] mt-[4.5px]"></div>
              </>
            )}
          </div>
        </div>
        {poolDetailV3?.token_x && (
          <>
            {showYourLiqType == "liq" && (
              <YourLiquidityBox
                poolDetail={poolDetailV3}
                tokenPriceList={tokenPriceList}
                liquidities={user_liquidities}
                matched_seeds={matched_seeds}
                setAddSuccess={setAddSuccess}
              />
            )}
            {showYourLiqType == "claim" && (
              <UnclaimedFeesBox
                poolDetail={poolDetailV3}
                tokenPriceList={tokenPriceList}
                liquidities={user_liquidities}
                setAddSuccess={setAddSuccess}
              />
            )}
            {!isMobile ? (
              <RelatedFarmsBox
                poolDetail={poolDetailV3}
                tokenPriceList={tokenPriceList}
                sole_seed={sole_seed}
              ></RelatedFarmsBox>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  );
}
export default React.memo(YourLiqAndClaimMobile);
