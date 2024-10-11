import React from "react";
import Modal from "react-modal";
import { isMobile } from "@/utils/device";
import FarmsDetailStake from "./FarmsDetailStake";
import { BoostConfig, Seed, UserSeedInfo } from "@/services/farm";

function StakeMobile(props: {
  isOpen: boolean;
  onRequestClose: () => void;
  detailData: Seed;
  tokenPriceList: any;
  lpBalance: string;
  stakeType: string;
  serverTime: number;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
  user_data_loading: Boolean;
  radio: string | number;
  activeTab: string;
  updateSharesAndBalance: any;
}) {
  const {
    isOpen,
    onRequestClose,
    detailData,
    lpBalance,
    stakeType,
    serverTime,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
    user_data_loading,
    radio,
    activeTab,
    updateSharesAndBalance,
  } = props;
  const cardWidth = isMobile() ? "100vw" : "430px";
  const cardHeight = isMobile() ? "90vh" : "80vh";
  const is_mobile = isMobile();
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
      style={{
        overlay: {
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        },
        content: {
          outline: "none",
          ...(is_mobile
            ? {
                transform: "translateX(-50%)",
                top: "auto",
                bottom: "32px",
              }
            : {
                transform: "translate(-50%, -50%)",
              }),
        },
      }}
    >
      <div
        className="text-white"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
        }}
      >
        <div className="bg-dark-10 lg:rounded-lg xs:rounded-t-2xl xs:border xs:border-modalGrayBg">
          <FarmsDetailStake
            detailData={detailData}
            tokenPriceList={tokenPriceList}
            stakeType="free"
            serverTime={serverTime ?? 0}
            lpBalance={lpBalance}
            loveSeed={loveSeed}
            boostConfig={boostConfig}
            user_seeds_map={user_seeds_map}
            user_unclaimed_map={user_unclaimed_map}
            user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
            user_data_loading={user_data_loading}
            radio={radio}
            activeMobileTab={activeTab}
            updateSharesAndBalance={updateSharesAndBalance}
          ></FarmsDetailStake>
        </div>
      </div>
    </Modal>
  );
}

export default React.memo(StakeMobile);
