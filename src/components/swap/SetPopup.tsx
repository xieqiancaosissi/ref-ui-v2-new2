import React, { useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { motion } from "framer-motion";
import { SetIcon, WarnIcon } from "../../components/swap/icons";
import { usePersistSwapStore, IPersistSwapStore } from "../../stores/swap";
import { INIT_SLIPPAGE_VALUE } from "@/utils/constant";
import swapStyles from "./swap.module.css";
import SupportLedgerGuide from "@/components/common/ledger/SupportLedgerGuide";
import { useAccountStore } from "@/stores/account";
import { useSwapStore } from "@/stores/swap";
import { getAccount } from "@/utils/near";
import HighPriceImpactTip from "./HighPriceImpactTip";
import { PRICE_IMPACT_RED_VALUE } from "@/utils/constant";

function SetPopup() {
  const [show, setShow] = useState<boolean>();
  const [isLedgerUser, setIsLedgerUser] = useState<boolean>(false);
  const [ledgerTip, setLedgerTip] = useState<boolean>(false);
  const [highPriceTip, setHighPriceTip] = useState<boolean>(false);
  const slippageOptions = ["0.1", "0.5", "1"];
  const persistSwapStore: IPersistSwapStore = usePersistSwapStore();
  const accountStore = useAccountStore();
  const swapStore = useSwapStore();
  const priceImpact = swapStore.getPriceImpact();
  const accountId = accountStore.getAccountId();
  const smartRoute = persistSwapStore.getSmartRoute();
  const slippageStore = persistSwapStore.getSlippage();

  const [slippage, setSlippage] = useState<string>(
    slippageStore ? slippageStore.toString() : INIT_SLIPPAGE_VALUE
  );
  useEffect(() => {
    function handleOutsideClick(event: any) {
      const path = event.composedPath();
      const el = path.find((el: any) => el.id == "setDiv");
      if (!el) {
        hideSet();
      }
    }
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  useEffect(() => {
    if (!show) {
      setSlippage(slippageStore.toString());
    }
  }, [show, slippageStore]);
  const slippageStatus = useMemo(() => {
    let status = 0; // 0: normal; 1:warn; 2: invalid
    if (Number(slippage || 0) > 0 && Number(slippage || 0) < 100) {
      if (Number(slippage || 0) > 1) {
        status = 1;
      }
      persistSwapStore.setSlippage(+slippage);
    } else {
      status = 2;
    }
    return status;
  }, [slippage]);
  // useEffect(() => {
  //   if (accountId) {
  //     ledgerJudge();
  //   }
  // }, [accountId]);
  useDebounce(
    () => {
      if (
        !isLedgerUser &&
        !smartRoute &&
        Number(priceImpact || 0) > PRICE_IMPACT_RED_VALUE
      ) {
        setHighPriceTip(true);
      } else {
        setHighPriceTip(false);
      }
    },
    500,
    [isLedgerUser, smartRoute, priceImpact]
  );
  async function ledgerJudge() {
    const account = await getAccount();
    const allKeys = await account.getAccessKeys();
    const isWalletMeta = allKeys.some((k: any) => {
      if (k.access_key.permission === "FullAccess") return false;
      const meta =
        k.access_key.permission.FunctionCall.method_names.includes(
          "__wallet__metadata"
        );
      return meta;
    });

    const isSelectLedger =
      window.selector.store.getState().selectedWalletId === "ledger";
    const isLedgerUser = !!(isSelectLedger || isWalletMeta);
    setIsLedgerUser(isLedgerUser);
    if (isLedgerUser && smartRoute) {
      setShow(true);
      setLedgerTip(true);
      persistSwapStore.setSmartRoute(false);
    } else {
      setShow(false);
      setLedgerTip(false);
    }
  }

  function switchSmartRoute() {
    persistSwapStore.setSmartRoute(!smartRoute);
  }
  function switchSet() {
    setShow(!show);
    if (show) {
      setLedgerTip(false);
    }
  }
  function hideSet() {
    setShow(false);
    setLedgerTip(false);
  }
  function hideLedgerTip() {
    setLedgerTip(false);
  }
  function hideHighPriceTip() {
    setHighPriceTip(false);
  }
  function onchange(e: any) {
    const value = e.target.value;
    setSlippage(value);
  }
  function smartTip() {
    return `
    <div class="text-gray-110 text-xs text-left w-62">
    By design, Ledger cannot handle large transactions (i.e. Auto Router: trade across multiple pools at once) because of its memory limitation. When activated, the 'Support Ledger' option will limit transactions to their simplest form (to the detriment of potential optimal prices found by our Auto Router), so transactions of a reasonable size can be signed.
    </div>
    `;
  }
  const variants = {
    on: { marginLeft: "16px" },
    off: { marginLeft: "0px" },
  };
  return (
    <div className="relative" id="setDiv">
      <span className={swapStyles.swapControlButton} onClick={switchSet}>
        <SetIcon />
      </span>
      <div className={`right-0 top-9 z-10 ${show ? "absolute" : "hidden"}`}>
        <div className={`rounded-lg border border-gray-140 bg-gray-40 p-4`}>
          {/* title */}
          <span className="text-base font-bold text-gray-110 whitespace-nowrap">
            Transaction Settings
          </span>
          {/* Slippage tolerance */}
          <div className="my-6">
            <span className="text-sm text-gray-50">Slippage tolerance</span>
            <div className="flex items-stretch justify-between mt-2 gap-2 text-sm">
              <div
                className="flex items-center gap-1 border border-dark-50 rounded bg-black bg-opacity-20"
                style={{ padding: "3px" }}
              >
                {slippageOptions.map((item) => {
                  return (
                    <span
                      className={`flex items-center justify-center  h-5 rounded px-2  cursor-pointer ${
                        slippage == item
                          ? "bg-gray-120 text-white"
                          : "text-gray-50"
                      }`}
                      key={item}
                      onClick={() => {
                        setSlippage(item);
                      }}
                    >
                      {item}%
                    </span>
                  );
                })}
              </div>
              <div
                className="flex items-center gap-1 border border-dark-50 rounded bg-black bg-opacity-20 text-white"
                style={{ padding: "3px 6px" }}
              >
                <input
                  type="number"
                  className="w-8 bg-transparent outline-none text-right"
                  value={slippage}
                  onChange={onchange}
                />
                %
              </div>
            </div>
            {/* Slippage Tip */}
            {slippageStatus == 0 ? null : (
              <div
                className={`flex items-start gap-1  rounded px-1.5 py-1 text-xs  bg-opacity-15 mt-1.5 ${
                  slippageStatus == 1
                    ? "bg-yellow-10 text-yellow-10"
                    : "bg-red-10 text-red-10"
                }`}
              >
                <WarnIcon className="relative top-0.5 transform scale-75 flex-shrink-0" />
                <span>
                  {slippageStatus == 1
                    ? "Be careful, please check the minimum you can receive"
                    : "The slippage tolerance is invalid"}
                </span>
              </div>
            )}
          </div>
          {/* Smart Router switch */}
          <div className="flexBetween">
            <div className="flexBetween gap-1">
              <span className="text-sm text-gray-50">Disable Smart Router</span>
              {/* <div
                className="text-white text-right"
                data-class="reactTip"
                data-tooltip-id="smartTipId"
                data-place="top"
                data-tooltip-html={smartTip()}
              >
                <QuestionIcon className="text-gray-10 hover:text-white cursor-pointer" />
                <CustomTooltip id="smartTipId" />
              </div> */}
            </div>
            <div
              className={`flex items-center relative h-4 rounded-2xl cursor-pointer p-px w-8 ${
                smartRoute ? "bg-gray-130" : "bg-greenGradientDark"
              }`}
              onClick={switchSmartRoute}
            >
              <motion.div
                className="absolute rounded-full border border-gray-40 border-opacity-40"
                variants={variants}
                initial={smartRoute ? "off" : "on"}
                animate={smartRoute ? "off" : "on"}
              >
                <span className="block w-3 h-3 bg-white rounded-full"></span>
              </motion.div>
            </div>
          </div>
        </div>
        {ledgerTip ? <SupportLedgerGuide handleClose={hideLedgerTip} /> : null}
      </div>
      {highPriceTip ? (
        <HighPriceImpactTip handleClose={hideHighPriceTip} />
      ) : null}
    </div>
  );
}
export default React.memo(SetPopup);
