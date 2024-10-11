import React, { useState, useContext, useMemo } from "react";
import Big from "big.js";
import { MemeContext } from "./context";
import {
  emptyObject,
  getListedMemeSeeds,
  getSeedApr,
  getTotalStaked,
} from "./tool";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
} from "@/utils/uiNumber";
import { isMobile } from "@/utils/device";
import { TokenMetadata } from "@/services/ft-contract";
import { Seed } from "@/services/farm";

const Overview = () => {
  const { seeds, lpSeeds, xrefSeeds } = useContext(MemeContext)!;
  const [totalStaked, maxAprSeed, totalStaker] = useMemo(() => {
    if (emptyObject(seeds)) return ["-", [], "-"];
    const listedMemeSeeds = getListedMemeSeeds(seeds);
    const t_staked = getTotalStaked(seeds, xrefSeeds);
    const [maxSeed, maxApr] = Object.values(listedMemeSeeds).reduce(
      (acc, seed) => {
        const apr = getSeedApr(seed);
        if (acc[1].gt(apr)) {
          return acc;
        } else {
          return [seed, Big(apr)];
        }
      },
      [seeds[0], Big(0)]
    );
    const totalStakerMeme = Object.values(seeds).reduce((acc, seed) => {
      return acc.plus(seed.farmer_count);
    }, Big(0));
    const totalStakerXref = Object.values(xrefSeeds).reduce((acc, seed) => {
      return acc.plus(seed.farmer_count);
    }, Big(0));
    const totalStaker = totalStakerMeme.plus(totalStakerXref).toFixed();
    return [
      toInternationalCurrencySystem_usd(t_staked),
      [maxSeed, maxApr.toFixed()],
      totalStaker,
    ];
  }, [seeds, xrefSeeds]) as any;
  const topApyFarm = useMemo(() => {
    const list = Object.entries(lpSeeds);
    if (!list.length) return [];
    return list.reduce<[Seed, string | number, string]>(
      (acc, cur) => {
        const [seedId, seed] = cur;
        const apr = getSeedApr(seed);
        if (!acc[0]) return [seed, apr, seedId];
        if (Big(acc[1]).gt(apr)) {
          return acc;
        } else {
          return [seed, apr, seedId];
        }
      },
      [null as any, 0, ""]
    );
  }, [lpSeeds]);
  function goFarmDetail(seed_id: string) {
    const lpSeed = lpSeeds[seed_id];
    if (lpSeed?.farmList?.[0].status == "Ended") {
      window.open(`/v2farms/${lpSeed?.pool?.id}-e`);
    } else {
      window.open(`/v2farms/${lpSeed?.pool?.id}-r`);
    }
  }
  const is_mobile = isMobile();
  return (
    <>
      {is_mobile ? (
        <div className="relative grid grid-cols-2 gap-2.5 mt-6 px-3">
          <TemplateMobile title="Total Staked">
            <span className="text-xl paceGrotesk-Bold text-white">
              {totalStaked}
            </span>
          </TemplateMobile>
          <TemplateMobile title="Total Stakers">
            <span className="text-xl paceGrotesk-Bold text-white">
              {totalStaker}
            </span>
          </TemplateMobile>
          <TemplateMobile title="Top Staking APY">
            {+maxAprSeed[1] > 0 ? (
              <div className="flex items-center gap-2">
                <img
                  src={maxAprSeed[0]?.token_meta_data?.icon}
                  className="rounded-full"
                  style={{ height: "26px", width: "26px" }}
                />
                <span className="text-xl paceGrotesk-Bold text-white">
                  {formatPercentage(maxAprSeed[1])}
                </span>
              </div>
            ) : (
              <span className="text-xl paceGrotesk-Bold text-white">-</span>
            )}
          </TemplateMobile>
          <TemplateMobile
            title="Top Farm APY"
            onClick={() => {
              if (topApyFarm[0]) {
                goFarmDetail(topApyFarm[2]);
              }
            }}
          >
            {topApyFarm[0] ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {(topApyFarm[0] as Seed).pool?.tokens_meta_data?.map(
                    (token: TokenMetadata) => {
                      return (
                        <img
                          key={token.id}
                          src={token.icon}
                          className="rounded-full -ml-1.5"
                          style={{ width: "26px", height: "26px" }}
                        />
                      );
                    }
                  )}
                </div>
                <span className="text-xl paceGrotesk-Bold text-white">
                  {formatPercentage(topApyFarm[1])}
                </span>
              </div>
            ) : (
              <span className="text-xl paceGrotesk-Bold text-white">-</span>
            )}
          </TemplateMobile>
        </div>
      ) : (
        <div className="relative z-50 flex items-center justify-between gap-8">
          <Template title="Total Staked">
            <span className="text-3xl paceGrotesk-Bold text-white">
              {totalStaked}
            </span>
          </Template>
          <Template title="Top Staking APY">
            {+maxAprSeed[1] > 0 ? (
              <div className="flex items-center gap-2">
                <img
                  src={maxAprSeed[0]?.token_meta_data?.icon}
                  className="rounded-full"
                  style={{ height: "26px", width: "26px" }}
                />
                <span className="text-3xl paceGrotesk-Bold text-white">
                  {formatPercentage(maxAprSeed[1])}
                </span>
              </div>
            ) : (
              <span className="text-3xl paceGrotesk-Bold text-white">-</span>
            )}
          </Template>
          <Template
            title="Top Farm APY"
            className="cursor-pointer"
            onClick={() => {
              if (topApyFarm[0]) {
                goFarmDetail(topApyFarm[2]);
              }
            }}
          >
            {topApyFarm[0] ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {(topApyFarm[0] as Seed).pool?.tokens_meta_data?.map(
                    (token: TokenMetadata) => {
                      return (
                        <img
                          key={token.id}
                          src={token.icon}
                          className="rounded-full -ml-1.5"
                          style={{ width: "26px", height: "26px" }}
                        />
                      );
                    }
                  )}
                </div>
                <span className="text-3xl paceGrotesk-Bold text-white">
                  {formatPercentage(topApyFarm[1])}
                </span>
              </div>
            ) : (
              <span className="text-3xl paceGrotesk-Bold text-white">-</span>
            )}
          </Template>
          <Template title="Total Stakers">
            <span className="text-3xl paceGrotesk-Bold text-white">
              {totalStaker}
            </span>
          </Template>
        </div>
      )}
    </>
  );
};

function Template({ title, children, className, ...props }: any) {
  return (
    <div
      {...props}
      className={`flex flex-grow flex-col items-center justify-center border border-gray-100 bg-dark-10 rounded-2xl ${
        className ? className : ""
      }`}
      style={{ height: "110px" }}
    >
      <span className="text-base text-white">{title}</span>
      {children}
    </div>
  );
}
function TemplateMobile({ title, children, ...props }: any) {
  return (
    <div
      {...props}
      className="flex flex-grow flex-col justify-center w-full gap-1.5 rounded-2xl pl-3.5"
      style={{
        height: "80px",
        border: "1px solid rgba(151, 151, 151, 0.2)",
        background: "linear-gradient(180deg, #213441 0%, #15242F 100%)",
      }}
    >
      <span className="text-sm text-white">{title}</span>
      {children}
    </div>
  );
}
export default React.memo(Overview);
