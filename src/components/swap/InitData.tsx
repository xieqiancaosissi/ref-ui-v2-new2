import React, { useEffect } from "react";
import getConfigV2 from "@/utils/configV2";
import { usePersistSwapStore, useSwapStore } from "@/stores/swap";
import { useTokenStore, ITokenStore } from "@/stores/token";
import { useAccountStore } from "@/stores/account";
import useAllWhiteTokensWithBalances from "@/hooks/useAllWhiteTokensWithBalances";
import { setSwapTokenAndBalances } from "@/components/common/SelectTokenModal/tokenUtils";
import { IUITokens } from "@/interfaces/tokens";
import { getAllTokenPrices } from "@/services/farm";
const configV2 = getConfigV2();
const { INIT_SWAP_PAIRS } = configV2;
function InitData() {
  const {
    defaultAccountTokensHook,
    tknAccountTokensHook,
    tknxAccountTokensHook,
    mcAccountTokensHook,
  } = useAllWhiteTokensWithBalances();
  const persistSwapStore = usePersistSwapStore();
  const swapStore = useSwapStore();
  const tokenStore = useTokenStore() as ITokenStore;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  const global_whitelisted_tokens_ids =
    tokenStore.get_global_whitelisted_tokens_ids();
  const tokenInId = persistSwapStore.getTokenInId();
  const tokenOutId = persistSwapStore.getTokenOutId();
  useEffect(() => {
    getAllTokenPrices().then((res) => {
      swapStore.setAllTokenPrices(res);
    });
  }, []);
  useEffect(() => {
    if (!walletLoading && global_whitelisted_tokens_ids?.length > 0) {
      const tokenInIdStore = persistSwapStore.getTokenInId();
      const tokenOutIdStore = persistSwapStore.getTokenOutId();
      const tokenInId = getTokenId({
        idFromStore: tokenInIdStore,
        isIn: true,
      });
      const tokenOutId = getTokenId({
        idFromStore: tokenOutIdStore,
        isIn: false,
      });
      setSwapTokenAndBalances({
        tokenInId,
        tokenOutId,
        accountId,
        swapStore,
        persistSwapStore,
        tokenStore,
        global_whitelisted_tokens_ids,
      });
    }
  }, [walletLoading, accountId, global_whitelisted_tokens_ids?.length]);
  useEffect(() => {
    if (tokenInId && tokenOutId && accountId) {
      const timerId = setInterval(() => {
        setSwapTokenAndBalances({
          tokenInId,
          tokenOutId,
          accountId,
          swapStore,
          persistSwapStore,
          tokenStore,
          global_whitelisted_tokens_ids,
          doNotshowLoading: true,
        });
      }, 10000);
      return () => clearInterval(timerId);
    }
  }, [tokenInId, tokenOutId, accountId]);
  useEffect(() => {
    tokenStore.setDefaultAccountTokens(
      defaultAccountTokensHook || ({} as IUITokens)
    );
  }, [JSON.stringify(defaultAccountTokensHook || {})]);
  useEffect(() => {
    tokenStore.setTknAccountTokens(tknAccountTokensHook || ({} as IUITokens));
  }, [JSON.stringify(tknAccountTokensHook || {})]);
  useEffect(() => {
    tokenStore.setTknxAccountTokens(tknxAccountTokensHook || ({} as IUITokens));
  }, [JSON.stringify(tknxAccountTokensHook || {})]);
  useEffect(() => {
    tokenStore.setMcAccountTokens(mcAccountTokensHook || ({} as IUITokens));
  }, [JSON.stringify(mcAccountTokensHook || {})]);
  function getTokenId({
    idFromStore,
    isIn,
  }: {
    idFromStore: string;
    isIn: boolean;
  }) {
    const tokenId =
      idFromStore || (isIn ? INIT_SWAP_PAIRS[0] : INIT_SWAP_PAIRS[1]);
    return tokenId;
  }
  return null;
}
export default React.memo(InitData);
