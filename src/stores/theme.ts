import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Itheme = "dark" | "light";
export const useThemeStore = create(
  persist(
    (set, get: any) => ({
      theme: "dark",
      getTheme: () => get().theme,
      setTheme: (theme: Itheme) => {
        set({
          theme,
        });
      },
    }),
    {
      name: "_cached_theme",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
