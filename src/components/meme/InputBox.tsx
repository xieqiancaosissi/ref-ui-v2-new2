import React, { useState, useEffect, useContext } from "react";
import Big from "big.js";
import { FormattedMessage } from "react-intl";
import { formatWithCommas, toPrecision } from "../../utils/numbers";
import { TokenMetadata } from "@/services/ft-contract";
import { useAccountStore } from "@/stores/account";
export function InputAmount({
  token,
  balance,
  tokenPriceList,
  changeAmount,
  amount,
  title,
  hidden,
}: {
  token: TokenMetadata;
  balance: string;
  tokenPriceList: Record<string, any>;
  changeAmount: any;
  amount: string;
  title?: string;
  hidden?: boolean;
}) {
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  const [inputPrice, setInputPrice] = useState("");
  useEffect(() => {
    const price = token ? tokenPriceList[token.id]?.price : "";
    if (price && amount) {
      setInputPrice(new Big(price).mul(amount).toFixed());
    } else {
      setInputPrice("");
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
    if (inputPrice) {
      return "$" + formatWithCommas(toPrecision(inputPrice.toString(), 3));
    }
    return "$-";
  }
  return (
    <div className={`${hidden ? "hidden" : ""}`}>
      <div
        className={`rounded-xl p-3 mt-7 border bg-black bg-opacity-20 border-inputV3BorderColor hover:border-inputV3BorderHoverColor xsm:mt-4`}
      >
        <div className="flex items-center justify-between">
          <input
            type="number"
            placeholder="0.0"
            className="font-gothamBold text-xl text-white"
            value={amount}
            step="any"
            onChange={({ target }) => {
              changeAmount(target.value);
            }}
          />
          <div className="flex items-center gap-1.5 ml-5 flex-shrink-0">
            <img
              className="rounded-full"
              style={{ width: "26px" }}
              src={token.icon}
            />
            <span
              className={`text-base paceGrotesk-Bold whitespace-nowrap text-white`}
            >
              {token.symbol}
            </span>
          </div>
        </div>
        <div className={`flex items-center justify-between mt-2.5 visible`}>
          <span className="text-xs text-gray-50">{showCurrentPrice()}</span>
          <div className="flex items-center text-xs text-gray-50 text-right">
            <span title={balance}>
              {title || <FormattedMessage id="balance" />}:{" "}
              <span
                className={`paceGrotesk-Bold cursor-pointer hover:text-white underline`}
                onClick={() => {
                  changeAmount(balance);
                }}
              >
                {getBalance()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
