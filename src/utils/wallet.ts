import type { Wallet } from "@near-wallet-selector/core";
import { CONST_ACKNOWLEDGE_WALLET_RISK } from "@/utils/constantLocal";

export function getSelector() {
  return window.selector;
}
export async function getCurrentWallet(): Promise<Wallet> {
  return await window.selector?.wallet();
}
export function getSelectedWalletId(): string {
  return window.selector?.store?.getState()?.selectedWalletId ?? "";
}
export function getAccountId() {
  return window?.accountId;
}
export function showWalletSelectorModal(riskModalShow: any) {
  const status = localStorage.getItem(CONST_ACKNOWLEDGE_WALLET_RISK);
  if (status == "1") {
    window.modal.show();
  } else {
    riskModalShow(true);
  }
}

export function addQueryParams(
  baseUrl: string,
  queryParams: {
    [name: string]: string;
  }
) {
  const url = new URL(baseUrl);
  for (const key in queryParams) {
    const param = queryParams[key];
    if (param) url.searchParams.set(key, param);
  }
  return url.toString();
}
export function getUsedKey() {
  return window.selector?.store?.getState()?.accounts?.[0].publicKey;
}

export const webWalletIds = [
  "my-near-wallet",
  "mintbase-wallet",
  "bitte-wallet",
];
