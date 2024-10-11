import { toast } from "react-toastify";
import { CloseIcon, WalletPopupWarnIcon } from "@/components/common/Icons";
const failToast = (failText: string) => {
  toast(
    <div>
      <div className="flex items-center gap-1.5">
        <WalletPopupWarnIcon />
        <span className="text-white tetx-base font-bold">Error</span>
      </div>
      <div className="text-gray-60 text-sm pl-6 mt-1">
        {failText || "An error occurred, please verify your wallet data."}
      </div>
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
        background: "#FFB018",
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
export default failToast;
