import React, { useState } from "react";
import Modal from "react-modal";
import { isMobile } from "../../utils/device";
import { ModalCloseIcon } from "./icons";
import { ButtonTextWrapper } from "../common/Button";
function DonateConfirmModal(props: any) {
  const { isOpen, onRequestClose, amount, symbol, onDonate } = props;
  const [donateLoading, setDonateLoading] = useState(false);
  const cardWidth = isMobile() ? "95vw" : "380px";
  function doDonate() {
    setDonateLoading(true);
    onDonate();
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          overflow: "auto",
        },
        content: {
          outline: "none",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <div
        className="rounded-2xl p-5 pt-4 text-white"
        style={{
          width: cardWidth,
          background: "#213441",
        }}
      >
        <div className="title flex items-center justify-between">
          <div className="text-white text-xl paceGrotesk-Bold">
            Donation Instructions
          </div>
          <ModalCloseIcon
            className="cursor-pointer text-black"
            onClick={onRequestClose}
          />
        </div>
        <p className="mt-3 mb-2 text-sm text-white">
          Please confirm that once you execute Donate, you will lose {amount}{" "}
          {symbol}.
        </p>
        <div className="flex justify-center">
          <div
            onClick={doDonate}
            className={`bg-greenGradient px-3 py-1 paceGrotesk-Bold cursor-pointer rounded-md mt-2 w-20 outline-none ${
              donateLoading ? "opacity-40" : ""
            }`}
          >
            <ButtonTextWrapper
              loading={donateLoading}
              Text={() => (
                <div className="flex items-center gap-2 text-base text-boxBorder">
                  Got it!
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default React.memo(DonateConfirmModal);
