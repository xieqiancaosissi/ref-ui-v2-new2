import React, { useState, useContext, useEffect } from "react";
import { toPrecision, toReadableNumber } from "@/utils/numbers";
import { unlock_lp } from "@/services/lplock";
import Modal from "react-modal";
import { UnLockLpTitleIcon, LpModalCloseIcon } from "@/components/pools/icon";
import {
  UnlockWithoutCircleBlack,
  LpUnlockWithDivIcon,
} from "@/components/pools/icon";
import tokenIcons from "@/utils/tokenIconConfig";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn/index";
import styles from "./style.module.css";
import { ButtonTextWrapper } from "@/components/common/Button";
import successToast from "@/components/common/toast/successToast";
import failToast from "@/components/common/toast/failToast";
import { TokenImgWithRiskTag } from "@/components/common/imgContainer";

function UnLockedModal(props: any) {
  const { pureIdList } = useRiskTokens();
  const { isOpen, onRequestClose, tokens, lockedData, setAddSuccess } = props;
  const [unlock_loading, set_unlock_loading] = useState<boolean>(false);

  const balance = toPrecision(
    toReadableNumber(24, lockedData?.locked_balance || "0"),
    8
  );
  function unlock() {
    set_unlock_loading(true);
    unlock_lp({
      token_id: lockedData.token_id,
      amount: lockedData.locked_balance,
    })
      .then((res: any) => {
        if (!res) return;
        if (res.status == "success") {
          successToast();
          setAddSuccess((pre: number) => pre + 1);
        } else if (res.status == "error") {
          failToast(res.errorResult?.message);
        }
      })
      .finally(() => {
        onRequestClose();
        set_unlock_loading(false);
      });
  }

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

  const cardWidth = isMobile ? "95vw" : "28vw";
  const cardHeight = isMobile ? "90vh" : "80vh";
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
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
      <div className="lg:w-108 xsm:w-full lg:h-92 rounded-lg bg-dark-10 px-4 py-5">
        {/* title */}
        <div className="flex items-center justify-between">
          <UnLockLpTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer"
            onClick={onRequestClose}
          />
        </div>

        <div className="flex items-center  text-sm mt-7 text-gray-60">
          <span>My Locking</span>
        </div>
        {/*  */}
        <div
          className="flex items-center justify-between px-3 rounded-lg mt-4 "
          style={{ height: "65px", background: "rgba(0,0,0,.2)" }}
        >
          <div className="text-white text-xl focus:outline-none appearance-none leading-tight px-2.5 w-full flex items-center">
            <span className="text-white paceGrotesk-Bold text-2xl mr-2">
              {balance}
            </span>
            <LpUnlockWithDivIcon />
          </div>
          <div
            className={`flex items-center flex-shrink-0 bg-gray-60 bg-opacity-10 rounded-full p-1 ${styles.tokenImgContainer}`}
          >
            {tokens?.map((ite: any, ind: number) => (
              <TokenImgWithRiskTag
                token={ite}
                withoutRisk={true}
                key={ite.tokenId + ind}
              />
            ))}
          </div>
        </div>

        <div
          onClick={unlock}
          className={`flex-shrink-0 mt-36 h-12 text-center text-sm text-white focus:outline-none font-semibold cursor-pointer`}
        >
          <div className="poolBtnStyle">
            <ButtonTextWrapper
              loading={unlock_loading}
              Text={() => (
                <span className="frcc">
                  <UnlockWithoutCircleBlack className="mr-0.5" />
                  Unlock
                </span>
              )}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default React.memo(UnLockedModal);
