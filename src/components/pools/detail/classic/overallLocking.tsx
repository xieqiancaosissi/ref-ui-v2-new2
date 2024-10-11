import React, { useEffect, useState, useMemo, use } from "react";
import HoverTooltip from "@/components/common/HoverToolTip";
import { ExclamationIcon } from "@/components/common/Icons";
import { LockIcon, LockWithoutCircle, UnlockWithoutCircle } from "../../icon";
import {
  toInternationalCurrencySystem_usd,
  format_apy,
  formatPercentage,
} from "@/utils/uiNumber";
import styles from "./style.module.css";
import OverallLockingPie from "./overallLockingCharts";
import {
  mft_has_registered,
  get_accounts_paged,
  ILock,
} from "@/services/lplock";
import getConfig from "@/utils/config";
import Big from "big.js";
import { useAccountStore } from "@/stores/account";
import { secToTime } from "@/utils/time";
import MyLockingDetailTip from "./myLockingDetails";
import { getSharesInPool } from "@/services/pool";
import LockedModal from "./LockedModal";
import UnLockedModal from "./UnLockedModal";
import { ArrowDown, ArrowUpWithYellow } from "../liquidity/components/add/Icon";

function OverallLocking(props: any) {
  const { poolDetail, updatedMapList, shares, addSuccess, setAddSuccess } =
    props;
  const detailItem = [
    {
      title: "TVL",
      value: "tvl",
    },
    {
      title: "Volume(24h)",
      value: "volume_24h",
    },
    {
      title: "Fee(24h)",
      value: "fee_volume_24h",
    },
    {
      title: "APR",
      value: "apy",
    },
  ];
  //
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const { REF_FI_CONTRACT_ID } = getConfig();
  const [isHidden, setIsHidden] = useState(true);
  const [is_mft_registered, set_is_mft_registered] = useState<boolean>(false);
  const [lp_locked_list, set_lp_locked_list] = useState<Record<string, ILock>>(
    {}
  );
  const [isLockedOpen, setIsLockedOpen] = useState<boolean>(false);
  const [isUnLockedOpen, setIsUnLockedOpen] = useState<boolean>(false);
  const [fold, setFold] = useState<boolean>(true);

  const [lockButtonDisabled, setLockButtonDisabled] = useState(true);
  const [unLockButtonDisabled, setUnLockButtonDisabled] = useState(true);
  //
  const [your_locked_percent, your_unLocked_time, your_locked_balance] =
    useMemo(() => {
      if (accountId && lp_locked_list[accountId]) {
        const { locked_balance, unlock_time_sec } = lp_locked_list[accountId];
        return [
          getSharesPercent(locked_balance),
          secToTime(unlock_time_sec),
          locked_balance,
        ];
      }
      return [{ percent: "", displayPercent: "" }, "", "0"];
    }, [accountId, lp_locked_list, addSuccess]);

  //
  const total_locked_percent = useMemo(() => {
    const totalLocked = Object.values(lp_locked_list).reduce((sum, cur) => {
      return sum.plus(cur.locked_balance);
    }, Big(0));
    return getSharesPercent(totalLocked.toFixed());
  }, [lp_locked_list, addSuccess]);

  //
  async function init() {
    const r = await mft_has_registered(`:${poolDetail?.id}`);
    set_is_mft_registered(r);
    if (r) {
      const locked_list: any[] = await get_accounts_paged();
      const locked_token_id = `${REF_FI_CONTRACT_ID}@:${poolDetail?.id}`;
      const current_lp_locked_list = locked_list.reduce((acc, cur) => {
        if (cur.locked_tokens[locked_token_id]) {
          return {
            ...acc,
            [cur.account_id]: {
              ...cur.locked_tokens[locked_token_id],
              token_id: locked_token_id,
            },
          };
        }
        return acc;
      }, {});
      set_lp_locked_list(current_lp_locked_list);
    }
  }

  function getSharesPercent(locked_balance: string) {
    const sharesInPool = poolDetail?.shares_total_supply;
    const sharesInLocked = locked_balance;
    let percent = "0";
    let displayPercent = "0%";
    if (Big(sharesInPool || "0").gt(0)) {
      percent = Big(sharesInLocked).div(sharesInPool).mul(100).toFixed();
      displayPercent = formatPercentage(percent);
    }
    return {
      percent,
      displayPercent,
    };
  }
  //
  useEffect(() => {
    if (addSuccess > 0 || poolDetail?.id) {
      init();
    }
  }, [JSON.stringify(poolDetail || {}), addSuccess]);

  useEffect(() => {
    if (shares) setLockButtonDisabled(Big(shares || 0).lte(0));
  }, [shares]);

  useEffect(() => {
    // //
    // getSharesInPool(+poolDetail?.id)
    //   .then(setShares)
    //   .catch(() => setShares);

    setUnLockButtonDisabled(
      Big(lp_locked_list?.[accountId]?.unlock_time_sec || 0).gte(
        new Date().getTime() / 1000
      ) || !your_unLocked_time
    );
  }, [lp_locked_list, your_unLocked_time, accountId, addSuccess]);

  function closeLockedModal() {
    setIsLockedOpen(false);
  }
  function openLockedModal() {
    if (!lockButtonDisabled) {
      setIsLockedOpen(true);
    }
  }
  function closeUnLockedModal() {
    setIsUnLockedOpen(false);
  }
  function openUnLockedModal() {
    if (!unLockButtonDisabled) {
      setIsUnLockedOpen(true);
    }
  }

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
    <div className="min-h-34">
      {poolDetail && (
        <div className="flex items-center lg:justify-around xsm:flex-wrap xsm:justify-between">
          {detailItem.map((item) => {
            return (
              <div
                key={item.title}
                className="lg:w-45 xsm:my-0.5 h-17  text-white box-border flex flex-col justify-center pl-4 rounded-md bg-refPublicBoxDarkBg"
                style={{
                  width: !isMobile ? "" : "46vw",
                }}
              >
                <h3 className="text-sm text-gray-50 font-normal">
                  {item.title}
                </h3>
                <p className="text-lg font-bold">
                  {item.value == "apy"
                    ? format_apy(poolDetail.apy)
                    : toInternationalCurrencySystem_usd(poolDetail[item.value])}
                  {/* farm apy */}
                  {item.value == "apy" && poolDetail.farm_apy && (
                    <span className="text-xs text-primaryGreen ml-2">
                      {poolDetail.farm_apy == 0
                        ? ""
                        : `+${format_apy(poolDetail.farm_apy)}`}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
      {/* Overall locking */}
      <div className="w-full min-h-17 text-white  rounded-md mt-1 flex flex-col justify-center items-start px-4 bg-refPublicBoxDarkBg">
        {/* locking detail */}
        <div className="flex items-center w-full h-17 xsm:justify-between">
          <div className="text-sm text-gray-50 font-normal lg:mr-40">
            <h3 className="frcc">
              <span>Overall locking</span>
              <div className="pt-1 ml-1">
                <HoverTooltip tooltipText="" isOverlocking={true}>
                  <ExclamationIcon className="opacity-40 hover:opacity-100" />
                </HoverTooltip>
              </div>
            </h3>
            <p className="text-lg font-bold text-white flex items-center">
              {total_locked_percent?.displayPercent || "-"}
              <LockIcon />
            </p>
          </div>
          <div className="lg:flex-1 text-sm text-gray-50 font-normal">
            <h3>My Locking</h3>
            <p className="text-lg font-bold text-primaryGreen flex items-center">
              {your_locked_percent?.displayPercent || "-"}
              <LockIcon />
            </p>
          </div>
          <div
            className={`xsm:hidden text-right border border-gray-60 w-5 h-5 rounded-md frcc cursor-pointer ${styles.triangleWrapper}`}
            onClick={() => {
              setIsHidden(!isHidden);
            }}
          >
            <div
              className={isHidden ? styles.triangleDown : styles.triangleUp}
            ></div>
          </div>
          <div
            className="lg:hidden"
            onClick={() => {
              setIsHidden(!isHidden);
            }}
          >
            {isHidden ? <ArrowDown /> : <ArrowUpWithYellow />}
          </div>
        </div>
        {/* hidden */}
        {!isHidden && !isMobile && (
          <div className="select-none lg:w-175 xsm:w-full">
            {/*lock list */}
            <div
              className="w-full lg:max-h-60 rounded-lg lg:overflow-y-auto p-4 text-sm text-gray-10 font-normal"
              style={{
                background: "rgba(33, 43, 53, 0.5)",
              }}
            >
              {/*lock title */}
              <div className="flex w-full xsm:justify-between">
                <span className="flex-1 lg:mr-14 ">Phase locking</span>
                <span className="flex-1 ">Expiration time</span>
                <span className="xsm:hidden flex-1"></span>
              </div>

              {/*lock body */}
              <div>
                {/* my lock */}
                {your_locked_percent?.displayPercent && (
                  <div className="flex w-full text-gray-50 lg:mt-4 xsm:py-2 xsm:border-t-gray-240 xsm:border xsm:border-transparent">
                    <div className="flex-1 mr-14 flex items-center ">
                      <OverallLockingPie percent={0} />
                      {/* tips */}
                      <MyLockingDetailTip
                        poolDetail={poolDetail}
                        your_locked_balance={your_locked_balance}
                        accountId={accountId}
                        updatedMapList={updatedMapList}
                      >
                        <span className="text-white mr-1 underline cursor-pointer">
                          {your_locked_percent?.displayPercent || "-"}
                        </span>
                      </MyLockingDetailTip>
                      <span>Locked</span>
                      <div
                        className="w-15 h-4 frcc text-xs text-primaryGreen ml-2 italic"
                        style={{
                          background: "rgba(154, 248, 1, 0.1)",
                          borderRadius: "30px",
                        }}
                      >
                        My Lock
                      </div>
                    </div>
                    <span className="flex-1">{your_unLocked_time}</span>
                    <span className="flex-1"></span>
                  </div>
                )}
                {/*total lock item */}
                {Object.entries(lp_locked_list)
                  .sort((b, a) => {
                    return b[1].unlock_time_sec - a[1].unlock_time_sec;
                  })
                  .map(([account_id, lockedData], index) => {
                    const { percent, displayPercent } = getSharesPercent(
                      lockedData.locked_balance
                    );
                    return (
                      <div
                        className="flex w-full text-gray-50 lg:mt-4 xsm:py-2 xsm:border-t-gray-240 xsm:border xsm:border-transparent"
                        key={accountId + "_" + index}
                      >
                        <div className="flex-1 mr-14 flex items-center">
                          <OverallLockingPie percent={+percent} />
                          <span className="text-white mr-1">
                            {displayPercent}
                          </span>
                          <span>Locked</span>
                        </div>
                        <span className="flex-1">
                          {secToTime(lockedData.unlock_time_sec)}
                        </span>
                        <span className="flex-1"></span>
                      </div>
                    );
                  })}
                {/*  */}
              </div>
            </div>

            {/* btn */}
            <div className="flex justify-end my-4 text-xs font-bold cursor-pointer">
              <div
                onClick={openLockedModal}
                className={`w-23 h-8 frcc border border-gray-40 rounded mx-1 ${
                  lockButtonDisabled ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <LockWithoutCircle /> <span className="ml-1">Lock</span>
              </div>
              <div
                onClick={openUnLockedModal}
                className={`w-23 h-8 frcc border border-gray-40 rounded mx-1 ${
                  unLockButtonDisabled ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <UnlockWithoutCircle /> <span className="ml-1">Unlock</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {!isHidden && isMobile && (
        <div className="select-none lg:w-175 xsm:w-full">
          {/*lock list */}
          <div
            className="w-full lg:max-h-60 rounded-lg lg:overflow-y-auto p-4 text-sm text-gray-10 font-normal"
            style={{
              background: "rgba(33, 43, 53, 0.5)",
            }}
          >
            {/*lock title */}
            <div className="flex w-full xsm:justify-between mb-4">
              <span className="flex-1 lg:mr-14 ">Phase locking</span>
              <span className="flex-1 ">Expiration time</span>
            </div>

            {/*lock body */}
            <div>
              {/* my lock */}
              {your_locked_percent?.displayPercent && (
                <div className="flex w-full text-gray-50 lg:mt-4 xsm:py-2 xsm:border-t-gray-240 xsm:border xsm:border-transparent">
                  <div className="frcc">
                    <OverallLockingPie percent={0} />

                    <div>
                      <div className="flex-1 flex items-center ">
                        {/* tips */}
                        <MyLockingDetailTip
                          poolDetail={poolDetail}
                          your_locked_balance={your_locked_balance}
                          accountId={accountId}
                          updatedMapList={updatedMapList}
                        >
                          <span className="text-white mr-1 cursor-pointer">
                            {your_locked_percent?.displayPercent || "-"}
                          </span>
                        </MyLockingDetailTip>

                        <div
                          className="w-15 h-4 frcc text-xs text-primaryGreen italic"
                          style={{
                            background: "rgba(154, 248, 1, 0.1)",
                            borderRadius: "30px",
                          }}
                        >
                          My Lock
                        </div>
                      </div>
                      <span>Locked</span>
                    </div>
                  </div>

                  <div className="flex-1 frcc">{your_unLocked_time}</div>
                </div>
              )}
              {/*total lock item */}
              {Object.entries(lp_locked_list)
                .sort((b, a) => {
                  return b[1].unlock_time_sec - a[1].unlock_time_sec;
                })
                .map(([account_id, lockedData], index) => {
                  const { percent, displayPercent } = getSharesPercent(
                    lockedData.locked_balance
                  );
                  return (
                    <div
                      className="flex w-full text-gray-50 lg:mt-4 xsm:py-2 xsm:border-t-gray-240 xsm:border xsm:border-transparent"
                      key={accountId + "_" + index}
                    >
                      <div className="frcc">
                        <OverallLockingPie percent={+percent} />
                        <div>
                          <div className="flex-1 mr-14 flex items-center">
                            <span className="text-white mr-1">
                              {displayPercent}
                            </span>
                          </div>
                          <span>Locked</span>
                        </div>
                      </div>
                      <div className="flex-1 frcc">
                        {secToTime(lockedData.unlock_time_sec)}
                      </div>
                    </div>
                  );
                })}
              {/*  */}
            </div>
            {/* btn */}
            <div className="frcc my-4 text-xs font-bold cursor-pointer">
              <div
                onClick={openLockedModal}
                className={`w-1/2 h-11 frcc border border-gray-40 rounded mx-1 ${
                  lockButtonDisabled ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <LockWithoutCircle /> <span className="ml-1">Lock</span>
              </div>
              <div
                onClick={openUnLockedModal}
                className={`w-1/2 h-11 frcc border border-gray-40 rounded mx-1 ${
                  unLockButtonDisabled ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <UnlockWithoutCircle /> <span className="ml-1">Unlock</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/*  */}
      {isLockedOpen && (
        <LockedModal
          isOpen={isLockedOpen}
          onRequestClose={closeLockedModal}
          is_mft_registered={is_mft_registered}
          userShares={shares}
          lockedData={lp_locked_list[accountId]}
          pool={poolDetail}
          tokens={updatedMapList[0].token_account_ids}
          setAddSuccess={setAddSuccess}
        />
      )}
      {isUnLockedOpen && (
        <UnLockedModal
          isOpen={isUnLockedOpen}
          onRequestClose={closeUnLockedModal}
          is_mft_registered={is_mft_registered}
          userShares={shares}
          lockedData={lp_locked_list[accountId]}
          pool={poolDetail}
          tokens={updatedMapList[0].token_account_ids}
          setAddSuccess={setAddSuccess}
        />
      )}
    </div>
  );
}
export default React.memo(OverallLocking);
