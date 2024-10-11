import React, { useState, useEffect } from "react";
import HoverTip from "@/components/common/Tips";
import {
  useCanFarmV1,
  useCanFarmV2,
  useYourliquidity,
} from "@/hooks/useStableShares";
import { ShareInFarm, ShareInFarmV2, ShareInBurrow } from "./ShareInFarm";
import ShareNumber from "./ShareNumber";
import {
  AddLiquidityIconStable,
  RemoveLiquidityIconStable,
} from "../liquidity/icon";
import { useRouter } from "next/router";
import { openUrlLocal, openUrl } from "@/services/commonV3";
import getConfigV2 from "@/utils/configV2";
import { useAccountStore } from "@/stores/account";
import { getAccountId } from "@/utils/wallet";

function ShareContainer(props: any) {
  const { poolDetail, setShowAdd, setShowRemove } = props;

  const router = useRouter();
  const accountId = getAccountId();
  const accountStore = useAccountStore();
  const isSignedIn = !!accountId || accountStore.isSignedIn;
  const { farmCount: countV1, endedFarmCount: endedFarmCountV1 } = useCanFarmV1(
    poolDetail.id,
    true
  );

  const { farmCount: countV2, endedFarmCount: endedFarmCountV2 } = useCanFarmV2(
    poolDetail.id,
    true
  );
  const {
    farmStakeV1,
    farmStakeV2,
    userTotalShare,
    shares,
    shadowBurrowShare,
    pool,
  } = useYourliquidity(poolDetail.id);

  const toSauce = (type: string) => {
    router.push(`/sauce/${type}/${router.query.id}`);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); //
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="lg:my-5 xsm:mt-5 xsm:mb-2 lg:w-270 xsm:w-full flex justify-between items-center">
      {/* left */}
      <div className="text-gray-60 text-sm font-normal flex flex-wrap">
        {/* get share */}
        <div className="frcc xsm:hidden">
          <HoverTip
            msg={"Shares available / Total shares"}
            extraStyles={"w-46"}
          />
          <span>Shares</span>
          <div className="ml-2">
            {pool && (
              <ShareNumber
                id={poolDetail.id}
                userTotalShare={userTotalShare}
                shares={shares}
                pool={pool}
              />
            )}
          </div>
        </div>

        <div className="frcc lg:hidden">
          <HoverTip
            msg={"Shares available / Total shares"}
            extraStyles={"w-46"}
          />
          <span>Shares</span>
          <div className="ml-2">
            {pool && (
              <ShareNumber
                id={poolDetail.id}
                userTotalShare={userTotalShare}
                shares={shares}
                pool={pool}
              />
            )}
          </div>
        </div>

        <div className="lg:frcc lg:ml-10 xsm:flex xsm:mt-auto">
          {(countV1 > endedFarmCountV1 || Number(farmStakeV1) > 0) &&
          isSignedIn ? (
            <ShareInFarmV2
              farmStake={farmStakeV1}
              userTotalShare={userTotalShare}
              version={"Legacy"}
              hideIcon={isMobile}
              useMx={true}
            />
          ) : null}
          {(countV2 > endedFarmCountV2 || Number(farmStakeV2) > 0) &&
          isSignedIn ? (
            <ShareInFarmV2
              farmStake={farmStakeV2}
              userTotalShare={userTotalShare}
              version={"Classic"}
              poolId={poolDetail.id}
              onlyEndedFarm={countV2 === endedFarmCountV2}
              hideIcon={isMobile}
              useMx={true}
            />
          ) : null}
          {shadowBurrowShare?.stakeAmount &&
            isSignedIn &&
            getConfigV2().SUPPORT_SHADOW_POOL_IDS.includes(
              poolDetail.id?.toString()
            ) && (
              <div
                className={`cursor-pointer xsm:mt-auto ${
                  !(countV2 > endedFarmCountV2) ? "hidden" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const shadow_id = `shadow_ref_v1-${poolDetail?.id}`;
                  const url = `https://app.burrow.finance/tokenDetail/${shadow_id}`;
                  window.open(url);
                }}
              >
                <ShareInBurrow
                  farmStake={shadowBurrowShare?.stakeAmount}
                  userTotalShare={userTotalShare}
                  inStr={"Burrow"}
                  forStable
                  from={"stable"}
                  hideIcon={isMobile}
                />
              </div>
            )}
        </div>
      </div>
      {/* right liquidity button */}
      <div className="flex items-center justify-end xsm:hidden">
        <div
          className="bg-primaryGreen text-black rounded p-2 h-7 opacity-90 frcc border border-transparent text-sm cursor-pointer hover:opacity-100"
          onClick={() => setShowAdd(true)}
        >
          Add Liquidity
          <AddLiquidityIconStable className="mx-1" />
        </div>
        <div
          className="bg-transparent rounded p-2 h-7 frcc border opacity-90 border-gray-40 text-sm ml-2  cursor-pointer hover:opacity-100"
          style={{ color: "#BCC9D2" }}
          onClick={() => setShowRemove(true)}
        >
          Remove Liquidity
          <RemoveLiquidityIconStable className="mx-1" />
        </div>
      </div>
    </div>
  );
}
export default React.memo(ShareContainer);
