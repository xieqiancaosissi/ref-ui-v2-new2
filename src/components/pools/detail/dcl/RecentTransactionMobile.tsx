import React, { useEffect, useState, useRef } from "react";
import { useDCLPoolTransaction } from "@/hooks/usePools";
import {
  toReadableNumber,
  numberWithCommas,
  toPrecision,
  toInternationalCurrencySystem,
} from "@/utils/numbers";
import { toRealSymbol } from "@/services/farm";
import getConfig from "@/utils/config";
import { getTxId } from "@/services/indexer";
import {
  PikespeakIcon,
  NearblocksIcon,
  TxLeftArrow,
  BlinkIcon,
} from "../../icon";
import styles from "./style.module.css";
import Big from "big.js";
import { sort_tokens_by_base, reverse_price } from "@/services/commonV3";
import { pointToPrice } from "@/services/swapV3";
import RecentTransactionModal from "../classic/RecentTransactionModal";
import { MoreExpand, MoreCollapse } from "../../icon";

function RecentTransactionMobile(props: any) {
  const { activeTab, poolId, updatedMapList, tokens } = props;
  const [title, setTitle] = useState<any>([{ colSpan: "", key: "" }]);

  const { swapTransactions, liquidityTransactions, limitOrderTransactions } =
    useDCLPoolTransaction({ pool_id: poolId });

  const [loadingStates, setLoadingStates] = useState<any>({});
  const [hoveredTx, setHoveredTx] = useState(null);
  const closeTimeoutRef = useRef<any>(null);
  const [hoverIndex, setHoverIndex] = useState(0);
  const handleMouseEnter = (receipt_id: any, index: number) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredTx(receipt_id);
    setHoverIndex(index);
  };
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredTx(null);
      setHoverIndex(0);
    }, 200);
  };

  const handleMouseClick = (receipt_id: any, index: number) => {
    if (receipt_id == hoveredTx && index == hoverIndex) {
      setHoveredTx(null);
      setHoverIndex(0);
      setRecentIsOpen(false);
    } else {
      setHoveredTx(receipt_id);
      setHoverIndex(index);
      setRecentIsOpen(true);
    }
  };

  async function handleTxClick(receipt_id: any, url: string) {
    setLoadingStates((prevStates: any) => ({
      ...prevStates,
      [receipt_id]: true,
    }));
    try {
      const data = await getTxId(receipt_id);
      if (data && data.receipts && data.receipts.length > 0) {
        const txHash = data.receipts[0].originated_from_transaction_hash;
        window.open(`${url}/${txHash}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error(
        "An error occurred while fetching transaction data:",
        error
      );
    } finally {
      setLoadingStates((prevStates: any) => ({
        ...prevStates,
        [receipt_id]: false,
      }));
    }
  }
  useEffect(() => {
    let titleList;
    switch (activeTab) {
      case "swap":
        titleList = [
          {
            key: "From",
            colSpan: "w-1/3",
          },
          {
            key: "To",
            colSpan: "w-1/3",
          },
          {
            key: "Time",
            colSpan: "w-1/3",
          },
        ];
        break;
      case "liquidity":
        titleList = [
          {
            key: "Action",
            colSpan: "w-1/3",
          },
          {
            key: "Amount",
            colSpan: "w-1/3",
          },
          {
            key: "Time",
            colSpan: "w-1/3",
          },
        ];
        break;
      case "order":
        titleList = [
          {
            key: "Action",
            colSpan: "w-2/12",
          },
          {
            key: "From",
            colSpan: "w-2/12",
          },
          {
            key: "To",
            colSpan: "w-2/12",
          },
          {
            key: "Price",
            colSpan: "w-3/12",
          },
          {
            key: "Time",
            colSpan: "w-3/12",
          },
        ];
        break;
      default:
        break;
    }

    setTitle(titleList);
  }, [activeTab]);
  const [recentIsOpen, setRecentIsOpen] = useState(false);

  const [showItem, setShowItem] = useState(false);
  // swap
  const renderSwapTransactions = swapTransactions.map((tx, index) => {
    if (index >= 5 && !showItem) return false;
    const swapIn = tokens.find((t: any) => t.id === tx.token_in);
    const swapOut = tokens.find((t: any) => t.id === tx.token_out);
    if (!swapIn || !swapOut) return null;
    const swapInAmount = toReadableNumber(swapIn.decimals, tx.amount_in);
    const displayInAmount =
      Number(swapInAmount) < 0.01
        ? "<0.01"
        : toInternationalCurrencySystem(swapInAmount, 6);

    const swapOutAmount = toReadableNumber(swapOut.decimals, tx.amount_out);

    const displayOutAmount =
      Number(swapOutAmount) < 0.01
        ? "<0.01"
        : toInternationalCurrencySystem(swapOutAmount, 6);
    return (
      <div
        key={tx.receipt_id + index}
        className={`text-sm flex items-center bg-refPublicBoxDarkBg my-3 min-h-14 rounded-lg p-3`}
      >
        <div className="w-1/3 flex flex-wrap break-words">
          <span className="col-span-1 text-white mr-1" title={swapInAmount}>
            {displayInAmount}
          </span>

          <span className="text-gray-60">{toRealSymbol(swapIn.symbol)}</span>
        </div>

        <div className="w-1/3 flex flex-wrap break-words">
          <span className="text-white" title={swapOutAmount}>
            {displayOutAmount}
          </span>

          <span className="ml-1 text-gray-60">
            {toRealSymbol(swapOut.symbol)}
          </span>
        </div>

        <div className="w-1/3 flex flex-wrap break-words">
          <span
            key={tx.receipt_id}
            className="inline-flex items-center cursor-pointer"
          >
            <span
              key={tx.receipt_id}
              className="flex flex-wrap break-words items-center cursor-pointer"
              onClick={() => {
                handleMouseClick(tx.receipt_id, index);
              }}
            >
              <span className="hover:underline cursor-pointer text-gray-60 frcc">
                {tx.timestamp}
                <BlinkIcon className="opacity-40 hover:opacity-100 ml-2  shrink-0"></BlinkIcon>
              </span>
            </span>
          </span>
        </div>

        {hoveredTx === tx.receipt_id && index == hoverIndex && (
          <RecentTransactionModal
            isOpen={recentIsOpen}
            onRequestClose={setRecentIsOpen}
            receipt_id={tx.receipt_id}
          />
        )}
      </div>
    );
  });

  const renderLiquidityTransactions = liquidityTransactions.map((tx, index) => {
    if (index >= 5 && !showItem) return false;
    const swapIn = tokens[0];

    const swapOut = tokens[1];

    if (!swapIn || !swapOut) return null;

    const AmountIn = toReadableNumber(swapIn.decimals, tx.amount_x);
    const displayInAmount =
      Number(AmountIn) < 0.01 && Number(AmountIn) > 0
        ? "<0.01"
        : toInternationalCurrencySystem(AmountIn, 6);

    const AmountOut = toReadableNumber(swapOut.decimals, tx.amount_y);

    const displayOutAmount =
      Number(AmountOut) < 0.01 && Number(AmountOut) > 0
        ? "<0.01"
        : toInternationalCurrencySystem(AmountOut, 6);

    return (
      <div
        key={tx.receipt_id + index}
        className={`text-sm flex items-center bg-refPublicBoxDarkBg my-3 min-h-14 rounded-lg p-3`}
      >
        <div className="w-1/3 flex flex-wrap break-words">
          <span className="text-white">
            {(tx.method_name.toLowerCase().indexOf("add") > -1 ||
              tx.method_name.toLowerCase().indexOf("append") > -1) &&
              "Add"}

            {tx.method_name.toLowerCase().indexOf("remove") > -1 && "Remove"}
          </span>
        </div>

        <div className={`w-1/3 flex flex-wrap break-words`}>
          {Big(AmountIn || 0).gt(0) ? (
            <>
              <span className="text-white" title={AmountIn}>
                {displayInAmount}
              </span>

              <span className="ml-1  text-gray-60">
                {toRealSymbol(swapIn.symbol)}
              </span>
            </>
          ) : null}
          {Big(AmountIn || 0).gt(0) && Big(AmountOut || 0).gt(0) ? (
            <span className="mx-1 text-white">+</span>
          ) : null}
          {Big(AmountOut || 0).gt(0) ? (
            <>
              {" "}
              <span className="text-white" title={AmountOut}>
                {displayOutAmount}
              </span>
              <span className="ml-1 text-gray-60">
                {toRealSymbol(swapOut.symbol)}
              </span>
            </>
          ) : null}
        </div>

        <div className="w-1/3 flex flex-wrap break-words">
          <span
            key={tx.receipt_id}
            className="inline-flex items-center cursor-pointer"
          >
            <span
              key={tx.receipt_id}
              className="flex flex-wrap break-words items-center cursor-pointer"
              onClick={() => {
                handleMouseClick(tx.receipt_id, index);
              }}
            >
              <span className="hover:underline cursor-pointer text-gray-60 frcc">
                {tx.timestamp}
                <BlinkIcon className="opacity-40 hover:opacity-100 ml-2  shrink-0"></BlinkIcon>
              </span>
            </span>
          </span>
        </div>
        {hoveredTx === tx.receipt_id && index == hoverIndex && (
          <RecentTransactionModal
            isOpen={recentIsOpen}
            onRequestClose={setRecentIsOpen}
            receipt_id={tx.receipt_id}
          />
        )}
      </div>
    );
  });

  // liquidity

  const renderLimitOrderTransactions = limitOrderTransactions.map(
    (tx, index) => {
      if (index >= 5 && !showItem) return false;
      const swapIn = tokens.find((t: any) => t.id === tx.sell_token);

      const swapOut = tokens.find((t: any) => t.id !== tx.sell_token);

      if (!swapIn || !swapOut) return null;
      let reverse = false;
      const sort_tokens = sort_tokens_by_base([swapIn, swapOut]);
      if (sort_tokens[0].id !== swapIn.id) {
        reverse = true;
      }

      const AmountIn = toReadableNumber(swapIn.decimals, tx.amount);
      const displayInAmount =
        Number(AmountIn) < 0.01
          ? "<0.01"
          : toInternationalCurrencySystem(AmountIn, 3);

      const price = pointToPrice({
        tokenA: swapIn,
        tokenB: swapOut,
        point:
          swapIn.id === poolId.split("|")[0]
            ? Number(tx.point)
            : -Number(tx.point),
      });
      const AmountOut = new Big(AmountIn).mul(price).toFixed();

      const displayOutAmount =
        Number(AmountOut) < 0.01
          ? "<0.01"
          : toInternationalCurrencySystem(AmountOut, 3);

      const display_price = reverse ? reverse_price(price) : price;
      return (
        <div
          key={tx.receipt_id + index}
          className={`text-sm flex items-center bg-refPublicBoxDarkBg my-3 min-h-14 rounded-lg p-3`}
        >
          <div className="w-2/12 flex flex-wrap break-words">
            <span className="text-white">
              {tx.method_name.toLowerCase().indexOf("cancelled") > -1 &&
                "Cancel"}

              {tx.method_name.toLowerCase().indexOf("add") > -1 && "Place"}
            </span>
          </div>

          <div className="w-2/12 flex flex-wrap break-words">
            <div className="frcs flex-wrap">
              <span className="text-white mr-1" title={AmountIn}>
                {displayInAmount}
              </span>

              <span className="text-gray-60">
                {toRealSymbol(swapIn.symbol)}
              </span>
            </div>
          </div>

          <div className="w-2/12 flex flex-wrap break-words">
            <div className="frcs flex-wrap">
              <span className="text-white mr-1" title={AmountOut}>
                {displayOutAmount}
              </span>

              <span className="text-gray-60">
                {toRealSymbol(swapOut.symbol)}
              </span>
            </div>
          </div>

          <div className="w-3/12 flex flex-wrap break-words">
            <div className="frcs flex-wrap">
              <span className="text-white mr-1" title={price}>
                {toInternationalCurrencySystem(display_price, 4)}
              </span>

              <span className="text-gray-60">
                {toRealSymbol(sort_tokens?.[1]?.symbol)}/
                {toRealSymbol(sort_tokens?.[0]?.symbol)}
              </span>
            </div>
          </div>

          <div className="w-3/12 flex flex-wrap break-words">
            <span
              key={tx.receipt_id}
              className="inline-flex items-center cursor-pointer"
              onMouseEnter={() => handleMouseEnter(tx.receipt_id, index)}
              onMouseLeave={handleMouseLeave}
            >
              <span
                key={tx.receipt_id}
                className="flex flex-wrap break-words items-center cursor-pointer"
                onClick={() => {
                  handleMouseClick(tx.receipt_id, index);
                }}
              >
                <span className="hover:underline cursor-pointer text-gray-60 frcc">
                  {tx.timestamp}
                  <BlinkIcon className="opacity-40 hover:opacity-100 ml-2 shrink-0"></BlinkIcon>
                </span>
              </span>
            </span>
          </div>
          {hoveredTx === tx.receipt_id && index == hoverIndex && (
            <RecentTransactionModal
              isOpen={recentIsOpen}
              onRequestClose={setRecentIsOpen}
              receipt_id={tx.receipt_id}
            />
          )}
        </div>
      );
    }
  );

  const renderTransactions =
    activeTab === "swap"
      ? renderSwapTransactions
      : activeTab === "liquidity"
      ? renderLiquidityTransactions
      : renderLimitOrderTransactions;

  return (
    <div className="xsm:w-full rounded-md overflow-auto ">
      <div
        className="flex sticky top-0  p-4  select-none"
        style={{
          zIndex: 10,
          background: "#030f16",
        }}
      >
        {title.map((item: any, index: number) => {
          return (
            <span
              key={item + "_" + index}
              className={`${item.colSpan} text-gray-60 text-sm`}
            >
              {item.key}
            </span>
          );
        })}
      </div>
      <div>{renderTransactions}</div>
      {activeTab == "swap" && swapTransactions.length > 5 && (
        <div
          className="w-full h-12 frcc text-gray-10 border border-gray-190 rounded-lg"
          onClick={() => {
            setShowItem((pre) => !pre);
          }}
        >
          {!showItem ? "Expand" : "Collapse"}
          <span className="ml-1">
            {!showItem ? <MoreExpand /> : <MoreCollapse />}
          </span>
        </div>
      )}
      {activeTab == "liquidity" && liquidityTransactions.length > 5 && (
        <div
          className="w-full h-12 frcc text-gray-10 border border-gray-190 rounded-lg"
          onClick={() => {
            setShowItem((pre) => !pre);
          }}
        >
          {!showItem ? "Expand" : "Collapse"}
          <span className="ml-1">
            {!showItem ? <MoreExpand /> : <MoreCollapse />}
          </span>
        </div>
      )}

      {activeTab == "order" && limitOrderTransactions.length > 5 && (
        <div
          className="w-full h-12 frcc text-gray-10 border border-gray-190 rounded-lg"
          onClick={() => {
            setShowItem((pre) => !pre);
          }}
        >
          {!showItem ? "Expand" : "Collapse"}
          <span className="ml-1">
            {!showItem ? <MoreExpand /> : <MoreCollapse />}
          </span>
        </div>
      )}
    </div>
  );
}
export default React.memo(RecentTransactionMobile);
