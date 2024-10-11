import { useMemo } from "react";
import useAllWhiteTokens from "@/hooks/useAllWhiteTokens";

export const useRiskTokens = () => {
  const { totalList } = useAllWhiteTokens();

  const { allRiskTokens, pureIdList } = useMemo(() => {
    const filteredTokens = totalList?.filter((token) => token.isRisk) || [];

    const riskTokenIds = filteredTokens.map((token) => token.id);

    return {
      allRiskTokens: filteredTokens,
      pureIdList: riskTokenIds,
    };
  }, [totalList]);

  return { allRiskTokens, pureIdList };
};
