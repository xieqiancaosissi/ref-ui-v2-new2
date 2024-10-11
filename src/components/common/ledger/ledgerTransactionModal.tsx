import React from "react";
import { CloseIcon, LedgerIcon } from "../Icons";
import { ledgerTipClose } from "@/components/common/ledger/ledger";
const LedgerTransactionModal = () => {
  return (
    <div
      className="ledger-transaction-pop-up"
      style={{
        zIndex: 999,
        display: "none",
      }}
    >
      <div className="nws-modal-wrapper open">
        <div className="modal-overlay" onClick={ledgerTipClose} />
        <div
          className="modal"
          style={{
            background: "#1B242C",
            minWidth: "280px",
            borderRadius: "8px",
            zIndex: "1000",
          }}
        >
          <div
            className="modal-header flex justify-end"
            style={{
              display: "flex",
              justifyContent: "end",
              padding: "0px",
            }}
          >
            <CloseIcon onClick={ledgerTipClose} className="cursor-pointer" />
          </div>
          <div className="modal-body">
            <div className="flex items-center justify-center my-7 mx-auto w-12">
              <LedgerIcon />
            </div>

            <div className="flex flex-col items-center text-white mb-4">
              <div className="text-center text-sm">
                Please confirm this transaction on Ledger
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LedgerTransactionModal;
