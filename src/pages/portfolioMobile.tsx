import { ModalClose } from "@/components/farm/icon";
import React, { createContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { UserLiquidityInfo } from "@/services/commonV3";
import { TokenMetadata } from "@/services/ft-contract";
import { getBoostTokenPrices } from "@/services/farm";
import { useAccountStore } from "@/stores/account";
import { getAssets } from "@/services/indexer";
import { PortfolioRefIcon } from "@/components/portfolio/components/icon";
import dynamic from "next/dynamic";

const Asset = dynamic(
  () => import("../components/portfolioMobile/modal/Asset"),
  {
    ssr: false,
  }
);
const AssetProfit = dynamic(
  () => import("../components/portfolioMobile/modal/AssetProfit"),
  {
    ssr: false,
  }
);
const Tab = dynamic(() => import("../components/portfolioMobile/modal/Tab"), {
  ssr: false,
});
const Orders = dynamic(
  () => import("../components/portfolioMobile/modal/Orders"),
  {
    ssr: false,
  }
);
const Positions = dynamic(
  () => import("../components/portfolioMobile/modal/Positions"),
  {
    ssr: false,
  }
);
const Farms = dynamic(
  () => import("../components/portfolioMobile/modal/Farms"),
  {
    ssr: false,
  }
);

export const PortfolioData = createContext<PortfolioContextType | null>(null);
export default function RefPanelMobille() {
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  // variables only used in mobile site start
  const [main_active_tab, set_main_active_tab] = useState("Summary"); // Summary,positions
  // variables only used in mobile site end
  const [activeTab, setActiveTab] = useState("1"); // 1,2,3
  const [YourLpValueV2, setYourLpValueV2] = useState("0");
  const [YourLpValueV1, setYourLpValueV1] = useState("0");
  const [lpValueV1Done, setLpValueV1Done] = useState(false);
  const [lpValueV2Done, setLpValueV2Done] = useState(false);
  const [v1LiquidityQuantity, setV1LiquidityQuantity] = useState("0");
  const [v2LiquidityQuantity, setV2LiquidityQuantity] = useState("0");
  const [v2LiquidityLoadingDone, setV2LiquidityLoadingDone] = useState(false);
  const [v1LiquidityLoadingDone, setV1LiquidityLoadingDone] = useState(false);
  const [your_classic_lp_all_in_farms, set_your_classic_lp_all_in_farms] =
    useState<boolean>(true);
  const [tokenPriceList, setTokenPriceList] = useState<any>({});

  const [classic_farms_value, set_classic_farms_value] = useState("0");
  const [dcl_farms_value, set_dcl_farms_value] = useState("0");
  const [classic_farms_value_done, set_classic_farms_value_done] =
    useState(false);
  const [dcl_farms_value_done, set_dcl_farms_value_done] = useState(false);
  const [all_farms_Loading_done, set_all_farms_Loading_done] = useState(false);
  const [all_farms_quanity, set_all_farms_quanity] = useState("0");

  const [active_order_value_done, set_active_order_value_done] =
    useState(false);
  const [active_order_Loading_done, set_active_order_Loading_done] =
    useState(false);
  const [active_order_value, set_active_order_value] = useState(false);
  const [active_order_quanity, set_active_order_quanity] = useState("0");

  const [user_unclaimed_map, set_user_unclaimed_map] = useState<
    Record<string, any>
  >({});
  const [user_unclaimed_map_done, set_user_unclaimed_map_done] =
    useState<boolean>(false);

  const [user_unclaimed_token_meta_map, set_user_unclaimed_token_meta_map] =
    useState<Record<string, any>>({});

  const [dcl_liquidities_list, set_dcl_liquidities_list] = useState<
    UserLiquidityInfo[]
  >([]);
  const [dcl_liquidities_details_list, set_dcl_liquidities_details_list] =
    useState<UserLiquidityInfo[]>([]);

  const [
    dcl_liquidities_details_list_done,
    set_dcl_liquidities_details_list_done,
  ] = useState<boolean>(false);

  const [dcl_tokens_metas, set_dcl_tokens_metas] = useState<
    Record<string, TokenMetadata>
  >({});
  const [activeDimension, setActiveDimension] = useState<
    "M" | "W" | "H" | "ALL"
  >("H");
  const [history_total_asset, set_history_total_asset] = useState<string>("0");
  const [history_total_asset_done, set_history_total_asset_done] =
    useState<boolean>(false);

  useEffect(() => {
    getTokenPriceList();
  }, []);
  async function getTokenPriceList() {
    // get all token prices
    const tokenPriceList = await getBoostTokenPrices();
    setTokenPriceList(tokenPriceList);
  }
  useEffect(() => {
    if (isSignedIn) {
      getAssets(activeDimension).then((res) => {
        set_history_total_asset(res?.[0]?.assets || "0");
        set_history_total_asset_done(true);
      });
    }
  }, [activeDimension, isSignedIn]);
  return (
    <div className="text-white mx-4 pb-8">
      {/* <div className="text-gray-60 text-sm mb-6">
        {`Account > Portfolio > `}
        <span className="text-white">Ref.finance</span>
      </div> */}
      <div className="flex items-center mb-4">
        <div className="bg-gray-220 bg-opacity-60 border border-dark-110 rounded-md frcc w-7 h-7 mr-2">
          <PortfolioRefIcon />
        </div>
        <p className="text-lg">Ref.finance</p>
      </div>
      <PortfolioData.Provider
        value={{
          main_active_tab,
          set_main_active_tab,
          activeTab,
          setActiveTab,
          tokenPriceList,
          user_unclaimed_map,
          user_unclaimed_token_meta_map,
          set_user_unclaimed_map,
          set_user_unclaimed_token_meta_map,
          history_total_asset,
          history_total_asset_done,
          set_history_total_asset,
          set_history_total_asset_done,

          YourLpValueV1,
          YourLpValueV2,
          lpValueV1Done,
          lpValueV2Done,
          v1LiquidityQuantity,
          v2LiquidityQuantity,
          v2LiquidityLoadingDone,
          v1LiquidityLoadingDone,
          setYourLpValueV1,
          setYourLpValueV2,
          setLpValueV1Done,
          setLpValueV2Done,
          setV1LiquidityQuantity,
          setV2LiquidityQuantity,
          setV1LiquidityLoadingDone,
          setV2LiquidityLoadingDone,

          classic_farms_value,
          dcl_farms_value,
          all_farms_quanity,
          classic_farms_value_done,
          dcl_farms_value_done,
          all_farms_Loading_done,
          set_dcl_farms_value_done,
          set_classic_farms_value_done,
          set_dcl_farms_value,
          set_classic_farms_value,
          set_all_farms_quanity,
          set_all_farms_Loading_done,

          active_order_quanity,
          active_order_value,
          active_order_value_done,
          active_order_Loading_done,
          set_active_order_value_done,
          set_active_order_Loading_done,
          set_active_order_quanity,
          set_active_order_value,

          dcl_liquidities_list,
          dcl_liquidities_details_list,
          dcl_tokens_metas,
          set_dcl_liquidities_list,
          set_dcl_liquidities_details_list,
          set_dcl_tokens_metas,

          user_unclaimed_map_done,
          set_user_unclaimed_map_done,
          dcl_liquidities_details_list_done,
          set_dcl_liquidities_details_list_done,

          your_classic_lp_all_in_farms,
          set_your_classic_lp_all_in_farms,
        }}
      >
        <Asset></Asset>
        <AssetProfit></AssetProfit>
        <Tab></Tab>
        <div className="pt-4 py-8">
          <div className={`${activeTab == "1" ? "" : "hidden"}`}>
            <Orders></Orders>
          </div>
          <div className={`${activeTab == "2" ? "" : "hidden"}`}>
            <Positions></Positions>
          </div>
          <div className={`${activeTab == "3" ? "" : "hidden"}`}>
            <Farms></Farms>
          </div>
        </div>
      </PortfolioData.Provider>
    </div>
  );
}

export interface PortfolioContextType {
  main_active_tab: string;
  set_main_active_tab: React.Dispatch<React.SetStateAction<string>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  tokenPriceList: any;
  user_unclaimed_map: Record<string, any>;
  user_unclaimed_token_meta_map: Record<string, any>;
  set_user_unclaimed_map: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
  set_user_unclaimed_token_meta_map: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
  history_total_asset: string;
  history_total_asset_done: boolean;
  set_history_total_asset: React.Dispatch<React.SetStateAction<string>>;
  set_history_total_asset_done: React.Dispatch<React.SetStateAction<boolean>>;
  YourLpValueV1: string;
  YourLpValueV2: string;
  lpValueV1Done: boolean;
  lpValueV2Done: boolean;
  v1LiquidityQuantity: string;
  v2LiquidityQuantity: string;
  v2LiquidityLoadingDone: boolean;
  v1LiquidityLoadingDone: boolean;
  setYourLpValueV1: React.Dispatch<React.SetStateAction<string>>;
  setYourLpValueV2: React.Dispatch<React.SetStateAction<string>>;
  setLpValueV1Done: React.Dispatch<React.SetStateAction<boolean>>;
  setLpValueV2Done: React.Dispatch<React.SetStateAction<boolean>>;
  setV1LiquidityQuantity: React.Dispatch<React.SetStateAction<string>>;
  setV2LiquidityQuantity: React.Dispatch<React.SetStateAction<string>>;
  setV1LiquidityLoadingDone: React.Dispatch<React.SetStateAction<boolean>>;
  setV2LiquidityLoadingDone: React.Dispatch<React.SetStateAction<boolean>>;
  classic_farms_value: string;
  dcl_farms_value: string;
  all_farms_quanity: string;
  classic_farms_value_done: boolean;
  dcl_farms_value_done: boolean;
  all_farms_Loading_done: boolean;
  set_dcl_farms_value_done: React.Dispatch<React.SetStateAction<boolean>>;
  set_classic_farms_value_done: React.Dispatch<React.SetStateAction<boolean>>;
  set_dcl_farms_value: React.Dispatch<React.SetStateAction<string>>;
  set_classic_farms_value: React.Dispatch<React.SetStateAction<string>>;
  set_all_farms_quanity: React.Dispatch<React.SetStateAction<string>>;
  set_all_farms_Loading_done: React.Dispatch<React.SetStateAction<boolean>>;
  active_order_quanity: string;
  active_order_value: boolean;
  active_order_value_done: boolean;
  active_order_Loading_done: boolean;
  set_active_order_value_done: React.Dispatch<React.SetStateAction<boolean>>;
  set_active_order_Loading_done: React.Dispatch<React.SetStateAction<boolean>>;
  set_active_order_quanity: React.Dispatch<React.SetStateAction<string>>;
  set_active_order_value: any;
  dcl_liquidities_list: UserLiquidityInfo[];
  dcl_liquidities_details_list: UserLiquidityInfo[];
  dcl_tokens_metas: Record<string, TokenMetadata>;
  set_dcl_liquidities_list: React.Dispatch<
    React.SetStateAction<UserLiquidityInfo[]>
  >;
  set_dcl_liquidities_details_list: React.Dispatch<
    React.SetStateAction<UserLiquidityInfo[]>
  >;
  set_dcl_tokens_metas: React.Dispatch<
    React.SetStateAction<Record<string, TokenMetadata>>
  >;
  user_unclaimed_map_done: boolean;
  set_user_unclaimed_map_done: React.Dispatch<React.SetStateAction<boolean>>;
  dcl_liquidities_details_list_done: boolean;
  set_dcl_liquidities_details_list_done: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  your_classic_lp_all_in_farms: boolean;
  set_your_classic_lp_all_in_farms: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}
