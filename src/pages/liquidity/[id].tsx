import dynamic from "next/dynamic";
import React from "react";
const ClientCom = dynamic(
  () => import("@/components/pools/detail/liquidity/AddYourLiquidityDCL"),
  {
    ssr: false,
  }
);

function Liq() {
  return <ClientCom />;
}

export default React.memo(Liq);
