import React, { useState } from "react";
import { useRouter } from "next/router";
import { Checkbox, CheckboxSelected } from "./icons";
import CustomModal from "../customModal/customModal";
import WalletSelectorFooter from "./WalletSelectorFooter";
import { useAppStore } from "@/stores/app";
import { CONST_ACKNOWLEDGE_WALLET_RISK } from "@/utils/constantLocal";

const WalletRiskCheckBox = (props: any) => {
  const appStore = useAppStore();
  const router = useRouter();
  const [checkBoxStatus, setCheckBoxStatus] = useState(false);

  function switchCheckBox() {
    const newStatus = !checkBoxStatus;
    setCheckBoxStatus(newStatus);
    appStore.setShowRiskModal(false);
    window.modal.show();
    localStorage.setItem(CONST_ACKNOWLEDGE_WALLET_RISK, "1");
  }
  function jumpRisksPage() {
    appStore.setShowRiskModal(false);
    router.push("/risks");
  }
  return (
    <div
      className={`flex items-start ${checkBoxStatus ? "my-4" : "mb-4 mt-1"}`}
    >
      {checkBoxStatus ? (
        <CheckboxSelected
          className="relative flex-shrink-0 mr-3 top-1 cursor-pointer"
          onClick={switchCheckBox}
        ></CheckboxSelected>
      ) : (
        <Checkbox
          className="relative flex-shrink-0 mr-3 top-1 cursor-pointer"
          onClick={switchCheckBox}
        ></Checkbox>
      )}
      <span className="text-sm text-gray-60">
        By checking this box and moving forward, you confirm that you fully
        understand the
        <a
          rel="noopener noreferrer nofollow"
          className="text-green-10 text-sm font-bold cursor-pointer hover:underline mx-1"
          onClick={jumpRisksPage}
        >
          risks
        </a>
        of using Ref Finance.
      </span>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: any;
}

const WalletRiskCheckBoxModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      onOutsideClick={onClose}
      className={"modal-style1x"}
      title={"Connect Wallet"}
      width={470}
    >
      <WalletRiskCheckBox />
      <WalletSelectorFooter />
    </CustomModal>
  );
};
function RiskModal() {
  const appStore = useAppStore();
  const isOpen = appStore.getShowRiskModal();
  function close() {
    appStore.setShowRiskModal(false);
  }
  return <WalletRiskCheckBoxModal isOpen={isOpen} onClose={close} />;
}
export default RiskModal;
