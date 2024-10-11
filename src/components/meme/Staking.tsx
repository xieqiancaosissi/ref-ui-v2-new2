import React, { useState, useContext } from "react";
import { isMobile } from "../../utils/device";
import {
  AcquireXREFIcon,
  AirdropMobileArrowIcon,
  ArrowRightTopIcon,
  CoinPc,
  XREFStakingDetails,
} from "./icons";
import VoteModal from "./VoteModal";
import DonateModal from "./DonateModal";
import MemeVoteModal from "./MemeVoteModal";
import { Intro } from "./Intro";
import MemeAirdropListForPc from "./memeAirdropListForPc";
import VoteDetailsModal from "./VoteDetailsModal";
import StakingChart from "./StakingChart";
import { useAccountStore } from "@/stores/account";
import { useScrollToTopOnFirstPage } from "@/services/meme";
import { useRouter } from "next/router";
import UserRankingModal from "./UserRankingModal";
import CallBackModal from "./CallBackModal";
import { ITxParams } from "./SeedsBox";

const Staking = () => {
  const is_mobile = isMobile();
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const [isMemeVoteOpen, setIsMemeVoteOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isUserRanking, setUserRanking] = useState(false);
  const [isShowAirdropModal, setShowAirdropModal] = useState(false);
  const [isShowVoteDetailsModal, setVoteDetailsModal] = useState(false);
  const { currentPage, introRef, hasGuided } = useScrollToTopOnFirstPage();
  const [isTxHashOpen, setIsTxHashOpen] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [txParams, setTxParams] = useState<ITxParams>();
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  const router = useRouter();
  function toXref() {
    router.push("/xref");
  }
  return (
    <div className="mt-16 flex text-white xsm:block xsm:pl-0 xsm:pr-0">
      <div className="flex-1 text-center pb-4 mr-4 xsm:pr-0 xsm:pb-0 xsm:text-left xsm:mb-14 xsm:mr-0">
        <div className="text-2xl mb-9 paceGrotesk-Bold xsm:text-xl xsm:ml-8 xsm:mb-5">
          Meme staking
        </div>
        <div className="xsm:bg-memeStakingBgColor xsm:border xsm:border-memeBorderColor xsm:rounded-2xl xsm:pt-12 xsm:pb-8 xsm:px-11">
          <div className="mb-24 xsm:mb-12" style={{ height: "285px" }}>
            <StakingChart chartType="meme" />
          </div>
          <div className="lg:flex lg:justify-center xsm:-mx-5">
            <div
              className="lg:w-48 lg:mr-4 xsm:mb-4 bg-greenGradient rounded-lg h-12 flex items-center justify-center text-black text-base cursor-pointer paceGrotesk-Bold"
              onClick={() => {
                setIsMemeVoteOpen(true);
              }}
            >
              Vote
            </div>
            <div
              className="lg:w-48 xsm:mb-4 lg:mr-4 border border-primaryGreen rounded-lg h-12 flex items-center 
              cursor-pointer justify-center text-primaryGreen text-base paceGrotesk-Bold"
              onClick={() => setUserRanking(true)}
            >
              Rank
            </div>
            {/* <div className="relative">
              <div
                className="opacity-30 lg:w-32 xsm:mb-4 lg:mr-4 border border-greenLight bg-memeDarkColor 
            rounded-lg h-12 flex items-center cursor-not-allowed justify-center text-greenLight text-base paceGrotesk-Bold"
                onMouseEnter={() => setShowRank(true)}
                onMouseLeave={() => setShowRank(false)}
              >
                Rank
              </div>
              {showRank && (
                <div
                  className="absolute -top-4 right-6 flex items-center justify-center 
                bg-cardBg border border-gray-50 text-farmText rounded-md py-1.5 px-2 text-xs z-50 xsm:top-8"
                  onMouseLeave={() => setShowRank(false)}
                >
                  <p>Coming soon</p>
                </div>
              )}
            </div> */}
            {/* <div
              className="lg:w-32  border border-gray-100 bg-dark-10 rounded-lg h-12 flex cursor-pointer 
              items-center justify-center text-white text-base paceGrotesk-Bold xsm:hidden"
              onClick={() => setShowAirdropModal(true)}
            >
              <CoinPc />
              <p className="ml-2">Airdrop</p>
            </div>
            <div
              className="lg:hidden border border-gray-100 bg-dark-10 rounded-lg h-12 flex cursor-pointer 
              items-center justify-center text-white text-base paceGrotesk-Bold xsm:border-none xsm:bg-transparent xsm:h-auto"
              onClick={() => router.push("/memeAirdop")}
            >
              <CoinPc />
              <p className="ml-2">Airdrop</p>
              <div className="ml-1">
                <AirdropMobileArrowIcon />
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div className="flex-1 text-center pb-4 xsm:pl-0 xsm:pb-0 xsm:text-left">
        <div className="font-bold relative xsm:flex xsm:justify-between xsm:items-center xsm:mb-5">
          <p className="text-2xl mb-9 paceGrotesk-Bold xsm:text-xl xsm:ml-8 xsm:mb-0">
            xREF staking
          </p>
          <div
            onClick={toXref}
            className="absolute right-0 top-4 text-gray-50 text-sm flex items-center justify-center hover:text-primaryGreen hover:cursor-pointer xsm:hidden"
          >
            Acquire $xREF
            <AcquireXREFIcon />
          </div>
          <div className="lg:hidden mr-8 flex items-center justify-center">
            <XREFStakingDetails />
            <p
              className="ml-1.5 text-sm"
              onClick={() => {
                setVoteDetailsModal(true);
              }}
            >
              Detail
            </p>
          </div>
        </div>
        <div className="xsm:bg-memeStakingBgColor xsm:border xsm:border-memeBorderColor xsm:rounded-2xl xsm:pt-8 xsm:pb-8 xsm:px-11">
          <div className="lg:hidden mb-3 flex flex-col items-center">
            <div className="text-base text-gray-50">Current Round:</div>
            <div className="text-lg mb-4">2024/10/06-2024/11/05</div>
            {/* <div className="text-base text-gray-50">Next Round:</div>
            <div className="text-lg mb-6">2024/07/06-2024/08/05</div> */}
          </div>
          <div className="mb-6 xsm:mb-12" style={{ height: "285px" }}>
            <StakingChart chartType="xref" />
          </div>
          <div className="flex justify-between mb-6 px-16 xsm:hidden">
            <div className="text-left ">
              <p className="text-sm text-gray-50 mb-2">Current Round:</p>
              <div className="text-sm ">2024/10/06-2024/11/05</div>
            </div>
            {/* <div className="text-left">
              <p className="text-sm text-gray-50 mb-2">Next Round:</p>
              <div className="text-sm ">2024/07/06-2024/08/05</div>
            </div> */}
          </div>
          {!hasGuided &&
            (currentPage === 1 || currentPage === 2) &&
            !is_mobile &&
            isSignedIn && (
              <div className="relative" ref={introRef}>
                <Intro
                  top={currentPage === 1 ? -264 : -240}
                  left={currentPage === 1 ? 230 : 170}
                >
                  <div
                    className="flex justify-center"
                    style={{
                      width: "33.875rem",
                    }}
                  >
                    <div className="w-32 mr-4 border border-gray-100 bg-dark-10 rounded-lg h-12 flex items-center justify-center text-white text-base">
                      Detail
                    </div>
                    <div className="w-32 mr-4 bg-primaryGreen rounded-lg h-12 flex items-center justify-center text-black text-base">
                      Vote
                    </div>
                    <div className="w-32 border border-primaryGreen bg-memeDarkColor rounded-lg h-12 flex items-center justify-center text-primaryGreen text-base">
                      Donate
                    </div>
                  </div>
                </Intro>
              </div>
            )}
          <div className="lg:flex lg:justify-center xsm:-mx-5">
            <div
              className="lg:w-32 lg:mr-4 xsm:hidden border border-gray-100 bg-dark-10 
              rounded-lg h-12 flex items-center cursor-pointer justify-center text-white text-base paceGrotesk-Bold"
              onClick={() => {
                setVoteDetailsModal(true);
              }}
            >
              Detail
            </div>
            <div
              className="lg:w-32 lg:mr-4 xsm:mb-4 bg-greenGradient rounded-lg h-12 flex items-center justify-center text-black text-base cursor-pointer paceGrotesk-Bold"
              onClick={() => {
                setIsVoteOpen(true);
              }}
            >
              Vote
            </div>
            <div
              className="lg:w-32 xsm:w-full xsm:mb-4 border border-primaryGreen rounded-lg h-12 flex items-center 
              justify-center text-primaryGreen text-base cursor-pointer paceGrotesk-Bold"
              onClick={() => {
                setIsDonateOpen(true);
              }}
            >
              Donate
            </div>
            <div className="lg:hidden flex items-center justify-center text-greenLight text-base hover:cursor-pointer">
              <div
                onClick={toXref}
                className="inline-flex items-center cursor-pointer"
              >
                Acquire $xREF <ArrowRightTopIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isVoteOpen ? (
        <VoteModal
          isOpen={isVoteOpen}
          onRequestClose={() => {
            setIsVoteOpen(false);
          }}
          setTxParams={setTxParams}
          setIsTxHashOpen={setIsTxHashOpen}
        />
      ) : null}
      {isMemeVoteOpen ? (
        <MemeVoteModal
          isOpen={isMemeVoteOpen}
          onRequestClose={() => {
            setIsMemeVoteOpen(false);
          }}
          setTxParams={setTxParams}
          setIsTxHashOpen={setIsTxHashOpen}
        />
      ) : null}
      {isDonateOpen ? (
        <DonateModal
          isOpen={isDonateOpen}
          onRequestClose={() => {
            setIsDonateOpen(false);
          }}
        />
      ) : null}
      {isUserRanking ? (
        <UserRankingModal
          isOpen={isUserRanking}
          onRequestClose={() => {
            setUserRanking(false);
          }}
        />
      ) : null}
      {isShowAirdropModal ? (
        <MemeAirdropListForPc
          isOpen={isShowAirdropModal}
          onRequestClose={() => {
            setShowAirdropModal(false);
          }}
        />
      ) : null}
      {isShowVoteDetailsModal ? (
        <VoteDetailsModal
          isOpen={isShowVoteDetailsModal}
          onRequestClose={() => {
            setVoteDetailsModal(false);
          }}
        />
      ) : null}
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
export default React.memo(Staking);
