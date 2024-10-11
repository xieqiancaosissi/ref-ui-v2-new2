import { useEffect, useMemo, useState } from "react";
import { useDebounce, useThrottle } from "react-use";
import { TokenMetadata } from "../services/ft-contract";
import getConfigV2 from "../utils/configV2";
import {
  useTokenStore,
  ITokenStore,
  useTokenStoreRealTime,
} from "../stores/token";
import {
  getGlobalWhitelist,
  getAccountWhitelist,
  ftGetTokenMetadata,
  getTokenBalance,
  get_auto_whitelisted_postfix_list,
} from "../services/token";
import { useAccountStore } from "../stores/account";
import db from "../db/RefDatabase";
import { getTokens } from "../services/indexer";
import { getWnearToken } from "@/services/swap/swapUtils";
import {
  IGlobalWhitelistData,
  IAccountWhitelistData,
  IListTokensData,
  IPostfixData,
  ITokenMetadata,
  IUITokens,
} from "@/interfaces/tokens";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { toReadableNumber } from "@/utils/numbers";
import { COMMON_TOKENS_TAG } from "@/utils/constantLocal";
import { is_specific_suffix } from "@/utils/commonUtil";
import { TKNX_SUFFIX, TKN_SUFFIX, MC_SUFFIX } from "@/utils/constant";
const { HIDDEN_TOKEN_LIST } = getConfigV2();

const useAllWhiteTokensWithBalances = () => {
  const initTokenAccountData = {
    data: [],
    done: false,
  };
  const [globalWhitelistData, setGlobalWhitelistData] =
    useState<IGlobalWhitelistData>({
      globalWhitelist: [],
      done: false,
    });
  const [accountWhitelistData, setAccountWhitelistData] =
    useState<IAccountWhitelistData>({
      accountWhitelist: [],
      done: false,
    });
  const [postfixData, setPostfixData] = useState<IPostfixData>({
    postfix: [],
    done: false,
  });
  const [listTokensData, setListTokensData] = useState<IListTokensData>({
    listTokens: [],
    done: false,
  });
  const [defaultAccountTokensHook, setDefaultAccountTokensHook] =
    useState<IUITokens>(initTokenAccountData);
  const [tknAccountTokensHook, setTknAccountTokensHook] =
    useState<IUITokens>(initTokenAccountData);
  const [tknxAccountTokensHook, setTknxAccountTokensHook] =
    useState<IUITokens>(initTokenAccountData);
  const [mcAccountTokensHook, setMcAccountTokensHook] =
    useState<IUITokens>(initTokenAccountData);
  const tokenStore = useTokenStore() as ITokenStore;
  const tokenStoreRealTime = useTokenStoreRealTime();
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  const balancesOwner = tokenStore.getBalancesOwner();
  const defaultAccountTokens = tokenStore.getDefaultAccountTokens();
  const tknAccountTokens = tokenStore.getTknAccountTokens();
  const tknxAccountTokens = tokenStore.getTknxAccountTokens();
  const mcAccountTokens = tokenStore.getMcAccountTokens();
  const tokenUpdatedSerialNumber =
    tokenStoreRealTime.get_tokenUpdatedSerialNumber();
  const sourceDataFetchDone = useMemo(() => {
    return !!(
      globalWhitelistData.done &&
      postfixData.done &&
      listTokensData.done
    );
  }, [globalWhitelistData.done, postfixData.done, listTokensData.done]);
  useEffect(() => {
    getGlobalWhitelistTokenIds();
    getAutoWhitelistedPostfix();
    getAllTokens();
  }, []);
  useEffect(() => {
    if (!walletLoading) {
      getAccountWhitelistTokenIds();
    }
  }, [accountId, walletLoading]);
  useThrottle(() => {
    // get data from cache
    if (!walletLoading) {
      if (balancesOwner == accountId) {
        if (defaultAccountTokens.done) {
          setDefaultAccountTokensHook(defaultAccountTokens);
        }
        if (tknAccountTokens.done) {
          setTknAccountTokensHook(tknAccountTokens);
        }
        if (tknxAccountTokens.done) {
          setTknxAccountTokensHook(tknxAccountTokens);
        }
        if (mcAccountTokens.done) {
          setMcAccountTokensHook(mcAccountTokens);
        }
      }
    }
  }, 500);
  useEffect(() => {
    if (!walletLoading && balancesOwner !== accountId) {
      // clear cache data
      clearCacheUITokens();
    }
  }, [accountId, walletLoading, balancesOwner]);
  useDebounce(
    () => {
      if (!walletLoading && sourceDataFetchDone && accountWhitelistData.done) {
        getUITokensFromServer();
      }
    },
    1000,
    [
      sourceDataFetchDone,
      accountId,
      walletLoading,
      JSON.stringify(accountWhitelistData),
      tokenUpdatedSerialNumber,
    ]
  );
  function clearCacheUITokens() {
    setDefaultAccountTokensHook(initTokenAccountData);
    setTknAccountTokensHook(initTokenAccountData);
    setTknxAccountTokensHook(initTokenAccountData);
    setMcAccountTokensHook(initTokenAccountData);
  }
  async function getTokenMetaDatas(tokenIds: string[]) {
    const metadatas = (
      await Promise.all(tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId)))
    ).filter((_) => _);
    return metadatas;
  }
  async function getGlobalWhitelistTokenIds() {
    const globalWhitelistInCache =
      tokenStore.get_global_whitelisted_tokens_ids();
    if (globalWhitelistInCache?.length) {
      setGlobalWhitelistData({
        globalWhitelist: globalWhitelistInCache,
        done: true,
      });
    }
    getGlobalWhitelist().then((globalWhitelist) => {
      setGlobalWhitelistData({
        globalWhitelist,
        done: true,
      });
      tokenStore.set_global_whitelisted_tokens_ids(globalWhitelist);
    });
  }
  async function getAccountWhitelistTokenIds() {
    setAccountWhitelistData({
      accountWhitelist: [],
      done: false,
    });
    if (accountId) {
      const accountWhitelist = await getAccountWhitelist();
      setAccountWhitelistData({
        accountWhitelist,
        done: true,
      });
      tokenStore.set_user_whitelisted_tokens_ids(accountWhitelist);
    } else {
      setAccountWhitelistData({
        accountWhitelist: [],
        done: true,
      });
      tokenStore.set_user_whitelisted_tokens_ids([]);
    }
  }
  async function getAutoWhitelistedPostfix() {
    const postfixListInCache = tokenStore.get_auto_whitelisted_postfix();
    if (postfixListInCache?.length) {
      setPostfixData({
        postfix: postfixListInCache,
        done: true,
      });
    }
    get_auto_whitelisted_postfix_list().then((postfixList) => {
      setPostfixData({
        postfix: postfixList || [],
        done: true,
      });
      tokenStore.set_auto_whitelisted_postfix(postfixList || []);
    });
  }
  async function getAllTokens() {
    let allTokens = (await db.queryAllTokens()) || [];
    if (!allTokens.length) {
      const tokens = await getTokens();
      allTokens = Object.keys(tokens).reduce((acc, id) => {
        // @ts-ignore
        acc.push({
          id,
          ...tokens[id],
        });
        return acc;
      }, []);
    }
    setListTokensData({
      listTokens: allTokens,
      done: true,
    });
  }
  async function getUITokensFromServer() {
    if (tokenUpdatedSerialNumber == 0) {
      clearCacheUITokens();
    }
    const { defaultTokens, tknTokens, tknxTokens, mcTokens, done } =
      (await getTokensFromServer()) as {
        defaultTokens: TokenMetadata[];
        tknTokens: TokenMetadata[];
        tknxTokens: TokenMetadata[];
        mcTokens: TokenMetadata[];
        done: boolean;
      };
    if (done) {
      tokenStore.setBalancesOwner(accountId);
      if (accountId) {
        getTokensBalance(defaultTokens)
          .then((res) => {
            setDefaultAccountTokensHook({ data: res, done: true });
          })
          .finally(() => {
            tokenStoreRealTime.set_update_loading(false);
            tokenStore.set_update_time(new Date().getTime());
          });
        getTokensBalance(tknTokens).then((res) => {
          setTknAccountTokensHook({ data: res, done: true });
        });
        getTokensBalance(tknxTokens).then((res) => {
          setTknxAccountTokensHook({ data: res, done: true });
        });
        getTokensBalance(mcTokens).then((res) => {
          setMcAccountTokensHook({ data: res, done: true });
        });
      } else {
        setDefaultAccountTokensHook({ data: defaultTokens, done: true });
        setTknAccountTokensHook({ data: tknTokens, done: true });
        setTknxAccountTokensHook({ data: tknxTokens, done: true });
        setMcAccountTokensHook({ data: mcTokens, done: true });
        tokenStore.set_update_time(new Date().getTime());
      }
    }
  }
  async function getTokensBalance(tokens: TokenMetadata[]) {
    const balancesPending = tokens.map((token: TokenMetadata) => {
      return getTokenBalance(getTokenUIId(token) == "near" ? "NEAR" : token.id);
    });
    const balances = await Promise.all(balancesPending);
    const tokensWithBalance = tokens.map((token: TokenMetadata, index) => {
      return {
        ...token,
        balanceDecimal: balances[index],
        balance: toReadableNumber(token.decimals, balances[index]),
      };
    }) as ITokenMetadata[];
    return tokensWithBalance;
  }
  async function getTokensFromServer() {
    if (
      !(
        globalWhitelistData.done &&
        accountWhitelistData.done &&
        postfixData.done &&
        listTokensData.done
      )
    )
      return {
        defaultTokens: [],
        tknTokens: [],
        tknxTokens: [],
        mcTokens: [],
        done: false,
      };
    tokenStore.setOwner(accountId);
    const defaultWhitelistIds = [
      ...new Set([
        ...globalWhitelistData.globalWhitelist,
        ...accountWhitelistData.accountWhitelist,
      ]),
    ];
    const defaultWhiteTokens = await getTokenMetaDatas(defaultWhitelistIds);
    const wnearToken = getWnearToken(defaultWhiteTokens);
    if (wnearToken) {
      defaultWhiteTokens.push(wnearToken);
    }
    const white_list_token_map: Record<string, TokenMetadata> =
      defaultWhiteTokens.reduce((sum, cur) => {
        return { ...sum, [cur.id]: cur };
      }, {});

    const auto_whitelisted_tokens = listTokensData.listTokens.filter(
      (token: TokenMetadata) =>
        postfixData.postfix?.some((p) => token.id.includes(p)) &&
        !white_list_token_map[token.id]
    );
    const defaultTokens = defaultWhiteTokens
      .map((token) => {
        if (
          !globalWhitelistData.globalWhitelist.includes(token.id) &&
          postfixData.postfix?.some((p) => token.id.includes(p))
        ) {
          return {
            ...token,
            isRisk: true,
          };
        }
        return token;
      })
      .filter((token) => !HIDDEN_TOKEN_LIST.includes(token.id));
    const autoTokens = auto_whitelisted_tokens
      .map((token) => {
        return {
          ...token,
          isRisk: true,
        };
      })
      .filter((token) => !HIDDEN_TOKEN_LIST.includes(token.id));
    // init common tokens
    initCommonTokens();
    const tknTokens = autoTokens.filter((t) =>
      is_specific_suffix(t.id, TKN_SUFFIX)
    );
    const tknxTokens = autoTokens.filter((t) =>
      is_specific_suffix(t.id, TKNX_SUFFIX)
    );
    const mcTokens = autoTokens.filter((t) =>
      is_specific_suffix(t.id, MC_SUFFIX)
    );
    const reault = {
      defaultTokens,
      tknTokens,
      tknxTokens,
      mcTokens,
      done: true,
    };
    return reault;
  }
  async function initCommonTokens() {
    // init common tokens
    const tag = tokenStore.get_common_tokens_tag();
    if (tag !== COMMON_TOKENS_TAG) {
      const { INIT_COMMON_TOKEN_IDS } = getConfigV2();
      const init_common_tokens = await getTokenMetaDatas(INIT_COMMON_TOKEN_IDS);
      tokenStore.set_common_tokens(init_common_tokens);
      tokenStore.set_common_tokens_tag(COMMON_TOKENS_TAG);
    }
  }
  return {
    defaultAccountTokensHook,
    tknAccountTokensHook,
    tknxAccountTokensHook,
    mcAccountTokensHook,
  };
};

export default useAllWhiteTokensWithBalances;
