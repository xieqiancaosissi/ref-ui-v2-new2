import React, { useState } from "react";
import { useAccountStore } from "@/stores/account";
import { useClientMobile } from "@/utils/device";
import { openTransak } from "./Transak";
import { BuyNearIcon, BuyNearHoverIcon } from "./icons";
const BuyNearButton = () => {
  const [hover, setHover] = useState<boolean>(false);
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const isMobile = useClientMobile();
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openTransak(accountId);
      }}
      className="relative z-50 outline-none"
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      {isMobile ? (
        <BuyNearIcon />
      ) : hover ? (
        <BuyNearHoverIcon />
      ) : (
        <BuyNearIcon />
      )}
    </button>
  );
};
export default BuyNearButton;
