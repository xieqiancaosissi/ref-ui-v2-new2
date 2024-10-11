import React, { useState, createContext, useEffect, useMemo } from "react";
import Big from "big.js";
import { useAccountStore } from "@/stores/account";
import { isMobile } from "@/utils/device";
import { getAccountId } from "@/utils/wallet";
import { getBoostTokenPrices } from "@/services/farm";
import WalletPanel from "./components/WalletPanel";
import RefPanel from "./components/RefPanel";
import { TotalAssetsIcon } from "../menu/icons";
import { formatWithCommas_usd } from "@/utils/uiNumber";
import BurrowPanel from "./components/BurrowPanel";
import { XrefMobileArrow } from "../xref/icon";
import FlipNumbers from "react-flip-numbers";
import { useAppStore } from "@/stores/app";
import { Spinner } from "@nextui-org/react";

export const OverviewData = createContext<OverviewContextType | null>(null);
const is_mobile: boolean = !!isMobile();

function Overview({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: any }) {
  const accountStore = useAccountStore();
  const accountId = getAccountId();
  const isSignedIn = accountStore.isSignedIn;
  const [tokenPriceList, setTokenPriceList] = useState<any>({});

  const [ref_invest_value, set_ref_invest_value] = useState<string>("0");
  const [ref_invest_value_done, set_ref_invest_value_done] =
    useState<boolean>(false);
  const [ref_profit_value, set_ref_profit_value] = useState<string>("0");
  const [ref_profit_value_done, set_ref_profit_value_done] =
    useState<boolean>(false);

  const [burrow_supplied_value, set_burrow_supplied_value] =
    useState<string>("0");
  const [burrow_borrowied_value, set_burrow_borrowied_value] =
    useState<string>("0");
  const [burrow_rewards_value, set_burrow_rewards_value] =
    useState<string>("0");
  const [burrow_done, set_burrow_done] = useState<boolean>(false);

  const [wallet_assets_value, set_wallet_assets_value] = useState<string>("0");
  const [wallet_assets_value_done, set_wallet_assets_value_done] =
    useState<boolean>(false);
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Wallet");
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  const [reloadLoading, setReloadLoading] = useState<boolean>(true);

  const [isWalletPanelOpen, setIsWalletPanelOpen] = useState<boolean>(false);
  const [isPortfolioPanelOpen, setIsPortfolioPanelOpen] =
    useState<boolean>(false);
  const appStore = useAppStore();
  const personalDataUpdatedSerialNumber =
    appStore.getPersonalDataUpdatedSerialNumber();
  const [netWorth, netWorthDone] = useMemo(() => {
    let netWorth = "0";
    let netWorthDone = false;
    if (
      ref_invest_value_done &&
      ref_profit_value_done &&
      burrow_done &&
      wallet_assets_value_done
    ) {
      netWorth = Big(ref_invest_value)
        .plus(ref_profit_value)
        .plus(burrow_supplied_value)
        .plus(burrow_rewards_value)
        .plus(wallet_assets_value)
        .minus(burrow_borrowied_value)
        .toFixed();
      netWorthDone = true;
    }
    return [netWorth, netWorthDone];
  }, [
    ref_invest_value_done,
    ref_profit_value_done,
    burrow_done,
    wallet_assets_value_done,
    ref_invest_value,
    ref_profit_value,
    burrow_supplied_value,
    burrow_rewards_value,
    wallet_assets_value,
    burrow_borrowied_value,
  ]);

  const [portfolioAssets, netPortfolioAssets] = useMemo(() => {
    let portfolioAssets = "0";
    let netPortfolioAssets = false;
    if (ref_invest_value_done && ref_profit_value_done && burrow_done) {
      portfolioAssets = Big(ref_invest_value)
        .plus(ref_profit_value)
        .plus(burrow_supplied_value)
        .plus(burrow_rewards_value)
        .minus(burrow_borrowied_value)
        .toFixed();
      netPortfolioAssets = true;
    }
    return [portfolioAssets, netPortfolioAssets];
  }, [
    ref_invest_value_done,
    ref_profit_value_done,
    burrow_done,
    burrow_supplied_value,
    burrow_borrowied_value,
    burrow_rewards_value,
  ]);

  const [claimable, claimableDone] = useMemo(() => {
    let claimable = "0";
    let claimableDone = false;
    if (ref_profit_value_done && burrow_done) {
      claimable = Big(ref_profit_value).plus(burrow_rewards_value).toFixed();
      claimableDone = true;
    }
    return [claimable, claimableDone];
  }, [ref_profit_value_done, burrow_rewards_value, burrow_done]);

  useEffect(() => {
    // get all token prices
    getTokenPriceList();
  }, [personalDataUpdatedSerialNumber]);
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("Wallet");
    }
  }, [isOpen]);

  async function getTokenPriceList() {
    const tokenPriceList = await getBoostTokenPrices();
    setTokenPriceList(tokenPriceList);
  }
  function showWalletPanelModal() {
    setIsWalletPanelOpen(true);
  }
  function hideWalletPanelModal() {
    setIsWalletPanelOpen(false);
  }
  function showPortfolioPanelModal() {
    setIsPortfolioPanelOpen(true);
  }
  function hidePortfolioPanelModal() {
    setIsPortfolioPanelOpen(false);
  }
  return (
    <OverviewData.Provider
      value={{
        tokenPriceList,
        isSignedIn,
        accountId,
        is_mobile,
        set_ref_invest_value,
        set_ref_invest_value_done,
        set_ref_profit_value,
        set_ref_profit_value_done,
        set_burrow_supplied_value,
        set_burrow_borrowied_value,
        set_burrow_rewards_value,
        set_burrow_done,
        set_wallet_assets_value,
        set_wallet_assets_value_done,
        userTokens,
        setUserTokens,
        netWorth,
        netWorthDone,
        claimable,
        claimableDone,
        wallet_assets_value,
        wallet_assets_value_done,
        burrow_borrowied_value,
        burrow_done,
        isOpen,
        setIsOpen,
        hidePortfolioPanelModal,
        setWalletLoading,
        setReloadLoading,
      }}
    >
      {/* pc */}
      {!is_mobile ? (
        <div>
          <div className="mt-4 bg-gray-20 py-2.5 pl-2 pr-4 rounded-3xl h-11 flex items-end justify-between mb-8 text-white">
            <div className="frcc">
              <TotalAssetsIcon className="w-9" />
              <p className="text-sm	ml-2 text-gray-50 mt-4">Total Assets</p>
            </div>
            <div className="text-primaryGreen text-base paceGrotesk-Bold">
              <FlipNumbers
                height={20}
                width={12}
                color="#9EFF00"
                play
                perspective={1000}
                numbers={formatWithCommas_usd(netWorth)}
              />
            </div>
          </div>
          <div className="border-b border-gray-70 -mx-3.5 px-7 flex items-center text-gray-50 text-sm paceGrotesk-Bold">
            <div
              className={`mr-10 pb-1.5 cursor-pointer  ${
                activeTab === "Wallet"
                  ? "text-white border-white border-b-2"
                  : ""
              }`}
              onClick={() => setActiveTab("Wallet")}
            >
              Wallet
            </div>
            <div
              className={`pb-1.5 cursor-pointer ${
                activeTab === "Portfolio"
                  ? "text-white border-b-2 border-white"
                  : ""
              }`}
              onClick={() => setActiveTab("Portfolio")}
            >
              Portfolio
            </div>
            <div className=" text-red-10"></div>
            {walletLoading && !reloadLoading ? (
              <Spinner
                size="sm"
                className="mb-2 ml-8"
                classNames={{
                  circle1: "border-b-primaryGreen",
                  circle2: "border-b-primaryGreen",
                }}
              />
            ) : null}
          </div>
          <div className="py-4 pr-1 overflow-auto h-[60vh]">
            <div className={activeTab === "Wallet" ? "" : "hidden"}>
              <WalletPanel />
            </div>
            {isOpen ? (
              <div className={activeTab === "Portfolio" ? "" : "hidden"}>
                <RefPanel></RefPanel>
                <BurrowPanel></BurrowPanel>
                <div className="frcb mt-6 px-4">
                  <p className="text-gray-50 text-sm">Total</p>
                  <p className="text-base xsm:text-primaryGreen">
                    {formatWithCommas_usd(portfolioAssets)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {/* mobile */}
      {is_mobile ? (
        <div className="pb-6">
          <div className="mt-6 bg-gray-20 rounded-[3rem] frcc py-3 mb-8">
            <TotalAssetsIcon className="w-8 mr-3" />
            <div className="text-xl text-primaryGreen mb-0.5">
              <p className="paceGrotesk-Bold">
                <FlipNumbers
                  height={20}
                  width={12}
                  color="#9EFF00"
                  play
                  perspective={1000}
                  numbers={formatWithCommas_usd(netWorth)}
                />
              </p>
              <p className="text-gray-60 text-sm">Total Assets</p>
            </div>
          </div>
          <div className="px-3.5 frcb mb-6">
            <div className="frcc text-base">
              <p className="text-gray-250 mr-4">Wallet assets</p>
              <p className="text-white">
                {formatWithCommas_usd(wallet_assets_value)}
              </p>
            </div>
            <div
              onClick={() => {
                showWalletPanelModal();
              }}
            >
              <XrefMobileArrow />
            </div>
          </div>
          <div className="px-3.5 frcb">
            <div className="frcc text-base">
              <p className="text-gray-250 mr-4">Portfolio assets</p>
              <p className="text-white">
                {formatWithCommas_usd(portfolioAssets)}
              </p>
            </div>
            <div
              onClick={() => {
                showPortfolioPanelModal();
              }}
            >
              <XrefMobileArrow />
            </div>
          </div>
          {/* WalletPanelOpen */}
          <div className={`${isWalletPanelOpen ? "block" : "hidden"}`}>
            <div
              className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50  ${
                isWalletPanelOpen ? "block" : "hidden"
              }`}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
              onClick={hideWalletPanelModal}
            ></div>
            <div className="fixed bottom-8 left-0 w-full bg-dark-10 py-6 px-4 z-50 rounded-t-2xl border border-modalGrayBg">
              <div className="mb-6 text-lg text-white">Wallet Assets</div>
              <WalletPanel />
            </div>
          </div>
          {/* PortfolioPanel */}
          <div className={`${isPortfolioPanelOpen ? "block" : "hidden"}`}>
            <div
              className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50  ${
                isPortfolioPanelOpen ? "block" : "hidden"
              }`}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
              onClick={hidePortfolioPanelModal}
            ></div>
            <div className="fixed bottom-8 left-0 w-full bg-dark-10 py-6 px-4 z-50 rounded-t-2xl border border-modalGrayBg">
              <div className="mb-6 text-lg text-white">Portfolio Assets</div>
              <RefPanel></RefPanel>
              <BurrowPanel></BurrowPanel>
              <div className="frcb mt-6 px-4">
                <p className="text-gray-50 text-sm">Total</p>
                <p className="text-base xsm:text-primaryGreen">
                  {formatWithCommas_usd(portfolioAssets)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </OverviewData.Provider>
  );
}
const OverviewMemo = React.memo(Overview);
export default function AccountOverview({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return <OverviewMemo isOpen={isOpen} setIsOpen={setIsOpen} />;
}

export interface OverviewContextType {
  tokenPriceList: any;
  isSignedIn: boolean;
  accountId: string;
  is_mobile: boolean;
  set_ref_invest_value: React.Dispatch<React.SetStateAction<string>>;
  set_ref_invest_value_done: React.Dispatch<React.SetStateAction<boolean>>;
  set_ref_profit_value: React.Dispatch<React.SetStateAction<string>>;
  set_ref_profit_value_done: React.Dispatch<React.SetStateAction<boolean>>;
  set_burrow_supplied_value: React.Dispatch<React.SetStateAction<string>>;
  set_burrow_borrowied_value: React.Dispatch<React.SetStateAction<string>>;
  set_burrow_rewards_value: React.Dispatch<React.SetStateAction<string>>;
  set_burrow_done: React.Dispatch<React.SetStateAction<boolean>>;
  set_wallet_assets_value: React.Dispatch<React.SetStateAction<string>>;
  set_wallet_assets_value_done: React.Dispatch<React.SetStateAction<boolean>>;
  userTokens: any[];
  setUserTokens: React.Dispatch<React.SetStateAction<any[]>>;
  netWorth: string;
  netWorthDone: boolean;
  claimable: string;
  claimableDone: boolean;
  wallet_assets_value: string;
  wallet_assets_value_done: boolean;
  burrow_borrowied_value: string;
  burrow_done: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hidePortfolioPanelModal: any;
  setWalletLoading: any;
  setReloadLoading: any;
}
