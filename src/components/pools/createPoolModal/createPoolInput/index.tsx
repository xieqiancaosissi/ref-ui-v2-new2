import React, { useState, useEffect } from "react";
import SelectTokenModal from "@/components/common/SelectTokenModal/Index";
import { ArrowDownIcon } from "@/components/swap/icons";
import { ITokenMetadata } from "@/interfaces/tokens";
import HoverTooltip from "@/components/common/HoverToolTip";
import { MobileArrowUp } from "../../icon";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import { TknIcon, TknxIcon, TknxIconMobile } from "../../icon";
export default function PoolInput({
  title,
  index,
  handleToken,
  pureIdList,
  isMobile,
}: {
  title?: string;
  index: number;
  handleToken: (e: any) => void;
  pureIdList?: any;
  isMobile?: boolean;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectToken, setSelectToken] = useState<ITokenMetadata>();
  function showModal() {
    setIsOpen(true);
  }
  function hideModal() {
    setIsOpen(false);
  }
  function onSelect(token: ITokenMetadata) {
    console.log(token, "token");
    setSelectToken(token);
    // notice farther
    handleToken({
      index,
      value: token?.id,
    });
  }
  return (
    <>
      <div
        className="flex flex-col items-start lg:w-48 xsm:w-full mb-2"
        onClick={showModal}
      >
        <h2 className="text-gray-50 text-sm font-normal mb-3">{title}</h2>
        <div className="w-full h-16 rounded bg-dark-60 flex items-center justify-between border border-transparent px-4 hover:border-green-10">
          <div className="lg:w-35 xsm:w-full frcc">
            {selectToken?.icon ? (
              <div className="relative lg:w-[24px] lg:h-[24px] xsm:w-[32px] xsm:h-[32px] shrink-0">
                <img
                  src={selectToken?.icon}
                  alt=""
                  className="object-cover rounded-full"
                />
                {pureIdList.includes(selectToken.id) &&
                  (selectToken.id.indexOf("tknx") != -1 ? (
                    isMobile ? (
                      <TknxIconMobile
                        className="absolute z-1"
                        style={{
                          bottom: "-1.5px",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      />
                    ) : (
                      <TknxIcon
                        className="absolute z-1"
                        style={{
                          bottom: "-1px",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      />
                    )
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
            ) : (
              <div className="lg:w-6 lg:h-6 xsm:w-8 xsm:h-8 rounded-full bg-dark-40 shrink-0"></div>
            )}
            <div
              className={`text-base font-medium ${
                selectToken?.symbol ? "text-white" : "text-gray-50"
              } ml-2 w-full`}
            >
              {selectToken && selectToken?.symbol?.length > 11 ? (
                <HoverTooltip tooltipText={selectToken?.symbol}>
                  {selectToken?.symbol.substring(0, 10) + "..."}
                </HoverTooltip>
              ) : (
                selectToken?.symbol || "Select"
              )}
            </div>
          </div>
          <ArrowDownIcon className={"text-gray-50"} />
        </div>
      </div>
      <SelectTokenModal
        isOpen={isOpen}
        onRequestClose={hideModal}
        onSelect={onSelect}
        excludedTokenIds={[WRAP_NEAR_CONTRACT_ID]}
      />
    </>
  );
}
