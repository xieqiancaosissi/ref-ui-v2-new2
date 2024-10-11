import React, { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import _ from "lodash";
import { AddLiqTitleIcon } from "../icon";
import { LpModalCloseIcon } from "@/components/pools/icon";
import { Icon } from "../IconCom";
import { ftGetBalance, ftGetTokenMetadata } from "@/services/token";
import { disPlayBalance } from "@/utils/uiNumber";
import { useAccountStore } from "@/stores/account";
import BigNumber from "bignumber.js";
import { RATED_POOL_LP_TOKEN_DECIMALS } from "@/utils/constant";
import {
  percentLess,
  scientificNotationToString,
  toReadableNumber,
  percent,
  toPrecision,
  toNonDivisibleNumber,
  calculateFairShare,
} from "@/utils/numbers";
import { ButtonTextWrapper } from "@/components/common/Button";
import { addLiquidityToPool } from "@/services/pool";
import AddLiqTip from "../../addLiqTip";
import { PoolDetailCard } from "./ClassicAddDetail";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import MyShares from "./Myshare";
import { toRealSymbol } from "@/services/farm";
import { getVEPoolId } from "@/services/referendum";

function YourLiqMobile(props: any) {
  const accountStore = useAccountStore();
  const {
    isOpen,
    onRequestClose,
    pool,
    poolId,
    shares,
    stakeList,
    updatedMapList,
    tokenInfoPC,
    lptAmount,
    usdValue,
    tokenAmountShareRaw,
    setShowAdd,
    haveShare,
    setShowRemove,
    userTotalShareToString,
  } = props;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); //
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        onRequestClose();
      }}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          overflow: "auto",
        },
        content: isMobile
          ? {
              transform: "translateX(-50%)",
              top: "auto",
              bottom: "32px",
              width: "100vw",
            }
          : {
              outline: "none",
              transform: "translate(-50%, -50%)",
            },
      }}
    >
      <div className="w-full min-h-58 p-4 rounded bg-dark-10 flex flex-col ">
        <div className="flex items-center justify-between text-white">
          <span className="whitespace-nowrap">Your Liquidity</span>
        </div>
        <div className="text-green-10 mt-6">
          <MyShares
            shares={shares}
            totalShares={pool.shareSupply}
            poolId={pool.id}
            stakeList={stakeList}
            lptAmount={lptAmount}
          />
        </div>

        <div className="w-full text-right text-sm mb-4 ">
          {!accountStore.isSignedIn ? (
            "-"
          ) : usdValue === "-" ? (
            "-"
          ) : (
            <div className="flex items-center relative top-1.5 justify-between">
              <span className="whitespace-nowrap text-gray-50">
                Estimate Value
              </span>

              <span className="text-white font-normal">{usdValue}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col text-center text-base">
          {updatedMapList[0]?.token_account_ids?.map(
            (token: any, index: number) => (
              <div
                key={index + "classic" + token.symbol}
                className="flex items-center justify-between mb-3"
              >
                <div className="flex items-center">
                  <Icon icon={token.icon} className="h-7 w-7 mr-2" />
                  <div className="flex items-start flex-col">
                    <div className="flex items-center text-gray-10 text-sm">
                      {toRealSymbol(token.symbol)}
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center text-white text-sm"
                  title={tokenAmountShareRaw(
                    pool,
                    token,
                    new BigNumber(userTotalShareToString)
                      .plus(
                        Number(getVEPoolId()) === Number(poolId)
                          ? lptAmount
                          : "0"
                      )
                      .toNumber()
                      .toFixed()
                  )}
                >
                  {tokenInfoPC({ token })}
                </div>
              </div>
            )
          )}
        </div>

        <div className="flex items-center w-full mt-2">
          <div className={`pr-2 ${haveShare ? "w-1/2" : "w-full"} `}>
            <div
              className={`poolBtnStyleBase w-full h-10  mr-2.5 text-sm cursor-pointer hover:opacity-90 `}
              onClick={() => {
                setShowAdd(true);
                onRequestClose();
              }}
              // disabled={disable_add}
            >
              Add
            </div>
          </div>
          {haveShare && (
            <div className="pl-2 w-1/2">
              <div
                onClick={() => {
                  if (+userTotalShareToString == 0) return;
                  setShowRemove(true);
                  onRequestClose();
                }}
                // disabled={Number(userTotalShareToString) == 0}
                className={`w-full ${
                  Number(userTotalShareToString) == 0
                    ? "border-gray-90 text-gray-60 cursor-not-allowed"
                    : "border-green-10 text-green-10 cursor-pointer "
                }  border rounded-md frcc w-35 h-10 text-sm hover:opacity-80 `}
              >
                Remove
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
export default React.memo(YourLiqMobile);
