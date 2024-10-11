import {
  batchWithdrawInner,
  batchWithdrawFromAurora,
  display_number_internationalCurrencySystemLongString,
  display_value,
} from "@/services/aurora";
import { TokenMetadata } from "@/services/ft-contract";
import Big from "big.js";
import React, { useState } from "react";
import { ButtonTextWrapper } from "@/components/common/Button";
import { useAppStore } from "@/stores/app";
import { IExecutionResult } from "@/interfaces/wallet";
import checkTxBeforeShowToast from "@/components/common/toast/checkTxBeforeShowToast";
import failToast from "@/components/common/toast/failToast";
import { beautifyNumber } from "@/components/common/beautifyNumber";

type Props = {
  token: TokenMetadata;
  tokenBalance: number | string;
  getTokenPrice: any;
  showWithdraw?: boolean;
  isAurora?: boolean;
};

const WalletTokenList = ({
  token,
  tokenBalance,
  getTokenPrice,
  showWithdraw,
  isAurora,
}: Props) => {
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const { aurora, id, decimals } = token || {};
  const appStore = useAppStore();
  const personalDataUpdatedSerialNumber =
    appStore.getPersonalDataUpdatedSerialNumber();
  const doWithDraw = async () => {
    if (!withdrawLoading) {
      try {
        setWithdrawLoading(true);
        if (isAurora) {
          batchWithdrawFromAurora({
            [id]: {
              amount: aurora,
              decimals,
              id,
            },
          }).then((res: IExecutionResult | undefined) => {
            if (!res) return;
            if (res.status == "success") {
              checkTxBeforeShowToast({ txHash: res.txHash });
              appStore.setPersonalDataUpdatedSerialNumber(
                personalDataUpdatedSerialNumber + 1
              );
            } else if (res.status == "error") {
              failToast(res.errorResult?.message);
            }
            setWithdrawLoading(false);
          });
        } else {
          batchWithdrawInner([token]).then(
            (res: IExecutionResult | undefined) => {
              if (!res) return;
              if (res.status == "success") {
                checkTxBeforeShowToast({ txHash: res.txHash });
                appStore.setPersonalDataUpdatedSerialNumber(
                  personalDataUpdatedSerialNumber + 1
                );
              } else if (res.status == "error") {
                failToast(res.errorResult?.message);
              }
              setWithdrawLoading(false);
            }
          );
        }
      } catch (e) {
        setWithdrawLoading(false);
      }
    }
  };
  return (
    <div className="w-full mb-3 px-2">
      <div className="flex items-center  rounded-md hover:bg-gray-100 h-[46px] flex-grow px-2 text-white">
        <div className="flex items-center" style={{ width: "50%" }}>
          <img
            className="w-6 h-6 rounded-3xl mr-2.5"
            src={token.icon}
            alt={""}
          />
          <div className="text-sm">
            <p className="w-24 overflow-hidden whitespace-nowrap overflow-ellipsis">
              {token.symbol}
            </p>
            <p className="text-gray-50 text-xs">
              {beautifyNumber({
                num: getTokenPrice(token),
                className: "text-gray-50 text-xs",
                subClassName: "text-[8px]",
                isUsd: true,
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col text-sm" style={{ width: "25%" }}>
          <span>
            {display_number_internationalCurrencySystemLongString(
              Big(tokenBalance || 0).toFixed()
            )}
          </span>
          <span
            className={`text-xs text-gray-50 ${showWithdraw ? "" : "hidden"}`}
          >
            {display_value(String(token?.t_value))}
          </span>
        </div>
        {showWithdraw ? (
          <div
            className="flex items-center justify-center rounded border border-gray-300 text-xs text-gray-10 hover:text-white h-6 px-1 cursor-pointer"
            onClick={doWithDraw}
            style={{ width: "25%" }}
          >
            <ButtonTextWrapper
              loading={withdrawLoading}
              Text={() => <>Withdraw</>}
            />
          </div>
        ) : (
          <div
            className="flex items-center justify-end text-sm"
            style={{ width: "25%" }}
          >
            {display_value(String(token?.t_value))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(WalletTokenList);
