import { useState, useEffect } from "react";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import { getTokenPriceList } from "@/services/indexer";
export const useTokenPriceList = (dep?: any) => {
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});

  const [tokenListTrigger, setTokenListTrigger] = useState<boolean>(false);

  useEffect(() => {
    if (dep) {
      setTokenListTrigger(!tokenListTrigger);
    }
  }, [dep]);

  useEffect(() => {
    getTokenPriceList().then(setTokenPriceList);
  }, [tokenListTrigger]);

  if (Object.keys(tokenPriceList).length > 0) {
    tokenPriceList.NEAR = tokenPriceList?.[WRAP_NEAR_CONTRACT_ID];
  }

  return tokenPriceList;
};
