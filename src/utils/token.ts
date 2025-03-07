import { TOKENS, EVMConfig } from "@/config/bridge";

const tokens = TOKENS.reduce((acc, token) => {
  acc[token.symbol] = token;
  return acc;
}, {} as Record<string, BridgeModel.BridgeTokenMeta>);

export function getChainMainToken(chain: BridgeModel.BridgeSupportChain) {
  if (chain === "NEAR") return tokens.NEAR;
  const mainTokenSymbol = EVMConfig.chains[chain.toLowerCase()].token;
  return tokens[mainTokenSymbol];
}

export function getTokenMeta(symbol: string) {
  return tokens[symbol];
}

export function getTokenAddress(
  symbol: string,
  chain?: BridgeModel.BridgeSupportChain
) {
  return tokens[symbol]?.addresses[chain || "NEAR"];
}

export function getTokenByAddress(
  address: string,
  chain?: BridgeModel.BridgeSupportChain
) {
  return Object.values(tokens).find((token) =>
    Object.values(token.addresses).some(
      (item) => item?.toLowerCase() === address.toLowerCase()
    )
  );
}

export function getTokenDecimals(
  symbol: string,
  chain?: BridgeModel.BridgeSupportChain
) {
  const tokenMeta = tokens[symbol];
  return (
    Object.entries(tokenMeta?.decimals).find(
      ([c, d]) => c.toLowerCase() === chain.toLowerCase()
    )?.[1] || tokenMeta?.decimals.default
  );
}
