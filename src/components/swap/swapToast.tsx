import { toast } from "react-toastify";
import getConfig from "@/utils/config";
import { CloseIcon, PopSuccessfulIcon } from "@/components/common/Icons";
const swapToast = (txHash: string) => {
  toast(
    <a
      className="text-white w-full h-full pl-1.5 text-base flex flex-col"
      href={`${getConfig().explorerUrl}/txns/${txHash}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      <div className="flex items-center">
        <span className="mr-2.5 ">
          <PopSuccessfulIcon />
        </span>
        <span className="mr-1">Swap successfully.</span>
      </div>
      <span
        className="underline decoration-1 text-gray-60 hover:text-white"
        style={{
          textDecorationThickness: "1px",
          paddingLeft: "26px",
        }}
      >
        Click to view
      </span>
    </a>,
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
        background: "#1B242C",
        border: "1px solid rgba(151, 151, 151, 0.2)",
        borderRadius: "8px",
        minHeight: "0px",
      },
    }
  );
};
export default swapToast;
