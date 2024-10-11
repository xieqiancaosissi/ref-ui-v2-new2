import React, { useState, useContext, useEffect, useMemo, useRef } from "react";
import Big from "big.js";
import { useRouter } from "next/router";
import MarketSeedsBox from "./MarketSeedsBox";
import MySeedsBox from "./MySeedsBox";
import CallBackModal from "./CallBackModal";
import { getMemeDataConfig } from "./memeConfig";
import { emptyObject, getSeedsTotalStaked } from "./tool";
import { MemeContext } from "./context";
import { formatPercentage } from "../../utils/uiNumber";
import { Intro } from "./Intro";
import UserRankingModal from "./UserRankingModal";
import MemeAirdropListForPc from "./memeAirdropListForPc";
import {
  CoinMobile,
  CoinPc,
  MemeRightArrow,
  UserRankingMobile,
  UserRankingPC,
} from "./icons";
import { isMobile } from "../../utils/device";
import { useAccountStore } from "@/stores/account";
import { checkTransaction } from "@/utils/contract";
import { useScrollToTopOnFirstPage } from "@/services/meme";
import { Seed } from "@/services/farm";
import { getURLInfoSubFirst } from "@/utils/transactionsPopup";

export enum TRANSACTION_WALLET_TYPE {
  NEAR_WALLET = "transactionHashes",
  SENDER_WALLET = "transactionHashesSender",
  WalletSelector = "transactionHashesWallets",
}

export const parsedArgs = (res: any) => {
  const buff = Buffer.from(res, "base64");
  const parsedData = buff.toString("ascii");
  return parsedData;
};

const is_mobile = isMobile();
export interface ITxParams {
  action: "stake" | "unstake";
  params: any;
  txHash: string;
  receiver_id: string;
}
const SeedsBox = () => {
  const [tab, setTab] = useState<"market" | "your">("market");
  const [isTxHashOpen, setIsTxHashOpen] = useState(false);
  const [txParams, setTxParams] = useState<ITxParams>();
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  const { seeds } = useContext(MemeContext)!;
  const memeDataConfig = getMemeDataConfig();
  const meme_winner_tokens = memeDataConfig.meme_winner_tokens;
  const [isUserRanking, setUserRanking] = useState(false);
  const [isShowAirdropModal, setShowAirdropModal] = useState<boolean>(false);
  const { txHash } = getURLInfoSubFirst();
  const router = useRouter();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res: any) => {
        const { transaction, receipts } = res;
        const byNeth =
          transaction?.actions?.[0]?.FunctionCall?.method_name === "execute";
        const byEvm =
          transaction?.actions?.[0]?.FunctionCall?.method_name ===
          "rlp_execute";
        const isPackage = byNeth || byEvm;
        const packageMethodName =
          receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
            ?.method_name;
        const methodNameNormal =
          transaction?.actions[0]?.FunctionCall?.method_name;
        const args = parsedArgs(
          isPackage
            ? res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
                ?.args
            : res?.transaction?.actions?.[0]?.FunctionCall?.args || ""
        );
        const receiver_id = byEvm
          ? receipts?.[0].receiver_id
          : transaction?.receiver_id;
        const parsedInputArgs = JSON.parse(args || "");
        const methodName = isPackage ? packageMethodName : methodNameNormal;
        if (
          methodName == "unlock_and_unstake_seed" ||
          methodName == "ft_transfer_call"
        ) {
          setIsTxHashOpen(true);
          setTxParams({
            action:
              methodName == "unlock_and_unstake_seed" ? "unstake" : "stake",
            params: parsedInputArgs,
            txHash,
            receiver_id,
          });
        }
      });
    }
  }, [txHash, isSignedIn]);
  const displaySeeds = useMemo(() => {
    if (emptyObject(seeds)) return {};
    return meme_winner_tokens.reduce(
      (acc: any, memeTokenId: string | number) => ({
        ...acc,
        ...{ [memeTokenId]: seeds[memeTokenId] },
      }),
      {}
    ) as Record<string, Seed>;
  }, [meme_winner_tokens, seeds]);
  const displaySeedsPercent = useMemo(() => {
    const displaySeedsPercent: Record<string, string> = {};
    if (!emptyObject(displaySeeds)) {
      const totalTvl = getSeedsTotalStaked(displaySeeds);
      Object.entries(displaySeeds).map(([seed_id, seed]) => {
        let percent = "0";
        const seedTvl = seed.seedTvl;
        if (seedTvl && Big(seedTvl).gt(0) && Big(totalTvl).gt(0)) {
          const p = Big(seedTvl).div(totalTvl);
          percent = formatPercentage(p.mul(100).toFixed());
          displaySeedsPercent[seed_id] = percent;
        } else {
          displaySeedsPercent[seed_id] = "0%";
        }
      });
    }
    return displaySeedsPercent;
  }, [displaySeeds]);

  const positionArray = new Set([3, 4, 5]);
  const { currentPage, introRef, hasGuided } = useScrollToTopOnFirstPage();
  const [positionInfo, setPositionInfo] = useState({ top: -140, left: 200 });
  const pagePositions: Record<number, { top: number; left: number }> = {
    3: { top: -130, left: 200 },
    4: { top: -180, left: 250 },
    5: { top: 150, left: 100 },
  };

  useEffect(() => {
    if (pagePositions[currentPage]) {
      setPositionInfo(pagePositions[currentPage]);
    }
  }, [currentPage]);
  return (
    <div className="mt-14">
      {/* gudie start */}
      {!hasGuided &&
        positionArray.has(currentPage) &&
        !is_mobile &&
        isSignedIn && (
          <div className="relative" ref={introRef}>
            <Intro top={positionInfo.top} left={positionInfo.left}>
              {currentPage == 3 && (
                <div style={{ marginTop: "72px" }}>
                  <MarketSeedsBox
                    hidden={tab === "market" ? false : true}
                    displaySeedsPercent={displaySeedsPercent}
                    origin={"intro"}
                    setTxParams={setTxParams}
                    setIsTxHashOpen={setIsTxHashOpen}
                  />
                </div>
              )}
              {currentPage == 4 && (
                <div className="flex items-center text-2xl paceGrotesk-Bold gap-12 mb-5 ml-2 xsm:text-xl xsm:mx-3 xsm:gap-0 xsm:border-b xsm:border-memeVoteBorderColor">
                  <div
                    className={` py-2 px-5 cursor-pointer xsm:w-1/2 xsm:text-center ${`text-white border-b-4 border-white`}`}
                  >
                    Feed Meme
                  </div>
                  <div
                    className={`py-2 border-b-4  px-5 cursor-pointer xsm:w-1/2 xsm:text-center text-gray-60 border-transparent`}
                  >
                    Yours
                  </div>
                </div>
              )}
              {currentPage == 5 && (
                <>
                  <div className="flex items-center text-2xl paceGrotesk-Bold gap-12 mb-5 ml-2 xsm:text-xl xsm:mx-3 xsm:gap-0 xsm:border-b xsm:border-memeVoteBorderColor">
                    <div
                      className={`py-2 border-b-4  px-5 cursor-pointer xsm:w-1/2 xsm:text-center text-gray-60 border-transparent`}
                    >
                      Feed Meme
                    </div>
                    <div
                      className={` py-2 px-5 cursor-pointer xsm:w-1/2 xsm:text-center ${`text-white border-b-4 ${
                        isSignedIn ? "border-white" : "border-transparent"
                      }`}`}
                    >
                      Yours
                    </div>
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      bottom: "-360px",
                      left: "20px",
                      width: "244px",
                    }}
                    className={`flex flex-grow items-center justify-center border border-primaryGreen 
                      rounded-xl h-12 text-primaryGreen text-base paceGrotesk-Bold focus:outline-none w-1/2 xsm:w-full 'opacity-30'`}
                  >
                    Unstake
                  </div>
                </>
              )}
            </Intro>
          </div>
        )}
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center justify-between text-2xl paceGrotesk-Bold gap-12 mb-5 ml-2 xsm:text-xl xsm:mx-3 xsm:gap-0 xsm:border-b xsm:border-memeVoteBorderColor">
          <div
            className={` py-2 px-5 cursor-pointer xsm:w-1/2 xsm:text-center ${
              tab === "market"
                ? `text-white ${currentPage != 5 ? "border-b-4" : ""} ${
                    isSignedIn ? "border-white" : "border-transparent"
                  }`
                : "border-b-4 text-gray-60 border-transparent"
            }`}
            onClick={() => {
              setTab("market");
            }}
          >
            Feed Meme
          </div>
          <div
            className={`py-2 ${
              currentPage != 4 ? "border-b-4" : ""
            }  px-5 cursor-pointer xsm:w-1/2 xsm:text-center ${
              isSignedIn ? "" : "hidden"
            } ${
              tab === "your"
                ? "text-white border-white"
                : "text-gray-60 border-transparent"
            }`}
            onClick={() => {
              setTab("your");
            }}
          >
            Yours
          </div>
        </div>
      </div>
      <MarketSeedsBox
        hidden={tab === "market" ? false : true}
        displaySeedsPercent={displaySeedsPercent}
        setTxParams={setTxParams}
        setIsTxHashOpen={setIsTxHashOpen}
      />
      <MySeedsBox
        hidden={tab === "your" ? false : true}
        displaySeedsPercent={displaySeedsPercent}
        setTxParams={setTxParams}
        setIsTxHashOpen={setIsTxHashOpen}
      />
      {isTxHashOpen && txParams ? (
        <CallBackModal
          isOpen={isTxHashOpen}
          onRequestClose={() => {
            setIsTxHashOpen(false);
            router.replace("/meme");
          }}
          txParams={txParams}
        />
      ) : null}
    </div>
  );
};
export default React.memo(SeedsBox);
