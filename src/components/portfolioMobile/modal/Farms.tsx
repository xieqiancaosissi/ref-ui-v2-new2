import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from "react";
import getConfig from "@/utils/config";
import {
  BoostConfig,
  FarmBoost,
  Seed,
  UserSeedInfo,
  frontConfigBoost,
  get_config,
  get_unclaimed_rewards,
  list_farmer_seeds,
  list_liquidities,
  toRealSymbol,
} from "@/services/farm";
import {
  TOKEN_LIST_FOR_RATE,
  UserLiquidityInfo,
  allocation_rule_liquidities,
  displayNumberToAppropriateDecimals,
  getPriceByPoint,
  get_all_seeds,
  get_liquidity_value,
  get_pool_name,
  openUrl,
} from "@/services/commonV3";
import { getAccountId } from "@/utils/wallet";
import { useAccountStore } from "@/stores/account";
import {
  UpDownButton,
  useTotalFarmData,
} from "../../../components/portfolioMobile/components/Tool";
import { ftGetTokenMetadata } from "@/services/token";
import { TokenMetadata } from "@/services/ft-contract";
import BigNumber from "bignumber.js";
import { BlueCircleLoading } from "@/components/pools/icon";
import {
  formatWithCommas,
  toInternationalCurrencySystem,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import {
  FarmListRewards,
  LinkIcon,
  QuestionMark,
} from "@/components/farm/icon";
import { display_value } from "@/services/aurora";
import useTokens from "@/hooks/useTokens";
import { LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import {
  PortfolioContextType,
  PortfolioData,
} from "../../../pages/portfolioMobile";
import {
  OrdersArrow,
  PositionsMobileIcon,
} from "@/components/portfolio/components/icon";
import { useRouter } from "next/router";
import NoContent from "@/components/common/NoContent";

const { REF_VE_CONTRACT_ID, REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();
export const FarmCommonDatas = createContext<FarmCommonDataContext | null>(
  null
);
function Farms(props: any) {
  const {
    tokenPriceList,
    set_classic_farms_value,
    set_classic_farms_value_done,
    set_dcl_farms_value,
    set_dcl_farms_value_done,
    set_all_farms_quanity,
    set_all_farms_Loading_done,
    all_farms_Loading_done,
    all_farms_quanity,
    user_unclaimed_map,
    set_user_unclaimed_map,
    set_user_unclaimed_map_done,
    user_unclaimed_token_meta_map,
    set_user_unclaimed_token_meta_map,
    dcl_farms_value,
    classic_farms_value,
    dcl_farms_value_done,
    classic_farms_value_done,
    activeTab,
    setActiveTab,
  } = useContext(PortfolioData) as PortfolioContextType;
  const [classicSeeds, setClassicSeeds] = useState<Seed[]>([]);
  const [dclSeeds, setDclSeeds] = useState<Seed[]>([]);
  // eslint-disable-next-line prefer-const
  let [user_seeds_map, set_user_seeds_map] = useState<
    Record<string, UserSeedInfo>
  >({});
  const [boostConfig, setBoostConfig] = useState<BoostConfig | null>(
    () => null
  );
  // eslint-disable-next-line prefer-const
  let [your_list_liquidities, set_your_list_liquidities] = useState<
    UserLiquidityInfo[]
  >([]);
  const accountStore = useAccountStore();
  const accountId = getAccountId();
  const isSignedIn = !!accountId || accountStore.isSignedIn;
  useEffect(() => {
    if (isSignedIn) {
      getBoostConfig();
      get_your_seeds();
      get_your_liquidities();
    }
  }, [isSignedIn]);
  const { total_farms_value, total_farms_quantity } = useTotalFarmData({
    dcl_farms_value,
    classic_farms_value,
    dcl_farms_value_done,
    classic_farms_value_done,
    all_farms_Loading_done,
    all_farms_quanity,
  });
  async function getBoostConfig() {
    const config = await get_config();
    const data = REF_VE_CONTRACT_ID
      ? config.booster_seeds?.[REF_VE_CONTRACT_ID]
      : undefined;
    setBoostConfig(data);
  }
  async function get_your_seeds() {
    const seeds: Seed[] = await get_all_seeds();
    const { user_seeds_map } = await get_user_seeds_and_unClaimedRewards();
    const { your_dcl_seeds, your_classic_seeds } = searchOutYourSeeds({
      farm_display_List: seeds,
      user_seeds_map,
    });
    setClassicSeeds(your_classic_seeds);
    setDclSeeds(your_dcl_seeds);
    const dcl_legth = your_dcl_seeds.length;
    const classic_length = your_classic_seeds.length;
    if (dcl_legth == 0) {
      set_dcl_farms_value_done(true);
      set_dcl_farms_value("0");
    }
    if (classic_length == 0) {
      set_classic_farms_value_done(true);
      set_classic_farms_value("0");
    }
    set_all_farms_quanity((dcl_legth + classic_length).toString());
    set_all_farms_Loading_done(true);
  }
  async function get_your_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    set_your_list_liquidities(list);
  }
  async function get_user_seeds_and_unClaimedRewards() {
    // get user seeds
    const list_user_seeds = await list_farmer_seeds();
    set_user_seeds_map(list_user_seeds);
    // get user unclaimed rewards
    const userUncliamedRewards: Record<string, any> = {};
    const seed_ids = Object.keys(list_user_seeds);
    const request: Promise<any>[] = [];
    seed_ids.forEach((seed_id: string) => {
      request.push(get_unclaimed_rewards(seed_id));
    });
    const resolvedList = await Promise.all(request);
    resolvedList.forEach((rewards, index) => {
      if (rewards && Object.keys(rewards).length > 0) {
        userUncliamedRewards[seed_ids[index]] = rewards;
      }
    });
    set_user_unclaimed_map(userUncliamedRewards);
    set_user_unclaimed_map_done(true);
    // get user unclaimed token meta
    const unclaimed_token_meta_datas: Record<string, any> = {};
    const prom_rewards = Object.values(userUncliamedRewards).map(
      async (rewards) => {
        const tokens = Object.keys(rewards);
        const unclaimedTokens = tokens.map(async (tokenId: string) => {
          const tokenMetadata = await ftGetTokenMetadata(tokenId);
          return tokenMetadata;
        });
        const tempArr = await Promise.all(unclaimedTokens);
        tempArr.forEach((token: TokenMetadata) => {
          unclaimed_token_meta_datas[token.id] = token;
        });
      }
    );
    await Promise.all(prom_rewards);
    set_user_unclaimed_token_meta_map(unclaimed_token_meta_datas);
    return {
      user_seeds_map: list_user_seeds,
      user_uncliamed_rewards: userUncliamedRewards,
      unclaimed_token_meta_datas,
    };
  }
  function searchOutYourSeeds({
    farm_display_List,
    user_seeds_map,
  }: {
    farm_display_List: Seed[];
    user_seeds_map: Record<string, UserSeedInfo>;
  }) {
    const commonSeedFarms: Record<string, Seed[]> =
      mergeCommonSeedsFarms(farm_display_List);
    const your_dcl_seeds: Seed[] = [];
    const your_classic_seeds: Seed[] = [];
    // filter out your seeds
    farm_display_List.forEach((seed: Seed) => {
      const { seed_id, farmList } = seed;
      if (!farmList) {
        throw new Error("farmList is undefined");
      }
      const isEnd = farmList[0].status == "Ended";
      const user_seed = user_seeds_map[seed_id];
      const userStaked = Object.keys(user_seed || {}).length > 0;
      const [contractId] = seed_id.split("@");
      const is_dcl_seed = contractId == REF_UNI_V3_SWAP_CONTRACT_ID;
      if (userStaked) {
        const commonSeedFarmList = commonSeedFarms[seed_id] || [];
        if (!(commonSeedFarmList.length == 2 && isEnd)) {
          if (is_dcl_seed) {
            your_dcl_seeds.push(seed);
          }
          if (!is_dcl_seed) {
            your_classic_seeds.push(seed);
          }
        }
      }
    });
    // sort by apr
    your_dcl_seeds.sort((item1: Seed, item2: Seed) => {
      const item1PoolId = item1?.pool?.id ?? "";
      const item2PoolId = item2?.pool?.id ?? "";
      const item1Front = frontConfigBoost[item1PoolId];
      const item2Front = frontConfigBoost[item2PoolId];
      if (item1Front || item2Front) {
        return Number(item2Front || 0) - Number(item1Front || 0);
      }
      const item1Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item1)));
      const item2Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item2)));
      return Number(item2Apr) - Number(item1Apr);
    });
    // sort by tvl
    your_classic_seeds.sort((item1: Seed, item2: Seed) => {
      const item1PoolId = item1?.pool?.id ?? "";
      const item2PoolId = item2?.pool?.id ?? "";
      const item1Front = frontConfigBoost[item1PoolId];
      const item2Front = frontConfigBoost[item2PoolId];
      if (item1Front || item2Front) {
        return Number(item2Front || 0) - Number(item1Front || 0);
      }
      return Number(item2.seedTvl) - Number(item1.seedTvl);
    });
    return {
      your_dcl_seeds,
      your_classic_seeds,
    };
  }
  function mergeCommonSeedsFarms(farm_display_List: Seed[]) {
    const tempMap: Record<string, any> = {};
    const list = JSON.parse(JSON.stringify(farm_display_List));
    list.forEach((seed: Seed) => {
      const { seed_id } = seed;
      tempMap[seed_id] = tempMap[seed_id] || [];
      tempMap[seed_id].push(seed);
    });
    return tempMap;
  }
  function getTotalAprForSeed(seed: Seed) {
    const farms = seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending(seed);
    farms &&
      farms.forEach(function (item: FarmBoost) {
        const pendingFarm =
          item.status == "Created" || item.status == "Pending";
        if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
          apr = +new BigNumber(item.apr || 0).plus(apr).toFixed();
        }
      });
    return apr;
  }
  const loading_status = !all_farms_Loading_done && isSignedIn;
  const noData_status =
    !loading_status &&
    ((all_farms_Loading_done && Number(all_farms_quanity) === 0) ||
      !isSignedIn);
  const data_status = all_farms_Loading_done && Number(all_farms_quanity) > 0;
  return (
    <>
      <FarmCommonDatas.Provider
        value={{
          classicSeeds,
          dclSeeds,
          user_seeds_map,
          user_unclaimed_map,
          user_unclaimed_token_meta_map,
          boostConfig,
          tokenPriceList,
          your_list_liquidities,
        }}
      >
        <p className="text-sm text-white mb-6">{total_farms_value}</p>
        <div className={`${activeTab == "3" ? "" : "hidden"}`}>
          <ClassicFarms></ClassicFarms>
          <DclFarms></DclFarms>
        </div>
        {/* pc loading */}
        {loading_status ? (
          <SkeletonTheme
            baseColor="rgba(33, 43, 53, 0.3)"
            highlightColor="#2A3643"
          >
            <Skeleton
              style={{ width: "100%" }}
              height={40}
              count={4}
              className="mt-4"
            />
          </SkeletonTheme>
        ) : null}
        {/* pc no data */}
        {noData_status ? <NoContent h="h-[260px]" /> : null}
      </FarmCommonDatas.Provider>
    </>
  );
}
function DclFarms() {
  const { user_seeds_map, dclSeeds, your_list_liquidities, tokenPriceList } =
    useContext(FarmCommonDatas)!;
  const { set_dcl_farms_value_done, set_dcl_farms_value } = useContext(
    PortfolioData
  ) as PortfolioContextType;
  useEffect(() => {
    if (
      your_list_liquidities.length > 0 &&
      Object.keys(tokenPriceList).length > 0 &&
      dclSeeds.length > 0
    ) {
      const total_value = get_all_seeds_liquidities_value();
      set_dcl_farms_value_done(true);
      set_dcl_farms_value(total_value);
    }
  }, [your_list_liquidities, tokenPriceList, dclSeeds]);
  function get_all_seeds_liquidities_value() {
    let all_liquidities_value = new BigNumber(0);
    dclSeeds.forEach((seed: Seed) => {
      const farming_liquidities = get_inFarming_list_liquidities(seed);
      farming_liquidities.forEach((liquidity: UserLiquidityInfo) => {
        const poolDetail = seed.pool;
        if (!poolDetail) {
          throw new Error("poolDetail is undefined");
        }
        const { tokens_meta_data } = poolDetail;
        if (!tokens_meta_data) {
          throw new Error("tokens_meta_data is undefined");
        }
        const v = get_liquidity_value({
          liquidity,
          poolDetail,
          tokenPriceList,
          tokensMeta: tokens_meta_data,
        });
        if (v === undefined) {
          throw new Error("get_liquidity_value returned undefined");
        }
        all_liquidities_value = all_liquidities_value.plus(v);
      });
    });
    return all_liquidities_value.toFixed();
  }
  function get_inFarming_list_liquidities(seed: Seed) {
    const { free_amount = "0", locked_amount = "0" } =
      user_seeds_map[seed.seed_id] || {};
    const user_seed_amount = new BigNumber(free_amount)
      .plus(locked_amount)
      .toFixed();
    const [temp_farming] = allocation_rule_liquidities({
      list: your_list_liquidities,
      user_seed_amount,
      seed,
    });
    return temp_farming;
  }
  return (
    <>
      {dclSeeds.map((seed: Seed) => {
        return <DclFarmRow seed={seed} key={seed.seed_id}></DclFarmRow>;
      })}
    </>
  );
}
const DCLData = createContext<DCLDataContext | null>(null);
function DclFarmRow({ seed }: { seed: Seed }) {
  const {
    user_seeds_map,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    tokenPriceList,
    your_list_liquidities,
  } = useContext(FarmCommonDatas)!;
  const [listLiquidities_inFarimg, set_listLiquidities_inFarimg] = useState<
    UserLiquidityInfo[]
  >([]);
  const [listLiquidities_inFarimg_value, set_listLiquidities_inFarimg_value] =
    useState<string>("0");
  const [switch_off, set_switch_off] = useState<boolean>(true);
  const tokens =
    seed.pool && seed.pool.tokens_meta_data
      ? sortTokens(seed.pool.tokens_meta_data)
      : [];
  useEffect(() => {
    get_inFarming_list_liquidities();
  }, [your_list_liquidities]);
  useEffect(() => {
    get_liquidities_in_seed_value();
  }, [listLiquidities_inFarimg, tokenPriceList]);

  const rate_need_to_reverse_display = useMemo(() => {
    const { tokens_meta_data } = seed.pool || {};
    if (tokens_meta_data) {
      const [tokenX] = tokens_meta_data;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) return true;
      return false;
    }
  }, [seed]);
  const unclaimedRewardsData = useMemo(() => {
    return getTotalUnclaimedRewards();
  }, [user_unclaimed_map[seed.seed_id], tokenPriceList]);
  function get_inFarming_list_liquidities() {
    if (your_list_liquidities.length > 0) {
      // get farming liquidites of seed;
      const { free_amount = "0", locked_amount = "0" } =
        user_seeds_map[seed.seed_id] || {};
      const user_seed_amount = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      const [temp_farming] = allocation_rule_liquidities({
        list: your_list_liquidities,
        user_seed_amount,
        seed,
      });
      set_listLiquidities_inFarimg(temp_farming);
    }
  }
  function get_liquidities_in_seed_value() {
    if (
      Object.keys(tokenPriceList).length > 0 &&
      listLiquidities_inFarimg.length > 0
    ) {
      // get farming liquidites value;
      let total_value = new BigNumber(0);
      listLiquidities_inFarimg.forEach((liquidity: UserLiquidityInfo) => {
        const poolDetail = seed.pool;
        if (!poolDetail) {
          throw new Error("poolDetail is undefined");
        }
        const { tokens_meta_data } = poolDetail || {};
        if (!tokens_meta_data) {
          throw new Error("tokens_meta_data is undefined");
        }

        const v = get_liquidity_value({
          liquidity,
          poolDetail,
          tokenPriceList,
          tokensMeta: tokens_meta_data,
        });
        if (v === undefined) {
          throw new Error("get_liquidity_value returned undefined");
        }
        total_value = total_value.plus(v);
      });
      set_listLiquidities_inFarimg_value(total_value.toFixed());
    }
  }
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    const tempFarmsRewards: Record<string, any> = {};
    seed.farmList &&
      seed.farmList.forEach((farm: FarmBoost) => {
        const { terms, token_meta_data } = farm;
        const reward_token = terms.reward_token;
        tempFarmsRewards[reward_token] = token_meta_data;
      });
    const unclaimed = user_unclaimed_map[seed.seed_id] || {};
    const unClaimedTokenIds = Object.keys(unclaimed);
    const tokenList: any[] = [];
    if (unClaimedTokenIds?.length == 0) {
      const tokenList_temp: any = Object.values(tempFarmsRewards).reduce(
        (acc: any[], cur) => {
          const temp = {
            token: cur,
            amount: <span className="text-gray-10">0</span>,
          };
          acc.push(temp);
          return acc;
        },
        []
      );
      return {
        worth: <span className="text-gray-10">$0</span>,
        list: tokenList_temp,
      };
    }
    unClaimedTokenIds?.forEach((tokenId: string) => {
      const token: TokenMetadata = user_unclaimed_token_meta_map[tokenId];
      // total price
      const { id, decimals } = token;
      const amount = toReadableNumber(decimals, unclaimed[id] || "0");
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != "N/A") {
        totalPrice += +amount * tokenPrice;
      }
      // rewards number
      let displayNum;
      if (new BigNumber("0").isEqualTo(amount)) {
        displayNum = <span className="text-gray-10">0</span>;
      } else if (new BigNumber("0.001").isGreaterThan(amount)) {
        displayNum = "<0.001";
      } else {
        displayNum = new BigNumber(amount).toFixed(3, 1);
      }
      const tempTokenData = {
        token,
        amount: displayNum,
      };
      tokenList.push(tempTokenData);
    });
    if (totalPrice == 0) {
      return {
        worth: <span className="text-gray-10">$0</span>,
        list: tokenList,
      };
    } else if (new BigNumber("0.01").isGreaterThan(totalPrice)) {
      return {
        worth: "<$0.01",
        list: tokenList,
      };
    } else {
      return {
        worth: `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`,
        list: tokenList,
      };
    }
  }
  function displaySymbols() {
    let result = "";
    const tokensMetaData = seed.pool?.tokens_meta_data;
    if (tokensMetaData) {
      tokensMetaData.forEach((token: TokenMetadata, index: number) => {
        const symbol = toRealSymbol(token.symbol);
        if (index === tokensMetaData.length - 1) {
          result += symbol;
        } else {
          result += symbol + "-";
        }
      });
    }
    return result;
  }
  function displayImgs() {
    const tokenList: any[] = [];
    (tokens || []).forEach((token: TokenMetadata, index: number) => {
      tokenList.push(
        <label
          key={token.id}
          className={`h-6 w-6 rounded-full overflow-hidden border border-black bg-cardBg ${
            index > 0 ? "-ml-1.5" : ""
          }`}
        >
          <img src={token.icon} className="w-full h-full"></img>
        </label>
      );
    });
    return tokenList;
  }
  function getRange() {
    const [contractId, temp_pool_id] = seed.seed_id.split("@");
    const [fixRange, dcl_pool_id, left_point, right_point] =
      temp_pool_id.split("&");
    const tokensMetaData = seed.pool?.tokens_meta_data;
    if (!tokensMetaData || tokensMetaData.length < 2) {
      throw new Error("Invalid tokens_meta_data");
    }
    const [token_x_metadata, token_y_metadata] = tokensMetaData;
    const decimalRate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let left_price = getPriceByPoint(+left_point, decimalRate);
    let right_price = getPriceByPoint(+right_point, decimalRate);
    let pairsDiv = (
      <span className="text-xs text-gray-10">
        {token_y_metadata.symbol}/{token_x_metadata.symbol}
      </span>
    );
    if (rate_need_to_reverse_display) {
      const temp = left_price;
      left_price = new BigNumber(1).dividedBy(right_price).toFixed();
      right_price = new BigNumber(1).dividedBy(temp).toFixed();
      pairsDiv = (
        <span className="text-xs text-gray-10">
          {token_x_metadata.symbol}/{token_y_metadata.symbol}
        </span>
      );
    }
    const display_left_price = left_price;
    const display_right_price = right_price;
    return (
      <div className="flex items-center whitespace-nowrap">
        <span className="text-xs text-white mr-1">
          {displayNumberToAppropriateDecimals(display_left_price)} -{" "}
          {displayNumberToAppropriateDecimals(display_right_price)}
        </span>
        {pairsDiv}
      </div>
    );
  }
  return (
    <DCLData.Provider
      value={{
        switch_off,
        displayImgs,
        displaySymbols,
        seed,
        listLiquidities_inFarimg_value,
        unclaimedRewardsData,
        set_switch_off,
        getRange,
        listLiquidities_inFarimg,
        tokens,
        rate_need_to_reverse_display,
      }}
    >
      <DclFarmRowPage></DclFarmRowPage>
    </DCLData.Provider>
  );
}
function DclFarmRowPage() {
  const {
    switch_off,
    displayImgs,
    displaySymbols,
    seed,
    listLiquidities_inFarimg_value,
    unclaimedRewardsData,
    set_switch_off,
    getRange,
    listLiquidities_inFarimg,
    tokens,
    rate_need_to_reverse_display,
  } = useContext(DCLData) as DCLDataContext;
  const router = useRouter();
  return (
    <div
      className={`rounded-xl mt-3 bg-gray-20 px-4 bg-opacity-30 ${
        switch_off ? "" : "pb-4"
      }`}
    >
      <div className="frcb h-14">
        <div className="flex items-center">
          <div className="flex items-center flex-shrink-0 mr-2.5">
            {displayImgs()}
          </div>
          <span className="text-white font-bold text-sm paceGrotesk-Bold">
            {displaySymbols()}
          </span>
          <span
            className="frcc text-xs text-gray-10 px-1 rounded-md border border-gray-90 mr-1.5"
            onClick={() => {
              goFarmDetailPage(seed, router);
            }}
          >
            DCL
            <span className="ml-1.5">
              <OrdersArrow></OrdersArrow>
            </span>
          </span>
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-end mr-5">
            <span className="text-white text-sm paceGrotesk-Bold">
              {display_value(listLiquidities_inFarimg_value)}
            </span>
            <div className="flex items-center">
              <FarmListRewards className="ml-1 mr-1" />
              <span className="text-xs text-farmApyColor paceGrotesk-Bold">
                {unclaimedRewardsData.worth}
              </span>
            </div>
          </div>
          <UpDownButton
            set_switch_off={() => {
              set_switch_off(!switch_off);
            }}
            switch_off={switch_off}
          ></UpDownButton>
        </div>
      </div>
      <div className={`${switch_off ? "hidden" : ""}`}>
        {/* border-b border-gray1  */}
        <div className="bg-dark-210 rounded-xl px-3.5 py-5 bg-opacity-70 mt-2">
          <div className="frcb">
            <span className="text-xs text-gray-10">farm_reward_range</span>
            <div className="flex items-center">{getRange()}</div>
          </div>
          <div className="flex items-center justify-between mt-5">
            <span className="text-xs text-gray-10">unclaimed_farm_rewards</span>
            <div className="flex items-center">
              {unclaimedRewardsData.list.map(
                (
                  {
                    token,
                    amount,
                  }: { token: TokenMetadata; amount: JSX.Element },
                  index: number
                ) => {
                  return (
                    <div
                      key={`pc_${token.id}_${index}`}
                      className={`flex items-center ${
                        index == unclaimedRewardsData.list.length - 1
                          ? ""
                          : "mr-4"
                      }`}
                    >
                      <img
                        src={token.icon}
                        className={`w-5 h-5 border border-greenColor rounded-full mr-1.5`}
                      ></img>
                      <span className={`text-xs text-white paceGrotesk-Bold`}>
                        {amount}
                      </span>
                    </div>
                  );
                }
              )}
              <span
                className={`tex-xs text-farmApyColor pl-3.5 ml-3.5 ${
                  unclaimedRewardsData.list.length == 0
                    ? ""
                    : "border-l border-orderTypeBg"
                }`}
              >
                {unclaimedRewardsData.worth}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function ClassicFarms() {
  const [activeIndex, setActiveIndex] = useState(null);
  const { set_classic_farms_value_done, set_classic_farms_value } = useContext(
    PortfolioData
  ) as PortfolioContextType;
  const { classicSeeds, user_seeds_map } = useContext(FarmCommonDatas)!;
  useEffect(() => {
    if (classicSeeds.length > 0) {
      const total_value = get_all_seeds_liquidities_value();
      set_classic_farms_value_done(true);
      set_classic_farms_value(total_value);
    }
  }, [classicSeeds]);
  function get_all_seeds_liquidities_value() {
    let total_value = new BigNumber(0);
    classicSeeds.forEach((seed: Seed) => {
      const v = getYourTvl(seed);
      if (v !== undefined) {
        total_value = total_value.plus(new BigNumber(v));
      }
    });
    return total_value.toFixed();
  }
  function getYourTvl(seed: Seed) {
    const { pool, seed_id, seed_decimal } = seed;
    const {
      free_amount = "0",
      locked_amount = "0",
      shadow_amount = "0",
    } = user_seeds_map[seed_id] || {};
    const { tvl, shares_total_supply } = pool;
    const amount = new BigNumber(free_amount || 0)
      .plus(locked_amount || 0)
      .plus(shadow_amount)
      .toFixed();
    const poolShares = toReadableNumber(seed_decimal, shares_total_supply);
    const yourLpAmount = toReadableNumber(seed_decimal, amount);
    const yourTvl =
      +poolShares == 0
        ? "0"
        : new BigNumber(yourLpAmount)
            .multipliedBy(tvl)
            .dividedBy(poolShares)
            .toFixed();
    return yourTvl;
  }
  const handleToggle = (index: any) => {
    setActiveIndex(index === activeIndex ? null : index);
  };
  return (
    <>
      {classicSeeds.map((seed: Seed, index) => {
        return (
          <ClassicFarmRow
            seed={seed}
            key={seed.seed_id}
            isActive={index === activeIndex}
            onToggle={() => handleToggle(index)}
          ></ClassicFarmRow>
        );
      })}
    </>
  );
}
const ClassicData = createContext<ClassicDataContext | null>(null);
function ClassicFarmRow({
  seed,
  isActive,
  onToggle,
}: {
  seed: Seed;
  isActive: any;
  onToggle: any;
}) {
  const {
    user_seeds_map,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    boostConfig,
    tokenPriceList,
  } = useContext(FarmCommonDatas)!;
  const { pool, seedTvl, seed_id, seed_decimal } = seed;
  const {
    free_amount = "0",
    x_locked_amount = "0",
    locked_amount = "0",
    shadow_amount,
  } = user_seeds_map[seed_id] || {};
  const { token_account_ids } = pool || {};
  const tokens = sortTokens(useTokens(token_account_ids) || []);
  const [switch_off, set_switch_off] = useState<boolean>(true);
  const unclaimedRewardsData = useMemo(() => {
    return getTotalUnclaimedRewards();
  }, [user_unclaimed_map[seed_id], tokenPriceList]);
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    const tempFarmsRewards: Record<string, any> = {};
    seed.farmList?.forEach((farm: FarmBoost) => {
      const { terms, token_meta_data } = farm;
      const reward_token = terms.reward_token;
      tempFarmsRewards[reward_token] = token_meta_data;
    });
    const unclaimed = user_unclaimed_map[seed_id] || {};
    const unClaimedTokenIds = Object.keys(unclaimed);
    const tokenList: any[] = [];
    if (unClaimedTokenIds?.length == 0) {
      const tokenList_temp: any = Object.values(tempFarmsRewards).reduce(
        (acc: any[], cur) => {
          const temp = {
            token: cur,
            amount: <span className="text-gray-10">0</span>,
          };
          acc.push(temp);
          return acc;
        },
        []
      );
      return {
        worth: <span className="text-gray-10">$0</span>,
        list: tokenList_temp,
      };
    }
    unClaimedTokenIds?.forEach((tokenId: string) => {
      const token: TokenMetadata = user_unclaimed_token_meta_map[tokenId];
      // total price
      const { id, decimals, icon } = token;
      const amount = toReadableNumber(decimals, unclaimed[id] || "0");
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != "N/A") {
        totalPrice += +amount * tokenPrice;
      }
      // rewards number
      let displayNum = "";
      if (new BigNumber("0").isEqualTo(amount)) {
        displayNum = "-";
      } else if (new BigNumber("0.001").isGreaterThan(amount)) {
        displayNum = "<0.001";
      } else {
        displayNum = new BigNumber(amount).toFixed(3, 1);
      }
      const tempTokenData = {
        token,
        amount: displayNum,
      };
      tokenList.push(tempTokenData);
    });
    if (totalPrice == 0) {
      return {
        worth: <label>$0</label>,
        list: tokenList,
      };
    } else if (new BigNumber("0.01").isGreaterThan(totalPrice)) {
      return {
        worth: "<$0.01",
        list: tokenList,
      };
    } else {
      return {
        worth: `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`,
        list: tokenList,
      };
    }
  }
  function displayImgs() {
    const tokenList: any[] = [];
    (tokens || []).forEach((token: TokenMetadata, index: number) => {
      tokenList.push(
        <img
          key={token.id + index}
          src={token.icon}
          className={`relative w-6 h-6  border border-black rounded-full ${
            index > 0 ? "-ml-1.5" : ""
          }`}
        ></img>
      );
    });
    return tokenList;
  }
  function displaySymbols() {
    let result = "";
    pool?.tokens_meta_data?.forEach((token: TokenMetadata, index: number) => {
      const symbol = toRealSymbol(token.symbol);
      if (index === (pool?.tokens_meta_data?.length ?? 0) - 1) {
        result += symbol;
      } else {
        result += symbol + "-";
      }
    });
    return result;
  }
  // function getTotalStaked() {
  //   return Number(seedTvl) == 0
  //     ? "-"
  //     : `$${toInternationalCurrencySystem(seedTvl, 2)}`;
  // }
  function showLpPower() {
    const power = getUserPower();
    const powerBig = new BigNumber(power);
    if (powerBig.isEqualTo(0)) {
      return <label className="opacity-50">{"0.0"}</label>;
    } else if (powerBig.isLessThan("0.01")) {
      return "<0.01";
    } else {
      return formatWithCommas(toPrecision(power, 2));
    }
  }
  function getUserPower() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return "";
    let realRadio;
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = seed;
    const love_user_seed = REF_VE_CONTRACT_ID
      ? user_seeds_map[REF_VE_CONTRACT_ID]
      : undefined;
    const base = affected_seeds[seed_id];
    if (base) {
      const { free_amount = 0, locked_amount = 0 } = love_user_seed || {};
      const totalStakeLoveAmount = toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      if (+totalStakeLoveAmount > 0) {
        if (+totalStakeLoveAmount < 1) {
          realRadio = 1;
        } else {
          realRadio = new BigNumber(1)
            .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
            .toFixed();
        }
      }
    }
    const powerBig = new BigNumber(+(realRadio || 1))
      .multipliedBy(free_amount)
      .plus(x_locked_amount);
    const power = toReadableNumber(
      seed_decimal,
      powerBig.toFixed(0).toString()
    );
    return power;
  }
  function getUserLpPercent() {
    let result = "(-%)";
    const { total_seed_power } = seed;
    const userPower = getUserPower();
    if (+total_seed_power && +userPower) {
      const totalAmount = toReadableNumber(seed_decimal, total_seed_power);
      const percent = new BigNumber(userPower)
        .dividedBy(totalAmount)
        .multipliedBy(100);
      if (percent.isLessThan("0.001")) {
        result = "<0.001%";
      } else {
        result = `${toPrecision(percent.toFixed().toString(), 3)}%`;
      }
    }
    return result;
  }
  function getPowerTip() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return "";
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = seed;
    const base = affected_seeds[seed_id];
    const tip = base
      ? "Your Power = Your staked LP Tokens * booster (by staking LOVE)"
      : "Your Power = Your staked LP Tokens";
    const result: string = `<div class="text-navHighLightText text-xs w-52 xsm:w-32 text-left">${tip}</div>`;
    return result;
  }
  function getYourTvl() {
    const { tvl, shares_total_supply } = pool;
    const amount = new BigNumber(free_amount || 0)
      .plus(shadow_amount || 0)
      .plus(locked_amount || 0)
      .toFixed();
    const poolShares = toReadableNumber(seed_decimal, shares_total_supply);
    const yourLpAmount = toReadableNumber(seed_decimal, amount);
    const yourTvl =
      +poolShares == 0
        ? "0"
        : new BigNumber(yourLpAmount)
            .multipliedBy(tvl)
            .dividedBy(poolShares)
            .toFixed();
    return "$" + toInternationalCurrencySystem(yourTvl, 2);
  }
  return (
    <ClassicData.Provider
      value={{
        switch_off,
        set_switch_off,
        displayImgs,
        displaySymbols,
        seed,
        getYourTvl,
        unclaimedRewardsData,
        getPowerTip,
        showLpPower,
        getUserLpPercent,
      }}
    >
      <ClassicFarmRowPage
        isActive={isActive}
        onToggle={onToggle}
      ></ClassicFarmRowPage>
    </ClassicData.Provider>
  );
}
function ClassicFarmRowPage({
  isActive,
  onToggle,
}: {
  isActive: any;
  onToggle: any;
}) {
  const {
    switch_off,
    set_switch_off,
    displayImgs,
    displaySymbols,
    seed,
    getYourTvl,
    unclaimedRewardsData,
    getPowerTip,
    showLpPower,
    getUserLpPercent,
  } = useContext(ClassicData)!;
  const router = useRouter();
  return (
    <div className="mb-4">
      <div
        className={`rounded-lg bg-dark-270 mb-0.5 ${switch_off ? "" : "pb-4"}`}
        onClick={onToggle}
      >
        <div className="bg-portfolioMobileBg pt-4 pb-2.5 pl-3 pr-3 rounded-t-lg frcb">
          <div className="flex items-center flex-shrink-0 mr-2.5">
            {displayImgs()}
          </div>
          <div className="flex flex-col justify-end items-end">
            <span className="text-white font-bold text-sm paceGrotesk-Bold">
              {displaySymbols()}
            </span>
            <span
              className="w-16 ml-2 frcc text-xs text-gray-10 px-1 rounded-md border border-gray-90"
              onClick={() => {
                goFarmDetailPage(seed, router);
              }}
            >
              Classic
              <span className="ml-1.5">
                <OrdersArrow></OrdersArrow>
              </span>
            </span>
          </div>
        </div>
        <div className="p-3.5">
          <div className="frcb mb-5">
            <p className="text-sm text-gray-60">Your Farming:</p>
            <p className="text-xl text-white">{getYourTvl()}</p>
          </div>
          <div className="frcb">
            <p className="text-sm text-gray-60">Rewards:</p>
            <p className="text-sm text-farmApyColor">
              {unclaimedRewardsData.worth}
            </p>
          </div>
        </div>
      </div>
      <div className={`${isActive ? "" : "hidden"}`}>
        <div className="bg-dark-270 rounded-xl px-3.5 py-4 bg-opacity-70 mt-0.5 pb-4">
          <div className="frcb mb-3">
            <span className="text-xs text-gray-10">USD Value Staked</span>
            <span className="text-xs text-white">{getYourTvl()}</span>
          </div>
          <div className="frcb mb-3">
            <div className="flex items-center">
              <span className="text-xs text-gray-10">Your Power</span>
              <div
                className="text-white text-right ml-1"
                data-class="reactTip"
                data-tooltip-id="powerTipId"
                data-place="top"
                data-tooltip-html={getPowerTip()}
              >
                <QuestionMark className="transform scale-90"></QuestionMark>
                <CustomTooltip id="powerTipId" />
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-white">{showLpPower()}</span>
              <span className="text-xs text-gray-10 mt-0.5">
                ({getUserLpPercent()})
              </span>
            </div>
          </div>
          <div className="frcb">
            <span className="text-xs text-gray-10">Unclaimed Farm Rewards</span>
            <div className="flex items-center">
              {unclaimedRewardsData.list.map(
                (
                  { token, amount }: { token: TokenMetadata; amount: string },
                  index: number
                ) => {
                  return (
                    <div
                      key={`pc_${token.id}_${index}`}
                      className={`flex items-center ${
                        index == unclaimedRewardsData.list.length - 1
                          ? ""
                          : "mr-4"
                      }`}
                    >
                      <img
                        src={token.icon}
                        className={`w-5 h-5 border border-greenColor rounded-full mr-1.5`}
                      ></img>
                      <span className={`text-xs text-white paceGrotesk-Bold`}>
                        {amount}
                      </span>
                    </div>
                  );
                }
              )}
              <span className="text-xs text-farmApyColor pl-3.5 border-l border-orderTypeBg ml-3.5">
                {unclaimedRewardsData && unclaimedRewardsData.worth}
              </span>
            </div>
          </div>
          <div
            className="border border-dark-190 rounded-lg frcc h-9 mt-5 cursor-pointer"
            onClick={onToggle}
          >
            <PositionsMobileIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
function sortTokens(tokens: TokenMetadata[]) {
  tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
    if (a.symbol === "NEAR") return 1;
    if (b.symbol === "NEAR") return -1;
    return 0;
  });
  return tokens;
}
function goFarmDetailPage(seed: Seed, router: any) {
  if (!seed.farmList || seed.farmList.length === 0) {
    return;
  }
  const poolId = getPoolIdBySeedId(seed.seed_id);
  const status = seed.farmList[0].status == "Ended" ? "e" : "r";
  let mft_id = poolId;
  let is_dcl_pool = false;
  const [contractId, temp_pool_id] = seed.seed_id.split("@");
  if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
    is_dcl_pool = true;
  }
  if (is_dcl_pool) {
    const [fixRange, pool_id, left_point, right_point] =
      temp_pool_id.split("&");
    mft_id = `${get_pool_name(pool_id)}[${left_point}-${right_point}]`;
  }
  router.push(`/v2farms/${mft_id}-${status}`);
}
function getPoolIdBySeedId(seed_id: string) {
  const [contractId, temp_pool_id] = seed_id.split("@");
  if (temp_pool_id) {
    if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
      const [fixRange, dcl_pool_id, left_point, right_point] =
        temp_pool_id.split("&");
      return dcl_pool_id;
    } else {
      return temp_pool_id;
    }
  }
  return "";
}
function isPending(seed: Seed) {
  let pending: boolean = true;
  const farms = seed.farmList;
  if (farms) {
    for (let i = 0; i < farms.length; i++) {
      if (farms[i].status !== "Created" && farms[i].status !== "Pending") {
        pending = false;
        break;
      }
    }
  }
  return pending;
}

interface FarmCommonDataContext {
  classicSeeds: Seed[];
  dclSeeds: Seed[];
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_map: Record<string, any>;
  user_unclaimed_token_meta_map: Record<string, TokenMetadata>;
  boostConfig: BoostConfig | null;
  tokenPriceList: any;
  your_list_liquidities: UserLiquidityInfo[];
}
interface DCLDataContext {
  switch_off: boolean;
  displayImgs: () => any[];
  displaySymbols: () => string;
  seed: Seed;
  listLiquidities_inFarimg_value: string;
  unclaimedRewardsData: any;
  set_switch_off: (value: boolean) => void;
  getRange: () => any;
  listLiquidities_inFarimg: UserLiquidityInfo[];
  tokens: any[];
  rate_need_to_reverse_display: boolean | undefined;
}

type ClassicDataContext = {
  switch_off: boolean;
  set_switch_off: React.Dispatch<React.SetStateAction<boolean>>;
  displayImgs: () => any[];
  displaySymbols: () => string;
  seed: Seed;
  getYourTvl: () => string | undefined;
  unclaimedRewardsData: any;
  getPowerTip: () => string;
  showLpPower: () => string | React.JSX.Element;
  getUserLpPercent: () => string;
};

export default React.memo(Farms);
