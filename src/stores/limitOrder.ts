import Big from "big.js";
import { ITokenMetadata } from "@/interfaces/tokens";
import { IPoolDcl } from "@/interfaces/swapDcl";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setAmountOut, formatAmount } from "@/services/limit/limitUtils";
import { toPrecision } from "@/utils/numbers";
import { get_pool } from "@/services/swapV3";
import { fillDclPool, getReverseRate } from "@/services/limit/limitUtils";
import { reverse } from "lodash";
export interface ILimitStore {
  getTokenIn: () => ITokenMetadata;
  setTokenIn: (token: ITokenMetadata) => void;
  getTokenOut: () => ITokenMetadata;
  setTokenOut: (token: ITokenMetadata) => void;
  getTokenInAmount: () => string;
  setTokenInAmount: (tokenInAmount: string) => void;
  getTokenOutAmount: () => string;
  setTokenOutAmount: (tokenOutAmount: string) => void;
  getRate: () => string;
  setRate: (rate: string) => void;
  getReverseRate: () => string;
  setReverseRate: (reverseRate: string) => void;
  getLock: () => boolean;
  setLock: (lock: boolean) => void;
  getMarketRate: () => string;
  setMarketRate: (marketRate: string) => void;
  getPoolFetchLoading: () => boolean;
  setPoolFetchLoading: (poolFetchLoading: boolean) => void;
  getRateDiff: () => string;
  setRateDiff: (rateDiff: string) => void;
  getBalanceLoading: () => boolean;
  setBalanceLoading: (balanceLoading: boolean) => void;
  getReverse: () => boolean;
  setReverse: (reverse: boolean) => void;
  getWalletInteractionStatusUpdatedLimit: () => boolean;
  setWalletInteractionStatusUpdatedLimit: (
    walletInteractionStatusUpdatedLimit: boolean
  ) => void;
  onAmountInChangeTrigger: ({
    amount,
    limitStore,
    rate,
  }: {
    amount: string;
    limitStore: ILimitStore;
    rate: string;
  }) => void;
  onRateChangeTrigger: ({
    amount,
    tokenInAmount,
    limitStore,
    isReverse,
  }: {
    amount: string;
    tokenInAmount: string;
    limitStore: ILimitStore;
    isReverse?: boolean;
  }) => void;
  onAmountOutChangeTrigger: ({
    amount,
    isLock,
    rate,
    tokenInAmount,
    limitStore,
  }: {
    amount: string;
    isLock: boolean;
    rate: string;
    tokenInAmount: string;
    limitStore: ILimitStore;
  }) => void;
  onFetchPool: ({
    limitStore,
    persistLimitStore,
  }: {
    limitStore: ILimitStore;
    persistLimitStore: IPersistLimitStore;
  }) => void;
}
export interface IPersistLimitStore {
  getDclPool: () => IPoolDcl;
  setDclPool: (dclPool: IPoolDcl) => void;
  getAllDclPools: () => IPoolDcl[];
  setAllDclPools: (allDclPools: IPoolDcl[]) => void;
}
export const usePersistLimitStore = create(
  persist(
    (set: any, get: any) => ({
      dclPool: null,
      getDclPool: () => get().dclPool,
      setDclPool: (dclPool: IPoolDcl) => set({ dclPool }),
      allDclPools: [],
      getAllDclPools: () => get().allDclPools,
      setAllDclPools: (allDclPools: IPoolDcl[]) => set({ allDclPools }),
    }),
    {
      name: "_cached_limit",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export const useLimitStore = create<ILimitStore>((set: any, get: any) => ({
  tokenIn: null,
  tokenOut: null,
  tokenInAmount: "1",
  tokenOutAmount: "",
  rate: "",
  reverseRate: "",
  marketRate: "",
  lock: false,
  poolFetchLoading: false,
  rateDiff: "",
  balanceLoading: true,
  reverse: false,
  walletInteractionStatusUpdatedLimit: false,
  getWalletInteractionStatusUpdatedLimit: () =>
    get().walletInteractionStatusUpdatedLimit,
  setWalletInteractionStatusUpdatedLimit: (
    walletInteractionStatusUpdatedLimit: boolean
  ) =>
    set({
      walletInteractionStatusUpdatedLimit,
    }),
  getBalanceLoading: () => get().balanceLoading,
  setBalanceLoading: (balanceLoading: boolean) => set({ balanceLoading }),
  onAmountInChangeTrigger: ({
    amount,
    rate,
    limitStore,
  }: {
    amount: string;
    limitStore: ILimitStore;
    rate: string;
  }) => {
    limitStore.setTokenInAmount(amount);
    if (Big(amount || 0).lte(0)) {
      limitStore.setTokenOutAmount("0");
    } else {
      setAmountOut({ rate, tokenInAmount: amount, limitStore });
    }
  },
  onRateChangeTrigger: ({
    amount,
    tokenInAmount,
    limitStore,
    isReverse,
  }: {
    amount: string;
    tokenInAmount: string;
    limitStore: ILimitStore;
    isReverse?: boolean;
  }) => {
    const precision = toPrecision(amount, 8, false, false);
    const reversePrecision = getReverseRate(precision);
    if (isReverse) {
      limitStore.setRate(reversePrecision);
      limitStore.setReverseRate(precision);
    } else {
      limitStore.setRate(precision);
      limitStore.setReverseRate(reversePrecision);
    }
    if (Big(precision || 0).lte(0)) {
      limitStore.setTokenOutAmount("0");
    } else {
      setAmountOut({
        rate: isReverse ? reversePrecision : precision,
        tokenInAmount,
        limitStore,
      });
    }
  },
  onAmountOutChangeTrigger: ({
    amount,
    isLock,
    rate,
    tokenInAmount,
    limitStore,
  }: {
    amount: string;
    isLock: boolean;
    rate: string;
    tokenInAmount: string;
    limitStore: ILimitStore;
  }) => {
    const precision = toPrecision(amount, 8, false, false);
    limitStore.setTokenOutAmount(precision);
    if (isLock) {
      if (Big(rate || 0).gt(0)) {
        const newAmountIn = new Big(precision || 0).div(rate).toFixed();
        limitStore.setTokenInAmount(formatAmount(newAmountIn));
      }
    } else {
      if (Big(tokenInAmount || 0).gt(0)) {
        const newRate = toPrecision(
          new Big(precision || "0").div(tokenInAmount).toFixed(),
          8
        );
        limitStore.setRate(newRate);
        limitStore.setReverseRate(getReverseRate(newRate));
      }
    }
  },
  onFetchPool: async ({
    limitStore,
    persistLimitStore,
  }: {
    limitStore: ILimitStore;
    persistLimitStore: IPersistLimitStore;
  }) => {
    const dclPool = persistLimitStore.getDclPool();
    limitStore.setPoolFetchLoading(true);
    const latest_pool = await get_pool(dclPool.pool_id)
      .catch()
      .finally(() => {
        limitStore.setPoolFetchLoading(false);
      });
    if (latest_pool) {
      const filledPool = await fillDclPool(latest_pool);
      persistLimitStore.setDclPool(filledPool);
    }
  },
  getTokenIn: () => get().tokenIn,
  setTokenIn: (tokenIn: ITokenMetadata) =>
    set({
      tokenIn,
    }),
  getTokenOut: () => get().tokenOut,
  setTokenOut: (tokenOut: ITokenMetadata) =>
    set({
      tokenOut,
    }),
  getTokenInAmount: () => get().tokenInAmount,
  setTokenInAmount: (tokenInAmount: string) => set({ tokenInAmount }),
  getTokenOutAmount: () => get().tokenOutAmount,
  setTokenOutAmount: (tokenOutAmount: string) => set({ tokenOutAmount }),
  getRate: () => get().rate,
  setRate: (rate: string) => set({ rate }),
  getReverseRate: () => get().reverseRate,
  setReverseRate: (reverseRate: string) => set({ reverseRate }),
  getLock: () => get().lock,
  setLock: (lock: boolean) => set({ lock }),
  getMarketRate: () => get().marketRate,
  setMarketRate: (marketRate: string) => set({ marketRate }),
  getPoolFetchLoading: () => get().poolFetchLoading,
  setPoolFetchLoading: (poolFetchLoading: boolean) =>
    set({
      poolFetchLoading,
    }),
  getRateDiff: () => get().rateDiff,
  setRateDiff: (rateDiff: string) =>
    set({
      rateDiff,
    }),
  getReverse: () => get().reverse,
  setReverse: (reverse: boolean) =>
    set({
      reverse,
    }),
}));
