import { getAccountId } from "../utils/wallet";
import { refVeViewFunction } from "../utils/contract";
import { useEffect, useState } from "react";
import { toReadableNumber } from "@/utils/numbers";
import { useAccountStore } from "@/stores/account";

export interface AccountInfo {
  duration_sec: number;
  lpt_amount: string;
  rewards: string[][];
  sponsor_id: string;
  unlock_timestamp: string;
  ve_lpt_amount: string;
}

export const LOVE_TOKEN_DECIMAL = 18;

export const getLoveAmount = () => {
  return refVeViewFunction({
    methodName: "ft_balance_of",
    args: { account_id: getAccountId() },
  });
};

export const getAccountInfo = () => {
  return refVeViewFunction({
    methodName: "get_account_info",
    args: { account_id: getAccountId() },
  });
};

export const useAccountInfo = () => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>();
  const [veShare, setVeShare] = useState<string>("0");
  const [accountInfoDone, setAccountInfoDone] = useState<boolean>(false);
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  useEffect(() => {
    if (!isSignedIn) return;
    getAccountInfo().then((info: AccountInfo) => {
      setAccountInfo(info);

      setVeShare(
        toReadableNumber(LOVE_TOKEN_DECIMAL, info?.ve_lpt_amount || "0")
      );
      setAccountInfoDone(true);
    });
  }, [isSignedIn]);

  return {
    accountInfo,
    veShare,
    veShareRaw: accountInfo?.ve_lpt_amount || "0",
    lptAmount: accountInfo?.lpt_amount || "0",
    fetchDoneVOTEAccountInfo: !!accountInfo,
    accountInfoDone,
  };
};

export const getVEPoolId = (
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) => {
  switch (env) {
    case "pub-testnet":
      return 17;
    case "testnet":
      return 269;
    case "mainnet":
      return 79;
    default:
      return 79;
  }
};
