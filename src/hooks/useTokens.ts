import { useState, useEffect } from "react";
import { TokenMetadata } from "../services/ft-contract";
import { ftGetTokenMetadata } from "../services/token";
const useTokens = (ids: string[] = [], curTokens?: TokenMetadata[]) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    if (curTokens && curTokens.length > 0) {
      setTokens(curTokens);
      return;
    }
    Promise.all<TokenMetadata>(ids.map((id) => ftGetTokenMetadata(id))).then(
      setTokens
    );
  }, [ids.join("")]);

  return tokens;
};
export default useTokens;
