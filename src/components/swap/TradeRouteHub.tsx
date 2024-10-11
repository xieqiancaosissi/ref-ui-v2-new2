import { useRouter } from "next/router";
import React from "react";
import { TokenMetadata } from "@/services/ft-contract";
import { SwapContractType } from "@/interfaces/swap";
import { RefMarketRouteIcon, PoolLinkIcon } from "./icons";
import { isStablePool } from "@/services/swap/swapUtils";
import Token from "./Token";
import { get_pool_name } from "@/services/commonV3";
const TradeRouteHub = ({
  token,
  contract,
  poolId,
}: {
  token: TokenMetadata;
  contract?: SwapContractType;
  poolId?: string | number;
}) => {
  const router = useRouter();
  function jump() {
    if (!poolId) return;
    if (contract == "Ref_Classic") {
      if (isStablePool(poolId)) {
        router.push(`/sauce/${poolId}`);
      } else {
        router.push(`/pool/${poolId}`);
      }
    } else if (contract == "Ref_DCL") {
      const params_str = get_pool_name(poolId.toString());
      router.push(`/poolV2/${params_str}`);
    }
  }
  return (
    <div
      className="flex flex-col justify-center relative z-10 text-gray-180 text-xs rounded-md px-2.5 py-1 border border-gray-170 bg-dark-60 hover:bg-gray-20"
      style={{
        height: "60px",
      }}
    >
      <div className="flexBetween">
        <div className="flex items-center pb-1">
          <Token icon={token.icon} size="16" />
          <span className="ml-1 text-white text-sm min-w-10 mr-4">
            {token.symbol}
          </span>
        </div>
        <span className={`cursor-pointer block mr-1.5`} onClick={jump}>
          {!(typeof poolId === "undefined" || poolId === null) && (
            <PoolLinkIcon className="hover:text-white"></PoolLinkIcon>
          )}
        </span>
      </div>

      <div className="w-full flexBetween pt-1 relative top-0.5 rounded-md">
        <div className="flex items-center">
          <RefMarketRouteIcon size="16" />
          <span className="ml-1 mr-1">{contract}</span>
        </div>
        <span>100%</span>
      </div>
    </div>
  );
};
export default React.memo(TradeRouteHub);
