import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import _ from "lodash";
import Input from "@/components/limit/Input";
import { useAllDclPools } from "@/hooks/usePools";
import RateContainer from "@/components/limit/RateContainer";
import { useSwapStore } from "@/stores/swap";
import {
  usePersistLimitStore,
  IPersistLimitStore,
  useLimitStore,
} from "@/stores/limitOrder";
import { getAllTokenPrices } from "@/services/farm";
import { SWitchButton } from "../components/swap/icons";
import { RefreshIcon } from "../components/limit/icons";
import Init from "../components/limit/Init";
import ChartTopBar from "../components/limit/ChartTopBar";
import { getBestTvlPoolList } from "@/services/limit/limitUtils";
const CreateOrderButton = dynamic(
  () => import("@/components/limit/CreateOrderButton"),
  { ssr: false }
);
const FeeTiers = dynamic(() => import("@/components/limit/FeeTiers"), {
  ssr: false,
});
const LimitOrderPopup = dynamic(
  () => import("@/components/common/LimitOrderPopup"),
  {
    ssr: false,
  }
);
const LimitOrderChartAndTable = dynamic(
  () => import("../components/limit/LimitOrderChartAndTable"),
  {
    ssr: false,
  }
);
const MyOrders = dynamic(() => import("../components/limit/myOrders"), {
  ssr: false,
});
export default function LimitOrderPage() {
  const allPools = useAllDclPools();
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const limitStore = useLimitStore();
  const dclPool = persistLimitStore.getDclPool();
  const allDclPools = persistLimitStore.getAllDclPools();
  const swapStore = useSwapStore();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const poolFetchLoading = limitStore.getPoolFetchLoading();
  useEffect(() => {
    getAllTokenPrices().then((res) => {
      swapStore.setAllTokenPrices(res);
    });
  }, []);
  useEffect(() => {
    if (allPools?.length) {
      persistLimitStore.setAllDclPools(allPools);
    }
  }, [allPools?.length]);
  useEffect(() => {
    if (allDclPools?.length) {
      if (!dclPool) {
        const bestPools = getBestTvlPoolList(allDclPools);
        persistLimitStore.setDclPool(bestPools[0]!);
      } else {
        const latestDclPool = allDclPools.find(
          (p) => p.pool_id == dclPool.pool_id
        );
        if (latestDclPool) {
          persistLimitStore.setDclPool(latestDclPool);
        } else {
          persistLimitStore.setDclPool(allDclPools[0]);
        }
      }
    }
  }, [allDclPools?.length, dclPool?.pool_id]);
  function onSwitch() {
    limitStore.setTokenIn(tokenOut);
    limitStore.setTokenOut(tokenIn);
    limitStore.setTokenInAmount("1");
  }
  async function fetchPool() {
    limitStore.onFetchPool({
      limitStore,
      persistLimitStore,
    });
  }

  const variants = {
    stop: { transform: "rotate(0deg)" },
    spin: {
      transform: "rotate(360deg)",
      transition: { duration: 1, repeat: Infinity, ease: "linear" },
    },
  };
  return (
    <main className="flex xsm:flex-col-reverse xsm:mx-3 items-start justify-center mt-6 xsm:mt-0 gap-5">
      {/* popup */}
      <LimitOrderPopup />
      {/* init */}
      <Init />
      {/* charts and records container */}
      <div className="lg:w-[950px]">
        <ChartTopBar />
        <div className="border border-gray-30 xsm:border-none rounded-lg mt-2.5">
          <LimitOrderChartAndTable />
          <p className="flex items-center justify-center border-t xsm:border-none lg:h-[42px] xsm:bg-dark-250 xsm:rounded xsm:p-3 xsm:text-xs xsm:text-dark-260 border-gray-30 text-gray-60 lg:text-[13px]">
            The price is from the Ref AMM and for reference only. There is no
            guarente that your limit order will be immediately filled.
          </p>
        </div>
        <MyOrders />
      </div>
      {/* create order container */}
      <div className="rounded-lg lg:bg-dark-10 xsm:bg-limitOrderMobileBg p-3.5 mt-2 lg:w-[420px] w-full">
        <div className="flexBetween px-px">
          <span className="font-bold text-xl bg-textWhiteGradient bg-clip-text text-transparent">
            Limit Order
          </span>
          <div className="flex items-center justify-center w-5 h-5 cursor-pointer rounded border border-gray-10 border-opacity-20">
            {poolFetchLoading ? (
              <motion.div variants={variants} animate="spin">
                <RefreshIcon className="text-white" />
              </motion.div>
            ) : (
              <RefreshIcon onClick={fetchPool} className="text-gray-60" />
            )}
          </div>
        </div>
        <div className="flex flex-col items-center mt-4">
          <Input token={tokenIn} isIn />
          <div
            className="flex items-center justify-center rounded w-7 h-7 cursor-pointer text-gray-50 hover:text-white  bg-dark-60 hover:bg-dark-10 relative z-10 border-2 border-dark-10"
            onClick={onSwitch}
            style={{
              marginTop: "-13px",
              marginBottom: "-13px",
            }}
          >
            <SWitchButton />
          </div>
        </div>
        <Input token={tokenOut} isOut />
        <div className="flex xsm:flex-col items-stretch gap-0.5 mt-0.5 xsm:mt-2 select-none">
          <RateContainer />
          <FeeTiers />
        </div>
        <p className="text-xs text-gray-10 text-center mt-6">
          Your price is automatically set to the closest price slot
        </p>
        <CreateOrderButton />
      </div>
    </main>
  );
}
