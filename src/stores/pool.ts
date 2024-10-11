import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type PoolType = () => {
  poolListLoading: boolean;
  getPoolListLoading: () => boolean;
  setPoolListLoading: (status: boolean) => void;
  poolActiveTab: string;
  setPoolActiveTab: (tab: string) => void;
  stableAddLiqVisible: boolean;
  stableRemoveLiqVisible: boolean;
  setStableAddLiqVisible: (status: boolean) => void;
  setStableRemoveLiqVisible: (status: boolean) => void;
  dclHideLowTVL: boolean;
  setDclHideLowTVL: (status: boolean) => void;
};
// export const usePoolStore = create<PoolType>((set, get) => ({
//   poolListLoading: true,
//   getPoolListLoading: () => get().poolListLoading,
//   setPoolListLoading: (poolListLoading: boolean) => {
//     set({ poolListLoading });
//   },
//   poolActiveTab: "classic",
//   setPoolActiveTab: (poolActiveTab: string) => {
//     set({ poolActiveTab });
//   },
//   stableAddLiqVisible: false,
//   stableRemoveLiqVisible: false,
//   setStableAddLiqVisible: (stableAddLiqVisible: boolean) => {
//     set({ stableAddLiqVisible });
//   },
//   setStableRemoveLiqVisible: (stableRemoveLiqVisible: boolean) => {
//     set({ stableRemoveLiqVisible });
//   },
// }));

export const usePoolStore = create<any>(
  persist(
    (set, get) => ({
      poolListLoading: true,
      getPoolListLoading: () => get().poolListLoading,
      setPoolListLoading: (poolListLoading: boolean) => {
        set({ poolListLoading });
      },
      poolActiveTab: "classic",
      setPoolActiveTab: (poolActiveTab: string) => {
        set({ poolActiveTab });
      },
      stableAddLiqVisible: false,
      stableRemoveLiqVisible: false,
      setStableAddLiqVisible: (stableAddLiqVisible: boolean) => {
        set({ stableAddLiqVisible });
      },
      setStableRemoveLiqVisible: (stableRemoveLiqVisible: boolean) => {
        set({ stableRemoveLiqVisible });
      },
      dclHideLowTVL: true,
      setDclHideLowTVL: (dclHideLowTVL: boolean) => {
        set({ dclHideLowTVL });
      },
      classicHideLowTVL: true,
      setClassicHideLowTVL: (classicHideLowTVL: boolean) => {
        set({ classicHideLowTVL });
      },
    }),
    {
      name: "my-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
