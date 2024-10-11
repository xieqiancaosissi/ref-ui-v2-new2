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
import successToast from "@/components/common/toast/successToast";
import failToast from "@/components/common/toast/failToast";
import { openUrlLocal } from "@/services/commonV3";
import { useRouter } from "next/router";
import { getAccountId } from "@/utils/wallet";

export function myShares({
  totalShares,
  userTotalShare,
}: {
  totalShares: string;
  userTotalShare: BigNumber;
}) {
  const sharePercent = percent(userTotalShare.valueOf(), totalShares);

  const displayUserTotalShare = userTotalShare
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });

  let displayPercent;
  if (Number(sharePercent) > 0 && Number(sharePercent) < 0.001) {
    displayPercent = "< 0.001";
  } else displayPercent = toPrecision(String(sharePercent), 3);

  const nonPrecisionDisplayUserTotalShares = toReadableNumber(
    RATED_POOL_LP_TOKEN_DECIMALS,
    displayUserTotalShare
  );

  const inPrecisionDisplayUserTotalShares =
    Number(nonPrecisionDisplayUserTotalShares) > 0 &&
    Number(nonPrecisionDisplayUserTotalShares) < 0.001
      ? "< 0.001"
      : toPrecision(nonPrecisionDisplayUserTotalShares, 3);

  return inPrecisionDisplayUserTotalShares + " " + `(${displayPercent}%)`;
}

function ClassicAdd(props: any) {
  const router = useRouter();

  const accountStore = useAccountStore();
  const {
    isOpen,
    onRequestClose,
    poolDetail,
    pureIdList,
    updatedMapList,
    isMobile,
    setAddSuccess,
    addSuccess,
    fromYours,
    pool,
  } = props;
  const [balancesList, setBalances] = useState<any>([]);
  const [inputValList, setInputValList] = useState<any>([]);
  const closeInit = () => {
    setInputValList([]);
  };
  const appStore = useAppStore();
  const returnBalance = async (token: any) => {
    try {
      const data = await ftGetBalance(token.tokenId);
      const balance = toReadableNumber(token.decimals, data);
      return { balance, id: token.tokenId, symbol: token.symbol };
    } catch (error) {
      console.error("error getting balance:", error);
    }
  };

  useEffect(() => {
    const array = new Array(
      updatedMapList[0]?.token_account_ids?.length || 2
    ).fill("");
    setInputValList(array);
    const fetchBalances = async () => {
      try {
        const promises = updatedMapList[0].token_account_ids.map((token: any) =>
          returnBalance(token)
        );
        const resolvedBalances = await Promise.all(promises);
        setBalances(resolvedBalances);
      } catch (err) {
        console.log(err);
      }
    };
    fetchBalances();
  }, [updatedMapList[0], addSuccess, getAccountId()]);

  const [preShare, setPreShare] = useState("0");
  const dealTokenAmounts = (
    ind: number,
    anotherInd: number,
    currentList: any
  ) => {
    if (!updatedMapList[0].token_account_ids) return;
    const fairShares = calculateFairShare({
      // shareOf: Reflect.has(updatedMapList[0], "shareSupply")
      //   ? pool.shareSupply
      //   : updatedMapList[0]?.shares_total_supply,
      shareOf: pool.shareSupply,
      contribution: toNonDivisibleNumber(
        updatedMapList[0]?.token_account_ids[ind]?.decimals,
        currentList[ind]
      ),
      totalContribution:
        pool.supplies[updatedMapList[0].token_account_ids[ind].id],
    });
    let secondAmount = "";
    if (currentList[ind]) {
      secondAmount = toReadableNumber(
        updatedMapList[0]?.token_account_ids[anotherInd]?.decimals,
        calculateFairShare({
          shareOf:
            pool?.supplies[updatedMapList[0]?.token_account_ids[anotherInd].id],
          contribution: fairShares,
          // totalContribution: Reflect.has(updatedMapList[0], "shareSupply")
          //   ? pool.shareSupply
          //   : updatedMapList[0]?.shares_total_supply,
          totalContribution: pool.shareSupply,
        })
      );
    }
    const newValues = [...currentList];
    newValues[anotherInd] = secondAmount;
    // console.log(newValues);

    // console.log(inputValList);
    // setPreShare(toReadableNumber(24, fairShares));
    // debouncedSendSearchValue(null);
    return {
      dealVal: newValues,
      fairShares,
    };
  };

  const changeVal = (e: any, ind: number) => {
    if (updatedMapList[0]?.amounts.every((amount: any) => amount == "0")) {
      setInputValList((prev: string[]) => {
        const newValues = [...prev];
        newValues[ind] = e.target.value;

        return newValues;
      });
    } else {
      setInputValList((prev: string[]) => {
        const newValues =
          prev.length < 1
            ? [
                ...new Array(
                  updatedMapList[0]?.token_account_ids?.length || 2
                ).fill(""),
              ]
            : [...prev];
        newValues[ind] = e.target.value;
        const { dealVal, fairShares }: any = dealTokenAmounts(
          ind,
          ind === 0 ? 1 : 0,
          newValues
        ); // use update newValues
        setPreShare(toReadableNumber(24, fairShares));
        return dealVal;
      });
    }
  };

  //

  const shareDisplay = () => {
    let result = "";
    let percentShare = "";
    let displayPercentShare = "";
    if (preShare && new BigNumber("0").isLessThan(preShare)) {
      const myShareBig = new BigNumber(preShare);
      if (myShareBig.isLessThan("0.001")) {
        result = "<0.001";
      } else {
        result = `${myShareBig.toFixed(3)}`;
      }
    } else {
      result = "-";
    }

    if (result !== "-") {
      percentShare = `${percent(
        preShare,
        scientificNotationToString(
          new BigNumber(
            toReadableNumber(24, updatedMapList[0]?.shares_total_supply)
          )
            .plus(new BigNumber(preShare))
            .toString()
        )
      )}`;

      if (Number(percentShare) > 0 && Number(percentShare) < 0.01) {
        displayPercentShare = "< 0.01%";
      } else {
        displayPercentShare = `${toPrecision(percentShare, 2)}%`;
      }
    }

    return {
      lpTokens: result,
      shareDisplay: displayPercentShare,
    };
  };

  const [canSubmit, setCanSubmit] = useState(true);
  const [inputAmountIsEmpty, setInputAmountIsEmpty] = useState(true);
  const [notEnoughList, setNotEnoughList] = useState([]);
  const [showNearGas, setShowNearGas] = useState(false);
  useEffect(() => {
    let flag: boolean = true;
    const emptyFlag = inputValList.every((amount: any) => Number(amount) > 0);
    const k: any = [];
    let nearGas: boolean = false;
    inputValList.map((item: any, index: number) => {
      if (
        emptyFlag &&
        updatedMapList[0].token_account_ids[index].id == "wrap.near" &&
        +item > balancesList[index]?.balance - 0.5
      ) {
        flag = false;
        nearGas = true;
      } else {
        if (+item > balancesList[index]?.balance) {
          flag = false;
          k.push(balancesList[index]?.symbol);
        }
      }
    });
    setInputAmountIsEmpty(emptyFlag);
    setCanSubmit(flag);
    setNotEnoughList(k);
    setShowNearGas(nearGas);
  }, [inputValList]);

  useEffect(() => {
    let emptyFlag: boolean = true;
    inputValList.map((item: any, index: number) => {
      if (!+item) {
        emptyFlag = false;
      }
    });
    setInputAmountIsEmpty(emptyFlag);
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  function submit() {
    return addLiquidityToPool({
      id: poolDetail.id,
      tokenAmounts: [
        {
          token: updatedMapList[0]?.token_account_ids[0],
          amount: inputValList[0],
        },
        {
          token: updatedMapList[0]?.token_account_ids[1],
          amount: inputValList[1],
        },
      ],
    })
      .then((res: any) => {
        if (!res) return;
        let status;
        if (res.status == "success") {
          if (fromYours) {
            router.push(`/pool/${poolDetail.id}`);
          } else {
            successToast();
            setAddSuccess((pre: number) => pre + 1);
          }
        } else if (res.status == "error") {
          failToast(res.errorResult?.message);
        }
      })
      .finally(() => {
        setIsLoading(false);
        onRequestClose();
        closeInit();
      });
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        closeInit();
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
      <div className="classAddLiqThumb lg:py-[12px] lg:h-[100vh] lg:overflow-y-auto lg:max-h-[750px]">
        <div className="flex items-center justify-between mb-4 xsm:hidden">
          <AddLiqTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer hover:opacity-90"
            onClick={() => {
              closeInit();
              onRequestClose();
            }}
          />
        </div>
        <div className="flex flex-col justify-between lg:w-108 xsm:w-full lg:h-[572px] rounded-lg bg-dark-10 px-4 py-5">
          <div className="lg:hidden text-white font-medium text-lg mb-6">
            Add Liquidity
          </div>
          {updatedMapList[0]?.token_account_ids?.map(
            (ite: any, ind: number) => {
              return (
                <div key={ite.tokenId}>
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-gray-50 mb-2 text-sm">
                      <span>
                        Balance:{" "}
                        <span
                          className={`underline hover:cursor-pointer  ${
                            inputValList[ind] ==
                            (ite.tokenId == "wrap.near"
                              ? balancesList[ind]?.balance - 0.5
                              : balancesList[ind]?.balance)
                              ? "text-green-10"
                              : "text-gray-50 hover:text-white"
                          }`}
                          onClick={() => {
                            changeVal(
                              {
                                target: {
                                  value:
                                    ite.tokenId == "wrap.near"
                                      ? balancesList[ind]?.balance > 0.5
                                        ? (
                                            balancesList[ind]?.balance - 0.5
                                          ).toString()
                                        : ""
                                      : balancesList[ind]?.balance,
                                },
                              },
                              ind
                            );
                          }}
                        >
                          {disPlayBalance(
                            accountStore.isSignedIn,
                            balancesList[ind]?.balance
                          )}
                        </span>
                      </span>
                    </div>
                    <div
                      className="flex h-16 w-full items-center border border-transparent hover:border-green-20 rounded pr-3"
                      style={{ background: "rgba(0,0,0,.2)" }}
                    >
                      <input
                        type="number"
                        className="h-16 p-3 max-w-74 text-white"
                        style={{ fontSize: "26px" }}
                        value={inputValList[ind]}
                        onChange={(e) => changeVal(e, ind)}
                        placeholder="0"
                      />
                      <Icon icon={ite.icon} className="h-7 w-7 mr-2" />
                      <span className="text-white text-base mr-1">
                        {ite.symbol}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          )}

          {/* slippage */}
          <div className="flex items-center justify-between mt-5 ">
            <div className="text-sm text-gray-50 frcc">LP tokens</div>
            <div className="text-white text-sm">
              {shareDisplay().lpTokens || "-"}
            </div>
          </div>

          {/* Minimum shares */}
          <div className="flex items-center justify-between my-5">
            <div className="text-sm text-gray-50 frcc">Share</div>
            <div className="text-white text-sm">
              {shareDisplay().shareDisplay || "-"}
            </div>
          </div>
          {/* tips  */}
          {!canSubmit && showNearGas && (
            <div
              className="text-yellow-10 text-sm border h-11 w-full rounded flex px-2 py-1 items-center mt-2"
              style={{
                borderColor: "rgba(230, 180, 1, 0.3)",
                backgroundColor: "rgba(230, 180, 1, 0.14)",
              }}
            >
              <span>{`Must have 0.5N or more left in wallet for gas fee.`}</span>
            </div>
          )}

          {!canSubmit && notEnoughList.length > 0 && (
            <div
              className="text-yellow-10 text-sm border h-11 w-full rounded flex px-2 py-1 items-center mt-2"
              style={{
                borderColor: "rgba(230, 180, 1, 0.3)",
                backgroundColor: "rgba(230, 180, 1, 0.14)",
              }}
            >
              <span>{`You don't have enough ${notEnoughList.join("｜")}`}</span>
            </div>
          )}

          <AddLiqTip tips="Fees automatically contribute to your liquidity for market making."></AddLiqTip>

          {/* submit */}
          {accountStore.isSignedIn ? (
            canSubmit && inputAmountIsEmpty ? (
              <div
                className="poolBtnStyleBase h-11 cursor-pointer hover:opacity-90"
                onClick={() => {
                  setIsLoading(true);
                  submit();
                }}
              >
                <ButtonTextWrapper
                  loading={isLoading}
                  Text={() => <span>Add Liquidity</span>}
                />
              </div>
            ) : (
              <div className="poolBtnStyleDefaultBase h-11  cursor-not-allowed">
                Add Liquidity
              </div>
            )
          ) : (
            <div
              className="flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer shrink-0"
              style={{ height: "42px" }}
              onClick={() => {
                showWalletSelectorModal(appStore.setShowRiskModal);
              }}
            >
              Connect Wallet
            </div>
          )}

          {/*  */}
          {poolDetail && isMobile && (
            <PoolDetailCard
              tokens_o={updatedMapList[0].token_account_ids}
              pool={updatedMapList[0]}
              poolDetail={poolDetail}
              isMobile={true}
            />
          )}
        </div>

        {/*  */}
        {poolDetail && !isMobile && (
          <PoolDetailCard
            tokens_o={updatedMapList[0].token_account_ids}
            pool={updatedMapList[0]}
            poolDetail={poolDetail}
          />
        )}
      </div>
    </Modal>
  );
}
export default React.memo(ClassicAdd);
