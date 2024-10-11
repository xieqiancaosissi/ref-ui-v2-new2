import React, { useState, useEffect } from "react";
import { ftGetBalance } from "@/services/token";
import { getAccountNearBalance } from "@/services/token";
import { toReadableNumber } from "@/utils/numbers";
import { useAccountStore } from "@/stores/account";
import { getAccountId } from "@/utils/wallet";
export const useDepositableBalance = (
  tokenId: string,
  decimals?: number,
  dependabale?: boolean
) => {
  const [depositable, setDepositable] = useState<string>("");
  const [max, setMax] = useState<string>("");
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;

  useEffect(() => {
    if (isSignedIn && getAccountId()) {
      if (tokenId === "NEAR") {
        getAccountNearBalance().then(({ available }: any) =>
          setDepositable(available)
        );
      } else if (tokenId) {
        ftGetBalance(tokenId).then(setDepositable);
      }
    } else {
      setDepositable("0");
    }
  }, [tokenId, isSignedIn, getAccountId()]);

  useEffect(() => {
    const max = toReadableNumber(decimals as any, depositable) || "0";
    setMax(max);
  }, [depositable]);

  return max;
};
