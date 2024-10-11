import { refFarmBoostViewFunction } from "@/utils/contract";
import { create } from "zustand";

type IAccountStore = {
  accountId: string;
  isSignedIn: boolean;
  walletLoading: boolean;
  setAccountId: (accountId: string) => void;
  getAccountId: () => string;
  getIsSignedIn: () => boolean;
  setIsSignedIn: (isSignedIn: boolean) => void;
  getWalletLoading: () => boolean;
  setWalletLoading: (status: boolean) => void;
};
export const useAccountStore = create<IAccountStore>((set, get) => ({
  accountId: "",
  isSignedIn: false,
  walletLoading: true,
  setAccountId: (accountId: string) => set({ accountId }),
  getAccountId: () => get().accountId,
  setIsSignedIn: (isSignedIn: boolean) => {
    set({ isSignedIn });
  },
  getIsSignedIn: () => get().isSignedIn,
  getWalletLoading: () => get().walletLoading,
  setWalletLoading: (walletLoading: boolean) => {
    set({ walletLoading });
  },
}));

export interface AccountStorageView {
  total: string;
  available: string;
}

export const currentStorageBalanceOfFarm_boost = (
  accountId: string
): Promise<AccountStorageView> => {
  return refFarmBoostViewFunction({
    methodName: "storage_balance_of",
    args: { account_id: accountId },
  });
};
