// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import _ from "lodash";
import Big from "big.js";
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from "@/utils/numbers";
import { TokenMetadata } from "@/services/ft-contract";
import { toRealSymbol } from "@/services/farm";
import { BigNumber } from "bignumber.js";
import { PoolInfo } from "@/services/swapV3";
import {
  UserLiquidityInfo,
  getPriceByPoint,
  CONSTANT_D,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
  TOKEN_LIST_FOR_RATE,
  displayNumberToAppropriateDecimals,
  get_pool_name,
  openUrlLocal,
  get_account_24_apr,
  get_total_earned_fee,
  get_token_amount_in_user_liquidities,
  findRangeIntersection,
} from "@/services/commonV3";
import { Seed } from "@/services/farm";
import { getAccountId } from "@/utils/wallet";
import DclChart from "../../dcl/d3Chart/DclChart";
import {
  IDCLAccountFee,
  UserLiquidityDetail,
} from "../../dcl/d3Chart/interfaces";
import {
  formatPercentage,
  formatWithCommas_usd,
  formatNumber,
} from "../../dcl/d3Chart/utils";
import { getDCLAccountFee } from "@/services/indexer";
import { get_unClaimed_fee_data } from "../../dcl/d3Chart/DetailFun";
import { SelectLiquidityBox } from "./SelectLiquidityBox";

function YourLiquidityBox(props: {
  poolDetail: PoolInfo;
  liquidities: UserLiquidityInfo[];
  tokenPriceList: any;
  matched_seeds: Seed[];
  setAddSuccess?: any;
  addSuccess?: any;
}) {
  const router = useRouter();
  const {
    poolDetail,
    liquidities,
    tokenPriceList,
    matched_seeds,
    setAddSuccess,
    addSuccess,
  } = props;
  const [user_liquidities_detail, set_user_liquidities_detail] = useState<
    UserLiquidityDetail[]
  >([]);
  const [showSelectLiquidityBox, setShowSelectLiquidityBox] = useState(false);
  const [accountAPR, setAccountAPR] = useState("");
  const [earned_fee, set_earned_fee] = useState("");
  const [earned_fee_x_amount, set_earned_fee_x_amount] = useState<any>();
  const [earned_fee_y_amount, set_earned_fee_y_amount] = useState<any>();
  const [operationType, setOperationType] = useState("add");
  const [hover, setHover] = useState<boolean>(false);
  const [noReverseRange, setNoReverseRange] = useState(true);
  const [removeButtonTip, setRemoveButtonTip] = useState<boolean>(false);
  const [is_in_farming, set_is_in_farming] = useState<boolean>(false);
  const [is_in_farming_done, set_is_in_farming_done] = useState<boolean>(false);
  const { token_x_metadata, token_y_metadata, pool_id } = poolDetail;

  const accountId = getAccountId();
  let pair_is_reverse = false;
  if (TOKEN_LIST_FOR_RATE.indexOf(token_x_metadata?.symbol) > -1) {
    pair_is_reverse = true;
  }
  useEffect(() => {
    if (liquidities) {
      const temp_list: UserLiquidityDetail[] = [];
      liquidities.forEach((liquidity: UserLiquidityInfo) => {
        if (!liquidity) return;
        const {
          left_point,
          right_point,
          lpt_id,
          amount,
          unclaimed_fee_x,
          unclaimed_fee_y,
        } = liquidity;
        const { amount_x, amount_y } = get_amount_x_y(liquidity);
        const unclaimed_fee_x_amount = toReadableNumber(
          token_x_metadata.decimals,
          unclaimed_fee_x
        );
        const unclaimed_fee_y_amount = toReadableNumber(
          token_y_metadata.decimals,
          unclaimed_fee_y
        );
        const token_x_price = tokenPriceList[token_x_metadata.id]?.price || 0;
        const token_y_price = tokenPriceList[token_y_metadata.id]?.price || 0;
        const total_liqudities_price =
          Number(amount_x) * Number(token_x_price) +
          Number(amount_y) * Number(token_y_price);
        const total_fees_price =
          Number(unclaimed_fee_x_amount) * Number(token_x_price) +
          Number(unclaimed_fee_y_amount) * Number(token_y_price);
        const decimalRate =
          Math.pow(10, token_x_metadata.decimals) /
          Math.pow(10, token_y_metadata.decimals);
        const l_price = getPriceByPoint(left_point, decimalRate);
        const r_price = getPriceByPoint(right_point, decimalRate);
        const temp: UserLiquidityDetail = {
          total_liqudities_price: total_liqudities_price.toString(),
          total_fees_price: total_fees_price.toString(),
          amount_x,
          amount_y,
          unclaimed_fee_x_amount,
          unclaimed_fee_y_amount,

          hashId: lpt_id.split("#")[1],
          l_price,
          r_price,
        };
        temp_list.push(temp);
      });
      set_user_liquidities_detail(temp_list);
    }
  }, [liquidities, Object.keys(tokenPriceList).length, addSuccess]);

  useEffect(() => {
    if (
      liquidities &&
      poolDetail &&
      tokenPriceList &&
      Object.keys(tokenPriceList).length
    ) {
      get_24_apr_and_fee();
      get_tokens_amount_liquidities();
    }
  }, [
    JSON.stringify(poolDetail || {}),
    tokenPriceList.length,
    liquidities.length,
    addSuccess,
  ]);

  useEffect(() => {
    if (liquidities) {
      const target = liquidities.find((l: UserLiquidityInfo) => {
        return Big(l.part_farm_ratio || 0).gt(0);
      });
      if (target) {
        set_is_in_farming(true);
      } else {
        set_is_in_farming(false);
      }
      set_is_in_farming_done(true);
    }
  }, [liquidities, addSuccess]);

  async function get_24_apr_and_fee() {
    let apr_24 = "0";
    let total_fee_earned = "0";
    let total_earned_fee_x;
    let total_earned_fee_y;
    const dcl_fee_result: IDCLAccountFee | any = await getDCLAccountFee({
      pool_id,
      account_id: accountId,
    });
    if (dcl_fee_result?.apr) {
      // total unClaimed fee
      const [
        unClaimed_tvl_fee,
        unClaimed_amount_x_fee,
        unClaimed_amount_y_fee,
      ] = get_unClaimed_fee_data(liquidities, poolDetail, tokenPriceList);
      // 24h profit
      apr_24 = get_account_24_apr(
        unClaimed_tvl_fee,
        dcl_fee_result,
        poolDetail,
        tokenPriceList
      );
      // total earned fee
      const {
        total_earned_fee_x_amount,
        total_earned_fee_y_amount,
        total_fee_earned_money,
      } = get_total_earned_fee({
        total_earned_fee: dcl_fee_result.total_earned_fee,
        token_x_metadata,
        token_y_metadata,
        unClaimed_amount_x_fee,
        unClaimed_amount_y_fee,
        tokenPriceList,
      });
      total_fee_earned = total_fee_earned_money;
      total_earned_fee_x = total_earned_fee_x_amount;
      total_earned_fee_y = total_earned_fee_y_amount;
    }
    set_earned_fee_x_amount(formatNumber(total_earned_fee_x));
    set_earned_fee_y_amount(formatNumber(total_earned_fee_y));
    set_earned_fee(formatWithCommas_usd(total_fee_earned));
    setAccountAPR(formatPercentage(apr_24));
  }

  function get_amount_x_y(liquidity: UserLiquidityInfo) {
    const [tokenX, tokenY] = [token_x_metadata, token_y_metadata];
    const { left_point, right_point, amount: L } = liquidity;
    const { current_point } = poolDetail;
    let amount_x = "0";
    let amount_y = "0";
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      const tokenYAmount = getY(
        left_point,
        current_point,
        current_point,
        L,
        tokenY
      );
      const tokenXAmount = getX(current_point + 1, right_point, L, tokenX);
      const { amountx, amounty } = get_X_Y_In_CurrentPoint(tokenX, tokenY, L);
      amount_x = new BigNumber(tokenXAmount).plus(amountx).toFixed();
      amount_y = new BigNumber(tokenYAmount).plus(amounty).toFixed();
    }
    // only y token
    if (current_point >= right_point) {
      const tokenYAmount = getY(
        left_point,
        right_point,
        current_point,
        L,
        tokenY
      );
      amount_y = tokenYAmount;
    }
    // only x token
    if (left_point > current_point) {
      const tokenXAmount = getX(left_point, right_point, L, tokenX);
      amount_x = tokenXAmount;
    }
    return {
      amount_x,
      amount_y,
    };
  }

  function getX(
    leftPoint: number,
    rightPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const x = new BigNumber(L)
      .multipliedBy(
        (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
            Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
      )
      .toFixed();
    return toReadableNumber(token.decimals, toPrecision(x, 0));
  }

  function getY(
    leftPoint: number,
    rightPoint: number,
    currentPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const y = new BigNumber(L).multipliedBy(
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
        (Math.sqrt(CONSTANT_D) - 1)
    );
    const y_result = y.toFixed();
    return toReadableNumber(token.decimals, toPrecision(y_result, 0));
  }

  function get_X_Y_In_CurrentPoint(
    tokenX: TokenMetadata,
    tokenY: TokenMetadata,
    L: string
  ) {
    const { liquidity, liquidity_x, current_point } = poolDetail;
    const liquidity_y_big = new BigNumber(liquidity).minus(liquidity_x);
    let Ly = "0";
    let Lx = "0";
    // only remove y
    if (liquidity_y_big.isGreaterThanOrEqualTo(L)) {
      Ly = L;
    } else {
      // have x and y
      Ly = liquidity_y_big.toFixed();
      Lx = new BigNumber(L).minus(Ly).toFixed();
    }
    const amountX = getXAmount_per_point_by_Lx(Lx, current_point);
    const amountY = getYAmount_per_point_by_Ly(Ly, current_point);
    const amountX_read = toReadableNumber(
      tokenX.decimals,
      toPrecision(amountX, 0)
    );
    const amountY_read = toReadableNumber(
      tokenY.decimals,
      toPrecision(amountY, 0)
    );
    return { amountx: amountX_read, amounty: amountY_read };
  }

  function getTotalLiquditiesTvl() {
    const { total_x, total_y } = amountLiquidity;
    if (total_x) {
      const price_x = tokenPriceList[token_x_metadata.id]?.price || 0;
      const price_y = tokenPriceList[token_y_metadata.id]?.price || 0;
      const total_x_value = Big(price_x).mul(total_x);
      const total_y_value = Big(price_y).mul(total_y);
      const total_value = total_x_value.plus(total_y_value).toFixed();
      const total_value_display = formatWithCommas_usd(total_value);
      return total_value_display;
    } else {
      return 0;
    }
  }

  const [amountLiquidity, setAmountLiquidity] = useState({
    total_x: "",
    total_y: "",
  });

  function get_tokens_amount_liquidities() {
    const [total_x, total_y] = get_token_amount_in_user_liquidities({
      user_liquidities: liquidities,
      pool: poolDetail,
      token_x_metadata,
      token_y_metadata,
    });
    setAmountLiquidity({
      total_x,
      total_y,
    });
    // return [total_x, total_y];
  }

  function getTotalTokenAmount() {
    const { total_x, total_y } = amountLiquidity;
    let display_total_x = "0";
    let display_total_y = "0";
    if (+total_x == 0) {
      display_total_x = "0";
    } else if (+total_x < 0.01) {
      display_total_x = "<0.01";
    } else {
      display_total_x = toInternationalCurrencySystem(total_x, 3);
    }
    if (+total_y == 0) {
      display_total_y = "0";
    } else if (+total_y < 0.01) {
      display_total_y = "<0.01";
    } else {
      display_total_y = toInternationalCurrencySystem(total_y, 3);
    }
    return {
      total_x: display_total_x,
      total_y: display_total_y,
    };
  }

  function removeLiquidity() {
    setOperationType("remove");
    setShowSelectLiquidityBox(true);
  }

  function getGroupLiquidities() {
    const tokenMetadata_x_y = [token_x_metadata, token_y_metadata];

    let rate_need_to_reverse_display: boolean;

    if (TOKEN_LIST_FOR_RATE.indexOf(token_x_metadata?.symbol) > -1) {
      rate_need_to_reverse_display = true;
    }

    if (!noReverseRange) {
      rate_need_to_reverse_display = !rate_need_to_reverse_display;
    }

    function getRateMapTokens() {
      if (tokenMetadata_x_y) {
        const [tokenX, tokenY] = tokenMetadata_x_y;
        if (rate_need_to_reverse_display) {
          return `${tokenX.symbol}/${tokenY.symbol}`;
        } else {
          return `${tokenY.symbol}/${tokenX.symbol}`;
        }
      }
    }

    function getRate(
      direction: string,
      left_point: number,
      right_point: number
    ) {
      let value = "";
      if (tokenMetadata_x_y) {
        const [tokenX, tokenY] = tokenMetadata_x_y;
        const decimalRate =
          Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
        if (direction == "left") {
          value = getPriceByPoint(left_point, decimalRate);
        } else if (direction == "right") {
          value = getPriceByPoint(right_point, decimalRate);
        }
        if (rate_need_to_reverse_display && +value !== 0) {
          value = new BigNumber(1).dividedBy(value).toFixed();
        }
      }
      return value;
    }

    const priceRangeList =
      liquidities?.map((l) => {
        return [
          +getRate(
            rate_need_to_reverse_display ? "right" : "left",
            l.left_point,
            l.right_point
          ),
          +getRate(
            rate_need_to_reverse_display ? "left" : "right",
            l.left_point,
            l.right_point
          ),
        ];
      }) || [];

    const rangeList = findRangeIntersection(priceRangeList);
    return {
      rangeList,
      rateMapTokens: getRateMapTokens(),
    };
  }

  const groupedData = getGroupLiquidities();

  function goAddliquidityV2() {
    const url_pool_id = get_pool_name(poolDetail.pool_id);
    router.push(`/liquidity/${url_pool_id}`);
  }

  return (
    <div className="lg:ml-7 lg:w-80 xsm:w-full bg-refPublicBoxDarkBg p-4 rounded-xl">
      <div className="flex items-start justify-between">
        <span className="text-white lg:font-bold lg:text-base xs:text-sm sm:text-sm xsm:hidden">
          Your Liquidity
        </span>
        <span className="text-white font-bold lg:text-base xsm:text-xl xsm:text-green-10 xsm:mt-6">
          {getTotalLiquditiesTvl()}
        </span>
      </div>
      {/* chart area */}
      {liquidities?.length > 0 && (
        <div className="flex items-center justify-center border border-gray-90 rounded p-3 pt-1 mt-6">
          <DclChart
            key={addSuccess}
            pool_id={poolDetail?.pool_id}
            config={{
              controlHidden: true,
              svgWidth: "280",
              svgHeight: "80",
              svgPaddingX: "12",
              currentBarHidden: true,
              hoverBoxHidden: true,
            }}
            chartType="USER"
            reverse={pair_is_reverse ? noReverseRange : !noReverseRange}
          />
        </div>
      )}
      {liquidities?.length > 0 && (
        <div className="flex flex-col gap-3 mt-6 text-sm font-normal">
          <div className="flex items-start justify-between gap-5">
            <span className="text-gray-50 whitespace-nowrap">Price Range</span>

            <span className="flex items-center justify-end flex-wrap gap-1">
              {groupedData.rangeList.map((range: number[], i: number) => {
                return (
                  <div
                    className="text-white whitespace-nowrap"
                    key={i + "groupedData"}
                  >
                    <span>{displayNumberToAppropriateDecimals(range[0])}</span>
                    <span className="mx-1">-</span>
                    <span>{displayNumberToAppropriateDecimals(range[1])}</span>
                    {groupedData.rangeList.length > 1 &&
                      i < groupedData.rangeList.length - 1 && (
                        <span className="mr-1">,</span>
                      )}
                  </div>
                );
              })}

              <span
                className="cursor-pointer underline text-white"
                onClick={() => {
                  setNoReverseRange(!noReverseRange);
                }}
              >
                {groupedData.rateMapTokens}
              </span>
            </span>
          </div>

          <div className="frcb">
            <span className="text-gray-50">Position</span>

            <div className="frcs gap-1 flex-wrap text-white">
              <span>{getTotalTokenAmount().total_x}</span>

              <span>{token_x_metadata.symbol}</span>

              <span>+</span>

              <span>{getTotalTokenAmount().total_y}</span>

              <span>{token_y_metadata.symbol}</span>
            </div>
          </div>

          <div className="frcb ">
            <span className="text-gray-50">APR(24h)</span>

            <div className="frcs gap-1 flex-wrap  text-white">
              {accountAPR || "-"}
            </div>
          </div>

          <div className="frcb ">
            <span className="text-gray-50">Total Earned Fee</span>

            <div
              className="frcs gap-1 flex-wrap relative text-white"
              onMouseEnter={() => {
                setHover(true);
              }}
              onMouseLeave={() => {
                setHover(false);
              }}
            >
              <div className="relative">
                {hover && (
                  <div
                    className="p-3 -top-8 text-white right-0 text-xs absolute rounded-xl border bg- border-assetsBorder flex flex-col gap-3 min-w-32"
                    style={{
                      background: "rgba(26, 39, 48, 0.9)",
                    }}
                  >
                    <div className="frcb gap-3 w-full">
                      <span>{toRealSymbol(token_x_metadata.symbol)}</span>
                      <span>{earned_fee_x_amount || "-"}</span>
                    </div>

                    <div className="frcb gap-3 w-full">
                      <span>{toRealSymbol(token_y_metadata.symbol)}</span>

                      <span>{earned_fee_y_amount || "-"}</span>
                    </div>
                  </div>
                )}
              </div>
              <span
                className={`${
                  earned_fee ? "border-b border-dashed border-white" : ""
                }`}
              >
                {earned_fee || "-"}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mt-7 xsm:w-full">
        {liquidities?.length > 0 ? (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                goAddliquidityV2();
              }}
              className={`poolBtnStyleBase lg:w-35 xsm:w-1/2 h-10  lg:mr-2.5 text-sm cursor-pointer hover:opacity-90 `}
            >
              Add
            </div>
            <div
              className={`relative flex items-center flex-grow xsm:w-1/2 xsm:ml-1`}
              onMouseEnter={() => {
                if (is_in_farming) {
                  setRemoveButtonTip(true);
                }
              }}
              onMouseLeave={() => {
                if (is_in_farming) {
                  setRemoveButtonTip(false);
                }
              }}
            >
              <div
                onClick={(e: any) => {
                  e.stopPropagation();
                  removeLiquidity();
                }}
                // disabled={is_in_farming || !is_in_farming_done}
                className={`lg:w-35 xsm:w-full h-10 text-sm cursor-pointer hover:opacity-90 ${
                  is_in_farming || !is_in_farming_done
                    ? "opacity-30 pointer-events-none poolBtnStyleDefaultBase"
                    : "poolBtnStyleActiveEmpty"
                } }`}
              >
                Remove
              </div>
              <div
                className={`${
                  removeButtonTip ? "" : "hidden"
                } absolute z-50 -right-2 -top-12 pb-2`}
              >
                <div className="border border-primaryText rounded-md px-2 py-1.5 text-xs text-gray-10 w-56 bg-cardBg">
                  You have liquidity in farm, please unstake from{" "}
                  <a
                    className="underline cursor-pointer"
                    onClick={() => {
                      localStorage.setItem("BOOST_FARM_TAB", "yours");
                      router.push("/v2farms");
                    }}
                  >
                    Your Farm
                  </a>{" "}
                  first.
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              goAddliquidityV2();
            }}
            className={`poolBtnStyleBase lg:w-35 xsm:w-full h-10  lg:mr-2.5 text-sm cursor-pointer hover:opacity-90 `}
          >
            Add
          </div>
        )}
      </div>
      <SelectLiquidityBox
        isOpen={showSelectLiquidityBox}
        onRequestClose={() => {
          setShowSelectLiquidityBox(false);
        }}
        poolDetail={poolDetail}
        user_liquidities_detail={user_liquidities_detail}
        user_liquidities={liquidities}
        operation={operationType}
        tokenPriceList={tokenPriceList}
        matched_seeds={matched_seeds}
        setAddSuccess={setAddSuccess}
        style={{
          overlay: {
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
          },
          content: {
            outline: "none",
            transform: "translate(-50%, -50%)",
          },
        }}
      />
    </div>
  );
}
export default React.memo(YourLiquidityBox);
