import React, { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import { RemoveLiqTitleIcon } from "../icon";
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
import { removeTab } from "./config";
import { usePool } from "@/hooks/usePools";
import { toRoundedReadableNumber } from "@/utils/numbers";
import { getStablePoolDecimal } from "@/services/swap/swapUtils";
import RangeSlider from "./StableRemoveRangeSlider";
import { LP_TOKEN_DECIMALS } from "@/services/m-token";
import { getRemoveLiquidityByShare } from "@/hooks/useStableShares";
import { TokenMetadata } from "@/services/ft-contract";
import { usePredictRemoveShares } from "@/hooks/usePools";
import { percentIncrese } from "@/utils/numbers";
import {
  removeLiquidityFromStablePool,
  removeLiquidityByTokensFromStablePool,
} from "@/services/pool";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import successToast from "@/components/common/toast/successToast";
import failToast from "@/components/common/toast/failToast";
import { useNewPoolData } from "@/hooks/useStableShares";
import { get_shadow_records } from "@/services/farm";
import { list_farmer_seeds } from "@/services/farm";
import { getPoolAvailableShare } from "@/hooks/useStableShares";
import { openUrlLocal } from "@/services/commonV3";
import { getAccountId } from "@/utils/wallet";
import { useRouter } from "next/router";

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

function StableRemove(props: any) {
  const accountStore = useAccountStore();
  const router = useRouter();
  const appStore = useAppStore();
  const {
    isOpen,
    onRequestClose,
    poolDetail,
    pureIdList,
    updatedMapList,
    isMobile,
    setAddSuccess,
    pool,
    shares,
    addSuccess,
    fromYours,
  } = props;
  const [balancesList, setBalances] = useState<any>([]);
  const [inputValList, setInputValList] = useState<any>([]);

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
  }, [updatedMapList[0]?.token_account_ids]);

  const changeVal = useCallback((e: any, ind: number) => {
    setInputValList((prev: string[]) => {
      const newValues = [...prev];
      newValues[ind] = e.target.value;
      return newValues;
    });
    debouncedSendSearchValue(e);
  }, []);

  const originalSendSearchValue = (e: any) => {
    // setSearchValue(e.target.value);
  };

  const debouncedSendSearchValue = _.debounce(originalSendSearchValue, 10);

  //

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

  const [canSubmit, setCanSubmit] = useState(false);
  const [notEnoughList, setNotEnoughList] = useState([]);

  useEffect(() => {
    let flag: boolean = true;
    const k: any = [];
    inputValList.map((item: any, index: number) => {
      if (+item > balancesList[index]?.balance || +item <= 0) {
        flag = false;
        k.push(balancesList[index]?.symbol);
      }
    });
    setCanSubmit(flag);
    setNotEnoughList(k);
  }, [inputValList]);

  const [isLoading, setIsLoading] = useState(false);

  function submit() {
    if (removeTabActive == "share") {
      const removeShares = toNonDivisibleNumber(
        poolDetail.pool_kind == "STABLE_SWAP" &&
          poolDetail.pool_kind != "DEGEN_SWAP"
          ? STABLE_LP_TOKEN_DECIMALS
          : RATED_POOL_LP_TOKEN_DECIMALS,
        shareVal
      );

      const min_amounts = receiveAmounts.map((amount, i) =>
        toNonDivisibleNumber(
          updatedMapList[0].token_account_ids[i].decimals,
          percentLess(
            feeValue,

            toReadableNumber(
              updatedMapList[0].token_account_ids[i].decimals,
              amount
            )
          )
        )
      );

      return removeLiquidityFromStablePool({
        tokens: updatedMapList[0].token_account_ids,
        id: +poolDetail.id,
        min_amounts: min_amounts as [string, string, string],
        shares: removeShares,
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
    } else {
      const amounts = [...inputValList].map((amount, i) => {
        return toNonDivisibleNumber(
          updatedMapList[0].token_account_ids[i].decimals,
          amount
        );
      }) as Array<string>;
      const predict_burn = toPrecision(
        percentIncrese(feeValue, predictedRemoveShares),
        0
      );

      const max_burn_shares = new BigNumber(predict_burn).isGreaterThan(shares)
        ? shares
        : predict_burn;

      return removeLiquidityByTokensFromStablePool({
        tokens: updatedMapList[0].token_account_ids,
        id: +poolDetail.id,
        amounts,
        max_burn_shares,
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
  }
  // tab change
  const [removeTabActive, setRemoveTabActive] = useState("share");

  // by share
  const { newPool } = useNewPoolData({ pool, shares });
  const sharesDecimals = toReadableNumber(
    getStablePoolDecimal(poolDetail.id, poolDetail),
    newPool?.availableShareNonDivisible
  );

  const [shareVal, setShareVal] = useState("");
  const changeShareVal = (val: any) => {
    if (
      +val > +(addSuccess > 0 ? newsharesDecimals : sharesDecimals) ||
      val <= 0
    ) {
      setCanSubmit(false);
    } else {
      setCanSubmit(true);
    }

    setShareVal(val ? val : "");
  };
  const [receiveAmounts, setReceiveAmounts] = useState(new Array(4).fill(""));
  useEffect(() => {
    // setCanSubmitByShare(true);
    const readableShares = toReadableNumber(
      poolDetail.pool_kind == "STABLE_SWAP" &&
        poolDetail.pool_kind != "DEGEN_SWAP"
        ? STABLE_LP_TOKEN_DECIMALS
        : RATED_POOL_LP_TOKEN_DECIMALS,
      shares
    );
    const shareParam = toNonDivisibleNumber(
      poolDetail.pool_kind == "STABLE_SWAP" &&
        poolDetail.pool_kind != "DEGEN_SWAP"
        ? STABLE_LP_TOKEN_DECIMALS
        : RATED_POOL_LP_TOKEN_DECIMALS,
      shareVal || "0"
    );
    if (
      shareVal == "" ||
      Number(shareVal) === 0 ||
      Number(shareVal) > Number(readableShares)
    ) {
      // setCanSubmitByShare(false);
      setReceiveAmounts(["0", "0", "0", "0"]);
      return;
    }
    // setCanSubmitByShare(false);
    const receiveAmounts = getRemoveLiquidityByShare(
      shareParam,
      updatedMapList[0]
    );
    const parsedAmounts = receiveAmounts.map((amount: any, i: number) =>
      toRoundedReadableNumber({
        decimals:
          (poolDetail.pool_kind == "STABLE_SWAP" &&
          poolDetail.pool_kind != "DEGEN_SWAP"
            ? STABLE_LP_TOKEN_DECIMALS
            : RATED_POOL_LP_TOKEN_DECIMALS) -
          updatedMapList[0].token_account_ids[i].decimals,
        number: amount,
        precision: 0,
        withCommas: false,
      })
    );
    setReceiveAmounts(parsedAmounts);
  }, [updatedMapList[0].token_account_ids, shareVal]);

  const calcTokenReceived = (receiveAmount: string, token: TokenMetadata) => {
    const nonPrecisionAmount = percentLess(
      feeValue,
      toReadableNumber(token.decimals, receiveAmount)
    );

    return Number(nonPrecisionAmount) < 0.001 && Number(nonPrecisionAmount) > 0
      ? "< 0.001"
      : toPrecision(nonPrecisionAmount, 3);
  };

  const [newShadowRecords, setnewShadowRecords] = useState<any>({});
  const [newFarmerSeeds, setnewFarmerSeeds] = useState<any>({});
  const [newnewPool, setnewNewPool] = useState<any>();
  const [newsharesDecimals, setnewsharesDecimals] = useState<any>("");

  useEffect(() => {
    if (addSuccess > 0 && getAccountId()) {
      // const { shadowRecords } = useShadowRecord(pool?.id);
      get_shadow_records().then((res) => {
        setnewShadowRecords(res);
      });

      // const { farmerSeeds } = useListFarmerSeeds();

      list_farmer_seeds().then((res) => {
        setnewFarmerSeeds(res);
      });
    }
  }, [addSuccess, shares, getAccountId()]);

  useEffect(() => {
    // todo: pool mutated key and value update here
    if (addSuccess == 0 || !newFarmerSeeds || !newShadowRecords) return;
    const updatePool = () => {
      const pool2 = JSON.parse(JSON.stringify(pool));
      const poolSeed = newFarmerSeeds?.[pool2.id];
      pool2.raw = {
        farmerSeeds: poolSeed,
      };
      pool2.farmShare = poolSeed
        ? new BigNumber(poolSeed.free_amount)
            .plus(poolSeed.shadow_amount)
            .toFixed()
        : shares;

      const { availableShare, availableShareNonDivisible } =
        getPoolAvailableShare({
          pool: pool2,
          shadowRecords: newShadowRecords,
          shares,
        });
      pool2.availableShare = availableShare;
      pool2.availableShareNonDivisible = availableShareNonDivisible;
      setnewNewPool(pool2);
    };
    if (pool?.id) {
      updatePool();
    }
  }, [addSuccess, newShadowRecords, newFarmerSeeds, shares, pool]);

  useEffect(() => {
    if (addSuccess > 0 && newnewPool?.availableShareNonDivisible) {
      const sharesDecimals = toReadableNumber(
        getStablePoolDecimal(poolDetail.id, poolDetail),
        newnewPool?.availableShareNonDivisible
      );

      setnewsharesDecimals(sharesDecimals);
    }
  }, [newnewPool, addSuccess, shares]);

  // by tokens
  const [error, setError]: any = useState(null);
  const { predictedRemoveShares, canSubmitByToken } = usePredictRemoveShares({
    amounts: [...inputValList],
    setError,
    shares:
      addSuccess > 0
        ? newnewPool?.availableShareNonDivisible
        : newPool?.availableShareNonDivisible,
    stablePool: updatedMapList[0],
  });

  const calcSharesRemoved = () => {
    const nonPrecisionValue = percentIncrese(
      feeValue,
      toReadableNumber(
        poolDetail.pool_kind == "STABLE_SWAP" &&
          poolDetail.pool_kind != "DEGEN_SWAP"
          ? STABLE_LP_TOKEN_DECIMALS
          : RATED_POOL_LP_TOKEN_DECIMALS,
        predictedRemoveShares
      )
    );

    const myReadableShare = toReadableNumber(
      poolDetail.pool_kind == "STABLE_SWAP" &&
        poolDetail.pool_kind != "DEGEN_SWAP"
        ? STABLE_LP_TOKEN_DECIMALS
        : RATED_POOL_LP_TOKEN_DECIMALS,
      shares
    );

    console.log(
      feeValue,
      nonPrecisionValue,
      myReadableShare,
      poolDetail.pool_kind == "STABLE_SWAP" &&
        poolDetail.pool_kind != "DEGEN_SWAP",
      predictedRemoveShares
    );

    if (error) return "0";

    return Number(nonPrecisionValue) > 0 && Number(nonPrecisionValue) < 0.001
      ? "< 0.001"
      : new BigNumber(nonPrecisionValue).isGreaterThan(
          new BigNumber(myReadableShare)
        )
      ? toPrecision(myReadableShare, 3)
      : toPrecision(nonPrecisionValue, 3);
  };

  const closeInit = () => {
    const array = new Array(
      updatedMapList[0]?.token_account_ids?.length || 2
    ).fill("");
    setInputValList(array);
    setFeeValue(0.1);
    setActive(0.1);
    changeShareVal(0);
    setCanSubmit(false);
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
      <div
        style={{
          width: isMobile && "100vw",
        }}
      >
        <div className="flex items-center justify-between mb-4 xsm:hidden">
          <RemoveLiqTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer hover:opacity-90"
            onClick={() => {
              onRequestClose();
              closeInit();
            }}
          />
        </div>

        <div className="lg:w-108 xsm:w-full min-h-123 rounded-lg bg-dark-10 px-4 py-5">
          <div className="lg:hidden text-white font-medium text-lg mb-6">
            Remove Liquidity
          </div>
          {/* tab */}
          <div className="w-full bg-dark-10 h-11 frcc rounded border border-gray-40 p-1 mb-5">
            {removeTab.map((item: any, index: number) => {
              return (
                <div
                  key={item.key + "_" + index + Math.random()}
                  onClick={() => setRemoveTabActive(item.key)}
                  className={`frcc text-base font-bold h-full flex-1 rounded cursor-pointer ${
                    item.key == removeTabActive
                      ? "text-white bg-gray-40"
                      : "text-gray-50 bg-transparent"
                  }`}
                >
                  {item.value}
                  <HoverTip
                    msg={item.tips}
                    extraStyles={`w-45`}
                    mobileRight={isMobile && index == 1 ? true : false}
                  />
                </div>
              );
            })}
          </div>
          {/*  */}
          {removeTabActive == "share" && (
            <div>
              <div>
                <div className="flex items-center justify-between text-gray-50 mb-2 text-sm">
                  <span>Shares</span>
                  <span
                    className={`underline hover:cursor-pointer  ${
                      shareVal >=
                      (addSuccess > 0 ? newsharesDecimals : sharesDecimals)
                        ? "text-green-10 "
                        : "text-gray-50"
                    }`}
                    onClick={() =>
                      changeShareVal(
                        addSuccess > 0 ? newsharesDecimals : sharesDecimals
                      )
                    }
                  >
                    Max
                  </span>
                </div>
                <div
                  className={`flex h-16 w-full items-center border border-transparent  rounded hover:border-green-20`}
                  style={{ background: "rgba(0,0,0,.2)" }}
                >
                  <input
                    type="number"
                    className={`h-16 p-3 w-full ${
                      +(addSuccess > 0 ? newsharesDecimals : sharesDecimals) > 0
                        ? "text-white"
                        : "text-gray-50"
                    }`}
                    style={{ fontSize: "26px" }}
                    placeholder="0"
                    disabled={
                      +(addSuccess > 0 ? newsharesDecimals : sharesDecimals) <=
                      0
                    }
                    value={shareVal}
                    onChange={(e) => {
                      changeShareVal(e.target.value);
                    }}
                  />
                </div>
              </div>
              <RangeSlider
                sliderAmount={shareVal || 0}
                setSliderAmount={changeShareVal}
                max={addSuccess > 0 ? newsharesDecimals : sharesDecimals}
                // setAmount={changeVal}
              ></RangeSlider>

              {/* slippage */}
              <div className="flex items-center justify-between mt-12 flex-wrap">
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
                {(feeValue == 0 || feeValue >= 2) && (
                  <div
                    className={`w-full text-right mt-2 text-xs xsm:hidden ${
                      feeValue == 0 ? "text-error" : "text-warn"
                    }`}
                    style={{ flex: "100%" }}
                  >
                    {feeValue == 0
                      ? "The slippage tolerance is invalid"
                      : "Be careful, please check the minimum you can receive"}
                  </div>
                )}
              </div>
              <div
                className={`flex items-center justify-between flex-1 text-sm py-1 mt-2 lg:hidden flex-wrap`}
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
                {(feeValue == 0 || feeValue >= 2) && (
                  <div
                    className={`w-full text-right mt-2 text-xs lg:hidden ${
                      feeValue == 0 ? "text-error" : "text-warn"
                    }`}
                    style={{ flex: "100%" }}
                  >
                    {feeValue == 0
                      ? "The slippage tolerance is invalid"
                      : "Be careful, please check the minimum you can receive"}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-50 frcc">
                  Minimum received
                </div>
              </div>

              {updatedMapList[0]?.token_account_ids?.length <= 2 && (
                <div className="flex flex-wrap items-center justify-between">
                  {updatedMapList[0]?.token_account_ids?.map(
                    (ite: any, ind: number) => {
                      return (
                        <>
                          <div
                            key={ite.tokenId}
                            className="flex lg:h-13 xsm:h-12 mt-2 p-2 lg:w-45 xsm:w-5/12 shrink-0 items-center rounded bg-gray-310"
                          >
                            <Icon icon={ite.icon} className="h-7 w-7 mr-2" />
                            <span className="text-gray-50 text-base xsm:hidden">
                              {ite.symbol}
                            </span>
                            <span className="text-base text-white ml-2 xsm:hidden">
                              {calcTokenReceived(receiveAmounts[ind], ite)}
                            </span>

                            <div className="lg:hidden flex flex-col justify-center">
                              <span className="text-sm text-white">
                                {calcTokenReceived(receiveAmounts[ind], ite)}
                              </span>
                              <span className="text-gray-50 text-sm">
                                {ite.symbol}
                              </span>
                            </div>
                          </div>
                          <span className="text-gray-50 text-lg">
                            {ind <
                            updatedMapList[0]?.token_account_ids.length - 1
                              ? "+"
                              : ""}
                          </span>
                        </>
                      );
                    }
                  )}
                </div>
              )}

              {updatedMapList[0]?.token_account_ids?.length > 2 && (
                <div className="flex items-center justify-between bg-gray-230 rounded mt-4">
                  {updatedMapList[0]?.token_account_ids?.map(
                    (ite: any, ind: number) => {
                      return (
                        <>
                          <div
                            key={ite.tokenId}
                            className="flex lg:h-13 xsm:h-12 px-2 shrink-0 items-center rounded "
                          >
                            <Icon icon={ite.icon} className="h-6 w-6 mr-1" />
                            <div className="flex flex-col">
                              <span className="text-gray-50 text-xs xsm:hidden">
                                {ite.symbol}
                              </span>
                              <span className="text-sm text-white xsm:hidden">
                                {calcTokenReceived(receiveAmounts[ind], ite)}
                              </span>
                            </div>

                            <div className="lg:hidden flex flex-col justify-center">
                              <span className="text-gray-50 text-xs">
                                {ite.symbol}
                              </span>
                              <span className="text-sm text-white">
                                {calcTokenReceived(receiveAmounts[ind], ite)}
                              </span>
                            </div>
                          </div>
                          <span className="text-gray-50 text-sm">
                            {ind <
                            updatedMapList[0]?.token_account_ids.length - 1
                              ? "+"
                              : ""}
                          </span>
                        </>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

          {removeTabActive == "token" && (
            <>
              {/*  */}
              {updatedMapList[0]?.token_account_ids?.map(
                (ite: any, ind: number) => {
                  return (
                    <div key={ite.tokenId}>
                      <div className="mb-6">
                        <div
                          className="flex h-16 w-full items-center border border-transparent hover:border-green-20 rounded pr-3"
                          style={{ background: "rgba(0,0,0,.2)" }}
                        >
                          <input
                            type="number"
                            className="h-16 p-3 lg:w-74 text-white"
                            style={{ fontSize: "26px" }}
                            value={inputValList[ind]}
                            onChange={(e) => changeVal(e, ind)}
                            placeholder="0"
                          />
                          <Icon icon={ite.icon} className="h-7 w-7 mr-2" />
                          <span className="text-white text-base">
                            {ite.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}

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
                <div className="text-sm text-gray-50 frcc">Shares</div>
                <div className="text-white text-sm">{calcSharesRemoved()}</div>
              </div>
              {/* tips  */}
              {error && (
                <div
                  className="text-yellow-10 text-sm border h-11 w-full rounded flex px-4 py-1 items-center my-6"
                  style={{
                    borderColor: "rgba(230, 180, 1, 0.3)",
                    backgroundColor: "rgba(230, 180, 1, 0.14)",
                  }}
                >
                  <span>{`Insufficient shares`}</span>
                </div>
              )}
            </>
          )}
          {/* submit */}
          {accountStore.isSignedIn ? (
            (removeTabActive == "share" ? canSubmit : canSubmitByToken) ? (
              <div
                className="poolBtnStyleBase h-11 mt-6 cursor-pointer hover:opacity-90"
                onClick={() => {
                  setIsLoading(true);
                  submit();
                }}
              >
                <ButtonTextWrapper
                  loading={isLoading}
                  Text={() => <span>Remove Liquidity</span>}
                />
              </div>
            ) : (
              <div className="poolBtnStyleDefaultBase h-11 mt-6 cursor-not-allowed">
                Remove Liquidity
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
    </Modal>
  );
}
export default React.memo(StableRemove);
