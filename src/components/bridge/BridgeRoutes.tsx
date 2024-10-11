import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";

import Button from "./Button";
import SvgIcon from "./SvgIcon";
import { BridgeConfig } from "@/config/bridge";
import { useBridgeFormContext } from "@/providers/bridgeForm";
import { formatAmount, formatFileUrl, formatUSDCurrency } from "@/utils/format";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import Big from "big.js";
import { Image } from "@nextui-org/react";
import { getTokenDecimals } from "@/utils/token";

const routeConfig = {
  Rainbow: {
    logo: formatFileUrl("/logo/rainbow.png"),
    ...BridgeConfig.Rainbow,
  },
  Stargate: {
    logo: formatFileUrl("/logo/stargate.png"),
    ...BridgeConfig.Stargate,
  },
};

function BridgeRouteItem({
  channel,
  className,
  onClick,
}: {
  channel: BridgeModel.BridgeSupportChannel;
  className?: string;
  onClick?: () => void;
}) {
  const { bridgeToValue, channelInfoMap } = useBridgeFormContext();
  const route = routeConfig[channel];

  return (
    route && (
      <div
        className={`bg-opacity-10 rounded-xl p-4 ${className ?? ""}`}
        style={{ backgroundColor: "rgba(126, 138, 147, 0.10)" }}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Image
              src={route.logo}
              alt=""
              width={28}
              height={28}
              classNames={{ wrapper: "w-7 h-7 bg-white rounded-lg" }}
            />

            <div className="text-slate-500 text-base font-medium ">
              {channel}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-black rounded-md">
              <div className="text-10px " style={{ color: "#6AFFE4" }}>
                Optimal Path
              </div>
            </div>
            <div className="px-2 py-0.5 bg-black rounded-md">
              <div className="text-10px " style={{ color: "#5077FF" }}>
                Fastest
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 justify-between gap-2">
          <div className="text-white text-sm font-medium">
            ~{channelInfoMap?.[channel]?.readableMinAmount}{" "}
            {bridgeToValue.tokenMeta.symbol}
          </div>
          <div className="text-right text-slate-500 text-xs font-normal ">
            {route.estimateWaitText} ｜ Bridge fee{" "}
            <span
              className="underline cursor-pointer ml-1"
              data-tooltip-id="bridgeFee"
              data-place="right"
              data-class="reactTip"
              data-tooltip-html={`
                <div>Layer0 Fee: ${formatUSDCurrency(
                  channelInfoMap?.[channel]?.usdFee,
                  "0.01"
                )} </div>
                <div>StarGate Fee: ${formatUSDCurrency(
                  channelInfoMap?.[channel]?.readableProtocolFee,
                  "0.01"
                )}</div>`}
            >
              <span>
                {formatUSDCurrency(
                  new Big(channelInfoMap?.[channel]?.usdFee || 0)
                    .plus(channelInfoMap?.[channel]?.readableProtocolFee || 0)
                    .toString(),
                  "0.01"
                )}
              </span>
              <CustomTooltip id="bridgeFee" />
            </span>
          </div>
        </div>
      </div>
    )
  );
}

function BridgeSelectRoutesModal({
  toggleOpenModal,
  ...props
}: Modal.Props & { toggleOpenModal: () => void }) {
  const { supportBridgeChannels, setBridgeChannel } = useBridgeFormContext();

  function handleSelectRoute(channel: BridgeModel.BridgeSupportChannel) {
    setBridgeChannel(channel);
    toggleOpenModal();
  }

  return (
    <Modal
      {...props}
      overlayClassName="modal-overlay"
      onRequestClose={toggleOpenModal}
    >
      <div className="bridge-modal" style={{ width: "428px" }}>
        <div className="flex items-center justify-between">
          <span className="text-base text-white font-medium">
            Bridge Router
          </span>
          <Button text onClick={toggleOpenModal}>
            <SvgIcon name="IconClose" />
          </Button>
        </div>
        <div>
          {supportBridgeChannels.map((channel) => (
            <BridgeRouteItem
              key={channel}
              channel={channel}
              className="mt-4"
              onClick={() => handleSelectRoute(channel)}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function BridgeRoutes() {
  const [isOpen, setIsOpen] = useState(false);
  function toggleOpenModal() {
    setIsOpen(!isOpen);
  }
  const {
    bridgeFromValue,
    bridgeChannel,
    setBridgeChannel,
    supportBridgeChannels,
    channelInfoMapLoading,
  } = useBridgeFormContext();

  const showRoute = useMemo(
    () =>
      !channelInfoMapLoading &&
      bridgeFromValue.amount &&
      bridgeFromValue.amount !== "0",
    [channelInfoMapLoading, bridgeFromValue.amount]
  );

  useEffect(() => {
    if (!supportBridgeChannels.includes(bridgeChannel)) {
      setBridgeChannel(supportBridgeChannels[0]);
    }
  }, [supportBridgeChannels, bridgeChannel, setBridgeChannel]);

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span>Select Bridge Router</span>
          <Button
            className="inline-flex items-center text-xs"
            size="small"
            text
            onClick={toggleOpenModal}
          >
            {showRoute
              ? `${supportBridgeChannels.length} Router${
                  supportBridgeChannels.length > 1 ? "s" : ""
                } 
            `
              : "-"}
            <SvgIcon
              name="IconArrowDown"
              className="transform -rotate-90 ml-2"
            />
          </Button>
        </div>
        {showRoute && supportBridgeChannels.length > 0 && (
          <BridgeRouteItem channel={bridgeChannel} className="mt-4" />
        )}
      </div>
      <BridgeSelectRoutesModal
        isOpen={isOpen}
        toggleOpenModal={toggleOpenModal}
      />
    </>
  );
}

export default BridgeRoutes;
