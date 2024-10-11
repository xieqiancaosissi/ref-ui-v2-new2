import React, { createContext, useContext, useEffect, useState } from "react";

import BridgeTransactionStatusModal from "@/components/bridge/BridgeTransactionStatus";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { BridgeTransferParams } from "@/services/bridge";
import { nearServices } from "@/services/bridge/contract";
import { storageStore } from "@/utils/common";
import { useDebouncedEffect, useRouterQuery } from "@/hooks/useHooks";

type Props = {
  openBridgeTransactionStatusModal: (
    param: BridgeTransferParams,
    hash: string
  ) => void;
};

const BridgeTransactionContext = createContext<Props>(null);

export function useBridgeTransactionContext() {
  return useContext(BridgeTransactionContext);
}

export default function BridgeTransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { query, replaceQuery } = useRouterQuery();

  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  function toggleOpen() {
    setIsOpen(!isOpen);
    if (!isOpen) storageStore()?.remove("bridgeTransferParams");
  }
  function openBridgeTransactionStatusModal(
    params: BridgeTransferParams,
    hash: string
  ) {
    setTransaction({ params, hash });
    setIsOpen(true);
  }

  const [transaction, setTransaction] =
    useState<{ params: BridgeTransferParams; hash: string }>();

  useDebouncedEffect(
    () => {
      async function handleTransactionStatus() {
        if (query.transactionHashes) {
          const txhash = Array.isArray(query.transactionHashes)
            ? query.transactionHashes
            : query.transactionHashes.split(",");
          const transactions = await Promise.all(
            txhash.map(async (tx) => {
              const res = await nearServices.getTransactionResult(tx);
              return res;
            })
          );
          const transaction = transactions.find(
            (item) =>
              item.transaction.receiver_id === "aurora" &&
              item.transaction.actions?.[0]?.FunctionCall?.method_name ===
                "call"
          );
          const transferParams = storageStore()?.get<BridgeTransferParams>(
            "bridgeTransferParams"
          );
          if (transaction?.transaction.hash && transferParams)
            openBridgeTransactionStatusModal(
              transferParams,
              transaction?.transaction.hash
            );
        }
        if (query.errorMessage) {
          const errorMessage =
            "Transaction Failed: " +
            decodeURIComponent(query.errorMessage.toString());
          toast.error(errorMessage, {
            theme: "dark",
          });
        }
        replaceQuery({
          ...query,
          transactionHashes: undefined,
          errorCode: undefined,
          errorMessage: undefined,
          account_id: undefined,
          public_key: undefined,
          all_keys: undefined,
        });
      }
      handleTransactionStatus();
    },
    [],
    1000
  );

  const exposes = {
    openBridgeTransactionStatusModal,
  };

  return (
    <BridgeTransactionContext.Provider value={exposes}>
      {children}
      {transaction && (
        <BridgeTransactionStatusModal
          {...transaction}
          isOpen={isOpen}
          toggleOpenModal={toggleOpen}
        ></BridgeTransactionStatusModal>
      )}
    </BridgeTransactionContext.Provider>
  );
}
