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

function RecentTransaction(props: any) {
  const { activeTab, poolId, updatedMapList } = props;
  const [title, setTitle] = useState<any>([]);
  const { swapTransaction, liquidityTransactions } = useClassicPoolTransaction({
    pool_id: poolId,
  });

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
    setTitle(
      activeTab == "swap"
        ? [
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
          ]
        : [
            {
              key: "Action",
              colSpan: "w-1/6",
            },
            {
              key: "Amount",
              colSpan: "w-1/2",
            },
            {
              key: "Time",
              colSpan: "w-1/3",
            },
          ]
    );
  }, [activeTab]);

  // swap
  const renderSwapTransactions = swapTransaction.map((tx, index) => {
    const swapIn = updatedMapList[0].token_account_ids.find(
      (t: any) => t.id === tx.token_in
    );

    const swapOut = updatedMapList[0].token_account_ids.find(
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
        className={`text-sm flex hover:bg-poolRecentHover my-3`}
      >
        <div className="w-1/3 flex flex-wrap pr-1">
          <span className="col-span-1 text-white mr-1" title={swapInAmount}>
            {displayInAmount}
          </span>

          <div
            title={toRealSymbol(swapIn.symbol)}
            className="text-gray-60 text-ellipsis overflow-hidden whitespace-nowrap"
          >
            {toRealSymbol(swapIn.symbol)}
          </div>
        </div>

        <div className="w-1/3 flex-wrap flex items-center justify-start pr-1">
          <span className="text-white" title={swapOutAmount}>
            {displayOutAmount}
          </span>

          <span className="ml-1 text-gray-60">
            {toRealSymbol(swapOut.symbol)}
          </span>
        </div>

        <div className="w-1/3 relative flex-wrap">
          <span
            key={tx.receipt_id}
            className="inline-flex items-center cursor-pointer"
            onMouseEnter={() => handleMouseEnter(tx.receipt_id, index)}
            onMouseLeave={handleMouseLeave}
          >
            {loadingStates[tx.receipt_id] ? (
              <div className="hover:underline cursor-pointer text-gray-60 min-w-36">
                {tx.timestamp}
                <span className={styles.loadingDots}></span>
              </div>
            ) : (
              <>
                <span className="hover:underline cursor-pointer text-gray-60 min-w-36">
                  {tx.timestamp}
                </span>
                <BlinkIcon className="opacity-40 hover:opacity-100 ml-2"></BlinkIcon>
              </>
            )}
            {hoveredTx === tx.receipt_id && index == hoverIndex && (
              <div className="bg-dark-70 w-41 h-25 absolute top-6 -right-2 bg-poolDetaileTxBgColor  p-2 shadow-lg rounded z-50">
                <div className="flex flex-col">
                  <div
                    className="mb-2 px-3 py-2 hover:bg-dark-10 text-white rounded-md flex items-center"
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "block";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "none";
                      }
                    }}
                    onClick={() =>
                      handleTxClick(
                        tx.receipt_id,
                        `${getConfig().explorerUrl}/txns`
                      )
                    }
                  >
                    <NearblocksIcon />
                    <p className="ml-2">nearblocks</p>
                    <div className="ml-3 arrow" style={{ display: "none" }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-dark-10 text-white rounded-md flex items-center"
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "block";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "none";
                      }
                    }}
                    onClick={() =>
                      handleTxClick(
                        tx.receipt_id,
                        `${getConfig().pikespeakUrl}/transaction-viewer`
                      )
                    }
                  >
                    <PikespeakIcon />
                    <p className="ml-2">Pikespeak...</p>
                    <div className="ml-3 arrow" style={{ display: "none" }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </span>
        </div>
      </div>
    );
  });

  const renderLiquidityTransactions = liquidityTransactions.map((tx, index) => {
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
        className={`text-sm flex hover:bg-poolRecentHover my-3`}
      >
        <div className="w-1/6 flex flex-wrap">
          <span className="text-white">
            {(tx.method_name.toLowerCase().indexOf("add") > -1 ||
              tx.method_name.toLowerCase().indexOf("append") > -1) &&
              "Add"}

            {tx.method_name.toLowerCase().indexOf("remove") > -1 && "Remove"}
          </span>
        </div>

        <div className={`w-6/12 flex items-center flex-wrap`}>
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

        <div className={`w-1/3 relative `}>
          <span
            key={tx.receipt_id}
            className="inline-flex items-center cursor-pointer"
            onMouseEnter={() => handleMouseEnter(tx.receipt_id, index)}
            onMouseLeave={handleMouseLeave}
          >
            {loadingStates[tx.receipt_id] ? (
              <div className="hover:underline cursor-pointer text-gray-60 min-w-36">
                {tx.timestamp}
                <span className={styles.loadingDots}></span>
              </div>
            ) : (
              <>
                <span className="hover:underline cursor-pointer text-gray-60 min-w-36">
                  {tx.timestamp}
                </span>
                <BlinkIcon className="opacity-40 hover:opacity-100 ml-2"></BlinkIcon>
              </>
            )}
            {hoveredTx === tx.receipt_id && index == hoverIndex && (
              <div className="bg-dark-70 w-41 h-25 absolute top-6 -right-2 bg-poolDetaileTxBgColor  p-2 shadow-lg rounded z-50">
                <div className="flex flex-col">
                  <div
                    className="mb-2 px-3 py-2 hover:bg-dark-10 text-white rounded-md flex items-center"
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "block";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "none";
                      }
                    }}
                    onClick={() =>
                      handleTxClick(
                        tx.receipt_id,
                        `${getConfig().explorerUrl}/txns`
                      )
                    }
                  >
                    <NearblocksIcon />
                    <p className="ml-2">nearblocks</p>
                    <div className="ml-3 arrow" style={{ display: "none" }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-dark-10 text-white rounded-md flex items-center"
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "block";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "none";
                      }
                    }}
                    onClick={() =>
                      handleTxClick(
                        tx.receipt_id,
                        `${getConfig().pikespeakUrl}/transaction-viewer`
                      )
                    }
                  >
                    <PikespeakIcon />
                    <p className="ml-2">Pikespeak...</p>
                    <div className="ml-3 arrow" style={{ display: "none" }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </span>
        </div>
      </div>
    );
  });

  // liquidity

  return (
    <div className="lg:w-183 max-h-106 rounded-md overflow-auto ">
      <div
        className="flex sticky top-0  px-4 xsm:pt-4 lg:py-3  select-none"
        style={{
          zIndex: 10,
          background: "#08141C",
        }}
      >
        {title.map((item: any, index: number) => {
          return (
            <span
              key={item.key + "_" + index}
              className={`${item.colSpan} text-gray-60 text-sm`}
            >
              {item.key}
            </span>
          );
        })}
      </div>
      <div className="px-4 pb-4 pt-2 bg-refPublicBoxDarkBg">
        {activeTab == "swap"
          ? renderSwapTransactions
          : renderLiquidityTransactions}
      </div>
    </div>
  );
}
export default React.memo(RecentTransaction);
