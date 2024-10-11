import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { TokenMetadata } from "@/services/ft-contract";
import { FormattedMessage } from "react-intl";
import BigNumber from "bignumber.js";
import { PoolInfo } from "@/services/swapV3";
import { formatWithCommas, toPrecision } from "@/utils/numbers";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import { useAccountStore } from "@/stores/account";
import { toRealSymbol } from "@/services/farm";
import { WarningIcon } from "@/components/farm/icon/FarmBoost";
import { ExclamationIcon } from "@/components/common/Icons";

export function InputAmount({
  token,
  balance,
  tokenPriceList,
  changeAmount,
  amount,
  currentSelectedPool,
  disabled,
}: {
  token: TokenMetadata;
  balance: string;
  tokenPriceList: Record<string, any>;
  changeAmount: any;
  amount: string;
  currentSelectedPool: PoolInfo;
  disabled?: Boolean;
}) {
  const [inputPrice, setInputPrice] = useState("");
  const [showNearTip, setShowNearTip] = useState(false);
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  useEffect(() => {
    const price = token ? tokenPriceList[token.id]?.price : "";
    if (price && amount) {
      setInputPrice(new BigNumber(price).multipliedBy(amount).toFixed());
    } else {
      setInputPrice("");
    }
    if (token?.id == WRAP_NEAR_CONTRACT_ID && amount) {
      const difference = new BigNumber(maxBalance).minus(amount);
      const b = difference.toFixed();
      const r = difference.isLessThan(0);
      if (r) {
        setShowNearTip(true);
      } else {
        setShowNearTip(false);
      }
    } else {
      setShowNearTip(false);
    }
  }, [amount, token, tokenPriceList.length]);
  function getBalance() {
    let r = "0";
    if (token && balance) {
      r = formatWithCommas(toPrecision(balance.toString(), 3));
    }
    return isSignedIn ? r : "-";
  }
  function showCurrentPrice() {
    if (isNoPool) {
      return "$-";
    } else if (inputPrice) {
      return "$" + formatWithCommas(toPrecision(inputPrice.toString(), 3));
    }
    return "$-";
  }
  const maxBalance =
    token?.id !== WRAP_NEAR_CONTRACT_ID
      ? balance
      : Number(balance) <= 0.5
      ? "0"
      : String(Number(balance) - 0.5);
  const isNoPool = !currentSelectedPool?.pool_id;
  return (
    <div>
      <div
        className={`rounded p-3 mt-3 border border-gray-90 h-22 flex flex-col justify-between ${
          disabled ? "" : "bg-black bg-opacity-20  hover:border-green-10"
        }`}
      >
        <div className="flex items-center justify-between">
          <input
            type="number"
            placeholder="0"
            className="font-gothamBold text-2xl"
            disabled={!currentSelectedPool?.pool_id || disabled ? true : false}
            value={isNoPool ? "" : amount}
            step="any"
            onChange={({ target }) => {
              changeAmount(target.value);
            }}
          />
          <span
            className={`text-2xl font-bold mx-2.5 whitespace-nowrap shrink-0 frcc min-w-10 ${
              currentSelectedPool?.pool_id
                ? "text-white"
                : "text-v3feeTextColor"
            }`}
          >
            <img
              className="w-6 h-6 rounded-full border border-gray-60 mx-1 bg-dark-10"
              key={token?.id}
              src={token?.icon}
            />
            {token ? toRealSymbol(token.symbol) : ""}
          </span>
        </div>
        <div
          className={`flex items-center justify-between mt-2.5 ${
            token ? "visible" : "invisible"
          }`}
        >
          <span className="text-xs text-gray-60">{showCurrentPrice()}</span>
          <div className="flex items-center text-xs text-gray-60 text-right">
            <span title={balance}>
              <span>Balance</span>
              <span
                onClick={() => {
                  if (disabled) return;
                  changeAmount(maxBalance);
                }}
                className={`mx-1 underline  ${
                  amount == maxBalance ? "text-green-10" : "hover:text-white"
                } ${disabled ? "" : "cursor-pointer"}`}
              >
                {getBalance()}
              </span>
            </span>
          </div>
        </div>
      </div>
      {showNearTip && !isNoPool ? (
        <div className="flex items-center text-sm text-yellow-10 mt-2.5 font-normal">
          <ExclamationIcon
            className="ml-2.5 mr-2"
            color={"#E6B401"}
          ></ExclamationIcon>
          <span>Must have 0.5N or more left in wallet for gas fee.</span>
        </div>
      ) : null}
    </div>
  );
}
