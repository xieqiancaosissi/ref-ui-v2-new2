import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  Checkbox,
  CheckboxSelected,
  ModalClose,
  WithdrawNodate,
} from "../icon";
import BigNumber from "bignumber.js";
import {
  formatWithCommas,
  toInternationalCurrencySystem,
  toReadableNumber,
} from "../../../utils/numbers";
import { toRealSymbol, withdrawAllReward_boost } from "../../../services/farm";
import { ButtonTextWrapper } from "@/components/common/Button";
import { isMobile } from "@/utils/device";
import { IExecutionResult } from "@/interfaces/wallet";
import successToast from "@/components/common/toast/successToast";
import failToast from "@/components/common/toast/failToast";

function Withdraw({
  isOpen,
  onRequestClose,
  rewardList,
  get_user_unWithDraw_rewards,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
  rewardList: any;
  get_user_unWithDraw_rewards: any;
}) {
  const cardWidth = isMobile() ? "100vw" : "430px";
  const cardHeight = isMobile() ? "90vh" : "80vh";
  const is_mobile = isMobile();
  const [selectAll, setSelectAll] = useState(false);
  const [checkedList, setCheckedList] = useState<Record<string, any>>({});
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const withdrawNumber = Object.keys(rewardList).length;
  function clickCheckBox(tokenId: string) {
    if (checkedList[tokenId]) {
      delete checkedList[tokenId];
      if (selectAll) {
        setSelectAll(false);
      }
    } else if (Object.keys(checkedList).length < withdrawNumber) {
      checkedList[tokenId] = { value: rewardList[tokenId].number };
      if (
        Object.keys(checkedList).length ==
        Math.min(withdrawNumber, Object.keys(rewardList).length)
      ) {
        setSelectAll(true);
      }
    }
    setCheckedList(JSON.parse(JSON.stringify(checkedList)));
  }
  function clickAllCheckBox() {
    const status = !selectAll;
    const checkedList: { [key: string]: any } = {};
    if (status) {
      const allAtOneTime = Object.entries(rewardList).slice(0, withdrawNumber);
      allAtOneTime.forEach(([key, value]) => {
        const item = value as {
          tokenId: string;
          rewardToken: { icon: string; symbol: string; decimals: number };
          price: string;
          number: number;
        };
        checkedList[key] = { value: item.number };
      });
    }
    setCheckedList(checkedList);
    setSelectAll(status);
  }
  function displayWithDrawTokenNumber(item: any) {
    const { rewardToken, number } = item;
    const tokenNumber = toReadableNumber(rewardToken.decimals, number);
    let resultDisplay = "";
    if (new BigNumber("0.001").isGreaterThan(tokenNumber)) {
      resultDisplay = "<0.001";
    } else {
      resultDisplay = formatWithCommas(
        new BigNumber(tokenNumber).toFixed(3, 1).toString()
      );
    }
    return resultDisplay;
  }
  function displaySinglePrice(price: string) {
    let displayPrice = "$-";
    if (price && price != "N/A") {
      if (new BigNumber("0.01").isGreaterThan(price)) {
        displayPrice = "<$0.01";
      } else {
        displayPrice = `$${toInternationalCurrencySystem(price.toString(), 2)}`;
      }
    }
    return displayPrice;
  }
  function displayTotalPrice(item: any) {
    const { rewardToken, number, price } = item;
    let resultTotalPrice = "0";
    if (price && price != "N/A") {
      const totalPrice = new BigNumber(price).multipliedBy(
        toReadableNumber(rewardToken.decimals, number)
      );
      if (new BigNumber("0.01").isGreaterThan(totalPrice)) {
        resultTotalPrice = "<$0.01";
      } else {
        resultTotalPrice = `$${toInternationalCurrencySystem(
          totalPrice.toString(),
          2
        )}`;
      }
    }
    return resultTotalPrice;
  }
  function calculateAllRewards() {
    let total = new BigNumber(0);
    Object.values(rewardList).forEach((item: any) => {
      const { rewardToken, number, price } = item;
      if (price && price != "N/A") {
        const totalPrice = new BigNumber(price).multipliedBy(
          toReadableNumber(rewardToken.decimals, number)
        );
        total = total.plus(totalPrice);
      }
    });
    return total.isGreaterThan(0)
      ? `$${toInternationalCurrencySystem(total.toString(), 2)}`
      : "$-";
  }
  async function doWithDraw() {
    setWithdrawLoading(true);
    withdrawAllReward_boost(checkedList).then((res) => {
      handleDataAfterTranstion(res);
    });
  }
  function handleDataAfterTranstion(res: IExecutionResult | undefined) {
    if (!res) return;
    if (res.status == "success") {
      successToast();
      onRequestClose();
      get_user_unWithDraw_rewards();
      setCheckedList({});
      setSelectAll(false);
    } else if (res.status == "error") {
      failToast(res.errorResult?.message);
    }
    setWithdrawLoading(false);
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
      style={{
        overlay: {
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        },
        content: {
          outline: "none",
          ...(is_mobile
            ? {
                transform: "translateX(-50%)",
                top: "auto",
                bottom: "32px",
              }
            : {
                transform: "translate(-50%, -50%)",
              }),
        },
      }}
    >
      <div
        className="text-white"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
        }}
      >
        <div className="bg-dark-10 p-6 lg:rounded-lg xs:rounded-t-2xl xs:border xs:border-modalGrayBg">
          <div className="flex justify-between mb-6">
            <div className="text-lg">Withdraw</div>
            <ModalClose
              className="hover:scale-110 hover:cursor-pointer"
              onClick={() => {
                onRequestClose();
              }}
            />
          </div>
          <div className="h-60 overflow-auto pr-3">
            {Object.values(rewardList).map((item: any) => {
              return (
                <div
                  className="flex justify-between pb-6 select-none"
                  key={item.tokenId}
                >
                  <div className="flex items-center text-sm text-white">
                    <div
                      className="mr-4 cursor-pointer"
                      onClick={() => {
                        clickCheckBox(item.tokenId);
                      }}
                    >
                      {checkedList[item.tokenId] ? (
                        <CheckboxSelected></CheckboxSelected>
                      ) : (
                        <Checkbox></Checkbox>
                      )}
                    </div>
                    <img
                      src={item.rewardToken.icon}
                      className="w-8 h-8 rounded-full mr-2 border border-black"
                    />
                    <div className="flex flex-col">
                      <label className="text-sm text-white">
                        {toRealSymbol(item.rewardToken.symbol)}
                      </label>
                      <label className="text-gray-10 text-xs">
                        {displaySinglePrice(item.price)}
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <label className="text-sm text-white">
                      {displayWithDrawTokenNumber(item)}
                    </label>
                    <label className="text-gray-10 text-xs">
                      {displayTotalPrice(item)}
                    </label>
                  </div>
                </div>
              );
            })}
            {Object.values(rewardList).length === 0 ? (
              <div className="h-60 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <WithdrawNodate />
                  <p className="text-base text-white text-opacity-60 mt-5">
                    No claimed rewards yet
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          {Object.values(rewardList).length !== 0 ? (
            <div className="flex justify-between mb-5 pr-3">
              <div className="frcc">
                <label
                  className="mr-5 cursor-pointer"
                  onClick={clickAllCheckBox}
                >
                  {selectAll ? (
                    <CheckboxSelected></CheckboxSelected>
                  ) : (
                    <Checkbox></Checkbox>
                  )}
                </label>
                <label className="text-sm text-gray-10">All</label>
              </div>
              <div className="text-gray-10 text-sm">
                {calculateAllRewards()}
              </div>
            </div>
          ) : null}
          <div className="flex flex-col items-start bg-gray-40 justify-between rounded-lg px-6 py-4  mb-4 xs:px-4">
            <span className="text-white text-sm">
              🤑 How to compound rewards?
            </span>
            <div className="flex items-center flex-wrap mt-4 xs:flex-nowrap xs:overflow-x-auto">
              <div className="flex items-center text-xs text-gray-150 mr-5 mb-1 xs:mr-3 xs:flex-shrink-0">
                <label className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-black bg-primaryGreen mr-1">
                  1
                </label>
                <div className="text-gray-150 mr-4 xs:mr-2">Withdraw</div>
                {">>"}
              </div>
              <div className="flex items-center text-xs text-gray-150 mr-5 mb-1 xs:mr-3 xs:flex-shrink-0">
                <label className="flex items-center justify-center w-4 h-4 rounded-full text-black bg-primaryGreen mr-1">
                  2
                </label>
                <div className="text-gray-150 mr-4 xs:mr-2">Add Liquidity</div>
                {">>"}
              </div>
              <div className="flex items-center text-xs text-gray-150 mb-1 xs:flex-shrink-0">
                <label className="flex items-center justify-center w-4 h-4 rounded-full text-black bg-primaryGreen mr-1">
                  3
                </label>
                <div className="text-gray-150 ">Stake</div>
              </div>
            </div>
          </div>
          <div
            onClick={() => {
              if (Object.keys(checkedList).length !== 0) {
                doWithDraw();
              }
            }}
            className={`w-full rounded-lg h-10 frcc ${
              Object.keys(checkedList).length === 0
                ? "bg-gray-40 text-gray-50 cursor-not-allowed"
                : "bg-greenGradientDark text-black cursor-pointer"
            }`}
          >
            <ButtonTextWrapper
              loading={withdrawLoading}
              Text={() => <>Withdraw</>}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default React.memo(Withdraw);
