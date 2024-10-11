import { toast } from "react-toastify";
import {
  CloseIcon,
  PopSuccessfulIcon,
  PopFailedIcon,
} from "@/components/common/Icons";
import { checkTransaction } from "@/utils/contract";
import { getTransactionStatus } from "@/utils/transactionsPopup";
import getConfig from "@/utils/config";
const checkTxBeforeShowToast = async ({
  txHash,
  successText,
  failText,
}: {
  txHash: string;
  successText?: string;
  failText?: string;
}) => {
  const res = await checkTransaction(txHash);
  const status = getTransactionStatus(res);
  const config = getConfig();
  toast(
    <>
      {status == "success" ? (
        <div>
          <div className="flex items-center gap-1.5">
            <PopSuccessfulIcon />
            <span className="text-white tetx-base font-bold">
              Transaction successful
            </span>
          </div>
          {successText ? (
            <div className="text-gray-60 text-sm pl-6 mt-1">{successText}</div>
          ) : null}
          {txHash ? (
            <span
              className="inline-flex decoration-1 hover:text-white text-base text-gray-60  mt-1 cursor-pointer underline"
              style={{
                textDecorationThickness: "1px",
                paddingLeft: "24px",
              }}
              onClick={() => {
                window.open(`${config.explorerUrl}/txns/${txHash}`);
              }}
            >
              Click to view
            </span>
          ) : null}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-1.5">
            <PopFailedIcon />
            <span className="text-white tetx-base font-bold">
              Transaction failed
            </span>
          </div>
          {failText ? (
            <div className="text-gray-60 text-sm pl-6 mt-1">{failText}</div>
          ) : null}
          {txHash ? (
            <span
              className="inline-flex decoration-1 hover:text-white text-base text-gray-60  mt-1 cursor-pointer underline"
              style={{
                textDecorationThickness: "1px",
                paddingLeft: "24px",
              }}
              onClick={() => {
                window.open(`${config.explorerUrl}/txns/${txHash}`);
              }}
            >
              Click to view
            </span>
          ) : null}
        </div>
      )}
    </>,
    {
      autoClose: 5000,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: (
        <CloseIcon
          size="12"
          className="relative top-2 right-1 text-dark-80 hover:text-white flex-shrink-0"
        />
      ),
      progressStyle: {
        background: status == "success" ? "#9DFD01" : "#FF4B76",
        borderRadius: "8px",
        height: "2px",
      },
      style: {
        borderRadius: "8px",
        background: "#1B242C",
        border: "1px solid rgba(151, 151, 151, 0.2)",
        padding: "6px 10px 8px 6px",
      },
    }
  );
};
export default checkTxBeforeShowToast;
