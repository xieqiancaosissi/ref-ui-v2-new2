import React, { useState } from "react";
import Modal from "react-modal";
import { CloseIcon } from "@/components/common/Icons";

function BridgeModal(props: any) {
  const { isOpen, onRequestClose, bridgeList } = props;
  const [selecteData, setSelecteData] = useState<any>({});
  function jump() {
    if (selecteData.link) {
      window.open(selecteData.link);
      onRequestClose();
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
    >
      <div className="rounded-t-lg w-screen px-3 py-4 bg-dark-10">
        <div className="flex items-center justify-between px-1">
          <span className="text-white text-base font-extrabold">Bridge</span>
          <CloseIcon
            className=" hover:text-white cursor-pointer text-gray-60"
            onClick={onRequestClose}
          />
        </div>
        <div className="mt-5">
          {bridgeList.map((b: any) => {
            const isChecked = b.name == selecteData.name;
            return (
              <div
                key={b.name}
                className="flex items-center gap-3 justify-between rounded-md cursor-pointer bg-gray-20 mt-1.5 px-4 h-[50px] text-base text-white"
              >
                <div className="flex items-center gap-2">
                  {b.icon}
                  {b.name}
                </div>
                <div
                  onClick={() => {
                    setSelecteData(b);
                  }}
                  className={`flex items-center justify-center w-[18px] h-[18px] rounded-full border ${
                    isChecked
                      ? "border-green-10"
                      : "border-gray-10 border-opacity-50"
                  }`}
                >
                  {isChecked ? (
                    <span className="w-3 h-3 rounded-full bg-green-10" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        {/* tip */}
        {selecteData?.name ? (
          <div className="rounded border border-yellow-10 border-opacity-60 px-4 py-2.5 bg-yellow-10 bg-opacity-10 text-sm text-yellow-10 mt-3">
            <span>
              Redirecting to{" "}
              <span className="underline" onClick={jump}>
                {selecteData.name}
              </span>{" "}
              , not affiliated with Ref.
            </span>
          </div>
        ) : null}

        {/* button */}
        <div
          onClick={jump}
          className={`flex items-center justify-center h-[48px] rounded text-base font-bold mt-3 ${
            selecteData.name
              ? "bg-greenGradient text-black"
              : "bg-gray-40 text-gray-50"
          }`}
        >
          Confirm
        </div>
      </div>
    </Modal>
  );
}
export default React.memo(BridgeModal);
