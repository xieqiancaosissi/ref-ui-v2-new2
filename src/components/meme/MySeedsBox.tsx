import React, { useState, useContext, useMemo } from "react";
import { ArrowRightIcon, MemeFinalistToken, NoDataIcon } from "./icons";
import { MemeContext } from "./context";
import { claim_all } from "../../services/meme";
import { getMemeDataConfig, getMemeContractConfig } from "./memeConfig";
import {
  formatPercentage,
  toInternationalCurrencySystem_number,
  toInternationalCurrencySystem_usd,
} from "../../utils/uiNumber";
import UnStakeModal from "./UnStakeModal";
import { isMobile } from "../../utils/device";
import {
  emptyObject,
  getSeedApr,
  getAccountFarmData,
  getAccountButtonStatus,
  get_meme_token_xref_map_reverse,
} from "./tool";
import RewardList from "./RewardList";
import { ButtonTextWrapper } from "../common/Button";
import { Seed } from "@/services/farm";
import CustomTooltip from "../customTooltip/customTooltip";
import { useRouter } from "next/router";
import { IExecutionResult } from "@/interfaces/wallet";
import successToast from "../common/toast/successToast";
import failToast from "../common/toast/failToast";

const is_mobile = isMobile();
const MySeedsBox = ({
  hidden,
  displaySeedsPercent,
  setTxParams,
  setIsTxHashOpen,
}: {
  hidden: boolean;
  displaySeedsPercent: Record<string, string>;
  setTxParams: any;
  setIsTxHashOpen: any;
}) => {
  const {
    seeds,
    lpSeeds,
    xrefSeeds,
    memeFarmContractUserData,
    xrefFarmContractUserData,
    xrefTokenId,
    tokenPriceList,
    allTokenMetadatas,
    init_user,
  } = useContext(MemeContext)!;
  const router = useRouter();
  const [isUnStakeOpen, setIsUnStakeOpen] = useState(false);
  const [modal_action_seed_id, set_modal_action_seed_id] = useState("");
  const [claim_id, set_claim_id] = useState("");
  const memeDataConfig = getMemeDataConfig();
  const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
  const mySeeds: Record<string, Seed> = useMemo(() => {
    if (
      memeFarmContractUserData &&
      xrefFarmContractUserData &&
      !emptyObject(seeds)
    ) {
      const joinMemeSeedIds = new Set();
      if (memeFarmContractUserData.join_seeds) {
        Object.keys(memeFarmContractUserData.join_seeds).forEach((memeSeedId) =>
          joinMemeSeedIds.add(memeSeedId)
        );
      }
      const MEME_TOKEN_XREF_MAP_REVERSE =
        get_meme_token_xref_map_reverse() as Record<string, string>;
      Object.entries(xrefFarmContractUserData)
        .reduce((acc: string[], [xrefContractId, accountData]) => {
          if (!emptyObject(accountData.join_seeds)) {
            acc.push(MEME_TOKEN_XREF_MAP_REVERSE[xrefContractId]);
          }
          return acc;
        }, [])
        .forEach((memeSeedId) => joinMemeSeedIds.add(memeSeedId));
      return Object.entries(seeds).reduce((acc, [memeTokenId, seed]) => {
        if (joinMemeSeedIds.has(memeTokenId))
          return { ...acc, ...{ [memeTokenId]: seed } };
        return acc;
      }, {});
    }
    return {};
  }, [memeFarmContractUserData, xrefFarmContractUserData, seeds, xrefSeeds]);
  function goFarmDetail(seed_id: string) {
    const lpSeed = lpSeeds[seed_id];
    if (lpSeed?.farmList?.[0].status == "Ended") {
      router.push(`/v2farms/${lpSeed?.pool?.id}-e`);
    } else {
      router.push(`/v2farms/${lpSeed?.pool?.id}-r`);
    }
  }
  function seedClaimAll({
    claim_id,
    seed,
    xrefSeed,
    xrefContractId,
  }: {
    claim_id: string;
    seed?: Seed;
    xrefSeed?: Seed;
    xrefContractId?: string;
  }) {
    set_claim_id(claim_id);
    claim_all({
      seed,
      xrefSeed,
      xrefContractId,
    }).then((res) => {
      handleDataAfterTranstion(res);
    });
  }
  async function handleDataAfterTranstion(res: IExecutionResult | undefined) {
    if (!res) return;
    if (res.status == "success") {
      successToast();
      set_claim_id("");
      init_user();
    } else if (res.status == "error") {
      failToast(res.errorResult?.message);
      set_claim_id("");
    }
  }
  function comeSoonTip() {
    const result = `<div class="px-2 text-xs text-farmText">
    Coming soon
    </div>`;
    return result;
  }
  function getFarmAPYTip(seed_id: string) {
    const b = getSeedApr(lpSeeds[seed_id]);
    const result = `<div class="px-2 text-xs text-farmText">
          <div class="flex items-center justify-between text-xs text-farmText gap-3.5">
              <span>Farm APR</span>
              <span class="text-white text-sm">${formatPercentage(b)}</span>
          </div>
    </div>`;
    return result;
  }
  return (
    <div className={`${hidden ? "hidden" : ""}`}>
      <div
        className={`grid gap-4 xsm:grid-cols-1 xsm:grid-rows-1 lg:grid-cols-2 xsm:mx-3 `}
      >
        {!emptyObject(mySeeds) &&
          Object.entries(mySeeds).map(([seed_id, seed]) => {
            const hasLpSeed =
              lpSeeds?.[seed_id]?.farmList?.[0]?.status &&
              lpSeeds?.[seed_id]?.farmList?.[0]?.status !== "Ended";
            const {
              memeUnStakeButtonDisabled,
              memeClaimButtonDisabled,
              xrefUnStakeButtonDisabled,
              xrefClaimButtonDisabled,
            } = getAccountButtonStatus({
              memeFarmContractUserData,
              xrefFarmContractUserData,
              MEME_TOKEN_XREF_MAP,
              seed_id,
              xrefTokenId,
            });
            const {
              memeAmount,
              memeUsd,
              xrefAmount,
              xrefUsd,
              memeUnclaimedUsd,
              xrefUnclaimedUsd,
              memeUnclaimed,
              xrefUnclaimed,
            } =
              getAccountFarmData({
                memeFarmContractUserData,
                xrefFarmContractUserData,
                seed_id,
                xrefTokenId,
                tokenPriceList,
                seeds,
                xrefSeeds,
                allTokenMetadatas,
              }) || {};
            const unStakeButtonDisabled =
              memeUnStakeButtonDisabled && xrefUnStakeButtonDisabled;
            const claimButtonDisabled =
              memeClaimButtonDisabled && xrefClaimButtonDisabled;
            const addBorder = memeDataConfig.meme_cap_tokens?.includes(seed_id);
            return (
              <div
                key={seed_id}
                className="flex flex-col justify-between border border-dark-100 bg-dark-10 rounded-2xl px-4 py-6"
              >
                <div className="flex items-stretch gap-4">
                  <div className="flex justify-center flex-shrink-0 relative">
                    {addBorder ? (
                      <>
                        <div className="absolute -top-2">
                          <MemeFinalistToken className="w-16 h-5 xsm:scale-90" />
                        </div>
                        <img
                          src={seed?.token_meta_data?.icon}
                          style={{
                            width: is_mobile ? "62px" : "86px",
                            height: is_mobile ? "62px" : "86px",
                            border: "2px solid #C6FC2D",
                          }}
                          className="rounded-full"
                        />
                      </>
                    ) : (
                      <img
                        src={seed?.token_meta_data?.icon}
                        style={{
                          width: is_mobile ? "62px" : "86px",
                          height: is_mobile ? "62px" : "86px",
                        }}
                        className="rounded-full"
                      />
                    )}
                    {Object.keys(displaySeedsPercent).includes(seed_id) ? (
                      <div
                        className="flex items-center justify-center absolute top-16 xsm:top-12 text-black
                     bg-greenGradient text-base px-3.5 xsm:px-1.5 xsm:py-0 xsm:text-sm py-1 rounded-lg xs:rounded-md paceGrotesk-Bold border border-memeBorderBlackColor"
                      >
                        {displaySeedsPercent[seed_id]}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col justify-between gap-1.5 xsm:gap-0 flex-grow">
                    <div className="flex items-center justify-between gap-1 xsm:flex-col xsm:items-start xsm:flex-grow">
                      <span className="text-xl paceGrotesk-Bold text-white">
                        {seed.token_meta_data?.symbol}
                      </span>
                      {memeDataConfig.meme_winner_tokens.includes(seed_id) ? (
                        <div
                          data-class="reactTip"
                          data-tooltip-id={`lp_farm_${seed_id}`}
                          data-place="top"
                          data-tooltip-html={
                            hasLpSeed ? getFarmAPYTip(seed_id) : comeSoonTip()
                          }
                        >
                          <div
                            onClick={() => {
                              if (hasLpSeed) {
                                goFarmDetail(seed_id);
                              }
                            }}
                            className={`flex items-center border border-dark-100 gap-2 rounded-lg h-8 px-2 ${
                              hasLpSeed
                                ? "cursor-pointer"
                                : "opacity-30 cursor-not-allowed"
                            }`}
                          >
                            <span className="text-xs text-white">
                              {seed.token_meta_data?.symbol}/NEAR
                            </span>
                            <ArrowRightIcon />
                          </div>
                          <CustomTooltip id={`lp_farm_${seed_id}`} />
                        </div>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-60 xsm:hidden">
                      {memeDataConfig.description[seed_id]}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-60 lg:hidden mt-2">
                  {memeDataConfig.description[seed_id]}
                </p>
                <div className="mt-5">
                  {/* title */}
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-white">Your Feed</span>
                    <span className="text-sm text-white ml-5">Your Reward</span>
                  </div>
                  {/* line1 */}
                  <div className="grid grid-cols-2 mt-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={seed?.token_meta_data?.icon}
                        className="w-8 h-8 rounded-full relative top-1"
                      />
                      <div className="flex flex-col">
                        <span className="text-white text-xl paceGrotesk-Bold">
                          {toInternationalCurrencySystem_number(memeAmount)}
                        </span>
                        <span className="text-white text-sm">
                          {toInternationalCurrencySystem_usd(memeUsd)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col ml-5">
                      <span className="text-white text-xl paceGrotesk-Bold">
                        {toInternationalCurrencySystem_usd(memeUnclaimedUsd)}
                      </span>
                      <RewardList rewards={memeUnclaimed} />
                    </div>
                  </div>
                  {/* line2 */}
                  <div className="grid grid-cols-2 mt-6">
                    <div className="flex items-start gap-3">
                      <img
                        src={allTokenMetadatas?.[xrefTokenId]?.icon}
                        className="w-8 h-9 relative top-1"
                      />
                      <div className="flex flex-col">
                        <span className="text-white text-xl paceGrotesk-Bold">
                          {toInternationalCurrencySystem_number(xrefAmount)}
                        </span>
                        <span className="text-white text-sm">
                          {toInternationalCurrencySystem_usd(xrefUsd)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col ml-5">
                      <span className="text-white text-xl paceGrotesk-Bold">
                        {toInternationalCurrencySystem_usd(xrefUnclaimedUsd)}
                      </span>
                      <RewardList rewards={xrefUnclaimed} />
                    </div>
                  </div>
                  {/* line3 operation */}
                  <div
                    className={`flex items-center justify-between mt-6 gap-3 xsm:flex-col-reverse`}
                  >
                    <div
                      //   disabled={unStakeButtonDisabled}
                      onClick={() => {
                        if (!unStakeButtonDisabled) {
                          set_modal_action_seed_id(seed.seed_id);
                          setIsUnStakeOpen(true);
                        }
                      }}
                      className={`flex flex-grow items-center justify-center border border-primaryGreen
                         rounded-xl h-12 text-primaryGreen text-base paceGrotesk-Bold focus:outline-none w-1/2 xsm:w-full ${
                           unStakeButtonDisabled
                             ? "opacity-30 cursor-not-allowed"
                             : "cursor-pointer"
                         }`}
                    >
                      <ButtonTextWrapper
                        loading={false}
                        Text={() => <>Unstake</>}
                      />
                    </div>
                    <div
                      //   disabled={claimButtonDisabled || claim_id == seed_id}
                      onClick={() => {
                        if (!claimButtonDisabled) {
                          seedClaimAll({
                            claim_id: seed.seed_id,
                            seed: memeClaimButtonDisabled ? undefined : seed,
                            xrefSeed: xrefClaimButtonDisabled
                              ? undefined
                              : xrefSeeds[MEME_TOKEN_XREF_MAP[seed_id]],
                            xrefContractId: xrefClaimButtonDisabled
                              ? undefined
                              : MEME_TOKEN_XREF_MAP[seed_id],
                          });
                        }
                      }}
                      className={`flex flex-grow items-center justify-center text-boxBorder rounded-xl h-12 text-base paceGrotesk-Bold focus:outline-none w-1/2 xsm:w-full ${
                        claimButtonDisabled
                          ? "bg-gray-40 text-dark-60 cursor-not-allowed"
                          : "bg-primaryGreen cursor-pointer text-black"
                      }`}
                    >
                      <ButtonTextWrapper
                        loading={claim_id == seed_id}
                        Text={() => <>Claim</>}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        {isUnStakeOpen ? (
          <UnStakeModal
            isOpen={isUnStakeOpen}
            onRequestClose={() => {
              setIsUnStakeOpen(false);
            }}
            seed_id={modal_action_seed_id}
            setTxParams={setTxParams}
            setIsTxHashOpen={setIsTxHashOpen}
          />
        ) : null}
      </div>
      {emptyObject(mySeeds) ? (
        <div className="flex flex-col w-full justify-center items-center mt-10 mb-40 xs:mt-8 md:mt-8 text-white">
          <NoDataIcon />
          You have not yet fed any MeMeTokens.
        </div>
      ) : null}
    </div>
  );
};
export default React.memo(MySeedsBox);
