import React from "react";
import { toast } from "react-toastify";
import { CloseIcon } from "@/components/common/Icons";
import { isClientMobie } from "../../utils/device";
import { SwapCheckIcon } from "./icons";

export const normalFailToast = (text: string, autoClose?: number) => {
  toast(
    <div
      className="text-error w-full h-full pl-1.5 py-1  flex-col text-sm"
      style={{
        lineHeight: "40px",
        width: isClientMobie() ? "" : "280px",
      }}
    >
      <span>{text}</span>
    </div>,
    {
      autoClose: typeof autoClose === "undefined" ? false : autoClose,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: <CloseIcon />,
      progressStyle: {
        background: "#FF7575",
        borderRadius: "8px",
      },
      style: {
        background: "#1D2932",
        boxShadow: "0px 0px 10px 10px rgba(0, 0, 0, 0.15)",
        border: "1px solid #FF7575",
        borderRadius: "8px",
      },
    }
  );
};

export const normalSuccessToast = (text: string) => {
  toast(
    <div
      className="text-white w-full h-full pl-1.5 text-sm  flex-wrap items-center"
      style={{
        lineHeight: "30px",
        width: isClientMobie() ? "" : "270px",
      }}
    >
      <div className="w-4 h-4 mr-2  relative top-1 inline-flex">
        <SwapCheckIcon />
      </div>
      {text}
    </div>,
    {
      autoClose: 5000,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: <CloseIcon />,
      progressStyle: {
        background: "#00FFD1",
        borderRadius: "8px",
      },
      style: {
        background: "#1D2932",
        boxShadow: "0px 0px 10px 10px rgba(0, 0, 0, 0.15)",
        borderRadius: "8px",
        minHeight: "0px",
      },
    }
  );
};
