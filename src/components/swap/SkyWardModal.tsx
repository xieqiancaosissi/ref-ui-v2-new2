import React, { useState } from "react";
import Modal from "react-modal";
import { CloseIcon } from "../common/Icons";
import { HeavyWarning } from "./icons";
function SkyWardModal(props: ReactModal.Props) {
  const [hover, setHover] = useState<boolean>(false);
  const { onRequestClose } = props as any;
  return (
    <Modal
      {...props}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
        },
      }}
    >
      <div
        className="text-white border border-green-10 outline-none flex flex-col items-center p-6 bg-dark-10 rounded-lg"
        style={{
          width: "356px",
        }}
      >
        <div
          className="ml-2 cursor-pointer p-1 self-end"
          onClick={onRequestClose}
        >
          <CloseIcon size="12" className="text-gray-50 hover:text-white" />
        </div>

        <div>
          <HeavyWarning />
        </div>

        <div className="text-gray-60 text-sm px-1 py-7">
          Note: the Skyward contract suffered a contract exploit, rendering the
          Skyward treasury worthless. More details about the{" "}
          <a
            className={`cursor-pointer  text-green-10 ${
              hover ? "font-bold underline" : "font-normal"
            } `}
            rel="noreferrer"
            href="https://twitter.com/skywardfinance/status/1587947957789331457?s=20&t=Of-CxqeTS162x11y0JRR_w"
            target={"_blank"}
            onMouseEnter={() => {
              setHover(true);
            }}
            onMouseLeave={() => {
              setHover(false);
            }}
          >
            exploit
          </a>
          . You should be aware of the risks and prepared to potentially lose
          all of the money invested for trading such a token.
        </div>

        <div
          className="flex items-center justify-center rounded cursor-pointer bg-greenGradient w-full text-base font-bold text-black"
          style={{ height: "42px" }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRequestClose(e);
          }}
        >
          I understand
        </div>
      </div>
    </Modal>
  );
}
export default React.memo(SkyWardModal);
