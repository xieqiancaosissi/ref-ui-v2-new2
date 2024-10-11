import {
  Seed,
  BoostConfig,
  UserSeedInfo,
  stake_boost,
  getMftTokenId,
  get_config,
  unStake_boost,
  stake_boost_shadow,
  mftGetBalance,
  unStake_boost_shadow,
} from "@/services/farm";
import { useContext, useEffect, useState } from "react";
import styles from "../farm.module.css";
import {
  LP_STABLE_TOKEN_DECIMALS,
  LP_TOKEN_DECIMALS,
} from "@/services/m-token";
import {
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import getConfig from "@/utils/config";
import BigNumber from "bignumber.js";
import { ButtonTextWrapper } from "@/components/common/Button";
import {
  ArrowDownHollow,
  FarmDetailsWarn,
  GoldLevel1,
  GoldLevel2,
  GoldLevel3,
  GoldLevel4,
  VEARROW,
} from "../icon";
import { CalcIcon } from "../icon/FarmBoost";
import { useAccountStore } from "@/stores/account";
import { showWalletSelectorModal } from "@/utils/wallet";
import { useAppStore } from "@/stores/app";
import getConfigV2 from "@/utils/configV2";
import { IExecutionResult } from "@/interfaces/wallet";
import successToast from "@/components/common/toast/successToast";
import failToast from "@/components/common/toast/failToast";
import { BeatLoader } from "react-spinners";
import getStablePoolTypeConfig from "@/utils/stablePoolConfig/stablePoolTypeConfig";
import { FarmsContextData } from "./FarmsContext";
import CalcEle from "./CalcEle";
import React from "react";
import { useFarmStore } from "@/stores/farm";
const stablePoolTypeConfig = getStablePoolTypeConfig();
const { STABLE_POOL_IDS } = stablePoolTypeConfig;
const { FARM_LOCK_SWITCH, REF_VE_CONTRACT_ID, FARM_BLACK_LIST_V2 } =
  getConfig();
const configV2 = getConfigV2();
function FarmsDetailStake(props: {
  detailData: Seed;
  tokenPriceList: any;
  lpBalance: string;
  stakeType: string;
  serverTime: number;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
  user_data_loading: Boolean;
  radio: string | number;
  activeMobileTab?: string;
  updateSharesAndBalance: any;
}) {
  const {
    detailData,
    lpBalance,
    stakeType,
    serverTime,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
    activeMobileTab,
    user_data_loading,
    updateSharesAndBalance,
  } = props;
  const init = useFarmStore((state) => state.init);
  const getConfig = useFarmStore((state) => state.getConfig);
  const get_user_unWithDraw_rewards = useFarmStore(
    (state) => state.get_user_unWithDraw_rewards
  );
  const get_user_seeds_and_unClaimedRewards = useFarmStore(
    (state) => state.get_user_seeds_and_unClaimedRewards
  );
  const {
    pool,
    min_locking_duration_sec,
    total_seed_amount,
    total_seed_power,
    min_deposit,
    seed_id,
  } = detailData;
  const DECIMALS =
    pool && new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
      ? LP_STABLE_TOKEN_DECIMALS
      : LP_TOKEN_DECIMALS;
  const {
    free_amount = "0",
    locked_amount = "0",
    shadow_amount = "0",
    x_locked_amount = "0",
    unlock_timestamp,
    duration_sec,
  } = user_seeds_map[seed_id] || {};
  const appStore = useAppStore();
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.getAccountId();
  const freeAmount = toReadableNumber(DECIMALS, free_amount);
  const lockAmount = toReadableNumber(DECIMALS, locked_amount);
  const lockedAmount = toReadableNumber(DECIMALS, locked_amount);
  const [selectedLockData, setSelectedLockData] = useState<Lock | null>(null);
  const [lockDataList, setLockDataList] = useState<Lock[]>([]);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [unStakeLoading, setUnStakeLoading] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [amount, setAmount] = useState(
    stakeType == "freeToLock" ? freeAmount : ""
  );
  const isEnded = detailData?.farmList?.[0]?.status == "Ended";
  const defaultTab = isEnded ? "unstake" : "stake";
  const [activeTab, setActiveTab] = useState(activeMobileTab || defaultTab);
  const [amountAvailableCheck, setAmountAvailableCheck] = useState(true);
  const [isMaxAmount, setIsMaxAmount] = useState(false);
  const [isLpMaxAmount, setLpIsMaxAmount] = useState(false);
  const unlpBalances = toReadableNumber(
    DECIMALS,
    BigNumber(free_amount).plus(shadow_amount).toFixed()
  );
  const [sharesInfo, setSharesInfo] = useState<{
    sharesInPool: string | number;
    amountByShadowInFarm: string | number;
    amountByTransferInFarm: string | number;
  }>({
    sharesInPool: "0",
    amountByShadowInFarm: "0",
    amountByTransferInFarm: "0",
  });
  useEffect(() => {
    if (Number(unlpBalances) === 0) {
      setActiveTab("stake");
    } else {
      if (isEnded) {
        setActiveTab("unstake");
      }
    }
  }, [unlpBalances]);
  useEffect(() => {
    if (!user_data_loading && isSignedIn) {
      getSharesInfo();
    }
  }, [Object.keys(user_seeds_map).length, user_data_loading, isSignedIn]);
  async function getSharesInfo() {
    const { seed_id } = detailData;
    const { free_amount, shadow_amount } = user_seeds_map[seed_id] || {};
    const poolId = pool?.id || "";
    const sharesInPool = await mftGetBalance(getMftTokenId(poolId.toString()));
    const amountByShadowInFarm = shadow_amount;
    const amountByTransferInFarm = free_amount;
    setSharesInfo({
      sharesInPool: sharesInPool || "0",
      amountByShadowInFarm: amountByShadowInFarm || "0",
      amountByTransferInFarm: amountByTransferInFarm || "0",
    });
  }
  useEffect(() => {
    if (stakeType !== "free") {
      const goldList = [
        <GoldLevel1 key="1" />,
        <GoldLevel2 key="2" />,
        <GoldLevel3 key="3" />,
        <GoldLevel4 key="4" />,
      ];
      const lockable_duration_month = [1, 3, 6, 12];
      const lockable_duration_second = lockable_duration_month.map(
        (duration: number, index: number) => {
          return {
            second: duration * 2592000,
            month: duration,
            icon: goldList[index],
          };
        }
      );
      let restTime_sec = 0;
      const user_seed = user_seeds_map[seed_id];
      if (user_seed.unlock_timestamp) {
        restTime_sec = new BigNumber(user_seed.unlock_timestamp)
          .minus(serverTime)
          .dividedBy(1000000000)
          .toNumber();
      }
      get_config().then((config) => {
        const list: any = [];
        const { maximum_locking_duration_sec, max_locking_multiplier } = config;
        lockable_duration_second.forEach(
          (item: { second: number; month: number; icon: any }, index) => {
            if (
              item.second >= Math.max(min_locking_duration_sec, restTime_sec) &&
              item.second <= maximum_locking_duration_sec
            ) {
              const locking_multiplier =
                ((max_locking_multiplier - 10000) * item.second) /
                (maximum_locking_duration_sec * 10000);
              list.push({
                ...item,
                multiplier: locking_multiplier,
              });
            }
          }
        );
        setLockDataList(list);
        setSelectedLockData(list[0]);
      });
    }
  }, [stakeType]);
  function changeAmount(value: string) {
    setAmount(value);
    // check
    const curValue = toNonDivisibleNumber(DECIMALS, value);
    if (value && new BigNumber(curValue).isLessThan(min_deposit)) {
      setAmountAvailableCheck(false);
    } else {
      setAmountAvailableCheck(true);
    }
    if (value === lpBalance) {
      setIsMaxAmount(true);
    } else {
      setIsMaxAmount(false);
    }
    if (value === unlpBalances) {
      setLpIsMaxAmount(true);
    } else {
      setLpIsMaxAmount(false);
    }
  }
  function displayLpBalance() {
    if (lpBalance === undefined || lpBalance === null || lpBalance === "") {
      return <BeatLoader size={5} color={"#ffffff"} />;
    } else {
      return toPrecision(lpBalance, 8);
    }
  }
  const isDisabledUnstake =
    !amount ||
    new BigNumber(amount).isLessThanOrEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(new BigNumber(unlpBalances));

  const minDepositReadable = toReadableNumber(DECIMALS, min_deposit);
  const isDisabledStake =
    !amount ||
    new BigNumber(amount).isLessThanOrEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(new BigNumber(lpBalance)) ||
    new BigNumber(amount).isLessThanOrEqualTo(
      new BigNumber(minDepositReadable)
    );

  function formatCheckedList(data) {
    if (!data || typeof data !== "object") {
      return {};
    }
    const formattedData = {};
    for (const [key, value] of Object.entries(data)) {
      formattedData[key] = { value: value.toString() };
    }
    return formattedData;
  }
  function operationStake() {
    setStakeLoading(true);
    let msg = "";
    const formattedCheckedList = formatCheckedList(user_unclaimed_map[seed_id]);
    if (
      stakeType == "free" ||
      min_locking_duration_sec == 0 ||
      FARM_LOCK_SWITCH == 0
    ) {
      msg = JSON.stringify("Free");
    } else if (stakeType === "lock" && selectedLockData) {
      msg = JSON.stringify({
        Lock: {
          duration_sec: selectedLockData.second,
        },
      });
    }
    if (
      configV2.SUPPORT_SHADOW_POOL_IDS.includes((pool?.id || "").toString())
    ) {
      stake_boost_shadow({
        pool_id: +(pool?.id || ""),
        amount: toNonDivisibleNumber(DECIMALS, amount),
        amountByTransferInFarm: sharesInfo.amountByTransferInFarm,
        seed_id,
        checkedList: formattedCheckedList,
      }).then((res) => {
        handleDataAfterTranstion(res, "stake");
      });
    } else {
      stake_boost({
        token_id: getMftTokenId((pool?.id || "").toString()),
        amount: toNonDivisibleNumber(DECIMALS, amount),
        msg,
        checkedList: formattedCheckedList,
      }).then((res) => {
        handleDataAfterTranstion(res, "stake");
      });
    }
  }
  function operationUnStake() {
    setUnStakeLoading(true);
    const formattedCheckedList = formatCheckedList(user_unclaimed_map[seed_id]);
    if (
      configV2.SUPPORT_SHADOW_POOL_IDS.includes((pool?.id || "").toString())
    ) {
      unStake_boost_shadow({
        seed_id,
        unlock_amount: "0",
        withdraw_amount: toNonDivisibleNumber(DECIMALS, amount),
        amountByTransferInFarm: sharesInfo.amountByTransferInFarm,
        checkedList: formattedCheckedList,
      }).then((res) => {
        handleDataAfterTranstion(res, "unstake");
      });
    } else {
      unStake_boost({
        seed_id,
        unlock_amount: "0",
        withdraw_amount: toNonDivisibleNumber(DECIMALS, amount),
        checkedList: formattedCheckedList,
      }).then((res) => {
        handleDataAfterTranstion(res, "unstake");
      });
    }
  }
  async function handleDataAfterTranstion(
    res: IExecutionResult | undefined,
    type: string
  ) {
    if (!res) return;
    if (res.status == "success") {
      successToast();
      setAmount("0");
      // ontriggerFarmsStakeUpdate();
      updateSharesAndBalance();
      await init();
      await getConfig();
      await get_user_unWithDraw_rewards();
      await get_user_seeds_and_unClaimedRewards();
    } else if (res.status == "error") {
      failToast(res.errorResult?.message);
    }
    if (type == "stake") {
      setStakeLoading(false);
    } else if (type == "unstake") {
      setUnStakeLoading(false);
    }
  }
  function showWalletSelector() {
    showWalletSelectorModal(appStore.setShowRiskModal);
  }
  return (
    <div className={`bg-dark-10 rounded-md p-5 xsm:p-0`}>
      <div className="flex items-center mb-4 xsm:mb-7 xsm:border-b xsm:border-white xsm:border-opacity-10 xsm:px-4">
        <button
          disabled={isEnded}
          className={`text-lg xsm:flex-1 ${
            activeTab === "stake" ? styles.gradient_text : "text-gray-500"
          } ${isEnded ? "cursor-not-allowed text-gray-400" : ""}`}
          onClick={() => {
            if (!isEnded) {
              setActiveTab("stake");
              setAmount("");
              setLpIsMaxAmount(false);
              setIsMaxAmount(false);
              setAmountAvailableCheck(true);
            }
          }}
        >
          Stake
        </button>
        {Number(unlpBalances) > 0 && (
          <div
            className="h-4 bg-gray-50 xsm:hidden mx-5"
            style={{ width: "2px" }}
          />
        )}
        <button
          className={`text-lg xsm:flex-1 ${
            activeTab === "unstake" ? styles.gradient_text : "text-gray-500"
          }  ${Number(unlpBalances) > 0 ? "" : "hidden"}`}
          onClick={() => {
            setActiveTab("unstake");
            setAmount("");
            setLpIsMaxAmount(false);
            setIsMaxAmount(false);
            setAmountAvailableCheck(true);
          }}
        >
          Unstake
        </button>
      </div>
      {activeTab === "stake" && (
        <div className={`xsm:px-4`}>
          <div className="lg:hidden mb-2.5 frcb">
            <div>
              <span
                className="underline cursor-pointer hover:text-primaryGreen"
                onClick={() => {
                  changeAmount(lpBalance);
                }}
              >
                {isSignedIn ? (
                  displayLpBalance()
                ) : (
                  <span className="opacity-50">-</span>
                )}
              </span>
              <span className="text-gray-10 ml-1">available to stake</span>
            </div>
            <div>
              <span
                onClick={() => {
                  changeAmount(lpBalance);
                }}
                className={`text-sm text-gray-50 underline cursor-pointer hover:text-primaryGreen xsm:hidden `}
              >
                Max
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center h-16 px-3 bg-dark-60 rounded-lg xsm:mb-2.5">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={({ target }) => changeAmount(target.value)}
              className="text-white text-lg focus:outline-non appearance-none leading-tight"
            ></input>
            {/* <div className="flex items-center ml-2">
              <span
                onClick={() => {
                  changeAmount(lpBalance);
                }}
                className={`text-sm text-gray-50 underline cursor-pointer hover:text-primaryGreen xsm:hidden`}
              >
                Max
              </span>
            </div> */}
          </div>
          {amountAvailableCheck ? null : (
            <div className="flex justify-center mt-2.5 xsm:mb-2.5">
              <div className="w-full bg-yellow-10 bg-opacity-10 rounded py-2 px-2.5 text-yellow-10 text-sm flex items-center">
                <p className="ml-1 mr-2">
                  Input must be greater than or equal to
                </p>
                {isSignedIn ? (
                  toReadableNumber(DECIMALS, min_deposit)
                ) : (
                  <span className="opacity-50">-</span>
                )}
                {/* <p className="underline frcc">
                  Add liquidity <VEARROW className="ml-1.5"></VEARROW>
                </p> */}
              </div>
            </div>
          )}
          <div
            className="lg:hidden bg-gary-20 rounded mb-6"
            onClick={() => {
              setShowCalc(!showCalc);
            }}
          >
            <div className="frcb">
              <div className="flex items-center mb-2">
                <CalcIcon />
                <label className="text-sm text-gray-10 ml-3 mr-4  cursor-pointer">
                  ROI Calculator
                </label>
              </div>
              <div
                className={
                  "cursor-pointer " +
                  (showCalc
                    ? "transform rotate-180 text-white"
                    : "text-gray-10")
                }
                onClick={() => setShowCalc(!showCalc)}
              >
                <ArrowDownHollow />
              </div>
            </div>
            {showCalc ? (
              <div className={"w-full"} onClick={(e) => e.stopPropagation()}>
                <CalcEle
                  seed={detailData}
                  tokenPriceList={tokenPriceList}
                  lpTokenNumAmount={amount}
                  loveSeed={loveSeed}
                  boostConfig={boostConfig}
                  user_seeds_map={user_seeds_map}
                  user_unclaimed_map={user_unclaimed_map}
                  user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
                  border={false}
                ></CalcEle>
              </div>
            ) : null}
          </div>
          <div className="mt-2.5 text-sm mb-6 xsm:hidden">
            {isSignedIn ? (
              <span
                className={`underline cursor-pointer hover:text-primaryGreen ${
                  isMaxAmount ? "text-primaryGreen" : ""
                }`}
                onClick={() => {
                  changeAmount(lpBalance);
                }}
              >
                {displayLpBalance()}
              </span>
            ) : (
              <span className="opacity-50">-</span>
            )}
            <span className="text-gray-10 ml-1">available to stake</span>
          </div>
          {isSignedIn ? (
            <div
              onClick={() => {
                if (!isDisabledStake) {
                  operationStake();
                }
              }}
              className={`w-full h-11 frcc rounded paceGrotesk-Bold text-base ${
                isDisabledStake
                  ? "cursor-not-allowed bg-gray-40 text-gray-50"
                  : "bg-greenGradient text-black cursor-pointer"
              }`}
            >
              <ButtonTextWrapper
                loading={stakeLoading}
                Text={() => <>Stake</>}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer"
              style={{ height: "42px" }}
              onClick={showWalletSelector}
            >
              Connect Wallet
            </div>
          )}
          <div className="mt-5 xsm:hidden">
            <div
              className="flex items-center justify-between mb-2 cursor-pointer"
              onClick={() => {
                setShowCalc(!showCalc);
              }}
            >
              <div className="frcc pt-5">
                <CalcIcon />
                <label className="text-sm text-gray-10 ml-3 mr-4  cursor-pointer">
                  ROI Calculator
                </label>
              </div>
              <div
                className={
                  "cursor-pointer " +
                  (showCalc
                    ? "transform rotate-180 text-white"
                    : "text-gray-10")
                }
                onClick={() => setShowCalc(!showCalc)}
              >
                <ArrowDownHollow />
              </div>
            </div>
            {showCalc ? (
              <div className={"w-full"}>
                <CalcEle
                  seed={detailData}
                  tokenPriceList={tokenPriceList}
                  lpTokenNumAmount={amount}
                  loveSeed={loveSeed}
                  boostConfig={boostConfig}
                  user_seeds_map={user_seeds_map}
                  user_unclaimed_map={user_unclaimed_map}
                  user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
                  border={false}
                ></CalcEle>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {activeTab === "unstake" && (
        <div className="xsm:px-4">
          <div className="mt-2.5 text-sm mb-2.5 frcb lg:hidden">
            <p className="text-gray-10 ml-1">Lp Tokens</p>
            <p
              className="underline cursor-pointer hover:text-primaryGreen"
              onClick={() => {
                changeAmount(unlpBalances);
              }}
            >
              {toPrecision(unlpBalances, 6)}
            </p>
          </div>
          <div className="flex justify-between items-center h-16 px-3 bg-dark-60 rounded-lg xsm:mb-6">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={({ target }) => changeAmount(target.value)}
              className="text-white text-lg focus:outline-non appearance-none leading-tight"
            ></input>
            {/* <div className="flex items-center ml-2 xsm:hidden">
              <span
                onClick={() => {
                  changeAmount(unlpBalances);
                }}
                className={`text-sm text-gray-50 underline cursor-pointer hover:text-primaryGreen`}
              >
                Max
              </span>
            </div> */}
          </div>
          <div className="mt-2.5 text-sm mb-6 frcb xsm:hidden">
            <p className="text-gray-10 ml-1">Lp Tokens</p>
            {isSignedIn ? (
              <p
                className={`underline cursor-pointer hover:text-primaryGreen ${
                  isLpMaxAmount ? "text-primaryGreen" : ""
                }`}
                onClick={() => {
                  changeAmount(unlpBalances);
                }}
              >
                {toPrecision(unlpBalances, 6)}
              </p>
            ) : (
              <span className="opacity-50">-</span>
            )}
          </div>
          {isSignedIn ? (
            <div
              onClick={() => {
                if (!isDisabledUnstake) {
                  operationUnStake();
                }
              }}
              className={`w-full h-11 frcc rounded paceGrotesk-Bold text-base ${
                isDisabledUnstake
                  ? "cursor-not-allowed bg-gray-40 text-gray-50"
                  : "text-green-10 border border-green-10 cursor-pointer"
              }`}
            >
              <ButtonTextWrapper
                loading={unStakeLoading}
                Text={() => <>Unstake</>}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer"
              style={{ height: "42px" }}
              onClick={showWalletSelector}
            >
              Connect Wallet
            </div>
          )}

          <div className="mt-5 flex items-start mb-2">
            <FarmDetailsWarn className="xsm:mt-0.5" />
            <p className="ml-1.5 text-gray-10 text-sm">
              Staking or unstaking will automatically claim your rewards to your
              wallet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface Lock {
  second: number;
  month: number;
  icon: any;
  multiplier: number;
}

export default FarmsDetailStake;
