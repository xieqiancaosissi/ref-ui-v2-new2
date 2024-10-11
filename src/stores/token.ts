import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ITokenMetadata, IUITokens } from "@/interfaces/tokens";
import getConfigV2 from "@/utils/configV2";
export type ITokenStore = {
  get_global_whitelisted_tokens_ids: () => string[];
  set_global_whitelisted_tokens_ids: (whitelisted_tokens_ids: string[]) => void;
  get_auto_whitelisted_postfix: () => string[];
  set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) => void;
  get_common_tokens: () => ITokenMetadata[];
  set_common_tokens: (common_tokens: ITokenMetadata[]) => void;
  get_common_tokens_tag: () => string;
  set_common_tokens_tag: (common_tokens_tag: string) => void;
  get_user_whitelisted_tokens_ids: () => string[];
  set_user_whitelisted_tokens_ids: (
    user_whitelisted_tokens_ids: string[]
  ) => void;
  getDefaultAccountTokens: () => IUITokens;
  setDefaultAccountTokens: (defaultAccountTokens: IUITokens) => void;
  getTknAccountTokens: () => IUITokens;
  setTknAccountTokens: (tknAccountTokens: IUITokens) => void;
  getTknxAccountTokens: () => IUITokens;
  setTknxAccountTokens: (tknxAccountTokens: IUITokens) => void;
  getMcAccountTokens: () => IUITokens;
  setMcAccountTokens: (mcAccountTokens: IUITokens) => void;
  getOwner: () => string;
  setOwner: (owner: string) => void;
  getBalancesOwner: () => string;
  setBalancesOwner: (balancesOwner: string) => void;
  get_update_time: () => number;
  set_update_time: (update_time: number) => void;
};
export const useTokenStore = create(
  persist(
    (set, get: any) => ({
      global_whitelisted_tokens_ids: [],
      auto_whitelisted_postfix: [],
      common_tokens: [],
      common_tokens_tag: "",
      user_whitelisted_tokens_ids: [],
      defaultAccountTokens: { data: [], done: false },
      tknAccountTokens: { data: [], done: false },
      tknxAccountTokens: { data: [], done: false },
      mcAccountTokens: { data: [], done: false },
      owner: "",
      balancesOwner: "",
      update_time: undefined,
      get_update_time: () => get().update_time,
      set_update_time: (update_time: number) => set({ update_time }),
      get_global_whitelisted_tokens_ids: () => get().whitelisted_tokens_ids,
      set_global_whitelisted_tokens_ids: (whitelisted_tokens_ids: string[]) =>
        set({ whitelisted_tokens_ids }),
      get_auto_whitelisted_postfix: () => get().auto_whitelisted_postfix,
      set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) =>
        set({ auto_whitelisted_postfix }),
      get_common_tokens: () => {
        const commonTokens = get().common_tokens;
        const hidden_ids = getConfigV2().HIDDEN_TOKEN_LIST;
        const filteredTokens = commonTokens?.filter(
          (token: ITokenMetadata) => !hidden_ids.includes(token.id)
        );
        return filteredTokens;
      },
      set_common_tokens: (common_tokens: ITokenMetadata[]) =>
        set({ common_tokens }),
      get_common_tokens_tag: () => get().common_tokens_tag,
      set_common_tokens_tag: (common_tokens_tag: string) =>
        set({ common_tokens_tag }),
      get_user_whitelisted_tokens_ids: () => get().user_whitelisted_tokens_ids,
      set_user_whitelisted_tokens_ids: (
        user_whitelisted_tokens_ids: string[]
      ) => set({ user_whitelisted_tokens_ids }),
      getDefaultAccountTokens: () => get().defaultAccountTokens,
      setDefaultAccountTokens: (defaultAccountTokens: IUITokens) =>
        set({ defaultAccountTokens }),
      getTknAccountTokens: () => get().tknAccountTokens,
      setTknAccountTokens: (tknAccountTokens: IUITokens) =>
        set({ tknAccountTokens }),
      getTknxAccountTokens: () => get().tknxAccountTokens,
      setTknxAccountTokens: (tknxAccountTokens: IUITokens) =>
        set({ tknxAccountTokens }),
      getMcAccountTokens: () => get().mcAccountTokens,
      setMcAccountTokens: (mcAccountTokens: IUITokens) =>
        set({ mcAccountTokens }),
      getOwner: () => get().owner,
      setOwner: (owner: string) => set({ owner }),
      getBalancesOwner: () => get().balancesOwner,
      setBalancesOwner: (balancesOwner: string) =>
        set({
          balancesOwner,
        }),
    }),
    {
      name: "_cached_tokens",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface ITokenStoreRealTime {
  get_update_loading: () => boolean;
  set_update_loading: (update_loading: boolean) => void;
  get_tokenUpdatedSerialNumber: () => number;
  set_tokenUpdatedSerialNumber: (tokenUpdatedSerialNumber: number) => void;
}
export const useTokenStoreRealTime = create<ITokenStoreRealTime>(
  (set: any, get: any) => ({
    update_loading: true,
    tokenUpdatedSerialNumber: 0,
    get_update_loading: () => get().update_loading,
    set_update_loading: (update_loading: boolean) => set({ update_loading }),
    get_tokenUpdatedSerialNumber: () => get().tokenUpdatedSerialNumber,
    set_tokenUpdatedSerialNumber: (tokenUpdatedSerialNumber: number) =>
      set({ tokenUpdatedSerialNumber }),
  })
);
