import React, { useState, useMemo } from "react";
import styles from "./style.module.css";
import tokenIcons from "@/utils/tokenIconConfig";
import { NearIcon } from "@/components/pools/icon";
import { tokenAmountInShares } from "@/utils/lock";

const MyLockingDetailTip = ({
  children,
  poolDetail,
  your_locked_balance,
  accountId,
  updatedMapList,
}: {
  children: any;
  poolDetail: any;
  your_locked_balance: any;
  accountId: any;
  updatedMapList: any;
}) => {
  const [tokenA_amount, tokenB_amount] = useMemo(() => {
    if (
      your_locked_balance &&
      updatedMapList?.length > 0 &&
      poolDetail &&
      accountId
    ) {
      return [
        tokenAmountInShares(
          updatedMapList[0],
          updatedMapList[0]?.token_account_ids[0],
          your_locked_balance
        ),
        tokenAmountInShares(
          updatedMapList[0],
          updatedMapList[0]?.token_account_ids[1],
          your_locked_balance
        ),
      ];
    }
    return ["0", "0"];
  }, [your_locked_balance, updatedMapList, poolDetail, accountId]);

  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  function TokenIconComponent({ ite }: { ite: any }) {
    const hasCustomIcon = Reflect.has(tokenIcons, ite.tokenId);
    const isNearToken = ite.tokenId === "wrap.near";
    const iconStyle = {
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      border: "1px solid #9EFE01",
    };

    if (hasCustomIcon && !isNearToken) {
      return (
        <div className={`relative`}>
          <img src={tokenIcons[ite.tokenId]} alt="" style={iconStyle} />
        </div>
      );
    }

    if (isNearToken) {
      return <NearIcon style={iconStyle} />;
    }

    return (
      <div>
        <img src={ite.icon} alt="" style={iconStyle} />
      </div>
    );
  }

  return (
    <div
      className={styles.hoverTooltipContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showTooltip && (
        <div className={styles.hoverTooltipOverlocking}>
          {updatedMapList.map((item: any, index: number) => {
            return (
              <div
                key={"poolTokendetail_" + index}
                className="flex flex-col justify-center"
              >
                {item?.token_account_ids?.map((ite: any, ind: number) => (
                  <div key={"tkn" + ind} className="flex items-center p-1">
                    {TokenIconComponent({ ite })}
                    <div className="mx-1 w-10">{item?.token_symbols[ind]}</div>
                    <span className="ml-auto">
                      {ind == 0 && tokenA_amount}
                      {ind == 1 && tokenB_amount}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(MyLockingDetailTip);
