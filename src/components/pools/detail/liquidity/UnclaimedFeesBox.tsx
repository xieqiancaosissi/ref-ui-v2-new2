import React, { useEffect, useState } from "react";
import { toPrecision, formatWithCommas } from "@/utils/numbers";
import { claim_all_liquidity_fee } from "@/services/swapV3";
import { UserLiquidityInfo } from "@/services/commonV3";
import { ButtonTextWrapper } from "@/components/common/Button";
import _ from "lodash";
import { Icon } from "./IconCom";
import { get_unClaimed_fee_data } from "../dcl/d3Chart/DetailFun";
import successToast from "@/components/common/toast/successToast";
import failToast from "@/components/common/toast/failToast";
export function UnclaimedFeesBox(props: any) {
  const { poolDetail, liquidities, tokenPriceList, setAddSuccess } = props;
  const { token_x_metadata, token_y_metadata } = poolDetail;
  const [user_liquidities_total, set_user_liquidities_total] =
    useState<Record<string, any>>();
  const [cliam_loading, set_cliam_loading] = useState(false);
  useEffect(() => {
    if (liquidities) {
      const [total_tvl_fee, total_amount_x_fee, total_amount_y_fee] =
        get_unClaimed_fee_data(liquidities, poolDetail, tokenPriceList);
      set_user_liquidities_total({
        total_amount_x_fee,
        total_amount_y_fee,
        total_tvl_fee,
      });
    }
  }, [liquidities, Object.keys(tokenPriceList).length]);
  function getTotalLiquditiesFee() {
    const total_tvl = user_liquidities_total?.total_tvl_fee || 0;
    if (total_tvl == 0) {
      return "$0";
    } else if (total_tvl < 0.01) {
      return "<$0.01";
    } else {
      return "$" + formatWithCommas(toPrecision(total_tvl.toString(), 2));
    }
  }
  function getTotalFeeAmount() {
    const total_amount_x = user_liquidities_total?.total_amount_x_fee || 0;
    const total_amount_y = user_liquidities_total?.total_amount_y_fee || 0;
    let display_amount_x;
    let display_amount_y;
    const total_amount_x_y = total_amount_x + total_amount_y;
    if (total_amount_x == 0) {
      display_amount_x = "0";
    } else if (total_amount_x < 0.001) {
      display_amount_x = "<0.001";
    } else {
      display_amount_x = toPrecision(total_amount_x.toString(), 3);
    }
    if (total_amount_y == 0) {
      display_amount_y = "0";
    } else if (total_amount_y < 0.001) {
      display_amount_y = "<0.001";
    } else {
      display_amount_y = toPrecision(total_amount_y.toString(), 3);
    }

    return {
      display_amount_x,
      display_amount_y,
      total_amount_x_y,
    };
  }
  function claimRewards() {
    if (total_amount_x_y == 0) return;
    set_cliam_loading(true);
    const lpt_ids: string[] = [];
    liquidities.forEach((liquidity: UserLiquidityInfo | any) => {
      const { unclaimed_fee_x, unclaimed_fee_y }: any = liquidity;
      if (+unclaimed_fee_x > 0 || +unclaimed_fee_y > 0) {
        lpt_ids.push(liquidity.lpt_id);
      }
    });
    claim_all_liquidity_fee({
      token_x: token_x_metadata,
      token_y: token_y_metadata,
      lpt_ids,
    })
      .then((res: any) => {
        if (!res) return;
        let status;
        if (res.status == "success") {
          successToast();
          setAddSuccess((pre: number) => pre + 1);
        } else if (res.status == "error") {
          failToast(res.errorResult?.message);
        }
      })
      .finally(() => {
        set_cliam_loading(false);
      });
  }
  const { display_amount_x, display_amount_y, total_amount_x_y } =
    getTotalFeeAmount();
  return (
    <>
      {/* for pc */}
      <div className="p-4 lg:ml-7 bg-refPublicBoxDarkBg lg:w-80 xsm:w-full rounded-xl mt-3.5 ">
        <div className="flex  font-bold text-white text-base items-start justify-between">
          <span className="xsm:hidden">Unclaimed Fees</span>
          <span className="text-green-10 xsm:text-xl">
            {getTotalLiquditiesFee()}
          </span>
        </div>
        <div className="flex flex-col items-start mt-4">
          <div className="flex flex-col w-full text-sm text-white">
            <div className="flex justify-between">
              <div className="frcc text-gray-60">
                <Icon icon={token_x_metadata.icon} className="h-7 w-7 mr-2" />
                {token_x_metadata.symbol}
              </div>
              <span className=" ">{display_amount_x}</span>
            </div>
            <div className="flex justify-between my-4">
              <div className="frcc text-gray-60">
                <Icon icon={token_y_metadata.icon} className="h-7 w-7 mr-2" />
                {token_y_metadata.symbol}
              </div>
              <span className=" ">{display_amount_y}</span>
            </div>
          </div>

          <div
            className={`flex items-center font-bold justify-center h-11 w-full rounded text-sm xsm:mt-48 ${
              total_amount_x_y == 0
                ? "border-gray-90 text-gray-60 cursor-not-allowed border"
                : "hover:opacity-90 cursor-pointer text-green-10 border border-green-10 "
            }`}
            onClick={() => claimRewards()}
          >
            <ButtonTextWrapper
              loading={cliam_loading}
              Text={() => <span>Claim</span>}
            />
          </div>
        </div>
      </div>
      {/* for mobile */}
      {/* <div className="flex flex-col items-center lg:hidden">
        <div className="flex items-center w-full justify-between mt-5">
          <span className="">Unclaimed Fees</span>
          <span className="text-green-10">{getTotalLiquditiesFee()}</span>
        </div>
        <div className="flex items-center justify-between w-full mt-5">
          <div className="flex items-center">
            <Icon icon={token_x_metadata.icon} className="h-7 w-7 mr-2"></Icon>
            <span className="text-white text-sm">
              {token_x_metadata.symbol}
            </span>
          </div>
          <span className="text-white text-sm">{display_amount_x}</span>
        </div>
        <div className="flex items-center justify-between w-full mt-5">
          <div className="flex items-center">
            <Icon icon={token_y_metadata.icon} className="h-7 w-7 mr-2"></Icon>
            <span className="text-white text-sm">
              {token_y_metadata.symbol}
            </span>
          </div>
          <span className="text-white text-sm">{display_amount_y}</span>
        </div>
        <div
          className={`flex items-center font-gothamBold justify-center h-10 rounded-lg text-sm px-6 py-1 w-full mt-6 ${
            total_amount_x_y == 0
              ? "bg-black bg-opacity-25 text-gray-10 cursor-not-allowed"
              : "bg-blue-10 hover:bg-deepBlueHover text-white cursor-pointer"
          }`}
          onClick={claimRewards}
          style={{
            background: "linear-gradient(180deg, #646DF4 0%, #371BE4 100%)",
          }}
        >
          <ButtonTextWrapper
            loading={cliam_loading}
            Text={() => <span>claim</span>}
          />
        </div>
      </div> */}
    </>
  );
}
