import React, { useEffect, useState } from "react";
import Tips from "@/components/common/Tips/index";
import poolStyle from "./index.module.css";
import { feeList, bankList } from "./config";
import { FEELIST } from "@/services/commonV3";
import { SelectedIcon } from "@/components/limit/icons";
import { PoolInfo } from "@/services/swapV3";
import { toInternationalCurrencySystem } from "@/utils/numbers";
import Big from "big.js";
import BigNumber from "bignumber.js";
import { toReadableNumber } from "@/utils/numbers";
import { useRouter } from "next/router";
export default function Fee({
  getherFee,
  listPool,
  token,
  tokenPriceList,
  setHasSame,
}: {
  getherFee: (e: any) => void;
  setHasSame: (e: any) => void;
  listPool: Array<any>;
  token: Array<any>;
  tokenPriceList: any;
}) {
  const [isActive, setActive] = useState(0.01);
  const [feeValue, setFeeValue] = useState(isActive);
  const router = useRouter();
  const switchSelectedFee = (e: any) => {
    setFeeValue(e);
    setActive(e);
  };
  useEffect(() => {
    getherFee(feeValue);
  }, [feeValue]);

  useEffect(() => {
    if (router?.query?.id) {
      const k: any = router.query.id;
      const fee = k.length > 1 && k.split("@")[1];

      if (fee) {
        setActive(fee / 10000);
        getherFee(fee / 10000);
        // console.log(fee / 10000, 'feee')
      }
    }
  }, [JSON.stringify(router || {})]);

  const [currentPools, setCurrentPools] = useState<
    Record<string, PoolInfo> | any
  >(null);

  function displayTvl(tvl: any) {
    if (!tokenPriceList) {
      return "-";
    } else if (!tvl || +tvl == 0) {
      return "$0";
    } else if (+tvl < 1) {
      return "<$1";
    } else {
      return `$${toInternationalCurrencySystem(tvl.toString(), 0)}`;
    }
  }
  return (
    <>
      <div className="flex items-center justify-start text-gray-60 font-normal text-sm mt-[24px]">
        Setting Fee Tiers{" "}
        {/* <Tips
      msg1={`LP fee 80%`}
      msg2={`Protocol fee and Refferral fee 20%`}
      extraStyles={"w-54"}
      origin="createPool"
    /> */}
      </div>
      <div
        className="flex mt-[10px] flex-col items-start border border-dark-90  rounded p-[2px]"
        style={{
          background: "rgba(0, 0, 0, 0.2)",
        }}
      >
        {/*  */}
        {/*  */}
        <div className={`w-full frcc h-[44px]`}>
          {FEELIST.map((feeItem, index) => {
            const { fee, text } = feeItem;
            const arr = [token[0]?.id, token[1]?.id];
            arr.sort();
            let p: any = {};
            const hasPool = listPool.some((item) => {
              const expectedId = `${arr[0]}|${arr[1]}|${fee}`;
              if (item.pool_id === expectedId) p = item;
              return item.pool_id === expectedId;
            });
            if (hasPool) {
              const {
                total_x,
                total_y,
                total_fee_x_charged,
                total_fee_y_charged,
              } = p;
              const firstToken = token[0]?.id == arr[0] ? token[0] : token[1];
              const secondToken = token[1]?.id == arr[1] ? token[1] : token[0];
              const firstTokenPrice =
                (tokenPriceList &&
                  tokenPriceList[firstToken.id] &&
                  tokenPriceList[firstToken.id].price) ||
                "0";
              const secondTokenPrice =
                (tokenPriceList &&
                  tokenPriceList[secondToken.id] &&
                  tokenPriceList[secondToken.id].price) ||
                "0";
              const totalX = new BigNumber(total_x)
                .minus(total_fee_x_charged || 0)
                .toFixed();
              const totalY = new BigNumber(total_y)
                .minus(total_fee_y_charged || 0)
                .toFixed();
              const tvlx = new Big(
                toReadableNumber(firstToken.decimals, totalX)
              )
                .times(firstTokenPrice)
                .toNumber();
              const tvly = new Big(
                toReadableNumber(secondToken.decimals, totalY)
              )
                .times(secondTokenPrice)
                .toNumber();
              const totalTvl = tvlx + tvly;
              p.tvl = totalTvl;
            }

            if (hasPool && fee / 10000 == isActive) {
              setHasSame(hasPool);
            } else if (!hasPool && fee / 10000 == isActive) {
              setHasSame(false);
            }

            return (
              <div
                onClick={() => {
                  setHasSame(hasPool);
                  switchSelectedFee(fee / 10000);
                }}
                key={fee + index}
                className={` fccc px-2 py-1.5 xsm:py-1 rounded-lg w-1/4  h-full cursor-pointer hover:border-green-10 hover:border ${
                  fee / 10000 == isActive ? " bg-gray-90" : "bg-transparent"
                }`}
              >
                <span
                  className={`text-sm font-bold ${
                    hasPool ? "text-gray-60" : "text-white"
                  }`}
                >
                  {fee / 10000}%
                </span>
                {/* { currentPools ? ( */}
                <span
                  className={`transform scale-90 origin-left text-xs text-gray-60 whitespace-nowrap ${
                    hasPool ? "text-opacity-60" : ""
                  }`}
                >
                  {!hasPool ? (
                    "No Pool"
                  ) : Object.keys(tokenPriceList).length > 0 ? (
                    <span>{displayTvl(p?.tvl || 0)}</span>
                  ) : (
                    "Loading..."
                  )}
                </span>
                {/* ) : null} */}
                {/* {currentSelectedPool?.fee == fee ? (
                          <SelectedIcon className="absolute top-0 right-0" />
                        ) : null} */}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
