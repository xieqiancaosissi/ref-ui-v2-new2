import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useMemo,
} from "react";
import Big from "big.js";
import { useAccountStore } from "@/stores/account";
import { isMobile } from "@/utils/device";
import { getAccountId } from "@/utils/wallet";
import { getBoostTokenPrices } from "@/services/farm";
import RefPanel from "./components/RefPanel";

export const OverviewData = createContext<OverviewContextType | null>(null);
const is_mobile: boolean = !!isMobile();

function Overview() {
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
  }, []);

  async function getTokenPriceList() {
    const tokenPriceList = await getBoostTokenPrices();
    setTokenPriceList(tokenPriceList);
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
      }}
    >
      <RefPanel></RefPanel>
    </OverviewData.Provider>
  );
}
export default React.memo(Overview);
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
}
