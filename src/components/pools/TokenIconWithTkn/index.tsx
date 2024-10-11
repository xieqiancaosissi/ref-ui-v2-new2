import React from "react";
import {
  NearIcon,
  DangerousIcon,
  TknIcon,
  TknxIcon,
} from "@/components/pools/icon";
import { getRiskTagByToken } from "@/utils/commonUtil";

export const TokenIconComponent = ({
  ite,
  tokenIcons,
  pureIdList,
  ind,
}: {
  ite: any;
  tokenIcons: any;
  pureIdList: any;
  ind: number;
}) => {
  const hasCustomIcon = Reflect.has(tokenIcons, ite.tokenId);
  const isNearToken = ite.tokenId === "wrap.near";
  const iconStyle = { width: "26px", height: "26px" };
  if (hasCustomIcon && !isNearToken) {
    return (
      <div className={`relative shrink-0`}>
        <img
          src={ite?.icon || tokenIcons[ite.tokenId]}
          alt=""
          style={iconStyle}
        />
        {pureIdList.includes(ite.tokenId) &&
          (ite.tokenId.indexOf("tknx") != -1 ? (
            <TknxIcon
              className="absolute z-1"
              style={{
                bottom: "0px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          ) : (
            <TknIcon
              className="absolute z-1"
              style={{
                bottom: "0px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          ))}
      </div>
    );
  }

  if (isNearToken) {
    return <NearIcon style={iconStyle} />;
  }

  return (
    <div className={`relative shrink-0 z-${ind + 2}`}>
      <img src={ite.icon} alt="" style={iconStyle} />
      {pureIdList.includes(ite.tokenId) &&
        (ite.tokenId.indexOf("tknx") != -1 ? (
          <TknxIcon
            className="absolute z-1"
            style={{
              bottom: "0px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        ) : (
          <TknIcon
            className="absolute z-1"
            style={{
              bottom: "0px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        ))}
    </div>
  );
};
