import {
  Seed,
  BoostConfig,
  UserSeedInfo,
  FarmBoost,
  MonthData,
  handleNumber,
} from "@/services/farm";
import { TokenMetadata, unWrapToken } from "@/services/ft-contract";
import {
  LP_STABLE_TOKEN_DECIMALS,
  LP_TOKEN_DECIMALS,
} from "@/services/m-token";
import { getLoveAmount, LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import { useAccountStore } from "@/stores/account";
import {
  toReadableNumber,
  toInternationalCurrencySystem,
  toPrecision,
} from "@/utils/numbers";
import BigNumber from "bignumber.js";
import { useState, useEffect } from "react";
import { BoostOptIcon, LightningIcon } from "../icon/FarmBoost";
import getConfig from "@/utils/config";
import getStablePoolTypeConfig from "@/utils/stablePoolConfig/stablePoolTypeConfig";
import React from "react";

const config = getConfig();
const stablePoolTypeConfig = getStablePoolTypeConfig();
const { REF_VE_CONTRACT_ID } = config;
const { STABLE_POOL_IDS } = stablePoolTypeConfig;

function CalcEle(props: {
  seed: Seed;
  tokenPriceList: Record<string, string>;
  lpTokenNumAmount: string;
  loveSeed?: Seed;
  boostConfig?: BoostConfig;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
  border?: boolean;
}) {
  const {
    seed,
    tokenPriceList,
    lpTokenNumAmount,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
    border = true,
  } = props;
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  const [selecteDate, setSelecteDate] = useState<MonthData>();
  const [ROI, setROI] = useState("");
  const [rewardData, setRewardData] = useState<Record<string, any>>({});
  /* eslint-disable prefer-const */
  let [lpTokenNum, setLpTokenNum] = useState(lpTokenNumAmount);
  const [dateList, setDateList] = useState<MonthData[]>([]);
  const [accountType, setAccountType] = useState("free");
  const [loveTokenBalance, setLoveTokenBalance] = useState<string>("0");
  const [amount, setAmount] = useState("");
  const { farmList: farms, pool } = seed;
  const poolId = pool?.id != null ? pool.id.toString() : "";
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(poolId)
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;
  useEffect(() => {
    get_all_date_list();
    getLoveTokenBalance();
  }, []);
  useEffect(() => {
    const handleRewards = () => {
      if (!selecteDate) return;
      if (accountType == "cd") {
        const rate = seedRadio;
        const power = new BigNumber(rate)
          .multipliedBy(+lpTokenNumAmount)
          .toFixed();
        lpTokenNum = power;
        setLpTokenNum(power);
      } else {
        lpTokenNum = lpTokenNumAmount;
        setLpTokenNum(lpTokenNumAmount);
      }
      const rewardsTemp: { tokenList: any[]; tokenTotalPrice: string } = {
        tokenList: [],
        tokenTotalPrice: "",
      };
      farms &&
        farms.forEach((farm: FarmBoost) => {
          const tokenTemp: TokenMetadata = Object.assign(
            {},
            farm.token_meta_data
          );
          if (!lpTokenNum || new BigNumber(lpTokenNum).isEqualTo("0")) {
            rewardsTemp.tokenList.push(tokenTemp);
          } else {
            const dailyReward = toReadableNumber(
              tokenTemp.decimals,
              farm.terms.daily_reward
            );
            const seedPower = toReadableNumber(DECIMALS, seed.total_seed_power);
            const totalStakePower = new BigNumber(lpTokenNum)
              .plus(seedPower)
              .toString();
            const day = selecteDate.day;
            const perDayAndLp = new BigNumber(dailyReward).dividedBy(
              new BigNumber(totalStakePower)
            );

            let rewardTokenNum;
            if (perDayAndLp.isEqualTo("0")) {
              // totalStake reach to the max limit
              rewardTokenNum = new BigNumber(dailyReward).multipliedBy(day);
            } else {
              rewardTokenNum = perDayAndLp
                .multipliedBy(day)
                .multipliedBy(lpTokenNum);
            }
            const priceData: any = tokenPriceList[tokenTemp.id];
            let tokenPrice = "0";
            if (priceData && priceData.price) {
              tokenPrice = new BigNumber(rewardTokenNum)
                .multipliedBy(priceData.price)
                .toString();
            }
            rewardsTemp.tokenList.push({
              ...tokenTemp,
              num: rewardTokenNum.toString(),
            });
            rewardsTemp.tokenTotalPrice = new BigNumber(
              rewardsTemp.tokenTotalPrice || "0"
            )
              .plus(tokenPrice)
              .toString();
          }
        });
      // handle tokenTotalPrice display
      const tokenTotalPriceActual = rewardsTemp.tokenTotalPrice;
      if (rewardsTemp.tokenTotalPrice) {
        if (new BigNumber("0").isEqualTo(rewardsTemp.tokenTotalPrice)) {
          rewardsTemp.tokenTotalPrice = "$ -";
        } else if (
          new BigNumber("0.001").isGreaterThan(rewardsTemp.tokenTotalPrice)
        ) {
          rewardsTemp.tokenTotalPrice = "<$ 0.001";
        } else {
          rewardsTemp.tokenTotalPrice = `~ $${toInternationalCurrencySystem(
            rewardsTemp.tokenTotalPrice,
            3
          )}`;
        }
      }
      // remove repeated rewards
      const tokenMap = {} as Record<string, TokenMetadata & { num: string }>;
      rewardsTemp.tokenList.forEach(
        (token: TokenMetadata & { num: string }) => {
          const curToken = tokenMap[token.id];
          if (curToken) {
            curToken.num = (
              Number(curToken.num) + Number(token.num)
            ).toString();
          } else {
            tokenMap[token.id] = token;
          }
        }
      );
      rewardsTemp.tokenList = Object.values(tokenMap);
      setRewardData(rewardsTemp);
      // get ROI
      if (lpTokenNumAmount && lpTokenNumAmount !== "0") {
        if (pool) {
          const { shares_total_supply, tvl } = pool;
          const DECIMALS = new Set(STABLE_POOL_IDS || []).has(
            pool.id?.toString()
          )
            ? LP_STABLE_TOKEN_DECIMALS
            : LP_TOKEN_DECIMALS;
          const totalShares = Number(
            toReadableNumber(DECIMALS, shares_total_supply)
          );
          const shareUsd = new BigNumber(lpTokenNumAmount)
            .multipliedBy(tvl)
            .dividedBy(totalShares)
            .toFixed();
          let aprActual = new BigNumber(tokenTotalPriceActual)
            .dividedBy(shareUsd)
            .multipliedBy(100);
          let aprDisplay;
          if (new BigNumber("0.001").isGreaterThan(aprActual)) {
            aprDisplay = "<0.001%";
          } else {
            aprDisplay = aprActual.toFixed(3, 1) + "%";
          }
          setROI(aprDisplay);
        } else {
          setROI("- %");
        }
      }
    };
    handleRewards();
  }, [lpTokenNumAmount, selecteDate, accountType, amount]);

  function changeDate(v: MonthData) {
    setSelecteDate(v);
  }
  const get_all_date_list = async () => {
    // get date list
    const month_list = [1, 3, 6, 12];
    const date_list: MonthData[] = month_list.map((duration: number) => {
      return {
        text: `${duration}M`,
        second: duration * 2592000,
        m: duration,
        day: duration * 30,
      };
    });
    setDateList(date_list);
    setSelecteDate(date_list[0]);
  };
  function switchAccountType(type: string) {
    setAccountType(type);
  }
  function displayNum(num: string) {
    if (!num) return "-";
    let resultRewardTokenNum;
    if (new BigNumber("0.001").isGreaterThan(num)) {
      resultRewardTokenNum = "<0.001";
    } else {
      resultRewardTokenNum = toInternationalCurrencySystem(num.toString(), 3);
    }
    return resultRewardTokenNum;
  }
  function getRate() {
    return `x ${toPrecision(seedRadio.toString(), 2)}`;
  }
  function getBoostMutil() {
    const lastObj: any = {
      radio: "1",
    };
    if (!boostConfig || !isSignedIn) return lastObj;
    const { affected_seeds, booster_decimal } = boostConfig;
    const { seed_id } = seed;
    const user_seed: UserSeedInfo = user_seeds_map[seed_id];
    if (user_seed && user_seed.free_amount) {
      lastObj.amount = user_seed.free_amount;
    }
    const love_user_seed = REF_VE_CONTRACT_ID
      ? user_seeds_map[REF_VE_CONTRACT_ID]
      : undefined;
    const base = affected_seeds?.[seed_id];
    if (base && loveSeed) {
      lastObj.base = base;
      const { free_amount = 0, locked_amount = 0 } = love_user_seed || {};
      const totalStakeLoveAmount_pre = toReadableNumber(
        booster_decimal,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      const totalStakeLoveAmount = new BigNumber(totalStakeLoveAmount_pre)
        .plus(amount || 0)
        .toFixed();
      if (+totalStakeLoveAmount > 0) {
        let result;
        if (+totalStakeLoveAmount < 1) {
          result = 1;
        } else {
          result = new BigNumber(1)
            .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
            .toFixed(2);
        }
        lastObj.radio = result;
        return lastObj;
      }
      return lastObj;
    }
    return lastObj;
  }
  function changeAmount(value: string) {
    setAmount(value);
  }
  async function getLoveTokenBalance() {
    // get LoveToken balance
    if (REF_VE_CONTRACT_ID && isSignedIn) {
      const loveBalance = await getLoveAmount();
      setLoveTokenBalance(toReadableNumber(LOVE_TOKEN_DECIMAL, loveBalance));
    }
  }
  const { radio: seedRadio, amount: seed_free_amount, base } = getBoostMutil();
  return (
    <div
      className={` ${
        !border ? "border border-gray-90 px-3.5 py-2.5 rounded mt-4" : ""
      } `}
    >
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-50">Duration</label>
        </div>
        <div className="flex items-center border border-gray-90 bg-black bg-opacity-20 rounded-md h-8 mt-2.5 mb-2.5 p-0.5">
          {dateList.map((date: MonthData, index) => {
            return (
              <div
                onClick={() => {
                  changeDate(date);
                }}
                className={
                  `flex items-center justify-center flex-grow text-sm rounded-md h-full cursor-pointer ` +
                  (selecteDate?.day == date.day
                    ? "bg-gray-120 text-chartBg"
                    : "text-gray-50")
                }
                key={date.text}
              >
                {date.text}
              </div>
            );
          })}
        </div>
      </div>
      <div className={` ${!border ? "mt-0" : "mt-3"}`}>
        {!base ? null : (
          <div className="flex items-center">
            <div className="flex items-center justify-center w-1/2">
              <span
                onClick={() => {
                  switchAccountType("free");
                }}
                className={`flex items-center justify-center h-10 text-sm w-4/5  cursor-pointer ${
                  accountType == "free"
                    ? "border-b border-greenColor text-white"
                    : "text-gray-50"
                }`}
              >
                nonBoosted
              </span>
            </div>
            <div className="flex items-center justify-center w-1/2">
              <div
                onClick={() => {
                  switchAccountType("cd");
                }}
                className={`flex items-center justify-center h-10  w-4/5 text-sm cursor-pointer ${
                  accountType == "cd"
                    ? "border-b border-greenColor text-white"
                    : "text-gray-50"
                }`}
              >
                <BoostOptIcon
                  className={`mr-1 ${accountType == "cd" ? "" : "opacity-40"}`}
                ></BoostOptIcon>
                boosted
              </div>
            </div>
          </div>
        )}
        <div
          className={`flex flex-col rounded ${
            border ? "border border-gray-90 p-3.5" : "p-1 "
          } `}
        >
          {accountType == "cd" ? (
            <>
              <div className="flex items-center justify-between mb-4 mt-5">
                <label className="text-sm text-gray-50 mr-8 xs:mr-2 md:mr-2 whitespace-nowrap">
                  love_staked
                </label>
                <div className="relative flex flex-col flex-grow">
                  <span className="absolute text-xs text-gray-10 right-0 -top-5">
                    <label className="mr-1">+ balance :</label>
                    {toPrecision(loveTokenBalance, 6)}
                  </span>
                  <div className="flex justify-between items-center h-9 px-3 bg-black bg-opacity-20 rounded-lg">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={({ target }) => changeAmount(target.value)}
                      className="text-white text-sm focus:outline-non appearance-none leading-tight"
                    ></input>
                    <div className="flex items-center ml-2">
                      <span
                        onClick={() => {
                          changeAmount(loveTokenBalance);
                        }}
                        className={`text-xs text-gray-50 px-1.5 py-0.5 rounded-lg border cursor-pointer hover:text-greenColor hover:border-greenColor ${
                          amount == loveTokenBalance
                            ? "bg-black bg-opacity-20 border-black border-opacity-20"
                            : "border-maxBorderColor"
                        }`}
                      >
                        Max
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className={`flex justify-between mb-4`}>
                <label className="text-sm text-gray-50 mr-2">booster</label>
                <span
                  className={`flex items-center text-sm text-right break-all text-primaryGreen`}
                >
                  {getRate()}
                  <LightningIcon></LightningIcon>
                </span>
              </p>
            </>
          ) : null}
          <p className="flex justify-between">
            <label className="text-sm text-gray-50 mr-2">ROI</label>
            <label className="text-sm text-gray-50 text-right break-all">
              {ROI}
            </label>
          </p>
          <p className="flex justify-between mt-3">
            <label className="text-sm text-gray-50 mr-2">
              Value of rewards
            </label>
            <label className="text-sm text-gray-50 text-right break-all">
              {rewardData.tokenTotalPrice || "$ -"}
            </label>
          </p>
          <div className="mt-3">
            <label className="text-sm text-gray-50">Reward tokens</label>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {(rewardData.tokenList || []).map((item: any) => {
                const token = unWrapToken(item, true);
                return (
                  <div className="flex items-center" key={token.symbol}>
                    <img
                      className="w-6 h-6 ounded-full border border-primaryGreen rounded-3xl"
                      src={token.icon}
                    ></img>
                    <label className="ml-2 text-sm text-gray-50">
                      {displayNum(item.num)}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(CalcEle);
