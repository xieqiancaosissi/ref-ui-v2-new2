import React, { useEffect, useState } from "react";
import { getUserIsBlocked } from "@/services/api";
import { PUBLIC_BLOCK_FEATURE } from "@/utils/constant";
export default function Blocked() {
  const [isBlocked, setIsBlocked] = useState(false);
  useEffect(() => {
    if (PUBLIC_BLOCK_FEATURE) {
      checkBlockedStatus();
    }
  }, [PUBLIC_BLOCK_FEATURE]);
  function checkBlockedStatus() {
    getUserIsBlocked().then((res) => {
      if (res.blocked === true) {
        const blockConfirmationTime = localStorage.getItem(
          "blockConfirmationTime"
        );
        if (blockConfirmationTime) {
          const currentTime = new Date().getTime();
          const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
          if (
            currentTime - parseInt(blockConfirmationTime, 10) <
            weekInMilliseconds
          ) {
            setIsBlocked(false);
          } else {
            setIsBlocked(true);
          }
        } else {
          setIsBlocked(true);
        }
      }
    });
  }
  function handleBlockConfirmation() {
    const currentTime = new Date().getTime();
    localStorage.setItem("blockConfirmationTime", currentTime.toString());
    setIsBlocked(false);
  }
  if (!(isBlocked && PUBLIC_BLOCK_FEATURE)) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center"
      style={{ zIndex: "10000", backdropFilter: "blur(6px)" }}
    >
      <div
        className="text-white text-center bg-dark-10 px-5 pt-9 pb-7 rounded-md"
        style={{ width: "278px", boxShadow: "0px 0px 10px 4px #00000026" }}
      >
        <p className="text-sm">
          You are prohibited from accessing app.ref.finance due to your location
          or other infringement of the Terms of Services.
        </p>
        <div
          onClick={handleBlockConfirmation}
          className="mt-4 border border-primaryGreen text-primaryGreen h-9 flex items-center justify-center rounded-md text-sm text-black text-primary cursor-pointer ml-1.5 mr-1.5"
        >
          Confirm
        </div>
      </div>
    </div>
  );
}
