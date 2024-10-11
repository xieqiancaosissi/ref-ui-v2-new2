import React, { useState } from "react";
import { Rainbow, WalletCedeBridge } from "./icons2";
import { ArrowIcon } from "./icons";
import BridgeConfirmModal from "./bridgeConfirmModal";
import BridgeModal from "./bridgeModal";
import { isMobile } from "@/utils/device";

function Bridge() {
  const [hover, setHover] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isBridgeOpen, setIsBridgeOpen] = useState<boolean>(false);
  const [bridgeData, setBridgeData] = useState<any>({});
  const [bridgeHoverName, setBridgeHoverName] = useState<string>("");
  const mobile = isMobile();
  const bridgeList = [
    {
      icon: <Rainbow />,
      name: "Rainbow",
      link: "https://rainbowbridge.app/transfer",
    },
    {
      icon: <WalletCedeBridge />,
      name: "Cede Bridge",
      link: "https://send.cede.store/?tokenSymbol=NEAR&network=near&source=ref_finance",
    },
  ];
  function closeConfirmModal() {
    setIsOpen(false);
    setHover(false);
    setBridgeHoverName("");
  }
  function showConfirmModal(d: any) {
    setBridgeData(d);
    setIsOpen(true);
    setHover(false);
    setBridgeHoverName("");
  }
  function showBridgeListModal() {
    if (mobile) {
      setIsBridgeOpen(true);
    }
  }
  function closeBridgeListModal() {
    if (mobile) {
      setIsBridgeOpen(false);
    }
  }
  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => {
        if (!mobile) {
          setHover(true);
        }
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <div
        onClick={showBridgeListModal}
        className="flex items-center justify-center lg:h-9 xsm:h-[26px] rounded text-sm font-bold text-gray-10 px-2 cursor-pointer border border-gray-70 hover:bg-dark-10"
      >
        BRIDGE
      </div>
      {/* for pc */}
      {hover && !mobile ? (
        <div className="absolute" style={{ paddingTop: "10px", top: "30px" }}>
          <div className="flex flex-col gap-2 border border-gray-70 bg-dark-70 p-2 rounded-lg whitespace-nowrap text-sm text-gray-10">
            {bridgeList.map((b) => {
              return (
                <div
                  key={b.name}
                  className="flex items-center gap-3 justify-between rounded cursor-pointer hover:bg-dark-10 hover:text-white p-2"
                  onClick={() => {
                    showConfirmModal(b);
                  }}
                  onMouseEnter={() => {
                    setBridgeHoverName(b.name);
                  }}
                  onMouseLeave={() => {
                    setBridgeHoverName("");
                  }}
                >
                  <div className="flex items-center gap-2">
                    {b.icon}
                    {b.name}
                  </div>
                  <ArrowIcon
                    className={`transform -rotate-90 ${
                      bridgeHoverName == b.name ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      <BridgeConfirmModal
        isOpen={isOpen}
        onRequestClose={closeConfirmModal}
        bridgeData={bridgeData}
      />
      {/* for mobile */}
      {isBridgeOpen ? (
        <BridgeModal
          isOpen={isBridgeOpen}
          onRequestClose={closeBridgeListModal}
          bridgeList={bridgeList}
        />
      ) : null}
    </div>
  );
}

export default React.memo(Bridge);
