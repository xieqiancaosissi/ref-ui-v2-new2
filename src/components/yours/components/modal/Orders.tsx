import getConfig from "@/utils/config";
import React, { useEffect, useMemo, useState, useContext } from "react";
import { PortfolioContextType, PortfolioData } from "../RefPanelModal";
import useMyOrders from "@/hooks/useMyOrders";
import useTokens from "@/hooks/useTokens";
import { getAccountId } from "@/utils/wallet";
import { useAccountStore } from "@/stores/account";
import { getLimitOrderLogsByAccount } from "@/services/indexer";
import BigNumber from "bignumber.js";
import {
  ONLY_ZEROS,
  calculateFeePercent,
  checkAllocations,
  scientificNotationToString,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import {
  UserOrderInfo,
  V3_POOL_SPLITER,
  pointToPrice,
} from "@/services/swapV3";
import { TokenMetadata } from "@/services/ft-contract";
import {
  SWAP_MODE,
  SWAP_MODE_KEY,
  UpDownButton,
  useTotalOrderData,
} from "../Tool";
import Big from "big.js";
import { toRealSymbol } from "@/services/farm";
import { MyOrderInstantSwapArrowRight } from "@/components/limit/icons2";
import { TOKEN_LIST_FOR_RATE, openUrlLocal } from "@/services/commonV3";
import { LinkIcon, QuestionMark } from "@/components/farm/icon";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import moment from "moment";
import { TIMESTAMP_DIVISOR } from "@/utils/constant";
import ExclamationTip from "@/components/limit/myOrders/exclamationTip";
import {
  ArrowRightForOrder,
  GreenCircleIcon,
  OrdersArrow,
  OrdersExclamationMark,
  PurpleCircleIcon,
} from "../icon";
import { BlueCircleLoading } from "@/components/pools/icon";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useRouter } from "next/router";

const { explorerUrl } = getConfig();
export default function Orders(props: any) {
  const router = useRouter();
  const {
    tokenPriceList,
    set_active_order_value_done,
    set_active_order_Loading_done,
    set_active_order_quanity,
    set_active_order_value,
  } = useContext(PortfolioData) as PortfolioContextType;
  const { activeOrder, activeOrderDone } = useMyOrders();
  const [activeOrderTxMap, setActiveOrderTxMap] = useState({});
  const ActiveTokenIds =
    activeOrder?.map((order) => [order.sell_token, order.buy_token]).flat() ||
    [];
  const tokenIds = !activeOrder ? null : [...new Set([...ActiveTokenIds])];
  const tokens = useTokens(tokenIds || []);
  const tokensMap = tokens?.reduce((acc, cur, index) => {
    return {
      ...acc,
      [cur.id]: cur,
    };
  }, {});
  const accountStore = useAccountStore();
  const accountId = getAccountId();
  const isSignedIn = !!accountId || accountStore.isSignedIn;
  useEffect(() => {
    if (isSignedIn) {
      getLimitOrderLogsByAccount()
        .then((res) => {
          const temp_map = res.reduce((acc, cur) => {
            const { order_id, tx_id } = cur;
            return {
              ...acc,
              [order_id]: tx_id,
            };
          }, {});
          setActiveOrderTxMap(temp_map);
        })
        .catch();
    }
  }, [isSignedIn]);
  useEffect(() => {
    if (
      activeOrder &&
      activeOrder.length > 0 &&
      Object.keys(tokenPriceList).length > 0 &&
      Object.keys(tokensMap || {}).length > 0
    ) {
      const total_value = get_total_active_orders_value();
      set_active_order_value_done(true);
      set_active_order_value(total_value);
    }
    if (activeOrderDone) {
      if (activeOrder?.length == 0) {
        set_active_order_value_done(true);
        set_active_order_value("0");
      }
      const total_quantity = activeOrder ? activeOrder.length : 0;
      set_active_order_Loading_done(true);
      set_active_order_quanity(total_quantity.toString());
    }
  }, [activeOrder, tokenPriceList, tokensMap]);

  function get_total_active_orders_value() {
    let total_value = new BigNumber(0);
    activeOrder?.forEach((order: UserOrderInfo) => {
      const { sell_token, original_deposit_amount } = order;
      const price = tokenPriceList[sell_token]?.price || new BigNumber(0);
      const sell_token_meta = tokensMap
        ? (tokensMap as any)[sell_token]
        : undefined;
      const amount = toReadableNumber(
        sell_token_meta.decimals,
        original_deposit_amount
      );
      total_value = total_value.plus(
        new BigNumber(amount || 0).multipliedBy(price)
      );
    });
    return total_value.toFixed();
  }
  return (
    <>
      <OrderCard
        tokensMap={tokensMap || {}}
        activeOrder={activeOrder || []}
        activeOrderTxMap={activeOrderTxMap}
      />
    </>
  );
}
function OrderCard({
  activeOrder,
  tokensMap,
  activeOrderTxMap,
}: {
  activeOrder: UserOrderInfo[];
  tokensMap: { [key: string]: TokenMetadata };
  activeOrderTxMap: Record<string, string>;
}) {
  const {
    activeTab,
    setActiveTab,
    active_order_value_done,
    active_order_Loading_done,
    active_order_quanity,
    active_order_value,
  } = useContext(PortfolioData) as PortfolioContextType;
  const accountStore = useAccountStore();
  const accountId = getAccountId();
  const isSignedIn = !!accountId || accountStore.isSignedIn;
  const [activeSortBy, setActiveSortBy] = useState<"unclaim" | "created">(
    "created"
  );
  const [sortOrderActive, setSorOrderActive] = useState<"asc" | "desc">("desc");
  const { total_active_orders_value, total_active_orders_quanity } =
    useTotalOrderData({
      active_order_value_done,
      active_order_Loading_done,
      active_order_quanity,
      active_order_value,
    });
  const sellAmountToBuyAmount = (
    undecimaled_amount: string,
    order: UserOrderInfo,
    price: string
  ) => {
    const buy_amount = new Big(
      toReadableNumber(
        tokensMap[order.sell_token].decimals,
        undecimaled_amount || "0"
      )
    )
      .times(price)
      .toFixed(tokensMap[order.sell_token].decimals);

    return scientificNotationToString(buy_amount);
  };
  const buyAmountToSellAmount = (
    undecimaled_amount: string,
    order: UserOrderInfo,
    price: string
  ) => {
    const p = new Big(price).eq(0) ? "1" : price;
    const sell_amount = new Big(
      toReadableNumber(
        tokensMap[order.buy_token].decimals,
        undecimaled_amount || "0"
      )
    )
      .div(p)
      .toFixed(tokensMap[order.buy_token].decimals);

    // return scientificNotationToString(sell_amount);
    return display_amount(sell_amount);
  };
  function display_amount(amount: string) {
    try {
      if (new Big(amount).eq(0)) {
        return "0";
      } else if (Number(amount) > 0 && Number(amount) < 0.01) {
        return "< 0.01";
      } else {
        return toPrecision(amount, 2);
      }
    } catch (error) {
      return amount;
    }
  }
  function display_amount_3_decimal(amount: string) {
    if (new Big(amount).eq(0)) {
      return "0";
    } else if (Number(amount) > 0 && Number(amount) < 0.001) {
      return "< 0.001";
    } else {
      return toPrecision(amount, 3);
    }
  }
  function ActiveLine({
    order,
    index,
  }: {
    order: UserOrderInfo;
    index: number;
  }) {
    const tx_record = activeOrderTxMap[order.order_id];
    const router = useRouter();
    const { tokenPriceList } = useContext(
      PortfolioData
    ) as PortfolioContextType;
    const [switch_off, set_switch_off] = useState<boolean>(true);

    const buyToken = tokensMap[order.buy_token];

    const sellToken = tokensMap[order.sell_token];

    if (!buyToken || !sellToken) return null;

    const swapIn = toReadableNumber(
      sellToken.decimals,
      scientificNotationToString(
        new Big(order.original_deposit_amount || "0")
          .minus(order.original_amount || "0")
          .toString()
      )
    );

    const swapOut = toReadableNumber(
      buyToken.decimals,
      order.swap_earn_amount || "0"
    );

    const orderIn = toReadableNumber(
      sellToken.decimals,
      order.original_amount || "0"
    );

    const totalIn = toReadableNumber(
      sellToken.decimals,
      order.original_deposit_amount || "0"
    );

    const calPoint =
      sellToken.id === order.pool_id.split(V3_POOL_SPLITER)[0]
        ? order.point
        : -order.point;

    const price = pointToPrice({
      tokenA: sellToken,
      tokenB: buyToken,
      point: calPoint,
    });

    const unClaimedAmount = toReadableNumber(
      buyToken.decimals,
      order.unclaimed_amount || "0"
    );

    const unDecimals_claimedAmount = new Big(order.bought_amount || "0")
      .minus(order.unclaimed_amount || "0")
      .toString();
    const claimedAmount = toReadableNumber(
      buyToken.decimals,
      scientificNotationToString(unDecimals_claimedAmount)
    );

    const buyAmountRaw = sellAmountToBuyAmount(
      order.original_amount,
      order,
      price
    );

    const buyAmount = new Big(buyAmountRaw).gt(
      toReadableNumber(buyToken.decimals, order.bought_amount || "0")
    )
      ? buyAmountRaw
      : toReadableNumber(buyToken.decimals, order.bought_amount || "0");

    const totalOut = scientificNotationToString(
      new Big(buyAmount).plus(swapOut).toString()
    );

    const pendingAmount = scientificNotationToString(
      new Big(toPrecision(buyAmount || "0", 5, false, false) || 0)
        .minus(
          toPrecision(
            toReadableNumber(buyToken.decimals, order.bought_amount || "0") ||
              "0",
            5,
            false,
            false
          )
        )
        .toString()
    );

    const pUnClaimedAmount = new Big(unClaimedAmount)
      .div(buyAmount)
      .times(100)
      .toNumber();

    const pClaimedAmount = new Big(claimedAmount)
      .div(buyAmount)
      .times(100)
      .toNumber();

    const pPendingAmount = new Big(pendingAmount)
      .div(buyAmount)
      .times(100)
      .toNumber();

    const displayPercents = checkAllocations("100", [
      pClaimedAmount > 0 && pClaimedAmount < 5
        ? "5"
        : scientificNotationToString(pClaimedAmount.toString()),
      pUnClaimedAmount > 0 && pUnClaimedAmount < 5
        ? "5"
        : scientificNotationToString(pUnClaimedAmount.toString()),

      pPendingAmount > 0 && pPendingAmount < 5
        ? "5"
        : scientificNotationToString(pPendingAmount.toString()),
    ]);

    const getUnclaimAmountTip = () => {
      return `
        <div 
          class="flex flex-col text-xs min-w-36 text-gray-10 z-50"
        >
        ${
          ONLY_ZEROS.test(claimedAmount)
            ? ""
            : `
        <div class="frcb my-1">
            <span class="flex items-center mr-1">
                <div class="w-1.5 h-1.5 rounded-full bg-white mr-1">
                </div>
              Claimed
            </span>
            <span>
            ${display_amount_3_decimal(claimedAmount)}
            </span>
        </div>
        `
        }

        ${
          ONLY_ZEROS.test(unClaimedAmount)
            ? ""
            : `<div class="flex items-center my-1 justify-between">
            <span class="flex items-center mr-1">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-10 mr-1">
                </div>Filled</span> <span>
            ${display_amount_3_decimal(unClaimedAmount)}
            </span>
        </div>`
        }

        ${
          ONLY_ZEROS.test(pendingAmount)
            ? ""
            : `<div class="flex items-center my-1 justify-between">
                <span class="flex items-center ">
                    <div class="w-1.5 h-1.5 rounded-full bg-gray-60 mr-1">
                    </div>Open</span>
                <span>${display_amount_3_decimal(pendingAmount)}</span></div>`
        }
        </div>
    `;
    };

    const sellAmountToClaimedAmount = buyAmountToSellAmount(
      unDecimals_claimedAmount,
      order,
      price
    );

    const sellAmountToUnClaimedAmount =
      displayPercents[1] == "100"
        ? display_amount(orderIn)
        : buyAmountToSellAmount(order.unclaimed_amount || "0", order, price);
    const sellTokenAmount = (
      <div className="flex items-center whitespace-nowrap w-28 justify-between xsm:w-1 xsm:flex-grow">
        <span className="flex flex-shrink-0 items-center">
          <img
            src={sellToken.icon}
            className="border border-gradientFrom rounded-full w-7 h-7"
            alt=""
          />

          <div className="flex   xs:flex-row flex-col ml-2">
            <span className="text-white text-sm mr-2" title={orderIn}>
              {Number(orderIn) > 0 && Number(orderIn) < 0.01
                ? "< 0.01"
                : toPrecision(orderIn, 2)}
            </span>

            <span className="text-gray-10 text-xs xs:relative xs:top-0.5">
              {toRealSymbol(sellToken.symbol)}
            </span>
          </div>
        </span>

        <span className="text-white text-lg xs:hidden pl-2  pr-1">
          <MyOrderInstantSwapArrowRight />
        </span>
      </div>
    );

    const buyTokenAmount = (
      <span className="flex items-center ml-6 xsm:w-1 xsm:flex-grow xsm:m-0 xsm:justify-end">
        <img
          src={buyToken.icon}
          className="border flex-shrink-0 border-gradientFrom rounded-full w-7 h-7"
          alt=""
        />

        <div className="flex xs:flex-row flex-col ml-2">
          <span
            className="text-white mr-2 text-sm whitespace-nowrap"
            title={buyAmount}
          >
            {Number(buyAmount) > 0 && Number(buyAmount) < 0.01
              ? "< 0.01"
              : toPrecision(buyAmount, 2)}
          </span>

          <span className="text-gray-10 text-xs xs:relative xs:top-0.5">
            {toRealSymbol(buyToken.symbol)}
          </span>
        </div>
      </span>
    );

    const fee = Number(order.pool_id.split(V3_POOL_SPLITER)[2]);

    const feeTier = (
      <span className="text-xs text-gray-10 px-1 py-0.5 rounded-md bg-gray-60 bg-opacity-15 ml-5">
        {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
      </span>
    );
    const sort =
      TOKEN_LIST_FOR_RATE.indexOf(sellToken?.symbol) > -1 && +price !== 0;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const orderRate = useMemo(() => {
      let p = price;
      if (sort) {
        p = new BigNumber(1).dividedBy(price).toFixed();
      }
      return (
        <span className="whitespace-nowrap flex items-start xs:flex-row xs:items-center flex-col w-32">
          <span className="mr-1 text-white text-sm" title={p}>
            {toPrecision(p, 2)}
          </span>
          <span className="text-gray-10 text-xs xs:hidden">
            {`${toRealSymbol(
              sort ? sellToken?.symbol : buyToken.symbol
            )}/${toRealSymbol(sort ? buyToken.symbol : sellToken.symbol)}`}
          </span>
          <span className="text-white text-sm lg:hidden md:hidden">
            {`${toRealSymbol(sort ? sellToken.symbol : buyToken.symbol)}`}
          </span>
        </span>
      );
    }, [buyToken, sellToken, price]);

    const unclaimTip = (
      <div
        className="text-xs mt-1 mr-1 w-40 xs:w-full xsm:mt-0 xsm:mr-0 flex items-center xs:flex-row-reverse"
        data-type="info"
        data-place="bottom"
        data-multiline={true}
        data-class="reactTip"
        data-tooltip-html={getUnclaimAmountTip()}
        data-tooltip-id={"unclaim_tip_" + order.order_id}
      >
        <span className="mr-1 xsm:ml-2.5 xsm:mr-3.5">
          <OrdersExclamationMark color="dark" />
        </span>
        <div className="flex items-center w-full">
          {displayPercents.map((p, i) => {
            if (ONLY_ZEROS.test(p)) return null;

            const bgColor =
              i === 0
                ? "bg-primaryGreen"
                : i === 1
                ? "bg-blue-10"
                : "bg-gray-60";

            return (
              <div
                key={i}
                className={`mx-px h-1 xs:h-2 rounded-lg ${bgColor}`}
                style={{
                  width: p + "%",
                }}
              />
            );
          })}
        </div>
        <CustomTooltip
          className="w-20"
          id={"unclaim_tip_" + order.order_id}
          place="bottom"
        />
      </div>
    );

    const unclaim = (
      <span className="flex items-center w-44 whitespace-nowrap mr-1">
        <div className="xs:hidden">{unclaimTip}</div>
      </span>
    );
    const created = (
      <div className="flex items-center justify-end text-xs text-gray-10">
        <span className="mr-1">Created </span>
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format("YYYY-MM-DD HH:mm")}
        <OrdersArrow
          onClick={() => {
            const txHash = activeOrderTxMap[order.order_id];
            router.push(`${explorerUrl}/txns/${txHash}`);
          }}
          className={`ml-1.5 text-gray-10 cursor-pointer hover:text-white ${
            tx_record ? "" : "hidden"
          }`}
        ></OrdersArrow>
      </div>
    );

    const sellTokenPrice = tokenPriceList?.[sellToken.id]?.price || null;
    const buyTokenPrice = tokenPriceList?.[buyToken.id]?.price || null;
    function instant_swap_tip() {
      const token_sell_symbol = toRealSymbol(sellToken.symbol);
      const token_buy_symbol = toRealSymbol(buyToken.symbol);
      const sell_token_price = sellTokenPrice
        ? `($${toPrecision(sellTokenPrice, 2)})`
        : "";
      const buy_token_price = buyTokenPrice
        ? `($${toPrecision(buyTokenPrice, 2)})`
        : "";
      let rate = new Big(swapOut).div(ONLY_ZEROS.test(swapIn) ? 1 : swapIn);
      if (sort) {
        rate = new Big(1).div(rate.eq(0) ? "1" : rate);
      }
      const display_rate = rate.toFixed(3);
      let result = "";
      if (sort) {
        result = `1 ${token_buy_symbol} ${buy_token_price} = ${display_rate} ${token_sell_symbol}`;
      } else {
        result = `1 ${token_sell_symbol} ${sell_token_price} = ${display_rate} ${token_buy_symbol}`;
      }
      return result;
    }
    const swapBanner = (
      <div>
        <div
          className={`flex items-center justify-between mb-6 ${
            ONLY_ZEROS.test(swapIn || "0") ? "hidden" : ""
          }`}
        >
          <span className="flex items-center text-sm text-gray-10">
            Initial Order
            <ExclamationTip
              id="this_order_has_been_partially_filled"
              defaultMessage="This order has been partially filled "
              dataPlace="right"
              colorhex="#7E8A93"
            />
          </span>

          <span className="flex items-center text-sm text-gray-10">
            <div className="flex items-center w-28">
              <span title={totalIn} className="text-white xs:text-gray-10">
                {display_amount(totalIn)}
              </span>
              <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            </div>
            <span className="mx-2 text-white xs:text-gray-10">
              <MyOrderInstantSwapArrowRight />
            </span>
            <div className="flex items-center w-40 justify-end">
              <span
                title={toPrecision(totalOut, buyToken.decimals)}
                className="text-white xs:text-gray-10"
              >
                {display_amount(totalOut)}
              </span>

              <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
            </div>
          </span>
        </div>

        <div
          className={`flex items-center justify-between mb-6 ${
            ONLY_ZEROS.test(swapIn || "0") ? "hidden" : ""
          }`}
        >
          <span className="flex items-center text-sm text-gray-10">
            Instant Swap
            <ExclamationTip
              colorhex="#7E8A93"
              id={instant_swap_tip()}
              defaultMessage={instant_swap_tip()}
            />
          </span>

          <div className="flex items-center text-sm text-gray-10">
            <div className="flex items-center w-24">
              {/* <BsCheckCircle fill="#42bb17" stroke="#42BB17" /> */}
              <span className="text-xs text-gray-10 ml-1.5">swapped</span>
            </div>
            <div className="flex items-center w-28">
              <span title={swapIn} className="text-white">
                {display_amount(swapIn)}
              </span>

              <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            </div>
            <span className="mx-2 text-gray-10">
              <MyOrderInstantSwapArrowRight />
            </span>
            <div className="flex items-end justify-end w-40">
              <span title={swapOut} className="text-white">
                {display_amount(swapOut)}
              </span>

              <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <span className="text-sm text-gray-10">Executing</span>
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center w-24">
                <GreenCircleIcon></GreenCircleIcon>
                <span className="text-xs text-gray-10 ml-1.5">Claimed</span>
              </div>
              <div className="flex items-center w-22">
                <span
                  title={sellAmountToClaimedAmount}
                  className="text-white text-sm"
                >
                  {display_amount(sellAmountToClaimedAmount)}
                </span>
                <span className="ml-1.5 text-gray-10 text-sm">
                  {toRealSymbol(sellToken.symbol)}
                </span>
              </div>
              <span className="mx-2 text-gray-10">
                <MyOrderInstantSwapArrowRight />
              </span>
              <div className="flex items-center justify-end w-24">
                <span title={claimedAmount} className="text-sm text-white">
                  {display_amount(claimedAmount)}
                </span>
                <span className="ml-1.5 text-sm text-gray-10">
                  {toRealSymbol(buyToken.symbol)}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center w-22">
                <PurpleCircleIcon></PurpleCircleIcon>
                <span className="text-xs text-gray-10 ml-1.5">Filled</span>
              </div>
              <div className="flex items-center w-24">
                <span
                  title={sellAmountToUnClaimedAmount}
                  className="text-white text-sm"
                >
                  {sellAmountToUnClaimedAmount}
                </span>
                <span className="ml-1.5 text-gray-10 text-sm">
                  {toRealSymbol(sellToken.symbol)}
                </span>
              </div>
              <span className="mx-2 text-gray-10">
                <MyOrderInstantSwapArrowRight />
              </span>
              <div className="flex items-center justify-end w-24">
                <span title={unClaimedAmount} className="text-sm text-white">
                  {display_amount(unClaimedAmount)}
                </span>
                <span className="ml-1.5 text-sm text-gray-10">
                  {toRealSymbol(buyToken.symbol)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    const mobile_l_width = 16;
    const mobile_r_width = 12;
    const swapBannerMobile = (
      <>
        <div
          className={`flex items-center justify-between ${
            ONLY_ZEROS.test(swapIn || "0") ? "hidden" : ""
          }`}
        >
          <span className="flex items-center text-sm text-gray-10">
            initial_order
            <ExclamationTip
              id="this_order_has_been_partially_filled"
              defaultMessage="This order has been partially filled "
              dataPlace="right"
              colorhex="#7E8A93"
            />
          </span>
          <div className="flex items-center text-sm text-gray-10">
            <span
              title={totalIn}
              className={`text-white xs:text-gray-10 whitespace-nowrap text-right w-${mobile_l_width}`}
            >
              {display_amount(totalIn)}
            </span>
            <span className="mx-2 text-white xs:text-gray-10">
              <MyOrderInstantSwapArrowRight />
            </span>
            <span
              title={toPrecision(totalOut, buyToken.decimals)}
              className={`text-white xs:text-gray-10 text-right whitespace-nowrap w-${mobile_r_width}`}
            >
              {display_amount(totalOut)}
            </span>
          </div>
        </div>
        <div
          className={`flex items-center justify-between mt-4  ${
            ONLY_ZEROS.test(swapIn || "0") ? "hidden" : ""
          }`}
        >
          <span className="flex items-center text-sm text-gray-10">
            instant_swap
            <ExclamationTip
              colorhex="#7E8A93"
              id={instant_swap_tip()}
              defaultMessage={instant_swap_tip()}
            />
          </span>
          <div className="flex items-center text-sm text-gray-10">
            <div
              className={`flex items-center justify-between whitespace-nowrap w-${mobile_l_width}`}
            >
              {/* <BsCheckCircle className="mr-3" fill="#42bb17" stroke="#42BB17" /> */}
              <span title={swapIn} className="text-gray-10 whitespace-nowrap">
                {display_amount(swapIn)}
              </span>
            </div>
            <span className="mx-2 text-gray-10">
              <MyOrderInstantSwapArrowRight />
            </span>
            <span
              title={swapOut}
              className={`text-gray-10 text-right whitespace-nowrap w-${mobile_r_width}`}
            >
              {display_amount(swapOut)}
            </span>
          </div>
        </div>
        <div className={`flex items-center justify-between mt-4`}>
          <span className="flex items-center text-sm text-gray-10">
            claimed_upper
          </span>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-between whitespace-nowrap w-${mobile_l_width}`}
            >
              <GreenCircleIcon className="flex-shrink-0"></GreenCircleIcon>
              <span className="text-primaryText text-sm whitespace-nowrap">
                {display_amount(sellAmountToClaimedAmount)}
              </span>
            </div>
            <span className="mx-2 text-gray-10">
              <MyOrderInstantSwapArrowRight />
            </span>
            <span
              className={`text-primaryText text-sm whitespace-nowrap text-right w-${mobile_r_width}`}
            >
              {display_amount(claimedAmount)}
            </span>
          </div>
        </div>
        <div className={`flex items-center justify-between mt-4 `}>
          <span className="flex items-center text-sm text-gray-10">filled</span>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-between whitespace-nowrap w-${mobile_l_width}`}
            >
              <PurpleCircleIcon className="flex-shrink-0"></PurpleCircleIcon>
              <span className="text-white text-sm whitespace-nowrap">
                {sellAmountToUnClaimedAmount}
              </span>
            </div>
            <span className="mx-2 text-gray-10">
              <MyOrderInstantSwapArrowRight />
            </span>
            <span
              className={`text-white text-sm whitespace-nowrap text-right w-${mobile_r_width}`}
            >
              {display_amount(unClaimedAmount)}
            </span>
          </div>
        </div>
      </>
    );
    return (
      <>
        <div
          className={`rounded-lg mt-2.5 bg-gray-20 px-3 ${
            switch_off ? "bg-opacity-30" : "pb-4 bg-opacity-80"
          }`}
        >
          <div className={`flex items-center justify-between h-14`}>
            <div className="flex items-center">
              {sellTokenAmount}
              {buyTokenAmount}
              {feeTier}
            </div>
            <div className="flex items-center">
              {orderRate}
              {unclaim}
              <UpDownButton
                set_switch_off={() => {
                  set_switch_off(!switch_off);
                }}
                switch_off={switch_off}
              ></UpDownButton>
            </div>
          </div>
          <div className={`${switch_off ? "hidden" : ""}`}>
            <div className="bg-dark-210 rounded-xl px-3.5 py-4 bg-opacity-70 mt-3 mb-4">
              {swapBanner}
            </div>
            {created}
          </div>
        </div>
      </>
    );
  }

  const activeOrderSorting = (a: UserOrderInfo, b: UserOrderInfo) => {
    if (activeSortBy === "created") {
      return sortOrderActive === "desc"
        ? Number(b.created_at) - Number(a.created_at)
        : Number(a.created_at) - Number(b.created_at);
    } else if (activeSortBy === "unclaim") {
      const unclaimA = toReadableNumber(
        tokensMap[a.buy_token].decimals,
        a.unclaimed_amount
      );
      const unclaimB = toReadableNumber(
        tokensMap[b.buy_token].decimals,
        b.unclaimed_amount
      );

      return sortOrderActive === "desc"
        ? Number(unclaimB) - Number(unclaimA)
        : Number(unclaimA) - Number(unclaimB);
    }
  };
  const loading_status =
    (!activeOrder ||
      (activeOrder.length > 0 && Object.keys(tokensMap || {}).length == 0)) &&
    isSignedIn;
  const noData_status =
    !loading_status && (activeOrder?.length === 0 || !isSignedIn);
  return (
    <div className="flex flex-col">
      {loading_status || noData_status ? (
        <SkeletonTheme
          baseColor="rgba(33, 43, 53, 0.3)"
          highlightColor="#2A3643"
        >
          <Skeleton
            style={{ width: "100%" }}
            height={40}
            count={2}
            className="mt-4"
          />
        </SkeletonTheme>
      ) : (
        <>
          <div
            className={`flex items-center justify-between  text-gray-60 text-sm  whitespace-nowrap ${
              loading_status || noData_status ? "hidden" : ""
            }`}
          >
            <div className="flex items-center">
              <span className="text-left">You Sell</span>

              <span className="ml-20">You Buy</span>
            </div>
            <div className="flex items-center">
              <span className="w-32">@price</span>
              <div className="flex items-center justify-between w-56">
                <span className="">Execute Status</span>
                <span
                  onClick={() => {
                    localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.LIMIT);
                    openUrlLocal("/");
                  }}
                  className="flex items-center justify-center text-xs text-gray-10 border border-gray-90 rounded-md px-1.5 cursor-pointer hover:text-white py-0.5"
                >
                  Your Orders
                  <OrdersArrow className="ml-1" />
                </span>
              </div>
            </div>
          </div>
          <div className={`${activeTab == "1" ? "" : "hidden"}`}>
            {activeOrder
              ?.sort((a, b) => activeOrderSorting(a, b) || 0)
              .map((order, index) => {
                return (
                  <ActiveLine
                    index={index}
                    key={index + "order"}
                    order={order}
                  />
                );
              })}
          </div>
        </>
      )}
      {/* pc no data */}
      {/* {noData_status  ? (
        <NoDataCard
          text={intl.formatMessage({ id: 'active_order_appear_here_tip' })}
        />
      ) : null} */}
    </div>
  );
}
