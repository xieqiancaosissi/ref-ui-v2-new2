import { create } from "zustand";

export const introCurrentPageStore = create((set, get: any) => ({
  currentPage: 1,
  hasLoaingOver: false,
  setCurrentPage: (currentPage: any) => set({ currentPage }),
  getCurrentPage: () => get().currentPage,
  setHasLoaingOver: (hasLoaingOver: any) => set({ hasLoaingOver }),
  getHasLoaingOver: () => get().hasLoaingOver,
}));
