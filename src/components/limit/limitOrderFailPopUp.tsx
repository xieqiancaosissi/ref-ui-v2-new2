import { toast } from "react-toastify";
import getConfig from "@/utils/config";
import { CloseIcon, PopFailedIcon } from "@/components/common/Icons";
const LimitOrderFailPopUp = (txHash: string) => {
  toast(
    <a
      className="text-error w-full h-full pl-1.5 py-1 flex flex-col text-sm"
      href={`${getConfig().explorerUrl}/txns/${txHash}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      style={{
        lineHeight: "20px",
      }}
    >
      <span className="flex items-center text-white text-base">
        <span className="mr-2.5">
          <PopFailedIcon />
        </span>

        <span>Limit order creation fails.</span>
      </span>

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
      autoClose: false,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: (
        <CloseIcon
          size="12"
          className="relative top-2 right-1 text-dark-80 hover:text-white flex-shrink-0"
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
      },
    }
  );
};
export default LimitOrderFailPopUp;
