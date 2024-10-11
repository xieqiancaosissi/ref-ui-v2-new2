import getConfig from "./config";
const { WRAP_NEAR_CONTRACT_ID } = getConfig();
export const NEAR_META_DATA = {
  id: "NEAR",
  name: "NEAR",
  symbol: "NEAR",
  decimals: 24,
  icon: "https://img.ref.finance/images/NEARIcon.png",
};
export const WNEAR_META_DATA = {
  id: WRAP_NEAR_CONTRACT_ID,
  name: "wNEAR",
  symbol: "wNEAR",
  decimals: 24,
  icon: "https://img.ref.finance/images/w-NEAR-no-border.png",
};
export const NEAR_META_TX_DATA = {
  ...NEAR_META_DATA,
  id: WRAP_NEAR_CONTRACT_ID,
};
