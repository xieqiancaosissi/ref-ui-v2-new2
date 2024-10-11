import React, { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import { AddLiqTitleIcon } from "../icon";
import { LpModalCloseIcon } from "@/components/pools/icon";
import tokenIcons from "@/utils/tokenIconConfig";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn";
import { Icon } from "../IconCom";
import { ftGetBalance, ftGetTokenMetadata } from "@/services/token";
import { toReadableNumber } from "@/utils/numbers";
import _ from "lodash";
import { disPlayBalance } from "@/utils/uiNumber";
import { useAccountStore } from "@/stores/account";
import poolStyle from "./index.module.css";
import { feeList } from "./config";
import HoverTip from "@/components/common/Tips";
import BigNumber from "bignumber.js";
import { percent, toPrecision } from "@/utils/numbers";
import {
  RATED_POOL_LP_TOKEN_DECIMALS,
  STABLE_LP_TOKEN_DECIMALS,
} from "@/utils/constant";
import { percentLess } from "@/utils/numbers";
import { usePredictShares } from "@/hooks/useStableLiquidity";
import { ButtonTextWrapper } from "@/components/common/Button";
import { toNonDivisibleNumber } from "@/utils/numbers";
import { addLiquidityToStablePool } from "@/services/pool";
import AddLiqTip from "../../addLiqTip";
import { useAppStore } from "@/stores/app";
import { getAccountId, showWalletSelectorModal } from "@/utils/wallet";
import successToast from "@/components/common/toast/successToast";
import failToast from "@/components/common/toast/failToast";
import { openUrlLocal } from "@/services/commonV3";
import { useRouter } from "next/router";
export function myShares({
  totalShares,
  userTotalShare,
  poolDetail,
}: {
  totalShares: string;
  userTotalShare: BigNumber;
  poolDetail: any;
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
    poolDetail.pool_kind == "STABLE_SWAP" &&
      poolDetail.pool_kind != "DEGEN_SWAP"
      ? STABLE_LP_TOKEN_DECIMALS
      : RATED_POOL_LP_TOKEN_DECIMALS,
    displayUserTotalShare
  );

  const inPrecisionDisplayUserTotalShares =
    Number(nonPrecisionDisplayUserTotalShares) > 0 &&
    Number(nonPrecisionDisplayUserTotalShares) < 0.001
      ? "< 0.001"
      : toPrecision(nonPrecisionDisplayUserTotalShares, 3);

  return inPrecisionDisplayUserTotalShares + " " + `(${displayPercent}%)`;
}

function StableAdd(props: any) {
  const accountStore = useAccountStore();
  const router = useRouter();
  const {
    isOpen,
    onRequestClose,
    poolDetail,
    pureIdList,
    updatedMapList,
    isMobile,
    tokenPriceList,
    setAddSuccess,
    addSuccess,
    fromYours,
  } = props;
  const [balancesList, setBalances] = useState<any>([]);
  const [inputValList, setInputValList] = useState<any>([]);
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
  const [radioActive, setRadioActive] = useState("");

  const [sumToken, setSumToken] = useState(0);
  const [everyTokenPercent, setEveryTokenPercent] = useState<any>({});
  useEffect(() => {
    if (updatedMapList?.length > 0 || addSuccess > 0) {
      let sumT = 0;
      const everyT: any = everyTokenPercent;
      updatedMapList.map((item: any, index: number) => {
        // 提取tokenIds和对应的symbols，以及计算tokenAmounts
        const tokenIdsAndSymbols = item.token_account_ids?.map(
          (ite: any, ind: number) => {
            const tokenAmount = toReadableNumber(
              ite.decimals,
              item.supplies[ite.tokenId]
            );
            sumT += +tokenAmount;
            everyT[ite.tokenId] = tokenAmount;
            return {
              tokenId: ite.tokenId,
              symbol: item.token_symbols[ind],
              tokenAmount,
            };
          }
        );
      });
      setEveryTokenPercent(everyT);
      setSumToken(sumT);
    }
  }, [updatedMapList, addSuccess]);

  useEffect(() => {
    const array = new Array(
      updatedMapList[0]?.token_account_ids?.length || 2
    ).fill("");
    setInputValList(array);
    const fetchBalances = async () => {
      try {
        const promises = updatedMapList[0].token_account_ids?.map(
          (token: any) => returnBalance(token)
        );
        const resolvedBalances = await Promise.all(promises);
        setBalances(resolvedBalances);
      } catch (err) {
        console.log(err);
      }
    };
    fetchBalances();
  }, [updatedMapList[0]?.token_account_ids, addSuccess, getAccountId()]);

  const changeVal = (e: any, ind: number, ite: any, radioActivestr: string) => {
    if (radioActivestr == "init") {
      const shortTo =
        e.target.value / (everyTokenPercent[ite.tokenId] / sumToken);
      const k: any = [];
      updatedMapList[0]?.token_account_ids.map((it: any, index: number) => {
        k[index] = (everyTokenPercent[it.tokenId] / sumToken) * shortTo;
      });
      console.log(k);
      setInputValList(k);
    } else {
      setInputValList((prev: string[]) => {
        const newValues = [...prev];
        newValues[ind] = e.target.value;
        return newValues;
      });
    }
    debouncedSendSearchValue(e);
  };

  const originalSendSearchValue = (e: any) => {
    // setSearchValue(e.target.value);
  };

  const debouncedSendSearchValue = _.debounce(originalSendSearchValue, 10);

  //

  const setRadio = (type: string) => {
    // interface
    if (radioActive == type) {
      setRadioActive("");
    } else {
      setRadioActive(type);
    }

    // data
    if (type == "init") {
      let k = [...inputValList];
      k = k.map((item: any) => {
        return "";
      });

      setInputValList(k);
    } else if (type == "max") {
      let k = [...inputValList];
      k = k.map((item: any, index: number) => {
        return balancesList[index]?.balance;
      });

      setInputValList(k);
    }
  };

  const [isActive, setActive] = useState(0.1);
  const [feeValue, setFeeValue] = useState(isActive);
  const inputChange = (e: any) => {
    if (e.target.value >= 20) {
      setFeeValue(20);
    } else {
      setFeeValue(e.target.value);
    }
    setActive(e.target.value);
  };

  const predicedShares = usePredictShares({
    poolId: poolDetail.id,
    tokenAmounts: [...inputValList],
    stablePool: updatedMapList[0],
  });

  const [canSubmit, setCanSubmit] = useState(true);
  const [inputAmountIsEmpty, setInputAmountIsEmpty] = useState(true);
  const [notEnoughList, setNotEnoughList] = useState([]);
  const [showNearGas, setShowNearGas] = useState(false);
  useEffect(() => {
    let flag: boolean = true;
    let emptyFlag: boolean = false;
    const k: any = [];
    const isAllMaxArray: any = [];
    let initBalance = 0;
    let nearGas: boolean = false;
    inputValList.map((item: any, index: number) => {
      if (+item > balancesList[index]?.balance) {
        flag = false;
        k.push(balancesList[index]?.symbol);
      }
      if (item > 0) {
        emptyFlag = true;
      }
      if (
        emptyFlag &&
        updatedMapList[0].token_account_ids[index].id == "wrap.near" &&
        +item > balancesList[index]?.balance - 0.5
      ) {
        flag = false;
        nearGas = true;
      }

      initBalance += +balancesList[index]?.balance || 0;
      if (
        (+item == balancesList[index]?.balance &&
          balancesList[index]?.balance > 0 &&
          +item > 0) ||
        (balancesList[index]?.balance == 0 &&
          balancesList[index]?.balance == +item)
      ) {
        isAllMaxArray.push(true);
      } else {
        isAllMaxArray.push(false);
      }
    });
    if (!isAllMaxArray.includes(false) && initBalance > 0) {
      setRadioActive("max");
    } else {
      if (radioActive == "max") {
        setRadioActive("");
      }
    }
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
    const min_shares = toPrecision(percentLess(feeValue, predicedShares), 0);

    const amounts = [...inputValList].map((amount, i) =>
      toNonDivisibleNumber(
        updatedMapList[0].token_account_ids[i].decimals,
        amount
      )
    ) as [string, string, string];

    return addLiquidityToStablePool({
      tokens: updatedMapList[0].token_account_ids,
      id: Number(poolDetail.id),
      amounts,
      min_shares,
    })
      .then((res: any) => {
        if (!res) return;
        if (res.status == "success") {
          if (fromYours) {
            router.push(`/sauce/${poolDetail.id}`);
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

  const closeInit = () => {
    setActive(0.1);
    const array = new Array(
      updatedMapList[0]?.token_account_ids?.length || 2
    ).fill("");
    setInputValList(array);
    setFeeValue(0.1);
    setRadioActive("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        onRequestClose();
        closeInit();
      }}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          overflow: "auto",
        },
        content: {
          outline: "none",
          top: isMobile ? "auto" : "50%",
          left: isMobile ? "auto" : "50%",
          transform: isMobile ? "none" : "translate(-50%, -50%)",
          bottom: isMobile ? "32px" : "auto",
          width: isMobile ? "100%" : "auto",
        },
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-4 xsm:hidden">
          <AddLiqTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer hover:opacity-90"
            onClick={() => {
              onRequestClose();
              closeInit();
            }}
          />
        </div>
        <div className="lg:w-108 xsm:w-full lg:min-h-123  rounded-lg bg-dark-10 py-5">
          <div className="lg:hidden text-white font-medium text-lg mb-6 px-4">
            Add Liquidity
          </div>
          <div className="lg:max-h-[492px]  lg:overflow-auto px-4">
            <div className="lg:overflow-y-auto xsm:w-full">
              {updatedMapList[0]?.token_account_ids?.map(
                (ite: any, ind: number) => {
                  return (
                    <div key={ite.tokenId} className="xsm:w-full">
                      <div className="mb-6 xsm:w-full">
                        <div className="flex items-end justify-end text-gray-50 mb-2 text-sm xsm:w-full">
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
                                            ? new BigNumber(
                                                balancesList[ind]?.balance
                                              )
                                                .minus(0.5)
                                                .toString()
                                            : ""
                                          : balancesList[ind]?.balance,
                                    },
                                  },
                                  ind,
                                  ite,
                                  radioActive
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
                        <div className="flex">
                          <div className="w-1/4 flex items-center">
                            <Icon icon={ite.icon} className="h-7 w-7 mr-2" />
                            <span className="text-white text-base">
                              {ite.symbol}
                            </span>
                          </div>
                          <div
                            className="flex h-11 w-3/4 items-center border border-transparent hover:border-green-20 rounded"
                            style={{ background: "rgba(0,0,0,.2)" }}
                          >
                            <input
                              type="number"
                              className="h-11 p-3 lg:w-74 text-white"
                              style={{ fontSize: "20px" }}
                              value={inputValList[ind]}
                              onChange={(e) =>
                                changeVal(e, ind, ite, radioActive)
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
            {/* radio */}
            <div className="w-full h-19 border border-gray-90 rounded flex px-4  py-3 justify-between flex-col cursor-pointer">
              {/* init */}
              <div
                className="flex items-center text-sm text-gray-50"
                onClick={() => {
                  setRadioActive("init");

                  setRadio("init");
                }}
              >
                <div
                  className={`w-3 h-3 p-0.5 border ${
                    radioActive == "init" ? "border-green-10" : "border-gray-60"
                  } rounded-full`}
                >
                  {radioActive == "init" && (
                    <div className="bg-green-10 rounded-full w-full h-full"></div>
                  )}
                </div>
                <span className="ml-1">
                  Add all tokens in a balanced proportion
                </span>
              </div>
              {/* max */}
              <div
                className="flex items-center text-sm text-gray-50"
                onClick={() =>
                  radioActive == "max" ? setRadioActive("") : setRadio("max")
                }
              >
                <div
                  className={`w-3 h-3 p-0.5 border ${
                    radioActive == "max" ? "border-green-10" : "border-gray-60"
                  } rounded-full`}
                >
                  {radioActive == "max" && (
                    <div className="bg-green-10 rounded-full w-full h-full"></div>
                  )}
                </div>
                <span className="ml-1">
                  Use maximum amount of tokens available
                </span>
              </div>
            </div>

            {/* slippage */}
            <div className="flex items-center justify-between mt-7">
              <div className="text-sm text-gray-50 frcc">
                Slippage tolerance{" "}
                <HoverTip
                  msg={
                    "Slippage means the difference between what you expect to get and what you actually get due to other executing first"
                  }
                  extraStyles={"w-50"}
                />
              </div>
              <div className="frcc xsm:hidden">
                <div
                  className={`frcc w-38 text-sm py-1  ${poolStyle.commonStyle}`}
                >
                  {feeList.map((item, index) => {
                    return (
                      <div
                        key={item.key + index}
                        className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-gray-120 rounded"
                      : "text-gray-60"
                  }
                  w-12 h-5 frcc cursor-pointer
                `}
                        onClick={() => {
                          setActive(item.key);
                          setFeeValue(item.key);
                        }}
                      >
                        {item.value}%
                      </div>
                    );
                  })}
                </div>
                <div className={poolStyle.filterSeacrhInputContainer}>
                  <input
                    type="number"
                    className={poolStyle.filterSearchInput}
                    value={feeValue}
                    onChange={inputChange}
                  />
                  <span className="text-gray-50 text-sm">%</span>
                </div>
              </div>
            </div>

            <div
              className={`flex items-center justify-between flex-1 text-sm py-1 mt-2 lg:hidden`}
            >
              {feeList.map((item, index) => {
                return (
                  <div
                    key={item.key + index}
                    className={`
                  ${isActive == item.key ? "text-white " : "text-gray-60"}
                   h-5 frcc cursor-pointer
                `}
                    onClick={() => {
                      setActive(item.key);
                      setFeeValue(item.key);
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border  frcc mr-1 ${
                        isActive == item.key
                          ? "border-green-10"
                          : "border-gray-60"
                      }`}
                    >
                      {isActive == item.key && (
                        <div className="w-3 h-3 rounded-full bg-green-10"></div>
                      )}
                    </div>
                    {item.value}%
                  </div>
                );
              })}
              <div className={poolStyle.filterSeacrhInputContainer}>
                <input
                  type="number"
                  className={poolStyle.filterSearchInput}
                  value={feeValue}
                  onChange={inputChange}
                />
                <span className="text-gray-50 text-sm">%</span>
              </div>
            </div>

            {/* Minimum shares */}
            <div className="flex items-center justify-between mt-5">
              <div className="text-sm text-gray-50 frcc">Minimum shares</div>
              <div
                className="text-white text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                title={myShares({
                  totalShares: BigNumber.sum(
                    poolDetail.shares_total_supply,
                    percentLess(feeValue, predicedShares)
                  )
                    .toNumber()
                    .toLocaleString("fullwide", { useGrouping: false }),
                  userTotalShare: new BigNumber(
                    toPrecision(percentLess(feeValue, predicedShares), 0)
                  ),
                  poolDetail,
                })}
              >
                {myShares({
                  totalShares: BigNumber.sum(
                    poolDetail.shares_total_supply,
                    percentLess(feeValue, predicedShares)
                  )
                    .toNumber()
                    .toLocaleString("fullwide", { useGrouping: false }),
                  userTotalShare: new BigNumber(
                    toPrecision(percentLess(feeValue, predicedShares), 0)
                  ),
                  poolDetail,
                })}
              </div>
            </div>
          </div>
          <div className="px-4">
            {/* tips  */}
            {showNearGas && notEnoughList.length < 1 && (
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
            {/* tips  */}
            {!canSubmit && notEnoughList.length > 0 && (
              <div
                className="text-yellow-10 text-sm border h-11 w-full rounded flex px-4 py-1 items-center mt-6 mb-2"
                style={{
                  borderColor: "rgba(230, 180, 1, 0.3)",
                  backgroundColor: "rgba(230, 180, 1, 0.14)",
                }}
              >
                <span>{`You don't have enough ${notEnoughList.join(
                  "｜"
                )}`}</span>
              </div>
            )}
            <AddLiqTip
              tips={
                "Fees automatically contribute to your liquidity for market making."
              }
            ></AddLiqTip>
            {/* submit */}
            {accountStore.isSignedIn ? (
              canSubmit && inputAmountIsEmpty ? (
                <div
                  className="poolBtnStyleBase h-11 mt-1 cursor-pointer hover:opacity-90"
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
                <div className="poolBtnStyleDefaultBase h-11 mt-1 cursor-not-allowed">
                  Add Liquidity
                </div>
              )
            ) : (
              <div
                className="flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer"
                style={{ height: "42px" }}
                onClick={() => {
                  showWalletSelectorModal(appStore.setShowRiskModal);
                }}
              >
                Connect Wallet
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
export default React.memo(StableAdd);
