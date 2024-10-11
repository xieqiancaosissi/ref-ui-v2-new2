import { ITokenMetadata } from "@/interfaces/tokens";
import { TokenPrice } from "@/db/RefDatabase";
import React, { createContext } from "react";
export interface ISelectTokenContext {
  onRequestClose: () => void;
  onSelect: (token: ITokenMetadata) => void;
  searchText: string;
  allTokenPrices: Record<string, TokenPrice>;
  setAddTokenError: (error: any) => void;
}
export const SelectTokenContext = createContext<ISelectTokenContext>({
  onRequestClose: () => ({}),
  onSelect: () => ({}),
  searchText: "",
  allTokenPrices: {},
  setAddTokenError: () => ({}),
});
