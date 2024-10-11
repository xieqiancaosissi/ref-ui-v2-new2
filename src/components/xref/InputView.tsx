import { stake, unstake } from "@/services/xref";
import { useAccountStore } from "@/stores/account";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { niceDecimals, toPrecision } from "@/utils/numbers";
import { FaExchangeAlt } from "../reactIcons";
import InputAmount from "./InputAmount";
import { ButtonTextWrapper } from "../common/Button";
import { RefSymbol, XrefSwitch, XrefSymbol } from "./icon";
import { IExecutionResult } from "@/interfaces/wallet";
import failToast from "../common/toast/failToast";
import successToast from "../common/toast/successToast";
import { showWalletSelectorModal } from "@/utils/wallet";
import { useAppStore } from "@/stores/app";
import React from "react";

function InputView(props: any) {
  const [amount, setAmount] = useState("0");
  const appStore = useAppStore();
  const [loading, setLoading] = useState(false);
  const { tab, max, hidden, isM, rate, fetchData } = props;
  const [forward, setForward] = useState(true);
  useEffect(() => {
    setForward(true);
  }, [tab]);
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  const onSubmit = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        // stake
        await stake({ amount }).then((res) => {
          handleDataAfterTranstion(res);
        });
      } else if (tab === 1) {
        // unstake
        await unstake({ amount }).then((res) => {
          handleDataAfterTranstion(res);
        });
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      setLoading(false);
    }
  };
  async function handleDataAfterTranstion(res: IExecutionResult | undefined) {
    if (!res) return;
    if (res.status == "success") {
      successToast();
      await fetchData();
      setAmount("0");
    } else if (res.status == "error") {
      failToast(res.errorResult?.message);
    }
    setLoading(false);
  }
  const buttonStatus =
    !amount ||
    new BigNumber(amount).isEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(max);
  const exchangeDisplay = () => {
    const bigAmount = new BigNumber(amount || "0");
    let receive;
    if (tab == 0) {
      receive = bigAmount.dividedBy(rate);
    } else {
      receive = bigAmount.multipliedBy(rate);
    }
    if (receive.isEqualTo(0)) {
      return 0;
    } else if (receive.isLessThan(0.001)) {
      return "<0.001";
    } else {
      return (
        <>
          {/* <label className="font-sans mr-0.5">≈</label> */}
          {receive.toFixed(3, 1)}
        </>
      );
    }
  };
  const rateDisplay = (tab: number) => {
    const cur_rate_forward = rate;
    const cur_rate_reverse = 1 / rate;
    if (rate) {
      if ((tab == 1 && forward) || (tab == 0 && !forward)) {
        // forward
        const displayStr = niceDecimals(cur_rate_forward, 4);
        return (
          <>
            1 <span className="text-gray-50 ml-1">xREF =</span>&nbsp;
            <span className="" title={cur_rate_forward.toString()}>
              {displayStr}
            </span>
            &nbsp; <span className="text-gray-50 ml-1">REF</span>
          </>
        );
      } else {
        const displayStr = niceDecimals(cur_rate_reverse, 4);
        return (
          <>
            1 <span className="text-gray-50 ml-1">REF =</span> &nbsp;
            <span className="" title={cur_rate_reverse.toString()}>
              {displayStr}
            </span>
            &nbsp; <span className="text-gray-50 ml-1">xREF</span>
          </>
        );
      }
    } else {
      return (
        <>
          1 <span className="text-gray-50 ml-1">xREF =</span>
          <span className="text-gray-50 ml-1" title="1">
            1
          </span>
          &nbsp; <span className="text-gray-50 ml-1">REF</span>
        </>
      );
    }
  };
  const displayBalance = (max: string | null) => {
    if (!isSignedIn) {
      return "-";
    }
    if (max === null || max === undefined) {
      return "0";
    }

    const formattedMax = new BigNumber(max);
    if (formattedMax.isEqualTo("0")) {
      return "0";
    } else {
      return toPrecision(max, 3, true);
    }
  };
  const handleMaxClick = () => {
    setAmount(max || "0");
  };
  return (
    <div className={`flex flex-col ${hidden} mt-8`}>
      <div className="mb-12 h-16 w-full">
        <div className="w-full frcb mb-2.5">
          <div
            onClick={() => {
              setForward(!forward);
            }}
            className="frcc text-sm  cursor-pointer"
          >
            <XrefSwitch className="mr-2 text-gray-10 hover:text-primaryGreen" />
            {rateDisplay(tab)}
          </div>
          <div className="flex items-center text-gray-50 text-sm">
            <span className="ml-2 frcc">
              Balance:
              <span
                title={max}
                onClick={handleMaxClick}
                className={`ml-1 hover:underline hover:text-primaryGreen cursor-pointer ${
                  amount == max ? "text-primaryGreen underline" : ""
                }`}
              >
                {displayBalance(max)}
              </span>
              {/* {max && (
                <div
                  className={`frcc ml-2 underline cursor-pointer hover:text-primaryGreen ${
                    amount == max ? "text-primaryGreen" : ""
                  }`}
                  onClick={handleMaxClick}
                >
                  MAX
                </div>
              )} */}
            </span>
          </div>
        </div>
        <div className="relative">
          <InputAmount max={max} onChangeAmount={setAmount} value={amount} />
          <div className="absolute frcc right-4 top-5">
            {tab == 0 ? <RefSymbol /> : <XrefSymbol />}
            <label className="text-white text-base ml-1.5">
              {tab == 0 ? "REF" : "xREF"}
            </label>
          </div>
        </div>
      </div>
      <div className="flex items-center mb-4">
        {tab == 0 ? (
          <label className="text-sm text-gray-50">xREF to receive ≈</label>
        ) : (
          <label className="text-sm text-gray-50">REF to receive ≈</label>
        )}

        <label className="text-sm text-white ml-1"> {exchangeDisplay()}</label>
      </div>
      {isSignedIn ? (
        <div
          className={`w-full h-11 frcc  rounded text-base text-black focus:outline-none font-semibold ${
            buttonStatus || loading
              ? "opacity-40 cursor-not-allowed"
              : "cursor-pointer"
          } ${
            tab == 0
              ? "bg-greenGradient"
              : "border border-primaryGreen text-primaryGreen"
          }`}
          onClick={() => {
            if (!buttonStatus && !loading) {
              onSubmit();
            }
          }}
        >
          {tab == 0 ? (
            <ButtonTextWrapper
              loading={loading}
              Text={() => <span>Stake</span>}
            ></ButtonTextWrapper>
          ) : (
            <ButtonTextWrapper
              loading={loading}
              Text={() => <span>Unstake</span>}
            ></ButtonTextWrapper>
          )}
        </div>
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
  );
}

export default React.memo(InputView);
