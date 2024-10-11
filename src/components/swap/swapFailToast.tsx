import { toast } from "react-toastify";
import getConfig from "@/utils/config";
import { CloseIcon, PopFailedIcon } from "@/components/common/Icons";
const swapFailToast = (txHash: string, errorType?: string) => {
  toast(
    <a
      className="text-error w-full h-full pl-1.5 py-1 flex flex-col text-base"
      href={`${getConfig().explorerUrl}/txns/${txHash}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      style={{
        lineHeight: "20px",
      }}
    >
      <span className="flex items-center text-white">
        <span className="mr-2.5">
          <PopFailedIcon />
        </span>

        <span>Transaction failed.</span>
      </span>

      <div
        className="flex flex-col gap-0.5 text-gray-60 text-sm mt-1"
        style={{ paddingLeft: "26px" }}
      >
        <span>Type {errorType}.</span>
        <span
          className="underline decoration-1 hover:text-white text-base"
          style={{
            textDecorationThickness: "1px",
          }}
        >
          Click to view
        </span>
      </div>
    </a>,
    {
      autoClose: false,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: (
        <CloseIcon
          size="12"
          className="relative top-3 right-1 text-dark-80 hover:text-white flex-shrink-0"
        />
      ),
      progressStyle: {
        background: "#FF4B76",
        borderRadius: "8px",
        height: "2px",
      },
      style: {
        background: "#1B242C",
        border: "1px solid rgba(151, 151, 151, 0.2)",
        borderRadius: "8px",
        padding: "0 10px 0 0",
      },
    }
  );
};
export default swapFailToast;
