import React, { useState, useContext, useMemo, useRef, useEffect } from "react";
import Modal from "react-modal";
import Big from "big.js";
import { isEmpty } from "lodash";
import { isMobile } from "../../utils/device";
import {
  FeedForMemeFinalist,
  ModalCloseIcon,
  QuestionMarkFeedForMeme,
  SelectsDown,
  SelectsSpecialDown,
  TipIcon,
} from "./icons";
import { TokenMetadata } from "../../services/ft-contract";
import { MemeContext } from "./context";
import { getMemeContractConfig } from "./memeConfig";
import { InputAmount } from "./InputBox";
import { toReadableNumber, toNonDivisibleNumber } from "../../utils/numbers";
import { getMemeUiConfig, getMemeDataConfig } from "./memeConfig";
import { stake } from "../../services/meme";
import MemeVoteConfirmModal from "./MemeVoteConfirmModal";
import { formatSeconds, sortByXrefStaked } from "./tool";
import { useAccountStore } from "@/stores/account";
import { ButtonTextWrapper } from "../common/Button";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import { IExecutionResult } from "@/interfaces/wallet";
import successToast from "../common/toast/successToast";
import failToast from "../common/toast/failToast";
import { checkTransaction } from "@/utils/contract";
import { parsedArgs } from "./SeedsBox";

const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
const { meme_winner_tokens, meme_nonListed_tokens, coming_offline_soon_token } =
  getMemeDataConfig();
const progressConfig = getMemeUiConfig();
function MemeVoteModal(props: any) {
  const { isOpen, onRequestClose, setTxParams, setIsTxHashOpen } = props;
  const [selectedTab, setSelectedTab] = useState("");
  const [selectedOtherTab, setSelectedOtherTab] = useState("");
  const [amount, setAmount] = useState("");
  const [memeVoteLoading, setMemeVoteLoading] = useState(false);
  const appStore = useAppStore();
  const {
    allTokenMetadatas,
    tokenPriceList,
    user_balances,
    xrefSeeds,
    xrefContractConfig,
    seeds,
    memeContractConfig,
    init_user,
  } = useContext(MemeContext)!;
  const { delay_withdraw_sec } = memeContractConfig;
  useEffect(() => {
    if (!isEmpty(xrefSeeds)) {
      setSelectedTab(
        Object.keys(MEME_TOKEN_XREF_MAP).sort(sortByXrefStaked(xrefSeeds))[0]
      );
    }
  }, [xrefSeeds]);
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  const [selectedTabBalance, seed, FeedIcon] = useMemo(() => {
    if (selectedTab && allTokenMetadatas?.[selectedTab]) {
      const balance = toReadableNumber(
        allTokenMetadatas?.[selectedTab].decimals,
        user_balances[selectedTab] || "0"
      );
      const FeedIcon = progressConfig?.progress?.[selectedTab]?.feedIcon;
      const seed = seeds[selectedTab];
      return [balance, seed, FeedIcon];
    }
    return ["0", null, ""];
  }, [selectedTab, user_balances, Object.keys(allTokenMetadatas || {}).length]);
  const cardWidth = isMobile() ? "100vw" : "28vw";
  const cardHeight = isMobile() ? "90vh" : "80vh";
  const is_mobile = isMobile();
  function stakeToken() {
    if (seed) {
      setMemeVoteLoading(true);
      stake({
        seed,
        amount: Big(toNonDivisibleNumber(seed.seed_decimal, amount)).toFixed(0),
      }).then((res) => {
        handleDataAfterTranstion(res);
      });
    }
  }
  async function handleDataAfterTranstion(res: IExecutionResult | undefined) {
    if (!res) return;
    if (res.status == "success") {
      const txHash = res.txHashes?.split(",");
      // successToast();
      setAmount("0");
      onRequestClose();
      init_user();
      checkTransaction(txHash[0]).then((res: any) => {
        const { transaction, receipts } = res;
        const args = parsedArgs(
          res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall?.args
        );
        const receiver_id = transaction?.receiver_id;
        const parsedInputArgs = JSON.parse(args || "");
        setIsTxHashOpen(true);
        setTxParams({
          action: "stake",
          params: parsedInputArgs,
          txHash: txHash[0],
          receiver_id,
        });
      });
    } else if (res.status == "error") {
      failToast(res.errorResult?.message);
      onRequestClose();
    }
  }
  const disabled =
    Big(amount || 0).lte(0) ||
    Big(amount || 0).gt(selectedTabBalance) ||
    !selectedTab ||
    !seed;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPcVisible, setDropdownPcVisible] = useState(false);
  const selectedDefaultTab = allTokenMetadatas[selectedTab];
  const [confirmIsOpen, setConfirmIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownContentRef = useRef<HTMLDivElement | null>(null);
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      dropdownContentRef.current &&
      !dropdownContentRef.current.contains(event.target as Node)
    ) {
      setDropdownVisible(false);
      setDropdownPcVisible(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (meme_winner_tokens.includes(selectedTab)) {
      setSelectedOtherTab("Other");
    } else {
      setSelectedOtherTab("");
    }
  }, [selectedTab]);
  function openMemeVoteConfirmModal() {
    setConfirmIsOpen(true);
  }
  function closeMemeVoteConfirmModal() {
    setConfirmIsOpen(false);
  }
  function showWalletSelector() {
    showWalletSelectorModal(appStore.setShowRiskModal);
  }
  if (!selectedTab) return null;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          // backdropFilter: 'blur(15px)',
          // WebkitBackdropFilter: 'blur(15px)',
          overflow: "auto",
        },
        content: {
          outline: "none",
          ...(is_mobile
            ? {
                transform: "translateX(-50%)",
                top: "auto",
                bottom: "32px",
              }
            : {
                transform: "translate(-50%, -50%)",
              }),
        },
      }}
    >
      <div className="flex flex-col bg-dark-10 rounded-2xl">
        <div
          className="px-5 xs:px-3 md:px-3 py-6 lg:rounded-2xl xsm:rounded-t-2xl overflow-auto xsm:py-4"
          style={{
            width: cardWidth,
            maxHeight: cardHeight,
            border: "1px solid rgba(151, 151, 151, 0.2)",
          }}
        >
          <div className="title flex items-center justify-between">
            <div className="text-white text-2xl paceGrotesk-Bold xsm:text-xl">
              Feed For Meme
            </div>
            <ModalCloseIcon
              className="cursor-pointer"
              onClick={onRequestClose}
            />
          </div>
          <div
            className="mt-6 mb-5 transparentScrollbar xsm:mt-4"
            style={{ maxHeight: is_mobile ? "70vh" : "auto", overflow: "auto" }}
          >
            <div className="text-gray-60 text-sm xsm:hidden">
              Select Meme you support
            </div>
            <div className="mt-5 flex flex-wrap xsm:hidden">
              {meme_winner_tokens
                .filter(
                  (memeTokenId) =>
                    !coming_offline_soon_token.includes(memeTokenId)
                )
                .sort(sortByXrefStaked(xrefSeeds))
                .map((memeTokenId: any) => {
                  return (
                    <Tab
                      key={memeTokenId}
                      isSelected={selectedTab === memeTokenId}
                      metadata={allTokenMetadatas?.[memeTokenId]}
                      onSelect={() => setSelectedTab(memeTokenId)}
                    />
                  );
                })}
            </div>
            <div className="flex flex-wrap mb-2 xsm:hidden">
              <div
                className="text-white relative w-full"
                ref={dropdownContentRef}
              >
                <button
                  className="w-full rounded-3xl border border-dark-40 pt-2 pl-2 pr-3 pb-2 flex 
                  items-center justify-between cursor-pointer bg-dark-70 text-white"
                  onClick={() => setDropdownPcVisible(!dropdownPcVisible)}
                >
                  <div className="flex">
                    {selectedOtherTab === "Other" ? (
                      <QuestionMarkFeedForMeme />
                    ) : (
                      <img
                        className="w-6 h-6 rounded-full"
                        src={selectedDefaultTab?.icon}
                      />
                    )}
                    <div className="ml-1.5 mr-2 text-base paceGrotesk-Bold">
                      {selectedOtherTab === "Other" ? (
                        <span className="text-gray-60">Other Token</span>
                      ) : (
                        selectedDefaultTab?.symbol
                      )}
                    </div>
                  </div>
                  <SelectsSpecialDown
                    className={dropdownPcVisible ? "transform rotate-180" : ""}
                  />
                </button>
                {dropdownPcVisible && (
                  <div
                    className="absolute top-10 right-0  h-56 w-60 overflow-auto rounded-2xl border border-dark-40 pt-4 pl-3.5 pr-3.5 
                   cursor-pointer bg-dark-70 text-white z-50"
                  >
                    <p className="text-base mb-3">Other Token</p>
                    {meme_nonListed_tokens
                      .sort(sortByXrefStaked(xrefSeeds))
                      .map((memeTokenId: any, index: any, array: any) => (
                        <div
                          key={memeTokenId}
                          onClick={() => {
                            setSelectedTab(memeTokenId);
                            setDropdownPcVisible(false);
                          }}
                          className={`flex items-center rounded-3xl border border-transparent hover:border-dark-40 p-1.5 ${
                            index !== array.length - 1 ? "mb-1.5" : "mb-4"
                          } ${
                            selectedTab === memeTokenId
                              ? "text-black bg-primaryGreen"
                              : ""
                          }`}
                        >
                          <img
                            className="w-5 h-5 rounded-full"
                            src={allTokenMetadatas[memeTokenId]?.icon}
                          />
                          <div className="ml-2 text-sm">
                            {allTokenMetadatas[memeTokenId]?.symbol}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center text-sm mt-2 lg:hidden md:hidden">
              <div className="text-gray-60">Meme</div>
              <div className="text-white relative" ref={dropdownRef}>
                <button
                  className="rounded-3xl border border-memeBorderColor pt-2 pl-2 pr-3 pb-2 flex items-center justify-between cursor-pointer outline-none bg-dark-70 text-white"
                  onClick={() => setDropdownVisible(!dropdownVisible)}
                >
                  <img
                    className="w-6 h-6 rounded-full"
                    src={selectedDefaultTab?.icon}
                  />
                  <div className="ml-1.5 mr-2 text-base paceGrotesk-Bold">
                    {selectedDefaultTab?.symbol}
                  </div>
                  <SelectsDown />
                </button>
                {dropdownVisible && (
                  <div
                    className="absolute h-80 overflow-auto z-50 top-12 right-0 rounded-lg border border-memeModelgreyColor pt-4 pl-3.5 pr-9 
                   cursor-pointer outline-none bg-dark-70 text-white w-max"
                  >
                    {Object.keys(MEME_TOKEN_XREF_MAP)
                      .filter(
                        (memeTokenId) =>
                          !coming_offline_soon_token.includes(memeTokenId)
                      )
                      .sort(sortByXrefStaked(xrefSeeds))
                      .map((memeTokenId, index, array) => (
                        <div
                          key={memeTokenId}
                          onClick={() => {
                            setSelectedTab(memeTokenId);
                            setDropdownVisible(false);
                          }}
                          className={`flex items-center ${
                            index !== array.length - 1 ? "mb-7" : "mb-4"
                          }`}
                        >
                          {meme_winner_tokens.includes(memeTokenId) ? (
                            <div className="relative">
                              <FeedForMemeFinalist className="absolute -top-1 left-1" />
                              <img
                                className="w-6 h-6 rounded-full"
                                src={allTokenMetadatas[memeTokenId]?.icon}
                                style={{ border: "0.5px solid #C6FC2D" }}
                              />
                            </div>
                          ) : (
                            <img
                              className="w-6 h-6 rounded-full"
                              src={allTokenMetadatas[memeTokenId]?.icon}
                            />
                          )}
                          <div className="ml-2 text-base paceGrotesk-Bold">
                            {allTokenMetadatas[memeTokenId]?.symbol}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-8">
              {allTokenMetadatas?.[selectedTab] && (
                <InputAmount
                  token={allTokenMetadatas[selectedTab]}
                  tokenPriceList={tokenPriceList}
                  balance={selectedTabBalance}
                  changeAmount={setAmount}
                  amount={amount}
                />
              )}
            </div>
            {/* <OprationButton
            onClick={doVote}
            className={`bg-primaryGreen px-3 py-1 paceGrotesk-Bold cursor-pointer rounded-md mt-2 w-20 outline-none ${
              memeVoteLoading ? 'opacity-40' : ''
            }`}
          >
            <ButtonTextWrapper
              loading={memeVoteLoading}
              Text={() => (
                <div className="flex items-center gap-2 text-base text-boxBorder">
                  Got it!
                </div>
              )}
            />
          </OprationButton> */}
            {isSignedIn ? (
              <div
                // onClick={stakeToken}
                onClick={() => {
                  if (!disabled) {
                    openMemeVoteConfirmModal();
                  }
                }}
                className={`flex flex-grow items-center text-black justify-center bg-greenGradient mt-6 rounded-xl h-12 text-base paceGrotesk-Bold focus:outline-none ${
                  disabled || memeVoteLoading
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <ButtonTextWrapper
                  loading={memeVoteLoading}
                  Text={() => (
                    <div className="flex items-center gap-2">
                      Feed{" "}
                      {FeedIcon ? (
                        <FeedIcon className="w-5 h-5 relative -top-0.5" />
                      ) : null}
                    </div>
                  )}
                />
              </div>
            ) : (
              <div
                onClick={showWalletSelector}
                className="frcc h-12 bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer"
              >
                Connect Wallet
              </div>
            )}
            <div
              className={`flex items-start gap-2 mt-4 ${
                xrefContractConfig?.[MEME_TOKEN_XREF_MAP[selectedTab]]
                  ?.delay_withdraw_sec
                  ? ""
                  : "hidden"
              }`}
            >
              <TipIcon className="flex-shrink-0 transform translate-y-1" />
              <p className="text-sm text-primaryGreen">
                The unstaked assets will available to be withdrawn in{" "}
                {formatSeconds(delay_withdraw_sec)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {confirmIsOpen && (
        <MemeVoteConfirmModal
          isOpen={confirmIsOpen}
          onRequestClose={closeMemeVoteConfirmModal}
          onMemeVote={stakeToken}
          delay_withdraw_sec={delay_withdraw_sec}
        />
      )}
    </Modal>
  );
}

const Tab = ({
  isSelected,
  onSelect,
  metadata,
}: {
  isSelected: boolean;
  onSelect: any;
  metadata: TokenMetadata;
}) => {
  const baseStyle =
    "rounded-3xl border border-dark-40 pt-2 pl-2 pr-3 pb-2 flex items-center justify-between cursor-pointer outline-none";
  const selectedStyle = "bg-primaryGreen text-black";
  const unselectedStyle = "bg-dark-70 text-white";

  return (
    <button
      className={`${baseStyle} ${
        isSelected ? selectedStyle : unselectedStyle
      } mr-4 mb-4`}
      onClick={onSelect}
    >
      <img className="w-6 h-6 rounded-full" src={metadata?.icon} />
      <div className="ml-1.5 text-base paceGrotesk-Bold">
        {metadata?.symbol}
      </div>
    </button>
  );
};

export default React.memo(MemeVoteModal);
