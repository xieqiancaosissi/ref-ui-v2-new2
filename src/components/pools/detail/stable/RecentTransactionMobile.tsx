import React, { useEffect, useState, useRef } from "react";
import { useClassicPoolTransaction } from "@/hooks/usePools";
import {
  toReadableNumber,
  numberWithCommas,
  toPrecision,
  toInternationalCurrencySystem,
} from "@/utils/numbers";
import { formatNumber } from "@/utils/uiNumber";
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
import RecentTransactionModal from "../classic/RecentTransactionModal";
import { MoreExpand, MoreCollapse } from "../../icon";

function RecentTransactionMobile(props: any) {
  const { activeTab, poolId, updatedMapList } = props;
  const [title, setTitle] = useState<any>([]);
  const { swapTransaction, liquidityTransactions } = useClassicPoolTransaction({
    pool_id: poolId,
  });
  const [containerWidth, setContainerWidth] = useState([
    "col-span-2",
    "col-span-4",
    "col-span-3",
  ]);
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
            colSpan: "col-span-3",
          },
          {
            key: "To",
            colSpan: "col-span-3",
          },
          {
            key: "Time",
            colSpan: "col-span-3",
          },
        ];
        break;
      case "liquidity":
        titleList = [
          {
            key: "Action",
            colSpan: containerWidth[0],
          },
          {
            key: "Amount",
            colSpan: containerWidth[1],
          },
          {
            key: "Time",
            colSpan: containerWidth[2],
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

  const renderSwapTransactions = swapTransaction.map((tx, index) => {
    if (index >= 5 && !showItem) return false;
    const swapIn = updatedMapList[0].token_account_ids?.find(
      (t: any) => t.id === tx.token_in
    );

    const swapOut = updatedMapList[0].token_account_ids?.find(
      (t: any) => t.id === tx.token_out
    );

    if (!swapIn || !swapOut) return null;

    const swapInAmount = toReadableNumber(swapIn.decimals, tx.swap_in);
    const displayInAmount =
      Number(swapInAmount) < 0.01
        ? "<0.01"
        : toInternationalCurrencySystem(swapInAmount, 6);

    const swapOutAmount = toReadableNumber(swapOut.decimals, tx.swap_out);

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
            onClick={() => handleMouseClick(tx.receipt_id, index)}
          >
            <span className="hover:underline cursor-pointer text-gray-60 frcc">
              {tx.timestamp}
              <BlinkIcon className="opacity-40 hover:opacity-100 ml-2 shrink-0"></BlinkIcon>
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
    const { amounts } = tx;
    const renderTokens: any[] = [];
    const amountsObj: any[] = JSON.parse(amounts.replace(/\'/g, '"'));
    amountsObj.forEach((amount: string, index) => {
      if (Big(amount || 0).gt(0)) {
        renderTokens.push({
          token: updatedMapList[0]?.token_account_ids[index],
          amount: toReadableNumber(
            updatedMapList[0]?.token_account_ids[index].decimals,
            amountsObj[index]
          ),
        });
      }
    });

    return (
      <div
        key={tx.receipt_id + index}
        className={`text-sm flex items-center bg-refPublicBoxDarkBg my-3 min-h-14 rounded-lg p-3`}
      >
        <div className={`w-1/3 flex flex-wrap break-words`}>
          <span className="text-white">
            {(tx.method_name.toLowerCase().indexOf("add") > -1 ||
              tx.method_name.toLowerCase().indexOf("append") > -1) &&
              "Add"}

            {tx.method_name.toLowerCase().indexOf("remove") > -1 && "Remove"}
          </span>
        </div>

        <div className={`w-1/3 flex flex-wrap break-words`}>
          {renderTokens.map((renderToken, index) => {
            return (
              <>
                <span className="text-white" title={renderToken.amount}>
                  {toInternationalCurrencySystem(renderToken.amount)}
                </span>

                <span className="ml-1 text-gray-60">
                  {toRealSymbol(renderToken.token.symbol)}
                </span>
                {index !== renderTokens.length - 1 ? (
                  <span className="mx-1 text-white">+</span>
                ) : null}
              </>
            );
          })}
        </div>

        <div className={`w-1/3 flex flex-wrap break-words`}>
          <span
            key={tx.receipt_id}
            className="inline-flex items-center cursor-pointer"
            onClick={() => handleMouseClick(tx.receipt_id, index)}
          >
            <span className="hover:underline cursor-pointer text-gray-60 frcc">
              {tx.timestamp}
              <BlinkIcon className="opacity-40 hover:opacity-100 ml-2 shrink-0"></BlinkIcon>
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

  return (
    <div className="lg:w-215 xsm:w-full  rounded-md overflow-auto ">
      <div
        className={`grid grid-cols-9 sticky top-0  p-4  select-none`}
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
      <div className="pb-4 pt-2 ">
        {activeTab == "swap"
          ? renderSwapTransactions
          : renderLiquidityTransactions}
      </div>
      {activeTab == "swap"
        ? swapTransaction.length > 5 && (
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
          )
        : liquidityTransactions.length > 5 && (
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
