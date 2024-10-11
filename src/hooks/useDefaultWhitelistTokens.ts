import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import { useTokenStore, ITokenStore } from "../stores/token";
import { useAccountStore } from "../stores/account";
import getConfigV2 from "../utils/configV2";
import {
  getGlobalWhitelist,
  getAccountWhitelist,
  ftGetTokenMetadata,
} from "../services/token";
const configV2 = getConfigV2();
const { HIDDEN_TOKEN_LIST } = configV2;
export const useDefaultWhitelistTokens = () => {
  const [whiteListTokens, setWhiteListTokens] = useState<TokenMetadata[]>([]);
  const [globalWhitelistIds, setGlobalWhitelistIds] = useState<string[]>([]);
  const [accountWhitelistIds, setAccountWhitelistIds] = useState<string[]>();
  const [whitelistIdList, setWhitelistIdList] = useState<string[][]>([]);
  const tokenStore = useTokenStore() as ITokenStore;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.walletLoading;
  const owner = tokenStore.getOwner();
  useEffect(() => {
    setGlobalWhitelistTokenIds();
  }, []);
  useEffect(() => {
    if (!walletLoading) {
      if (accountId) {
        setAccountWhitelistTokenIds();
      } else {
        clearAccountWhitelistTokenIds();
      }
    }
  }, [accountId, walletLoading]);
  useEffect(() => {
    // get white list ids from cache
    setWhitelistIdList(getWhiteListIdsFromCache());
    // get white list ids from server
    if (
      !walletLoading &&
      globalWhitelistIds.length > 0 &&
      accountWhitelistIds
    ) {
      getWhiteListIdsFromServer().then((idList) => {
        setWhitelistIdList(idList);
      });
    }
  }, [
    accountId,
    owner,
    walletLoading,
    globalWhitelistIds.length,
    accountWhitelistIds?.length,
  ]);
  useEffect(() => {
    if (whitelistIdList.length > 0) {
      getWhitelistTokens();
    }
  }, [JSON.stringify(whitelistIdList || [])]);
  function getWhiteListIdsFromCache() {
    const whitelisted_tokens_ids =
      tokenStore.get_global_whitelisted_tokens_ids();
    const user_whitelisted_tokens_ids =
      tokenStore.get_user_whitelisted_tokens_ids();
    return [whitelisted_tokens_ids || [], user_whitelisted_tokens_ids || []];
  }
  async function getWhiteListIdsFromServer() {
    /* update cache logic (account whitelist) start */
    if (!accountId || accountId !== owner) {
      clearAccountWhitelistTokenIds();
      return [globalWhitelistIds, []];
    }
    /* update cache logic (account whitelist) end */
    return [globalWhitelistIds, accountWhitelistIds || []];
  }
  async function getWhitelistTokens() {
    const [globalWhitelistIds, accountWhitelistIds] = whitelistIdList;
    const whitelistIds = [
      ...new Set([...globalWhitelistIds, ...accountWhitelistIds]),
    ];
    const tokens = await getTokenMetaDatas(whitelistIds, accountWhitelistIds);
    setWhiteListTokens(tokens);
  }
  async function clearAccountWhitelistTokenIds() {
    tokenStore.set_user_whitelisted_tokens_ids([]);
    tokenStore.setOwner(accountId);
    setAccountWhitelistIds([]);
  }
  async function getTokenMetaDatas(
    tokenIds: string[],
    accountWhitelistIds: string[]
  ) {
    const metadatas = (
      await Promise.all(tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId)))
    ).filter((_) => _);
    return metadatas;
  }
  async function setGlobalWhitelistTokenIds() {
    const globalWhitelist = await getGlobalWhitelist();
    const availableIds = globalWhitelist.filter(
      (id) => !HIDDEN_TOKEN_LIST.includes(id)
    );
    tokenStore.set_global_whitelisted_tokens_ids(availableIds);
    setGlobalWhitelistIds(availableIds);
  }
  async function setAccountWhitelistTokenIds() {
    const accountWhitelist = await getAccountWhitelist();
    tokenStore.set_user_whitelisted_tokens_ids(accountWhitelist || []);
    tokenStore.setOwner(accountId);
    setAccountWhitelistIds(accountWhitelist || []);
  }
  return {
    whiteListTokens,
    globalWhitelistIds,
    accountWhitelistIds,
  };
};
