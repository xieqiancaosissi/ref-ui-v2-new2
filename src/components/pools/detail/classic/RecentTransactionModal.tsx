import React, { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import { PikespeakIcon } from "../../icon";
import { TxLeftArrow } from "../../icon";
import getConfig from "@/utils/config";
import { NearblocksIcon } from "../../icon";
import { getTxId } from "@/services/indexer";

function RecentTransactionModal(props: any) {
  const { isOpen, onRequestClose, receipt_id } = props;

  async function handleTxClick(receipt_id: any, url: string) {
    try {
      const data = await getTxId(receipt_id);
      if (data && data.receipts && data.receipts.length > 0) {
        const txHash = data.receipts[0].originated_from_transaction_hash;
        window.open(`${url}/${txHash}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error(
        "An error occurred while fetching transaction data:",
        error
      );
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        onRequestClose();
      }}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          overflow: "auto",
        },
        content: {
          transform: "translateX(-50%)",
          top: "auto",
          bottom: "32px",
          width: "100vw",
        },
      }}
    >
      <div className="bg-gray-230 w-full h-64 p-4 shadow-lg rounded">
        <div className="flex flex-col">
          <div
            className="p-3 h-12 mb-2 bg-gray-100 text-white rounded-md flex items-center justify-between"
            onClick={() =>
              handleTxClick(receipt_id, `${getConfig().explorerUrl}/txns`)
            }
          >
            <div className="flex items-center">
              <NearblocksIcon />
              <p className="ml-2">nearblocks</p>
            </div>
            <TxLeftArrow stroke={"#91A2AE"} />
          </div>
          <div
            className="p-3 h-12 bg-gray-100 text-white rounded-md flex items-center justify-between"
            onClick={() =>
              handleTxClick(
                receipt_id,
                `${getConfig().pikespeakUrl}/transaction-viewer`
              )
            }
          >
            <div className="flex items-center">
              <PikespeakIcon />
              <p className="ml-2">Pikespeak...</p>
            </div>
            <TxLeftArrow stroke={"#91A2AE"} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
export default React.memo(RecentTransactionModal);
