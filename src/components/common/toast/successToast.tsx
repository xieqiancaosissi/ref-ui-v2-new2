import { toast } from "react-toastify";
import getConfig from "@/utils/config";
import { CloseIcon, PopSuccessfulIcon } from "@/components/common/Icons";
const successToast = (params?: { successText?: string; txHash?: string }) => {
  const { successText, txHash } = params || {};
  toast(
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
            window.open(`${getConfig().explorerUrl}/txns/${txHash}`);
          }}
        >
          Click to view
        </span>
      ) : null}
    </div>,
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
        background: "#9DFD01",
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
export default successToast;
