import React from "react";
import tokenIcons from "@/utils/tokenIconConfig";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn/index";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import styles from "./style.module.css";
import { TokenImgWithRiskTag } from "@/components/common/imgContainer";

function TokenDetail({
  poolDetail,
  updatedMapList,
}: {
  poolDetail: any;
  updatedMapList: any;
}) {
  const { pureIdList } = useRiskTokens();

  return (
    <div>
      {updatedMapList.map((item: any, index: any) => {
        return (
          <div
            className={`${styles.tokenImgContainer} shrink-0`}
            key={"poolTokendetail_" + index}
          >
            {item?.token_account_ids?.map((ite: any, ind: number) => (
              <TokenImgWithRiskTag
                token={ite}
                withoutRisk={true}
                key={ite.tokenId + ind}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
export default React.memo(TokenDetail);
