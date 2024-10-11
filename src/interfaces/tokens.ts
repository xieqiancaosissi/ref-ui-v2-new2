import { TokenMetadata } from "@/services/ft-contract";
export interface ISelectTokens {
  defaultList: TokenMetadata[];
  autoList: TokenMetadata[];
  totalList: TokenMetadata[];
  done: boolean;
}
export interface IGlobalWhitelistData {
  globalWhitelist: string[];
  done: boolean;
}
export interface IAccountWhitelistData {
  accountWhitelist: string[];
  done: boolean;
}
export interface IPostfixData {
  postfix: string[];
  done: boolean;
}
export interface IListTokensData {
  listTokens: TokenMetadata[];
  done: boolean;
}
export interface ITokenMetadata extends TokenMetadata {
  balanceDecimal?: string;
  balance?: string;
}

export interface IUITokens {
  data: ITokenMetadata[];
  done: boolean;
}
