import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import getConfigV2 from "../utils/configV2";
import { useTokenStore, ITokenStore } from "../stores/token";
import { get_auto_whitelisted_postfix_list } from "../services/token";
import {
  getGlobalWhitelist,
  getAccountWhitelist,
  ftGetTokenMetadata,
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
  ISelectTokens,
} from "@/interfaces/tokens";
const { HIDDEN_TOKEN_LIST } = getConfigV2();

const useAllWhiteTokens = () => {
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
  const initSelectTokensData = {
    defaultList: [],
    autoList: [],
    totalList: [],
    done: false,
  };
  const [selectTokens, setSelectTokens] =
    useState<ISelectTokens>(initSelectTokensData);
  const tokenStore = useTokenStore() as ITokenStore;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
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
  useEffect(() => {
    if (
      globalWhitelistData.done &&
      postfixData.done &&
      listTokensData.done &&
      accountWhitelistData.done
    ) {
      getAllWhiteTokens();
    }
  }, [
    globalWhitelistData.done,
    postfixData.done,
    listTokensData.done,
    JSON.stringify(accountWhitelistData || {}),
  ]);
  async function getAllWhiteTokens() {
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
    const reault = {
      defaultList: defaultTokens,
      autoList: autoTokens,
      totalList: [...defaultTokens, ...autoTokens],
      done: true,
    };
    setSelectTokens(reault);
    return reault;
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

  return selectTokens;
};
export default useAllWhiteTokens;
