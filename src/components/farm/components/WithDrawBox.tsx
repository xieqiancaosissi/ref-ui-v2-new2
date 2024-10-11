import { useContext, useEffect, useState } from "react";
import { FarmBoost, Seed } from "../../../services/farm";
import { FarmAvatarIcon, FarmWithdrawIcon, FarmWithdrawMobIcon } from "../icon";
import { useAccountStore } from "../../../stores/account";
import { ftGetTokenMetadata } from "@/services/token";
import {
  toReadableNumber,
  toInternationalCurrencySystem,
} from "@/utils/numbers";
import BigNumber from "bignumber.js";
import getConfig from "@/utils/config";
import { NEAR_META_DATA } from "@/utils/nearMetaData";
import Withdraw from "./WithdrawModal";
import styles from "../farm.module.css";
import { showWalletSelectorModal } from "@/utils/wallet";
import { useAppStore } from "@/stores/app";
import React from "react";

const { WRAP_NEAR_CONTRACT_ID } = getConfig();

function WithDrawBox(props: {
  userRewardList: any;
  tokenPriceList: any;
  farmDisplayList: Seed[];
  get_user_unWithDraw_rewards: any;
}) {
  const appStore = useAppStore();
  const {
    userRewardList,
    tokenPriceList,
    farmDisplayList,
    get_user_unWithDraw_rewards,
  } = props;
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  const [actualRewardList, setActualRewardList] = useState<{
    [key: string]: any;
  }>({});
  const maxLength = 10;
  const [rewardList, setRewardList] = useState<any>({});
  const [yourReward, setYourReward] = useState("-");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  useEffect(() => {
    const updatedRewardList: { [key: string]: any } = {};
    Object.entries(userRewardList).forEach(([key, value]) => {
      if (Number(value) > 0) {
        updatedRewardList[key] = value;
      }
    });
    setActualRewardList(updatedRewardList);
  }, [userRewardList]);
  useEffect(() => {
    if (Object.keys(userRewardList).length === 0) {
      setRewardList({});
      setYourReward("$0.00");
    } else {
      const tempList = Object.keys(actualRewardList).map(
        async (key: string) => {
          let rewardToken = await ftGetTokenMetadata(key);
          const price = tokenPriceList[key]?.price;
          if (rewardToken.id === WRAP_NEAR_CONTRACT_ID) {
            rewardToken = { ...rewardToken, ...NEAR_META_DATA };
          }
          return {
            tokenId: key,
            rewardToken,
            price,
            number: actualRewardList[key],
          };
        }
      );
      Promise.all(tempList).then((list) => {
        const newRewardList: { [key: string]: any } = {};
        list.forEach((item: any) => {
          newRewardList[item.tokenId] = item;
        });
        setRewardList(newRewardList);
      });
    }
    if (
      actualRewardList &&
      tokenPriceList &&
      Object.keys(tokenPriceList).length > 0 &&
      farmDisplayList &&
      farmDisplayList.length > 0
    ) {
      getTotalUnWithdrawRewardsPrice();
    }
  }, [actualRewardList, tokenPriceList, farmDisplayList, userRewardList]);

  function getTotalUnWithdrawRewardsPrice() {
    const rewardTokenList: { [key: string]: any } = {};
    farmDisplayList.forEach((seed: Seed, index: number) => {
      if (seed.farmList) {
        seed.farmList.forEach((farm: FarmBoost) => {
          const { token_meta_data } = farm;
          if (token_meta_data) {
            rewardTokenList[token_meta_data.id] = token_meta_data;
          }
        });
      }
    });
    let totalUnWithDraw = 0;
    Object.entries(actualRewardList).forEach((arr: [string, string]) => {
      const [key, v] = arr;
      const singlePrice = tokenPriceList[key]?.price;
      const token = rewardTokenList[key];
      if (token) {
        const number: any = toReadableNumber(token.decimals, v);
        if (singlePrice && singlePrice != "N/A") {
          totalUnWithDraw = BigNumber.sum(
            singlePrice * number,
            totalUnWithDraw
          ).toNumber();
        }
      }
    });
    if (totalUnWithDraw > 0) {
      let totalUnWithDrawV = toInternationalCurrencySystem(
        totalUnWithDraw.toString(),
        2
      );
      if (Number(totalUnWithDrawV) == 0) {
        totalUnWithDrawV = "<$0.01";
      } else {
        totalUnWithDrawV = `$${totalUnWithDrawV}`;
      }
      setYourReward(totalUnWithDrawV);
    } else {
      isSignedIn ? setYourReward("$0.00") : "";
    }
  }
  function showWithdrawModal() {
    setIsWithdrawOpen(true);
  }
  function hideWithdrawModal() {
    setIsWithdrawOpen(false);
  }
  function showWalletSelector() {
    showWalletSelectorModal(appStore.setShowRiskModal);
  }
  return (
    <>
      <div className="frcb mb-12 2xl:w-3/5 xl:w-9/12 lg:w-4/5 xsm:hidden">
        <div className="frcc">
          <FarmAvatarIcon className="mr-6" />
          <div>
            <p className="text-sm text-gray-50">Claimed Rewards</p>
            <h1 className="text-3xl paceGrotesk-Bold frcc">
              {isSignedIn ? (
                <>
                  {yourReward}
                  {Object.values(rewardList).length > 0 && (
                    <div className="flex items-center ml-3">
                      {Object.values(rewardList)
                        .slice(0, maxLength)
                        .map((reward: any, index: number) => {
                          return (
                            <img
                              key={index}
                              src={reward.rewardToken.icon}
                              className={`w-5 h-5 rounded-full bg-cardBg border border-green-10 ${
                                index > 0 ? "-ml-1" : ""
                              }`}
                            />
                          );
                        })}
                    </div>
                  )}
                </>
              ) : (
                "$0.00"
              )}
            </h1>
          </div>
        </div>
        {!isSignedIn ? (
          <div
            className="text-primaryGreen border border-primaryGreen px-2 py-1 rounded-md cursor-pointer"
            onClick={showWalletSelector}
          >
            Connect Wallet
          </div>
        ) : (
          <div
            className={styles.gradient_border_container}
            onClick={() => {
              showWithdrawModal();
            }}
          >
            <p className="text-gray-10 text-base">Withdraw</p>
            <FarmWithdrawIcon className="ml-2" />
          </div>
        )}
        <Withdraw
          isOpen={isWithdrawOpen}
          onRequestClose={hideWithdrawModal}
          rewardList={rewardList}
          get_user_unWithDraw_rewards={get_user_unWithDraw_rewards}
        />
      </div>
      <div className="lg:hidden">
        <div className="frcb mb-2.5">
          <p className="text-2xl"> {yourReward}</p>
          {!isSignedIn ? (
            <div
              className="text-black border border-black px-2 py-1 rounded-md cursor-pointer"
              onClick={showWalletSelector}
            >
              Connect Wallet
            </div>
          ) : (
            <div
              className="border border-black p-1.5 rounded text-base pr-1.5 frcc font-medium"
              onClick={() => {
                showWithdrawModal();
              }}
            >
              Withdraw
              <FarmWithdrawMobIcon className="ml-1.5" />
            </div>
          )}
        </div>
        {Object.values(rewardList).length > 0 ? (
          <div className="flex items-center">
            {Object.values(rewardList)
              .slice(0, maxLength)
              .map((reward: any, index: number) => {
                return (
                  <img
                    key={index}
                    src={reward.rewardToken.icon}
                    className={`w-5 h-5 rounded-full  bg-cardBg border border-green-10 ${
                      index > 0 ? "-ml-1" : ""
                    }`}
                  ></img>
                );
              })}
          </div>
        ) : null}
      </div>
    </>
  );
}

export default React.memo(WithDrawBox);
