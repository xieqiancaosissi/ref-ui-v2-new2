import React, { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import { RemoveLiqTitleIcon } from "../icon";
import { LpModalCloseIcon } from "@/components/pools/icon";
import { Icon } from "../IconCom";
import { ftGetBalance } from "@/services/token";
import { toReadableNumber } from "@/utils/numbers";
import _ from "lodash";
import { useAccountStore } from "@/stores/account";
import poolStyle from "./index.module.css";
import { feeList } from "./config";
import HoverTip from "@/components/common/Tips";
import BigNumber from "bignumber.js";
import { percent, toPrecision } from "@/utils/numbers";
import { RATED_POOL_LP_TOKEN_DECIMALS } from "@/utils/constant";
import { ButtonTextWrapper } from "@/components/common/Button";
import { toNonDivisibleNumber } from "@/utils/numbers";
import { usePool } from "@/hooks/usePools";
import { toInternationalCurrencySystem } from "@/utils/numbers";
import { useRemoveLiquidity } from "@/hooks/usePools";
import { useIntl } from "react-intl";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import successToast from "@/components/common/toast/successToast";
import failToast from "@/components/common/toast/failToast";
import { openUrlLocal } from "@/services/commonV3";
import { beautifyNumber } from "@/components/common/beautifyNumber";
import { ShareInFarmV2 } from "../../stable/ShareInFarm";
import { useCanFarmV1, useCanFarmV2 } from "@/hooks/useStableShares";
import { useYourliquidity } from "@/hooks/useStableShares";
import { useRouter } from "next/router";

export const REF_FI_PRE_LIQUIDITY_ID_KEY = "REF_FI_PRE_LIQUIDITY_ID_VALUE";

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

function ClassicRemove(props: any) {
  const router = useRouter();
  const accountStore = useAccountStore();
  const intl = useIntl();
  const appStore = useAppStore();
  const {
    isOpen,
    onRequestClose,
    poolDetail,
    pureIdList,
    updatedMapList,
    isMobile,
    setAddSuccess,
    addSuccess,
    shares,
    fromYours,
    pool,
  } = props;

  useEffect(() => {
    const array = new Array(
      updatedMapList[0]?.token_account_ids?.length || 2
    ).fill("");
  }, [updatedMapList[0]?.token_account_ids]);

  const { farmCount: countV1, endedFarmCount: endedFarmCountV1 } = useCanFarmV1(
    poolDetail.id,
    true
  );

  const { farmCount: countV2, endedFarmCount: endedFarmCountV2 } = useCanFarmV2(
    poolDetail.id,
    true
  );
  const { farmStakeV1, farmStakeV2, userTotalShare, shadowBurrowShare } =
    useYourliquidity(poolDetail.id);
  const originalSendSearchValue = (e: any) => {
    // setSearchValue(e.target.value);
  };

  const debouncedSendSearchValue = _.debounce(originalSendSearchValue, 10);

  //

  const [isActive, setActive] = useState(0.5);
  const [feeValue, setFeeValue] = useState(isActive);

  const [canSubmit, setCanSubmit] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  function submit() {
    const amountBN = new BigNumber((shareVal || "0")?.toString());
    const shareBN = new BigNumber(toReadableNumber(24, shares));
    if (Number(shareVal || "0") === 0) {
      throw new Error(
        intl.formatMessage({ id: "must_input_a_value_greater_than_zero" })
      );
    }
    if (amountBN.isGreaterThan(shareBN)) {
      throw new Error(
        intl.formatMessage({
          id: "input_greater_than_available_shares",
        })
      );
    }
    localStorage.setItem(REF_FI_PRE_LIQUIDITY_ID_KEY, poolDetail.id.toString());
    return removeLiquidity()
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
  // tab change
  const [removeTabActive, setRemoveTabActive] = useState("share");

  // by share
  // const { shares } = usePool(poolDetail.id);
  const sharesDecimals = toReadableNumber(24, shares);
  const [shareVal, setShareVal] = useState("");
  const changeShareVal = (val: any) => {
    setCanSubmit(true);
    if (+val > +sharesDecimals) {
      setCanSubmit(false);
    }
    setShareVal(val ? val : "");
  };

  const { minimumAmounts, removeLiquidity } = useRemoveLiquidity({
    pool,
    slippageTolerance: feeValue,
    shares: shareVal ? toNonDivisibleNumber(24, shareVal || "0") : "0",
  });

  const closeInit = () => {
    changeShareVal(0);
    setActive(0.5);
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
        content: isMobile
          ? {
              transform: "translateX(-50%)",
              top: "auto",
              bottom: "32px",
            }
          : {
              outline: "none",
              transform: "translate(-50%, -50%)",
            },
      }}
    >
      <div
        style={{
          width: isMobile ? "100vw" : "auto",
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

        <div className="flex flex-col justify-between lg:w-108 xsm:w-full lg:min-h-84 rounded-lg bg-dark-10 px-4 py-5">
          <div className="lg:hidden text-white font-medium text-lg mb-6">
            Remove Liquidity
          </div>
          {/*  */}
          {removeTabActive == "share" && (
            <div>
              <div>
                <div className="flex items-center justify-between text-gray-50 mb-2 text-sm">
                  <span>Available LP Tokens</span>
                  <span onClick={() => changeShareVal(sharesDecimals)}>
                    {beautifyNumber({
                      num: sharesDecimals,
                      className: `underline hover:cursor-pointer  ${
                        shareVal >= sharesDecimals
                          ? "text-green-10"
                          : "text-gray-50 lg:hover:text-white"
                      }`,
                    })}
                  </span>
                </div>
                <div
                  className="flex h-16 w-full items-center border border-transparent hover:border-green-20 rounded pr-3"
                  style={{ background: "rgba(0,0,0,.2)" }}
                >
                  <input
                    type="number"
                    className="h-16 p-3 w-full text-white"
                    style={{ fontSize: "26px" }}
                    placeholder="0"
                    value={shareVal}
                    onChange={(e) => {
                      changeShareVal(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center mt-1">
                {countV1 > endedFarmCountV1 || Number(farmStakeV1) > 0 ? (
                  <ShareInFarmV2
                    farmStake={farmStakeV1}
                    userTotalShare={userTotalShare}
                    version={"Legacy"}
                    hideIcon={isMobile}
                    useFarmAmount
                    lpDecimal={24}
                    useMx={false}
                  />
                ) : null}
                {countV2 > endedFarmCountV2 || Number(farmStakeV2) > 0 ? (
                  <ShareInFarmV2
                    farmStake={farmStakeV2}
                    userTotalShare={userTotalShare}
                    version={"Classic"}
                    poolId={poolDetail.id}
                    onlyEndedFarm={countV2 === endedFarmCountV2}
                    hideIcon={isMobile}
                    useFarmAmount
                    lpDecimal={24}
                    useMx={false}
                  />
                ) : null}
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
                </div>
              </div>
              {/* slippage radio pc */}
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
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-50 frcc">
                  Minimum received
                </div>
              </div>

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
                          <span
                            title={toInternationalCurrencySystem(
                              toPrecision(
                                toReadableNumber(
                                  ite.decimals,
                                  minimumAmounts[ite.id]
                                ),
                                4
                              ),
                              4
                            )}
                            className="text-base text-white ml-2 xsm:hidden text-ellipsis overflow-hidden whitespace-nowrap"
                          >
                            {toInternationalCurrencySystem(
                              toPrecision(
                                toReadableNumber(
                                  ite.decimals,
                                  minimumAmounts[ite.id]
                                ),
                                4
                              ),
                              4
                            )}
                          </span>

                          <div className="lg:hidden flex flex-col justify-center text-ellipsis overflow-hidden whitespace-nowrap">
                            <span className="text-sm text-white">
                              {toInternationalCurrencySystem(
                                toPrecision(
                                  toReadableNumber(
                                    ite.decimals,
                                    minimumAmounts[ite.id]
                                  ),
                                  4
                                ),
                                4
                              )}
                            </span>
                            <span className="text-gray-50 text-sm">
                              {ite.symbol}
                            </span>
                          </div>
                        </div>
                        <span className="text-gray-50 text-lg">
                          {ind < updatedMapList[0]?.token_account_ids.length - 1
                            ? "+"
                            : ""}
                        </span>
                      </>
                    );
                  }
                )}
              </div>
            </div>
          )}
          <div>
            {!canSubmit && (
              <div
                className="text-yellow-10 text-sm border h-11 w-full rounded flex px-2 py-1 items-center my-2"
                style={{
                  borderColor: "rgba(230, 180, 1, 0.3)",
                  backgroundColor: "rgba(230, 180, 1, 0.14)",
                }}
              >
                <span>{` Input greater than available shares`}</span>
              </div>
            )}

            {/* submit */}
            {accountStore.isSignedIn ? (
              canSubmit && +(shareVal || "0") > 0 ? (
                <div
                  className="poolBtnStyleActiveEmpty h-11 lg:mt-2 xsm:mt-7  cursor-pointer hover:opacity-90"
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
                <div className="poolBtnStyleDisable h-11 lg:mt-2 xsm:mt-7 cursor-not-allowed">
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
      </div>
    </Modal>
  );
}
export default React.memo(ClassicRemove);
