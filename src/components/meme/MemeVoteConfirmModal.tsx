import React, { useState } from "react";
import Modal from "react-modal";
import { isMobile } from "../../utils/device";
import { ModalCloseIcon } from "./icons";
import { formatSeconds } from "./tool";
import { ButtonTextWrapper } from "../common/Button";
function MemeVoteConfirmModal(props: any) {
  const { isOpen, onRequestClose, onMemeVote, delay_withdraw_sec } = props;
  const [memeVoteLoading, setMemeVoteLoading] = useState(false);
  const cardWidth = isMobile() ? "95vw" : "380px";
  function doVote() {
    setMemeVoteLoading(true);
    onMemeVote();
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
        className="border border-dark-300 border-opacity-20 bg-dark-10 rounded-2xl p-5 pt-4 text-white"
        style={{
          width: cardWidth,
          background: "#213441",
        }}
      >
        <div className="title flex items-center justify-between">
          <div className="text-white text-xl paceGrotesk-Bold">
            Feed Instructions
          </div>
          <ModalCloseIcon
            className="cursor-pointer text-black"
            onClick={onRequestClose}
          />
        </div>
        <p className="mt-3 mb-2 text-sm text-white">
          The winner of the next round of MemeSeason has not been decided yet.
          Voting for MemeToken at this time might result in wasting{" "}
          {formatSeconds(delay_withdraw_sec)} to withdraw it
        </p>
        <div className="flex justify-center">
          <div
            onClick={doVote}
            className={`bg-greenGradient px-3 py-1 paceGrotesk-Bold cursor-pointer rounded-md mt-2 w-fit text-black outline-none ${
              memeVoteLoading ? "opacity-40" : ""
            }`}
          >
            <ButtonTextWrapper
              loading={memeVoteLoading}
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

export default React.memo(MemeVoteConfirmModal);
