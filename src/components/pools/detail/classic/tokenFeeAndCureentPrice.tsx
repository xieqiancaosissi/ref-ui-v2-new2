import React, { useState, useEffect } from "react";
import { SplitRectangleIcon, ExchangeIcon } from "@/components/pools/icon";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
} from "@/utils/uiNumber";
import { toReadableNumber, numberWithCommas } from "@/utils/numbers";
import { beautifyNumber } from "@/components/common/beautifyNumber";
import { filterSpecialChar } from "@/utils/numbers";
import Big from "big.js";
import { usePool } from "@/hooks/usePools";

function TokenFeeAndCureentPrice({
  poolDetail,
  tokenPriceList,
  updatedMapList,
  pool,
  share,
}: {
  poolDetail: any;
  tokenPriceList: any;
  updatedMapList: any;
  pool: any;
  share: any;
}) {
  const [currentSort, setCurrenSort] = useState([0, 1]);
  const exchange = () => {
    const [a, b] = currentSort;
    setCurrenSort([b, a]);
  };
  //

  const first_token_num = toReadableNumber(
    updatedMapList[0].token_account_ids[currentSort[0]].decimals ?? 24,
    Object.values(pool.supplies)[currentSort[0]] ||
      pool.supplies[updatedMapList[0].token_account_ids[currentSort[0]].id]
  );
  const second_token_num = toReadableNumber(
    updatedMapList[0].token_account_ids[currentSort[1]].decimals ?? 24,
    Object.values(pool.supplies)[currentSort[1]] ||
      pool.supplies[updatedMapList[0].token_account_ids[currentSort[1]].id]
  );
  console.log(
    updatedMapList[0],
    pool,
    first_token_num,
    second_token_num,
    updatedMapList[0].token_account_ids[currentSort[0]].decimals ?? 24,
    pool.supplies[updatedMapList[0].token_account_ids[currentSort[0]].id],
    "poolpoolpool"
  );
  const rate =
    // tokenPriceList[poolDetail.token_account_ids[currentSort[1]]]?.price /
    //   tokenPriceList[poolDetail.token_account_ids[currentSort[0]]]?.price ||
    Number(second_token_num) / Number(first_token_num);
  // rate < 0.001 ? "< 0.001" : numberWithCommas(rate.toFixed(3));
  const showRate =
    rate && beautifyNumber({ num: Big(isNaN(rate) ? 0 : rate).toFixed() });
  return (
    <div className="flex items-center text-white h-10 lg:justify-around  xsm:w-full xsm:justify-start">
      <div className="text-sm">
        <h3 className="text-gray-50 font-normal">Fee</h3>
        <p>{formatPercentage(poolDetail?.total_fee * 100)}</p>
      </div>
      <SplitRectangleIcon className="mx-7" />
      <div className="text-sm lg:min-w-45">
        <h3 className="text-gray-50 font-normal">Current Price</h3>
        <div className="flex items-center h-[20px]">
          {/* dom render in html formatter above: 1 Near($5.2) = 7Ref */}
          <span className="mr-1">1</span>
          {/* token left name */}
          {poolDetail?.token_symbols[currentSort[0]] == "wNEAR"
            ? "NEAR"
            : filterSpecialChar(poolDetail?.token_symbols[currentSort[0]])}
          {/* usd price */}
          {tokenPriceList && poolDetail && (
            <span className="text-gray-50 font-normal">
              (
              {toInternationalCurrencySystem_usd(
                tokenPriceList[poolDetail.token_account_ids[currentSort[0]]]
                  ?.price
              )}
              )
            </span>
          )}
          <span className="mx-1">=</span>
          {/* token right amount */}
          {tokenPriceList && poolDetail && (
            <span className="mr-1">{showRate}</span>
          )}
          {/* token right name */}
          {poolDetail?.token_symbols[currentSort[1]] == "wNEAR"
            ? "NEAR"
            : filterSpecialChar(poolDetail?.token_symbols[currentSort[1]])}
        </div>
      </div>
      <ExchangeIcon
        className="mt-auto lg:ml-1 xsm:ml-2 mb-1 cursor-pointer lg:opacity-40 lg:hover:opacity-100"
        onClick={() => exchange()}
      />
    </div>
  );
}
export default React.memo(TokenFeeAndCureentPrice);
