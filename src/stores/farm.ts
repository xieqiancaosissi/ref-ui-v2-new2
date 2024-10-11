import { create } from "zustand";

interface IFarmStore {
  init: () => void;
  getConfig: () => any;
  get_user_unWithDraw_rewards: () => any;
  get_user_seeds_and_unClaimedRewards: () => any;
  setInit: (fn: () => void) => void;
  setGetConfig: (fn: () => any) => void;
  setGet_user_unWithDraw_rewards: (fn: () => any) => void;
  setGet_user_seeds_and_unClaimedRewards: (fn: () => any) => void;
}

export const useFarmStore = create<IFarmStore>((set) => ({
  init: () => {},
  getConfig: () => ({}),
  get_user_unWithDraw_rewards: () => ({}),
  get_user_seeds_and_unClaimedRewards: () => ({}),
  setInit: (fn) => set({ init: fn }),
  setGetConfig: (fn) => set({ getConfig: fn }),
  setGet_user_unWithDraw_rewards: (fn) =>
    set({ get_user_unWithDraw_rewards: fn }),
  setGet_user_seeds_and_unClaimedRewards: (fn) =>
    set({ get_user_seeds_and_unClaimedRewards: fn }),
}));
