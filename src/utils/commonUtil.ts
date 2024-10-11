import { ITokenMetadata } from "@/interfaces/tokens";
import { TokenMetadata } from "@/services/ft-contract";
import { TKNX_SUFFIX, TKN_SUFFIX, MC_SUFFIX } from "@/utils/constant";

export function is_specific_suffix(mainStr: string, subStr: string) {
  return (
    mainStr.endsWith(subStr + ".testnet") || mainStr.endsWith(subStr + ".near")
  );
}
export function getRiskTagByToken(token: TokenMetadata | ITokenMetadata) {
  if (token.isRisk) {
    if (is_specific_suffix(token.id, TKN_SUFFIX)) return "TKN";
    if (is_specific_suffix(token.id, TKNX_SUFFIX)) return "TKNX";
    if (is_specific_suffix(token.id, MC_SUFFIX)) return "MC";
  }
  return "";
}

export function getRiskTagByTokenWhithOutRisk(
  token: TokenMetadata | ITokenMetadata
) {
  if (is_specific_suffix(token.id, TKN_SUFFIX)) return "TKN";
  if (is_specific_suffix(token.id, TKNX_SUFFIX)) return "TKNX";
  if (is_specific_suffix(token.id, MC_SUFFIX)) return "MC";
  return "";
}

export function isRiskTokenBySuffix(token: TokenMetadata) {
  if (is_specific_suffix(token.id, TKN_SUFFIX)) return true;
  if (is_specific_suffix(token.id, TKNX_SUFFIX)) return true;
  if (is_specific_suffix(token.id, MC_SUFFIX)) return true;
  return false;
}
