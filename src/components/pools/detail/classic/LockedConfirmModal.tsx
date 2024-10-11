import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Big from "big.js";
import { LpModalCloseIcon } from "../../icon";
import { secToTime } from "@/utils/time";
import { ButtonTextWrapper } from "@/components/common/Button";
import { LpLockConfirmIconMobile } from "../../icon";
function LockedConfirmModal(props: any) {
  const { isOpen, onRequestClose, months, onLock } = props;
  const [lockLoading, setLockLoading] = useState(false);
  function doLock() {
    setLockLoading(true);
    onLock();
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
  const cardWidth = isMobile ? "95vw" : "380px";

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        onRequestClose();
        setLockLoading(false);
      }}
      style={{
        overlay: {
          overflow: "auto",
        },
        content: isMobile
          ? {
              transform: "translateX(-50%)",
              top: "auto",
              bottom: "33px",
              width: "100vw",
            }
          : {
              outline: "none",
              transform: "translate(-50%, -50%)",
            },
      }}
    >
      {isMobile && (
        <div
          className=" rounded-lg bg-dark-10 p-5 pt-4 text-white"
          style={{
            width: "100vw",
          }}
        >
          <div className="frcc w-full mb-10 mt-20">
            <LpLockConfirmIconMobile></LpLockConfirmIconMobile>
          </div>
          <div className="mt-4 mb-12 text-sm text-gray-60 fccc">
            <div className="text-white text-lg font-medium my-5">
              Lock Instructions
            </div>
            <p>Your LP Token will be unlocked on</p>
            <p className="text-green-10">
              {" "}
              {secToTime(
                Big(new Date().getTime() / 1000).plus(
                  +(months || 0) * 30 * 24 * 3600
                )
              )}
              .
            </p>
            <p>Please confirm this operation again.</p>
          </div>
          <div className="flex justify-center">
            <div
              onClick={doLock}
              className={`cursor-pointer rounded frcc mt-2 w-full h-12 outline-none border hover:opacity-85 border-green-10 text-green-10 ${
                lockLoading ? "opacity-40" : ""
              }`}
            >
              <ButtonTextWrapper
                loading={lockLoading}
                Text={() => <span className="frcc">Got it!</span>}
              />
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <div
          className=" rounded bg-dark-10 p-5 pt-4 text-white"
          style={{
            width: cardWidth,
          }}
        >
          <div className="title flex items-center justify-between">
            <div className="text-white text-lg font-medium">
              Lock Instructions
            </div>
            <LpModalCloseIcon
              className="cursor-pointer text-black hover:opacity-80"
              onClick={onRequestClose}
            />
          </div>
          <p className="mt-4 mb-12 text-sm text-gray-60">
            Your LP Token will be unlocked on{" "}
            {secToTime(
              Big(new Date().getTime() / 1000).plus(
                +(months || 0) * 30 * 24 * 3600
              )
            )}
            . Please confirm this operation again.
          </p>
          <div className="flex justify-center">
            <div
              onClick={doLock}
              className={`cursor-pointer rounded frcc mt-2 w-29 h-9 outline-none border hover:opacity-85 border-green-10 text-green-10 ${
                lockLoading ? "opacity-40" : ""
              }`}
            >
              <ButtonTextWrapper
                loading={lockLoading}
                Text={() => <span className="frcc">Got it!</span>}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default React.memo(LockedConfirmModal);
