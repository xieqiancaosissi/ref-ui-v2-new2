import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from "react";
import getConfig from "@/utils/config";
import { PortfolioContextType, PortfolioData } from "../RefPanelModal";
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
  openUrlLocal,
} from "@/services/commonV3";
import { getAccountId } from "@/utils/wallet";
import { useAccountStore } from "@/stores/account";
import { UpDownButton, useTotalFarmData } from "../Tool";
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
import { FarmMiningIcon, OrdersArrow } from "../icon";
import useTokens from "@/hooks/useTokens";
import { LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { FarmView } from "./FarmView";
import { get24hVolumes } from "@/services/indexer";
import { getVeSeedShare } from "@/services/farm";
import NoContent from "@/components/common/NoContent";

const { REF_VE_CONTRACT_ID, REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();
export const FarmCommonDatas = createContext<FarmCommonDataContext | null>(
  null
);
export default function Farms(props: any) {
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

  if (!isSignedIn) return <NoContent />;

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
        <div
          className={`${
            activeTab == "2" ? "" : "hidden"
          } flex items-center w-full justify-start flex-wrap`}
        >
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
              height={60}
              count={4}
              className="mt-4"
            />
          </SkeletonTheme>
        ) : null}

        {!loading_status && noData_status && isSignedIn && <NoContent />}
      </FarmCommonDatas.Provider>
    </>
  );
}
function DclFarms() {
  const {
    user_seeds_map,
    dclSeeds,
    your_list_liquidities,
    tokenPriceList,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
    boostConfig,
  } = useContext(FarmCommonDatas)!;

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
      getAllPoolsDayVolume(dclSeeds);
      get_ve_seed_share();
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

  const [detailData, setDetailData] = useState<Seed | null>(null);
  const [loveSeed, setLoveSeed] = useState<Seed | null>(null);
  const [maxLoveShareAmount, setMaxLoveShareAmount] = useState<string>("0");
  const getDetailData = (data: { detailData: Seed; loveSeed: Seed }) => {
    const { detailData, loveSeed } = data;
    setDetailData(detailData);
    setLoveSeed(loveSeed);
  };
  const [dayVolumeMap, setDayVolumeMap] = useState<any>({});
  async function getAllPoolsDayVolume(list_seeds: Seed[]) {
    const tempMap: { [key: string]: any } = {};
    const poolIds: string[] = [];
    const seedIds: string[] = [];
    list_seeds.forEach((seed: Seed) => {
      seedIds.push(seed.seed_id);
    });
    seedIds.forEach((seedId: string) => {
      const [contractId, temp_pool_id] = seedId.split("@");
      if (contractId !== REF_UNI_V3_SWAP_CONTRACT_ID) {
        poolIds.push(temp_pool_id);
      }
    });
    // get24hVolume
    try {
      const resolvedResult = await get24hVolumes(poolIds);
      poolIds.forEach((poolId: string, index: number) => {
        tempMap[poolId] = resolvedResult[index];
      });
      setDayVolumeMap(tempMap);
    } catch (error) {}
  }

  async function get_ve_seed_share() {
    const result = await getVeSeedShare();
    const maxShareObj = result?.accounts?.accounts[0] || {};
    const amount = maxShareObj?.amount;
    if (amount) {
      const amountStr = new BigNumber(amount).toFixed().toString();
      // todo 现在是 用 ref-near替代，上mainnet后替代
      // const amountStr_readable = toReadableNumber(LOVE_TOKEN_DECIMAL, amountStr);
      const amountStr_readable = toReadableNumber(24, amountStr);
      setMaxLoveShareAmount(amountStr_readable);
    }
  }

  return (
    <>
      {dclSeeds.map((seed: Seed, index: number) => {
        return (
          <div
            key={seed.seed_id + index}
            className={`
              ${
                seed.hidden
                  ? "hidden"
                  : index < 2
                  ? "bg-farmItemBg rounded-lg"
                  : "bg-gray-20 bg-opacity-30 rounded-lg"
              }
                lg:w-[32.5%]
                xsm:w-full
                lg:mr-[0.8%]
                mb-[12px]
            `}
          >
            <FarmView
              seed={seed}
              all_seeds={dclSeeds}
              tokenPriceList={tokenPriceList}
              getDetailData={getDetailData}
              dayVolumeMap={dayVolumeMap}
              boostConfig={boostConfig || ({} as BoostConfig)}
              loveSeed={loveSeed || ({} as Seed)}
              user_seeds_map={user_seeds_map}
              user_unclaimed_map={user_unclaimed_map}
              user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
              maxLoveShareAmount={maxLoveShareAmount}
            ></FarmView>
          </div>
        );
      })}
    </>
  );
}

function ClassicFarms() {
  const { set_classic_farms_value_done, set_classic_farms_value } = useContext(
    PortfolioData
  ) as PortfolioContextType;
  const {
    classicSeeds,
    user_seeds_map,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    boostConfig,
    tokenPriceList,
  } = useContext(FarmCommonDatas)!;
  useEffect(() => {
    if (classicSeeds.length > 0) {
      const total_value = get_all_seeds_liquidities_value();
      set_classic_farms_value_done(true);
      set_classic_farms_value(total_value);
      getAllPoolsDayVolume(classicSeeds);
      get_ve_seed_share();
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
    const { free_amount = "0", locked_amount = "0" } =
      user_seeds_map[seed_id] || {};
    if (pool) {
      const { tvl, shares_total_supply } = pool;
      const amount = new BigNumber(free_amount || 0)
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
      return yourTvl;
    }

    if (pool) {
      const { tvl, shares_total_supply } = pool;
      const amount = new BigNumber(free_amount || 0)
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
  }

  const [detailData, setDetailData] = useState<Seed | null>(null);
  const [loveSeed, setLoveSeed] = useState<Seed | null>(null);
  const [maxLoveShareAmount, setMaxLoveShareAmount] = useState<string>("0");
  const getDetailData = (data: { detailData: Seed; loveSeed: Seed }) => {
    const { detailData, loveSeed } = data;
    setDetailData(detailData);
    setLoveSeed(loveSeed);
  };
  const [dayVolumeMap, setDayVolumeMap] = useState<any>({});

  async function getAllPoolsDayVolume(list_seeds: Seed[]) {
    const tempMap: { [key: string]: any } = {};
    const poolIds: string[] = [];
    const seedIds: string[] = [];
    list_seeds.forEach((seed: Seed) => {
      seedIds.push(seed.seed_id);
    });
    seedIds.forEach((seedId: string) => {
      const [contractId, temp_pool_id] = seedId.split("@");
      if (contractId !== REF_UNI_V3_SWAP_CONTRACT_ID) {
        poolIds.push(temp_pool_id);
      }
    });
    // get24hVolume
    try {
      const resolvedResult = await get24hVolumes(poolIds);
      poolIds.forEach((poolId: string, index: number) => {
        tempMap[poolId] = resolvedResult[index];
      });
      setDayVolumeMap(tempMap);
    } catch (error) {}
  }

  async function get_ve_seed_share() {
    const result = await getVeSeedShare();
    const maxShareObj = result?.accounts?.accounts[0] || {};
    const amount = maxShareObj?.amount;
    if (amount) {
      const amountStr = new BigNumber(amount).toFixed().toString();
      // todo 现在是 用 ref-near替代，上mainnet后替代
      // const amountStr_readable = toReadableNumber(LOVE_TOKEN_DECIMAL, amountStr);
      const amountStr_readable = toReadableNumber(24, amountStr);
      setMaxLoveShareAmount(amountStr_readable);
    }
  }

  return (
    <>
      {classicSeeds.map((seed: Seed, index: number) => {
        return (
          <div
            key={seed.seed_id + index}
            className={`
              ${
                seed.hidden ? "hidden" : index < 2 ? "rounded-lg" : "rounded-lg"
              }
               lg:w-[32.5%]
                xsm:w-full
               lg:mr-[0.8%]
              mb-[12px]
              `}
          >
            <FarmView
              seed={seed}
              all_seeds={classicSeeds}
              tokenPriceList={tokenPriceList}
              getDetailData={getDetailData}
              dayVolumeMap={dayVolumeMap}
              boostConfig={boostConfig || ({} as BoostConfig)}
              loveSeed={loveSeed || ({} as Seed)}
              user_seeds_map={user_seeds_map}
              user_unclaimed_map={user_unclaimed_map}
              user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
              maxLoveShareAmount={maxLoveShareAmount}
            ></FarmView>
          </div>
        );
      })}
    </>
  );
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
