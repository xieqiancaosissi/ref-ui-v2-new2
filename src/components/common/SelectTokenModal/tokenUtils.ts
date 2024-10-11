import { ITokenMetadata } from "@/interfaces/tokens";
import { getTokenBalance, ftGetTokenMetadata } from "@/services/token";
import { toReadableNumber } from "@/utils/numbers";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { isRiskTokenBySuffix } from "@/utils/commonUtil";
import { TokenMetadata } from "@/services/ft-contract";
export function updateStoreBalance({
  token_in,
  token_out,
  tokenStore,
}: {
  token_in: ITokenMetadata;
  token_out: ITokenMetadata;
  tokenStore: any;
}) {
  const { data: defaultAccountTokens, done: defaultDone } =
    tokenStore.getDefaultAccountTokens();
  const { data: tknAccountTokens, done: tknDone } =
    tokenStore.getTknAccountTokens();
  const { data: tknxAccountTokens, done: tknxDone } =
    tokenStore.getTknxAccountTokens();
  const { data: mcAccountTokens, done: mcDone } =
    tokenStore.getMcAccountTokens();
  const index_in_default = defaultAccountTokens.findIndex(
    (t: ITokenMetadata) => t.id == token_in.id && t.symbol == token_in.symbol
  );
  const index_in_tkn = tknAccountTokens.findIndex(
    (t: ITokenMetadata) => t.id == token_in.id && t.symbol == token_in.symbol
  );
  const index_in_tknx = tknxAccountTokens.findIndex(
    (t: ITokenMetadata) => t.id == token_in.id && t.symbol == token_in.symbol
  );
  const index_in_mc = mcAccountTokens.findIndex(
    (t: ITokenMetadata) => t.id == token_in.id && t.symbol == token_in.symbol
  );
  const index_out_default = defaultAccountTokens.findIndex(
    (t: ITokenMetadata) => t.id == token_in.id && t.symbol == token_out.symbol
  );
  const index_out_tkn = tknAccountTokens.findIndex(
    (t: ITokenMetadata) => t.id == token_in.id && t.symbol == token_out.symbol
  );
  const index_out_tknx = tknxAccountTokens.findIndex(
    (t: ITokenMetadata) => t.id == token_in.id && t.symbol == token_out.symbol
  );
  const index_out_mc = mcAccountTokens.findIndex(
    (t: ITokenMetadata) => t.id == token_in.id && t.symbol == token_out.symbol
  );
  if (index_in_default > -1) {
    defaultAccountTokens[index_in_default] = token_in;
    tokenStore.setDefaultAccountTokens({
      data: defaultAccountTokens,
      done: defaultDone,
    });
  }
  if (index_in_tkn > -1) {
    tknAccountTokens[index_in_tkn] = token_in;
    tokenStore.setTknAccountTokens({
      data: tknAccountTokens,
      done: tknDone,
    });
  }
  if (index_in_tknx > -1) {
    tknxAccountTokens[index_in_tknx] = token_in;
    tokenStore.setTknxAccountTokens({
      data: tknxAccountTokens,
      done: tknxDone,
    });
  }
  if (index_in_mc > -1) {
    mcAccountTokens[index_in_mc] = token_in;
    tokenStore.setMcAccountTokens({
      data: mcAccountTokens,
      done: mcDone,
    });
  }
  if (index_out_default > -1) {
    defaultAccountTokens[index_out_default] = token_out;
    tokenStore.setDefaultAccountTokens({
      data: defaultAccountTokens,
      done: defaultDone,
    });
  }
  if (index_out_tkn > -1) {
    tknAccountTokens[index_out_tkn] = token_out;
    tokenStore.setTknAccountTokens({
      data: tknAccountTokens,
      done: tknDone,
    });
  }
  if (index_out_tknx > -1) {
    tknxAccountTokens[index_out_tknx] = token_out;
    tokenStore.setTknxAccountTokens({
      data: tknxAccountTokens,
      done: tknxDone,
    });
  }
  if (index_out_mc > -1) {
    mcAccountTokens[index_out_mc] = token_out;
    tokenStore.setMcAccountTokens({
      data: mcAccountTokens,
      done: mcDone,
    });
  }
}
export async function setSwapTokenAndBalances({
  tokenInId,
  tokenOutId,
  accountId,
  swapStore,
  persistSwapStore,
  tokenStore,
  global_whitelisted_tokens_ids,
  doNotshowLoading,
}: {
  tokenInId: string;
  tokenOutId: string;
  accountId: string;
  swapStore: any;
  persistSwapStore: any;
  tokenStore: any;
  global_whitelisted_tokens_ids: string[];
  doNotshowLoading?: boolean;
}) {
  let TOKEN_IN, TOKEN_OUT;
  const in_meta_pending = ftGetTokenMetadata(tokenInId, true);
  const out_meta_pending = ftGetTokenMetadata(tokenOutId, true);
  const metas = await Promise.all([in_meta_pending, out_meta_pending]);
  if (accountId) {
    if (!doNotshowLoading) {
      swapStore.setBalanceLoading(true);
    }
    const in_pending = getTokenBalance(
      tokenInId == "near" ? "NEAR" : tokenInId
    );
    const out_pending = getTokenBalance(
      tokenOutId == "near" ? "NEAR" : tokenOutId
    );
    const balances = await Promise.all([in_pending, out_pending]);
    if (window.selectTokenUpdated) {
      // Prevents problems caused by asynchronism
      window.selectTokenUpdated = undefined;
      return;
    }
    TOKEN_IN = {
      ...metas[0],
      balanceDecimal: balances[0],
      balance: toReadableNumber(metas[0].decimals, balances[0]),
    };
    TOKEN_OUT = {
      ...metas[1],
      balanceDecimal: balances[1],
      balance: toReadableNumber(metas[1].decimals, balances[1]),
    };
    updateStoreBalance({
      token_in: TOKEN_IN,
      token_out: TOKEN_OUT,
      tokenStore,
    });
  } else {
    TOKEN_IN = metas[0];
    TOKEN_OUT = metas[1];
  }
  if (
    !global_whitelisted_tokens_ids.includes(TOKEN_IN.id) &&
    isRiskTokenBySuffix(TOKEN_IN)
  ) {
    TOKEN_IN.isRisk = true;
  }
  if (
    !global_whitelisted_tokens_ids.includes(TOKEN_OUT.id) &&
    isRiskTokenBySuffix(TOKEN_OUT)
  ) {
    TOKEN_OUT.isRisk = true;
  }
  swapStore.setTokenIn(TOKEN_IN);
  swapStore.setTokenOut(TOKEN_OUT);
  persistSwapStore.setTokenInId(getTokenUIId(TOKEN_IN));
  persistSwapStore.setTokenOutId(getTokenUIId(TOKEN_OUT));
  swapStore.setBalanceLoading(false);
}
export function purgeTokensByIds(
  tokens: TokenMetadata[],
  excludedIds?: string[]
) {
  if (tokens?.length && excludedIds?.length) {
    return tokens.filter((token) => !excludedIds.includes(getTokenUIId(token)));
  }

  return tokens;
}
