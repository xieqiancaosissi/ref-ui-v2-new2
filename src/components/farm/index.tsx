/* eslint-disable prefer-const */
import {
  SetStateAction,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAccountStore } from "../../stores/account";
import {
  Checkbox,
  CheckboxSelected,
  FarmAvatarIcon,
  FarmDownArrown,
  FarmInputCheck,
  FarmSortMobIcon,
  FarmWithdrawIcon,
} from "./icon";
import {
  BoostConfig,
  FarmBoost,
  PoolRPCView,
  Seed,
  UserSeedInfo,
  classificationOfCoins_key,
  frontConfigBoost,
  getBoostSeeds,
  getAllTokenPrices,
  getFarmClassification,
  getVeSeedShare,
  get_config,
  get_unWithDraw_rewards,
  get_unclaimed_rewards,
  list_farmer_seeds,
  list_seeds_info,
  getPoolIdBySeedId,
} from "../../services/farm";
import { IPoolDcl } from "../../interfaces/swapDcl";
import getConfig from "../../utils/config";
import { ftGetTokenMetadata } from "../../services/token";
import { toPrecision, toReadableNumber } from "../../utils/numbers";
import BigNumber from "bignumber.js";
import {
  get_matched_seeds_for_dcl_pool,
  get_pool_id,
  get_pool_name,
  get_total_value_by_liquidity_amount_dcl,
  isPending,
  openUrl,
} from "../../services/commonV3";
import { TokenMetadata } from "../../services/ft-contract";
import { SearchIcon } from "./icon/FarmBoost";
import { get24hVolumes } from "../../services/indexer";
import { LOVE_TOKEN_DECIMAL, getLoveAmount } from "../../services/referendum";
import SelectBox from "./components/SelectBox";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import WithDrawBox from "./components/WithDrawBox";
import NoContent from "../common/NoContent";
import { FarmsContextData } from "./components/FarmsContext";
import React from "react";
import FarmView from "./components/FarmView";
import { useFarmStore } from "@/stores/farm";
import { useRouter } from "next/router";

const {
  REF_VE_CONTRACT_ID,
  FARM_BLACK_LIST_V2,
  boostBlackList,
  REF_UNI_V3_SWAP_CONTRACT_ID,
} = getConfig();

const FarmsPage = (props: any, ref: any) => {
  const {
    getDetailData,
    getDetailData_user_data,
    getDetailData_boost_config,
    getDayVolumeMap,
  } = props;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const [selected, setSelected] = useState("");
  const [user_unWithdraw_rewards, set_user_unWithdraw_rewards] = useState<
    Record<string, string>
  >({});
  const [tokenPriceList, setTokenPriceList] = useState<any>({});
  let [farm_display_List, set_farm_display_List] = useState<any>([]);
  let [farm_display_ended_List, set_farm_display_ended_List] = useState<any>(
    []
  );
  const [user_seeds_map, set_user_seeds_map] = useState<
    Record<string, UserSeedInfo>
  >({});
  const [showEndedFarmList, setShowEndedFarmList] = useState(false);
  const [homePageLoading, setHomePageLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [count, setCount] = useState(0);
  const [dayVolumeMap, setDayVolumeMap] = useState<any>({});
  const searchRef = useRef<HTMLInputElement>(null);
  let [loveSeed, setLoveSeed] = useState<Seed | null>(null);
  let [boostConfig, setBoostConfig] = useState<BoostConfig | null>(null);
  const [sort, setSort] = useState("apr");
  const [keyWords, setKeyWords] = useState("");
  const [farmTab, setFarmTab] = useState("all");
  const [farm_type_selectedId, set_farm_type_selectedId] = useState("all");
  const [filter_type_selectedId, set_filter_type_selectedId] = useState("all");
  const [has_dcl_farms_in_display_list, set_has_dcl_farms_in_display_list] =
    useState(true);
  const [your_seeds_quantity, set_your_seeds_quantity] = useState("-");
  const [user_unclaimed_map, set_user_unclaimed_map] = useState<
    Record<string, any>
  >({});
  const [user_unclaimed_token_meta_map, set_user_unclaimed_token_meta_map] =
    useState<Record<string, any>>({});
  const [userDataLoading, setUserDataLoading] = useState<boolean>(true);
  const [loveTokenBalance, setLoveTokenBalance] = useState("0");
  const [maxLoveShareAmount, setMaxLoveShareAmount] = useState<string>("0");
  const [globalConfigLoading, setGlobalConfigLoading] = useState<boolean>(true);
  const refreshTime = 300000;
  const router = useRouter();
  const paramId = router.query.id || "";
  const sortList: { [key: string]: string } = {
    tvl: "TVL",
    apr: "APR",
  };
  const [farmTypeList, setFarmTypeList] = useState([
    { id: "all", label: "All" },
    { id: "classic", label: "Classic" },
    { id: "dcl", label: "DCL" },
  ]);
  const [filterTypeList, setFilterTypeList] = useState([
    { id: "all", label: "All" },
    { id: "new", name: "New" },
    { id: "near", name: "NEAR" },
    { id: "stable", name: "Stable" },
    { id: "eth", name: "ETH" },
    { id: "meme", name: "Meme" },
    {
      id: "boost",
      name: "Boost",
      hidden: REF_VE_CONTRACT_ID ? false : true,
    },
    { id: "others", name: "Others" },
  ]);
  const setInit = useFarmStore((state) => state.setInit);
  const setGetConfig = useFarmStore((state) => state.setGetConfig);
  const setGet_user_unWithDraw_rewards = useFarmStore(
    (state) => state.setGet_user_unWithDraw_rewards
  );
  const setGet_user_seeds_and_unClaimedRewards = useFarmStore(
    (state) => state.setGet_user_seeds_and_unClaimedRewards
  );
  useEffect(() => {
    init();
    getConfig();
    get_user_unWithDraw_rewards();
    if (accountId) {
      get_user_seeds_and_unClaimedRewards();
    }
    getLoveTokenBalance();
    get_ve_seed_share();
  }, [accountId, paramId]);
  useEffect(() => {
    setInit(init);
    setGetConfig(getConfig);
    setGet_user_unWithDraw_rewards(get_user_unWithDraw_rewards);
    setGet_user_seeds_and_unClaimedRewards(get_user_seeds_and_unClaimedRewards);
  }, [accountId, paramId]);
  useEffect(() => {
    if (count > 0) {
      init();
      get_user_seeds_and_unClaimedRewards();
    }
    const intervalId = setInterval(() => {
      setCount(count + 1);
    }, refreshTime);
    return () => {
      clearInterval(intervalId);
    };
  }, [count]);
  useEffect(() => {
    searchByCondition();
  }, [farm_type_selectedId, filter_type_selectedId, keyWords, farmTab]);
  useEffect(() => {
    sortFarms();
  }, [sort]);
  useEffect(() => {
    if (farm_display_List?.length > 0) {
      getYourFarmsQuantity();
    }
  }, [farm_display_List]);
  const handleCheckbox = (value: SetStateAction<string>) => {
    setSelected(value);
  };
  async function getConfig() {
    const config = await get_config();
    const data = REF_VE_CONTRACT_ID
      ? config.booster_seeds?.[REF_VE_CONTRACT_ID]
      : undefined;
    boostConfig = data;
    setBoostConfig(data);
    setGlobalConfigLoading(false);
    searchByCondition();
    // for detail page
    getDetailData_boost_config(data);
  }
  async function init() {
    let list_seeds: Seed[];
    let list_farm: FarmBoost[][];
    let pools: PoolRPCView[];
    const result = await getBoostSeeds();
    const { seeds: seeds_from_cache, farms, pools: cachePools } = result || {};
    // replace cache seeds with server seeds due to apr display
    const seeds: Seed[] = [];
    const seeds_from_server = await list_seeds_info();
    const seeds_from_server_map: { [key: string]: Seed } = {};
    seeds_from_server.forEach((s: Seed) => {
      seeds_from_server_map[s.seed_id] = s;
    });
    if (seeds_from_cache) {
      seeds_from_cache?.forEach((s: Seed) => {
        if (seeds_from_server_map[s.seed_id]) {
          seeds.push(seeds_from_server_map[s.seed_id]);
        }
      });
    }
    list_seeds = seeds;
    list_farm = farms;
    // console.log(farms,'farms')
    const defultPools = cachePools;
    // get Love seed
    list_seeds.find((seed: Seed) => {
      if (seed.seed_id == REF_VE_CONTRACT_ID) {
        loveSeed = seed;
        setLoveSeed(seed);
      }
    });
    // filter Love Seed
    list_seeds.filter((seed: Seed) => {
      if (seed.seed_id.indexOf("@") > -1) return true;
    });
    // filter black farms
    const temp_list_farm: FarmBoost[][] = [];
    list_farm?.forEach((farmList: FarmBoost[]) => {
      let temp_farmList: FarmBoost[] = [];
      temp_farmList = farmList?.filter((farm: FarmBoost) => {
        const id = farm?.farm_id?.split("@")[1];
        if (boostBlackList.indexOf(id) == -1) {
          return true;
        }
      });
      temp_list_farm.push(temp_farmList);
    });
    list_farm = temp_list_farm;
    // filter no farm seed
    const new_list_seeds: any[] = [];
    list_farm.forEach((farmList: FarmBoost[], index: number) => {
      if (farmList?.length > 0) {
        new_list_seeds.push({
          ...list_seeds[index],
          farmList,
        });
      }
    });

    list_seeds = new_list_seeds;
    // get all token prices
    const tokenPriceList = await getAllTokenPrices();
    setTokenPriceList(tokenPriceList);
    // get pool apr
    getAllPoolsDayVolume(list_seeds);
    getFarmDataList({
      list_seeds,
      list_farm,
      tokenPriceList,
      defultPools,
    });
  }
  // get user unWithDraw rewards data
  async function get_user_unWithDraw_rewards() {
    if (accountId) {
      // console.log("get_user_unWithDraw_rewards is called");
      const userRewardList = await get_unWithDraw_rewards();
      set_user_unWithdraw_rewards(userRewardList);
    }
  }
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
      // for detail page
      getDayVolumeMap(tempMap);
    } catch (error) {}
  }
  function getTotalAprForSeed(seed: Seed) {
    const farms = seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending(seed);
    farms?.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == "Created" || item.status == "Pending";
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        const itemApr = new BigNumber(item.apr || 0);
        apr = +itemApr.plus(apr).toFixed();
      }
    });
    // get pool fee apy
    if (seed.pool) {
      const poolApy = getPoolFeeApr(dayVolumeMap[seed.pool.id], seed);
      if (poolApy) {
        apr = +new BigNumber(poolApy)
          .plus(new BigNumber(apr || 0).multipliedBy(100).toFixed())
          .toFixed();
      }
    }
    return apr;
  }
  function getPoolFeeApr(dayVolume: string, seed: Seed) {
    let result = "0";
    if (dayVolume) {
      if (seed.pool) {
        const { total_fee, tvl } = seed.pool;
        const revenu24h = (total_fee / 10000) * 0.8 * Number(dayVolume);
        if (tvl > 0 && revenu24h > 0) {
          const annualisedFeesPrct = ((revenu24h * 365) / tvl) * 100;
          const half_annualisedFeesPrct = annualisedFeesPrct;
          result = toPrecision(half_annualisedFeesPrct.toString(), 2);
        }
      }
    }
    return result;
  }
  function sortFarms(s?: string) {
    const sort_v = s || sort;
    if (sort_v == "apr") {
      farm_display_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = `${item1.pool?.id ?? item1.pool?.pool_id}`;
        const item2PoolId = `${item2.pool?.id ?? item2.pool?.pool_id}`;
        const item1Front = frontConfigBoost[item1PoolId] ?? 0;
        const item2Front = frontConfigBoost[item2PoolId] ?? 0;
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        const item1Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item1)));
        const item2Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item2)));
        return Number(item2Apr) - Number(item1Apr);
      });
      farm_display_ended_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = `${item1.pool?.id ?? item1.pool?.pool_id}`;
        const item2PoolId = `${item2.pool?.id ?? item2.pool?.pool_id}`;
        const item1Front = frontConfigBoost[item1PoolId] ?? 0;
        const item2Front = frontConfigBoost[item2PoolId] ?? 0;
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        const item1Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item1)));
        const item2Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item2)));
        return Number(item2Apr) - Number(item1Apr);
      });
    } else if (sort_v == "tvl") {
      farm_display_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = `${item1.pool?.id}`;
        const item2PoolId = `${item2.pool?.id}`;
        const item1Front = frontConfigBoost[item1PoolId] ?? 0;
        const item2Front = frontConfigBoost[item2PoolId] ?? 0;
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        return Number(item2.seedTvl) - Number(item1.seedTvl);
      });
      farm_display_ended_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = `${item1.pool?.id}`;
        const item2PoolId = `${item2.pool?.id}`;
        const item1Front = frontConfigBoost[item1PoolId] ?? 0;
        const item2Front = frontConfigBoost[item2PoolId] ?? 0;
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        return Number(item2.seedTvl) - Number(item1.seedTvl);
      });
    }
    set_farm_display_List(farm_display_List);
    set_farm_display_ended_List(Array.from(farm_display_ended_List));
  }
  function split_point_string(str: string) {
    const arr = Array.from(str);
    let index = -1;
    for (let i = 0; i < arr.length; i++) {
      if (str[i] == "-" && i !== 0) {
        index = i;
        break;
      }
    }
    return [str.slice(0, index), str.slice(index + 1)];
  }
  function isEnded(seed: Seed) {
    const farms = seed.farmList;
    if (farms && farms.length > 0) {
      return farms[0].status == "Ended";
    }
    return false;
  }
  function isInMonth(seed: Seed) {
    const endedStatus = isEnded(seed);
    if (endedStatus) return false;
    const farmList = seed.farmList;
    const result = farmList?.find((farm: FarmBoost) => {
      const start_at = farm?.terms?.start_at;
      if (start_at == 0) return true;
      const one_month_seconds = 15 * 24 * 60 * 60;
      const currentA = new Date().getTime();
      const compareB = new BigNumber(start_at)
        .plus(one_month_seconds)
        .multipliedBy(1000);
      const compareResult = compareB.minus(currentA);
      if (compareResult.isGreaterThan(0)) {
        return true;
      }
    });
    if (result) return true;
    return false;
  }
  function getAllEndedFarms() {
    const allEndedFarms = farm_display_List.filter((seed: Seed) => {
      if (
        seed.farmList &&
        seed.farmList.length > 0 &&
        seed.farmList[0].status == "Ended"
      ) {
        return true;
      }
    });
    return JSON.parse(JSON.stringify(allEndedFarms));
  }
  function mergeCommonSeedsFarms() {
    const tempMap: { [key: string]: Seed[] } = {};
    const list = JSON.parse(JSON.stringify(farm_display_List));
    list.forEach((seed: Seed) => {
      const { seed_id } = seed;
      tempMap[seed_id] = tempMap[seed_id] || [];
      tempMap[seed_id].push(seed);
    });
    return tempMap;
  }
  function getUrlParams() {
    try {
      // http://localhost:1234/v2farms/USDC<>NEAR@2000[406600-408600]-r new link
      // phoenix-bonds.near|wrap.near|2000&3080&4040-r
      const pathArr = location.pathname.split("/");
      const layer1 = decodeURIComponent(pathArr[2] || "");
      if (layer1) {
        if (layer1.indexOf("<>") > -1 || layer1.indexOf("|") > -1) {
          // dcl link
          if (layer1.indexOf("<>") == -1) {
            // compatible with old link
            const [tokena_id, tokenb_id, fee_p_s] = layer1.split("|");
            const [fee_p, status] = fee_p_s.split("-");
            const [fee, lp, rp] = fee_p.split("&");
            const replace_str = `${get_pool_name(
              `${tokena_id}|${tokenb_id}|${fee}`
            )}[${lp}-${rp}]-${status}`;
            location.replace(`/v2farms/${replace_str}`);
            return layer1;
          }
          const layer2 = layer1.split("[");
          const pool_id = get_pool_id(layer2[0]);
          const point_str = layer2[1].substring(0, layer2[1].length - 3);
          const status = layer2[1].substring(layer2[1].length - 1);
          const p_arr = split_point_string(point_str);
          const [lp, rp] = p_arr;
          return `${pool_id}&${lp}&${rp}-${status}`;
        } else {
          // classic link
          return layer1;
        }
      }
    } catch (error) {
      return "";
    }

    return "";
  }
  function getSpecialSeed({
    tokenPriceList,
    farm_display_List,
    loveSeed,
  }: {
    tokenPriceList: any;
    farm_display_List: Seed[];
    loveSeed: Seed;
  }) {
    const paramStr = getUrlParams() || "";
    if (paramStr) {
      let is_dcl_pool = false;
      const idArr = [
        paramStr.slice(0, paramStr.length - 2),
        paramStr.slice(-1),
      ];
      const mft_id = decodeURIComponent(idArr[0]);
      const farmsStatus = idArr[1];
      if (mft_id.split("|").length > 1) {
        is_dcl_pool = true;
      }
      const targetFarms = farm_display_List.find((seed: Seed) => {
        const { seed_id, farmList } = seed;
        if (farmList && farmList.length > 0) {
          const status = farmList[0].status;
          const id = getPoolIdBySeedId(seed_id);
          if (is_dcl_pool) {
            const [contractId, temp_pool_id] = seed_id.split("@");
            if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
              const [fixRange, pool_id, left_point, right_point] =
                temp_pool_id.split("&");
              const temp = `${pool_id}&${left_point}&${right_point}`;
              if (farmsStatus == "r" && status != "Ended" && mft_id == temp)
                return true;
              if (farmsStatus == "e" && status == "Ended" && mft_id == temp)
                return true;
            }
          } else {
            if (farmsStatus == "r" && status != "Ended" && mft_id == id)
              return true;
            if (farmsStatus == "e" && status == "Ended" && mft_id == id)
              return true;
          }
        }
      });
      if (!targetFarms) {
        router.push("/v2farms");
      } else {
        getDetailData({
          detailData: targetFarms,
          tokenPriceList,
          loveSeed,
          all_seeds: farm_display_List,
        });
      }
    }
  }
  function searchByCondition(from?: string) {
    farm_display_List = farm_display_List.sort();
    farm_display_ended_List = farm_display_ended_List.sort();
    let noDataEnd = true,
      noDataLive = true;
    const commonSeedFarms = mergeCommonSeedsFarms();
    const farmClassification = getFarmClassification();
    // filter
    farm_display_List.forEach((seed: Seed) => {
      const { pool, seed_id, farmList } = seed || {};
      const isEnd =
        farmList && farmList.length > 0
          ? farmList[0].status === "Ended"
          : false;
      const user_seed = user_seeds_map ? user_seeds_map[seed_id] : undefined;
      const userStaked = user_seed ? Object.keys(user_seed).length > 0 : false;
      const tokens_meta_data = pool ? pool.tokens_meta_data : undefined;
      const token_symbols: string[] = [];
      if (tokens_meta_data) {
        tokens_meta_data.forEach((token: TokenMetadata) => {
          token_symbols.push(token.symbol);
        });
      }
      const [contractId] = seed_id.split("@");
      let condition1, condition2, condition3, condition4;
      const is_dcl_farm = contractId == REF_UNI_V3_SWAP_CONTRACT_ID;
      // farm status
      if (isEnd) {
        condition4 = false;
      } else {
        condition4 = true;
      }
      // farm_type
      if (farmTab == "yours") {
        condition3 = true;
        condition4 = true;
      }
      if (farm_type_selectedId == "all") {
        condition3 = true;
      } else if (farm_type_selectedId == "dcl") {
        if (is_dcl_farm) {
          condition3 = true;
        } else {
          condition3 = false;
        }
      } else if (farm_type_selectedId == "classic") {
        if (!is_dcl_farm) {
          condition3 = true;
        } else {
          condition3 = false;
        }
      }
      // filter_type
      if (farmTab == "yours") {
        if (userStaked) {
          const commonSeedFarmList = commonSeedFarms[seed_id] || [];
          if (commonSeedFarmList.length == 2 && isEnd) {
            condition1 = false;
          } else {
            condition1 = true;
          }
        }
      } else if (filter_type_selectedId == "all") {
        condition1 = true;
      } else if (filter_type_selectedId == "boost" && boostConfig) {
        const affected_seeds_keys = Object.keys(boostConfig.affected_seeds);
        if (affected_seeds_keys.indexOf(seed_id) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == "near") {
        if (farmClassification.near.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == "eth") {
        if (farmClassification.eth.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition3 = false;
        }
      } else if (filter_type_selectedId == "stable") {
        if (
          farmClassification.stable.indexOf(getPoolIdBySeedId(seed_id)) > -1
        ) {
          condition1 = true;
        } else {
          condition3 = false;
        }
      } else if (filter_type_selectedId == "meme") {
        if (farmClassification.meme.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition3 = false;
        }
      } else if (filter_type_selectedId == "others") {
        // others
        const isNotNear =
          farmClassification.near.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotEth =
          farmClassification.eth.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotStable =
          farmClassification.stable.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotMeme =
          farmClassification.meme.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        if (isNotNear && isNotEth && isNotStable && isNotMeme) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == "new") {
        if (!is_dcl_farm) {
          // in month
          const m = isInMonth(seed);
          if (m) {
            condition1 = true;
          } else {
            condition1 = false;
          }
        } else {
          // new dcl
          condition1 = false;
          const matched_seeds = get_matched_seeds_for_dcl_pool({
            seeds: farm_display_List,
            pool_id: pool?.pool_id || "",
            sort: "new",
          });
          if (matched_seeds.length > 1) {
            const latestSeed = matched_seeds[0];
            if (latestSeed.seed_id == seed.seed_id) {
              condition1 = true;
            }
          } else if (!condition1) {
            // in month
            const m = isInMonth(seed);
            if (m) {
              condition1 = true;
            } else {
              condition1 = false;
            }
          }
        }
      }
      // key words
      if (keyWords) {
        for (let i = 0; i < token_symbols.length; i++) {
          if (
            token_symbols[i].toLowerCase().indexOf(keyWords.toLowerCase()) > -1
          ) {
            condition2 = true;
            break;
          } else {
            condition2 = false;
          }
        }
      } else {
        condition2 = true;
      }
      if (condition1 && condition2 && condition3 && condition4) {
        seed.hidden = false;
        noDataLive = false;
      } else {
        seed.hidden = true;
      }
    });
    farm_display_ended_List.forEach((seed: Seed) => {
      const { pool, seed_id } = seed;
      const tokens_meta_data = pool?.tokens_meta_data || [];
      const token_symbols: string[] = [];
      tokens_meta_data.forEach((token: TokenMetadata) => {
        token_symbols.push(token.symbol);
      });
      const [contractId] = seed_id.split("@");
      const is_dcl_farm = contractId == REF_UNI_V3_SWAP_CONTRACT_ID;
      let condition1, condition3;
      let condition2 = true;
      // farm_type
      if (farm_type_selectedId == "all") {
        condition3 = true;
      } else if (farm_type_selectedId == "dcl") {
        if (is_dcl_farm) {
          condition3 = true;
        } else {
          condition3 = false;
        }
      } else if (farm_type_selectedId == "classic") {
        if (!is_dcl_farm) {
          condition3 = true;
        } else {
          condition3 = false;
        }
      }
      // filter_type
      if (filter_type_selectedId == "all") {
        condition1 = true;
      } else if (filter_type_selectedId == "boost" && boostConfig) {
        const affected_seeds_keys = Object.keys(boostConfig.affected_seeds);
        if (affected_seeds_keys.indexOf(seed_id) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == "near") {
        if (farmClassification.near.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == "eth") {
        if (farmClassification.eth.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == "stable") {
        if (
          farmClassification.stable.indexOf(getPoolIdBySeedId(seed_id)) > -1
        ) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == "meme") {
        if (farmClassification.meme.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == "others") {
        const isNotNear =
          farmClassification.near.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotEth =
          farmClassification.eth.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotStable =
          farmClassification.stable.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotMeme =
          farmClassification.stable.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        if (isNotNear && isNotEth && isNotStable && isNotMeme) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      }

      if (keyWords) {
        for (let i = 0; i < token_symbols.length; i++) {
          if (
            token_symbols[i].toLowerCase().indexOf(keyWords.toLowerCase()) > -1
          ) {
            condition2 = true;
            break;
          } else {
            condition2 = false;
          }
        }
      }
      if (condition1 && condition2 && condition3) {
        seed.hidden = false;
        noDataEnd = false;
      } else {
        seed.hidden = true;
      }
    });
    // displayed dcl farms
    const dcl_farms = farm_display_List.filter((seed: Seed) => {
      const { seed_id, hidden } = seed;
      const [contractId] = seed_id.split("@");
      const is_dcl_farm = contractId == REF_UNI_V3_SWAP_CONTRACT_ID;
      return is_dcl_farm && !hidden;
    });
    if (farmTab == "yours") {
      setNoData(noDataLive);
    } else {
      setNoData(noDataEnd && noDataLive);
    }
    if (from == "main") {
      setHomePageLoading(false);
    }
    // sort
    if (dcl_farms.length > 0) {
      set_has_dcl_farms_in_display_list(true);
      sortFarms("apr");
      setSort("apr");
    } else {
      sortFarms(sort);
      set_has_dcl_farms_in_display_list(false);
    }
    // if (keyWords) {
    //   setShowEndedFarmList(true);
    // } else {
    //   setShowEndedFarmList(false);
    // }
  }
  async function getFarmDataList(initData: any) {
    const { list_seeds, tokenPriceList, defultPools } = initData;
    // console.log(defultPools, "list_seeds");
    const promise_new_list_seeds = list_seeds.map(async (newSeed: Seed) => {
      const {
        seed_id,
        farmList,
        total_seed_amount,
        total_seed_power,
        seed_decimal,
      } = newSeed;
      const [contractId, temp_pool_id] = seed_id.split("@");
      let is_dcl_pool = false;
      if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
        is_dcl_pool = true;
      }
      const poolId = getPoolIdBySeedId(seed_id);
      const pool = defultPools?.find((pool: PoolRPCView & IPoolDcl) => {
        if (is_dcl_pool) {
          if (pool.pool_id == poolId) return true;
        } else {
          if (+pool.id == +poolId) return true;
        }
      });
      let token_ids: string[] = [];
      if (pool) {
        if (is_dcl_pool) {
          const [token_x, token_y, fee] = poolId.split("|");
          token_ids.push(token_x, token_y);
        } else {
          const { token_account_ids } = pool;
          token_ids = token_account_ids;
        }
      }
      const promise_token_meta_data: Promise<any>[] = [];
      token_ids?.forEach(async (tokenId: string) => {
        promise_token_meta_data.push(ftGetTokenMetadata(tokenId));
      });
      const tokens_meta_data = await Promise.all(promise_token_meta_data);
      if (pool) {
        pool.tokens_meta_data = tokens_meta_data;
      }
      const promise_farm_meta_data =
        farmList?.map(async (farm: FarmBoost) => {
          const tokenId = farm.terms.reward_token;
          const tokenMetadata = await ftGetTokenMetadata(tokenId);
          farm.token_meta_data = tokenMetadata;
          return farm;
        }) ?? [];
      await Promise.all(promise_farm_meta_data);
      // get seed tvl
      const DECIMALS = seed_decimal;
      const seedTotalStakedAmount = toReadableNumber(
        DECIMALS,
        total_seed_amount
      );
      let single_lp_value = "0";
      if (is_dcl_pool) {
        const [fixRange, dcl_pool_id, left_point, right_point] =
          temp_pool_id.split("&");
        const [token_x, token_y] = dcl_pool_id.split("|");
        const [token_x_meta, token_y_meta] = tokens_meta_data;
        const price_x = tokenPriceList[token_x]?.price || "0";
        const price_y = tokenPriceList[token_y]?.price || "0";
        const temp_valid = +right_point - +left_point;
        const range_square = Math.pow(temp_valid, 2);
        const amount = new BigNumber(Math.pow(10, 12))
          .dividedBy(range_square)
          .toFixed();
        single_lp_value = get_total_value_by_liquidity_amount_dcl({
          left_point: +left_point,
          right_point: +right_point,
          amount,
          poolDetail: pool,
          price_x_y: { [token_x]: price_x, [token_y]: price_y },
          metadata_x_y: { [token_x]: token_x_meta, [token_y]: token_y_meta },
        });
      } else {
        if (pool) {
          const { tvl, id, shares_total_supply } = pool;
          const poolShares = Number(
            toReadableNumber(DECIMALS, shares_total_supply)
          );
          if (poolShares == 0) {
            single_lp_value = "0";
          } else {
            single_lp_value = (tvl / poolShares).toString();
          }
        }
      }
      const seedTotalStakedPower = toReadableNumber(DECIMALS, total_seed_power);
      const seedTvl = new BigNumber(seedTotalStakedAmount)
        .multipliedBy(single_lp_value)
        .toFixed();
      const seedPowerTvl = new BigNumber(seedTotalStakedPower)
        .multipliedBy(single_lp_value)
        .toFixed();
      // get apr per farm
      farmList?.forEach((farm: FarmBoost) => {
        const { token_meta_data } = farm;
        const { daily_reward, reward_token } = farm.terms;
        if (token_meta_data) {
          const readableNumber = toReadableNumber(
            token_meta_data.decimals,
            daily_reward
          );
          const reward_token_price = Number(
            tokenPriceList[reward_token]?.price || 0
          );
          const apr =
            +seedPowerTvl == 0
              ? "0"
              : new BigNumber(readableNumber)
                  .multipliedBy(365)
                  .multipliedBy(reward_token_price)
                  .dividedBy(seedPowerTvl)
                  .toFixed();
          const baseApr =
            +seedTvl == 0
              ? "0"
              : new BigNumber(readableNumber)
                  .multipliedBy(365)
                  .multipliedBy(reward_token_price)
                  .dividedBy(seedTvl)
                  .toFixed();
          farm.apr = apr;
          farm.baseApr = baseApr;
        }
      });
      newSeed.pool = pool;
      newSeed.seedTvl = seedTvl || "0";
    });
    await Promise.all(promise_new_list_seeds);
    // split ended farms
    const ended_split_list_seeds: Seed[] = [];
    list_seeds.forEach((seed: Seed) => {
      const { farmList } = seed;
      if (Array.isArray(farmList)) {
        const endedList = farmList.filter(
          (farm: FarmBoost) => farm.status == "Ended"
        );
        const noEndedList = farmList.filter(
          (farm: FarmBoost) => farm.status != "Ended"
        );

        if (endedList.length > 0 && noEndedList.length > 0) {
          seed.farmList = noEndedList;
          const endedSeed = JSON.parse(JSON.stringify(seed));
          endedSeed.farmList = endedList;
          endedSeed.endedFarmsIsSplit = true;
          ended_split_list_seeds.push(endedSeed);
        }
      }
    });

    const total_list_seeds = list_seeds.concat(ended_split_list_seeds);
    farm_display_List = total_list_seeds;
    farm_display_ended_List = getAllEndedFarms();
    set_farm_display_List(farm_display_List);
    set_farm_display_ended_List(farm_display_ended_List);
    // for detail page data
    getSpecialSeed({
      tokenPriceList,
      farm_display_List,
      loveSeed: loveSeed as Seed,
    });
    searchByCondition("main");
  }
  // console.log(accountId, "accountId11111");
  async function get_user_seeds_and_unClaimedRewards() {
    // get user seeds
    const list_user_seeds = await list_farmer_seeds();
    set_user_seeds_map(list_user_seeds);
    // get user unclaimed rewards
    const userUncliamedRewards = {} as { [key: string]: any };
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
    // get user unclaimed token meta
    const unclaimed_token_meta_datas = {} as { [key: string]: any };
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
    setUserDataLoading(false);
    // for detail page
    getDetailData_user_data({
      user_seeds_map: list_user_seeds,
      user_unclaimed_token_meta_map: unclaimed_token_meta_datas,
      user_unclaimed_map: userUncliamedRewards,
    });
    searchByCondition();
    console.log("执行更新奖励数据");
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
  async function getLoveTokenBalance() {
    // get LoveToken balance
    if (accountId && REF_VE_CONTRACT_ID) {
      const loveBalance = await getLoveAmount();
      setLoveTokenBalance(toReadableNumber(LOVE_TOKEN_DECIMAL, loveBalance));
    }
  }
  function getYourFarmsQuantity() {
    const yourSeeds: Seed[] = [];
    // filter out yours
    farm_display_List.forEach((seed: Seed) => {
      const { seed_id, farmList } = seed;
      const isEnd =
        farmList && farmList.length > 0 ? farmList[0].status == "Ended" : false;
      const user_seed = user_seeds_map ? user_seeds_map[seed_id] : undefined;
      const userStaked = user_seed ? Object.keys(user_seed).length > 0 : false;

      let condition;
      const commonSeedFarms = mergeCommonSeedsFarms();

      if (userStaked) {
        const commonSeedFarmList = commonSeedFarms[seed_id] || [];
        if (commonSeedFarmList.length == 2 && isEnd) {
          condition = false;
        } else {
          condition = true;
        }
      }
      if (condition) {
        yourSeeds.push(seed);
      }
    });
    set_your_seeds_quantity(yourSeeds.length.toString());
  }
  function searchByKeyWords(value: string) {
    setKeyWords(value);
  }
  function changeSort(sortKey: any) {
    setSort(sortKey);
  }
  function switchFarmTab(tab: string) {
    setFarmTab(tab);
    if (tab == "yours") {
      // set_farm_type_selectedId("all");
      set_filter_type_selectedId("all");
    }
  }
  return (
    <main className={`dark:text-white ${getUrlParams() ? "hidden" : ""}`}>
      {/* pc */}
      <div className="xsm:hidden">
        {/* title */}
        <div className="bg-farmTitleBg fccc w-full pt-12 pb-1.5">
          <WithDrawBox
            userRewardList={user_unWithdraw_rewards}
            tokenPriceList={tokenPriceList}
            farmDisplayList={farm_display_List}
            get_user_unWithDraw_rewards={get_user_unWithDraw_rewards}
          ></WithDrawBox>
          <div className="frcb 2xl:w-3/5 xl:w-9/12 lg:w-4/5">
            <div className="frcc border border-dark-40 rounded-md p-0.5">
              <SelectBox
                list={farmTypeList}
                containerClass="lg:mr-2.5 xsm:mr-1"
                type="farm_type"
                selectedId={farm_type_selectedId}
                setSelectedId={set_farm_type_selectedId}
              ></SelectBox>
            </div>
            <div className="frcc">
              <div className="frcc text-sm mr-10">
                <p className="text-gray-60 mr-2">Sort by:</p>
                {Object.keys(sortList).map((item, index) => {
                  const value = sortList[item];
                  const disabled =
                    has_dcl_farms_in_display_list && item == "tvl";
                  return (
                    <div
                      className={`flex items-center justify-between rounded-lg h-9  px-3 py-0.5 ml-1 text-xs ${
                        sort == item ? "text-white" : "text-gray-60"
                      } ${
                        disabled
                          ? "text-opacity-50 cursor-not-allowed"
                          : "hover:bg-cardBg cursor-pointer"
                      }`}
                      key={index}
                      onClick={() => {
                        if (disabled) return;
                        changeSort(item);
                      }}
                    >
                      {value}
                      <FarmDownArrown
                        className="ml-2"
                        strokeColor={sort === item ? "#9EFE01" : "#7E8A93"}
                      />
                    </div>
                  );
                })}
              </div>
              <div
                className={`border border-gray-100 w-52 h-9 frc p-1 rounded ${
                  keyWords ? "border border-borderLightBlueColor" : ""
                }`}
              >
                <input
                  ref={searchRef}
                  type="text"
                  className="border-none w-40 bg-transparent outline-none caret-white mr-1 ml-1 text-white text-sm"
                  onWheel={(event) => searchRef.current?.blur()}
                  onChange={({ target }) => searchByKeyWords(target.value)}
                  placeholder="Search Farms by token"
                ></input>
                <span
                  className={`${
                    keyWords ? "text-lightGreenColor" : "text-gray-10"
                  }`}
                >
                  <SearchIcon />
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* content */}
        <div className="mx-auto 2xl:w-3/5 xl:w-9/12 lg:w-4/5 pt-10">
          {/* select */}
          <div className="frcb mb-3.5">
            <div className="frcc">
              <SelectBox
                list={filterTypeList}
                type="filter"
                disabled={farmTab == "yours"}
                selectedId={filter_type_selectedId}
                setSelectedId={set_filter_type_selectedId}
              ></SelectBox>
            </div>
            {!homePageLoading && getUrlParams() ? null : !homePageLoading ? (
              <div className="frcc">
                {accountId ? (
                  <div
                    className="frcc cursor-pointer"
                    onClick={() => {
                      if (farmTab === "yours") {
                        switchFarmTab("all");
                      } else {
                        switchFarmTab("yours");
                        if (showEndedFarmList) {
                          setShowEndedFarmList(false);
                        }
                      }
                    }}
                  >
                    {farmTab === "yours" ? (
                      <CheckboxSelected></CheckboxSelected>
                    ) : (
                      <Checkbox></Checkbox>
                    )}
                    <span className="ml-1.5 text-gray-10 text-sm">
                      Staked only
                    </span>
                  </div>
                ) : null}
                <div
                  className="frcc ml-6 cursor-pointer"
                  onClick={() => {
                    if (showEndedFarmList === true) {
                      setShowEndedFarmList(false);
                    } else {
                      setShowEndedFarmList(true);
                      if (farmTab === "yours") {
                        setFarmTab("all");
                      }
                    }
                  }}
                >
                  {showEndedFarmList === true ? (
                    <CheckboxSelected></CheckboxSelected>
                  ) : (
                    <Checkbox></Checkbox>
                  )}
                  <span className="ml-1.5 text-gray-10 text-sm">
                    Show Ended Farms
                  </span>
                </div>
              </div>
            ) : null}
          </div>
          {/* list */}
          <div className="mb-8">
            {homePageLoading && getUrlParams() ? null : homePageLoading ? (
              <div className="flex justify-between">
                <SkeletonTheme
                  baseColor="rgba(33, 43, 53, 0.3)"
                  highlightColor="#2A3643"
                  duration={3}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                    <div className="w-full">
                      <Skeleton
                        width="100%"
                        height={200}
                        count={2}
                        className="mt-4"
                      />
                    </div>
                    <div className="w-full">
                      <Skeleton
                        width="100%"
                        height={200}
                        count={2}
                        className="mt-4"
                      />
                    </div>
                    <div className="w-full">
                      <Skeleton
                        width="100%"
                        height={200}
                        count={2}
                        className="mt-4"
                      />
                    </div>
                    <div className="w-full">
                      <Skeleton
                        width="100%"
                        height={200}
                        count={2}
                        className="mt-4"
                      />
                    </div>
                    <div className="w-full">
                      <Skeleton
                        width="100%"
                        height={200}
                        count={2}
                        className="mt-4"
                      />
                    </div>
                    <div className="w-full">
                      <Skeleton
                        width="100%"
                        height={200}
                        count={2}
                        className="mt-4"
                      />
                    </div>
                  </div>
                </SkeletonTheme>
              </div>
            ) : farm_display_List.every((seed: any) => seed.hidden) &&
              (!showEndedFarmList ||
                farm_display_ended_List.every((seed: any) => seed.hidden)) ? (
              <NoContent />
            ) : (
              <>
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-6 m-auto ">
                  {farm_display_List.map((seed: Seed, index: number) => {
                    return (
                      <div
                        key={seed.seed_id + index}
                        className={seed.hidden ? "hidden" : ""}
                      >
                        <FarmView
                          seed={seed}
                          all_seeds={farm_display_List}
                          tokenPriceList={tokenPriceList}
                          getDetailData={getDetailData}
                          dayVolumeMap={dayVolumeMap}
                          boostConfig={boostConfig || ({} as BoostConfig)}
                          loveSeed={loveSeed || ({} as Seed)}
                          user_seeds_map={user_seeds_map}
                          user_unclaimed_map={user_unclaimed_map}
                          user_unclaimed_token_meta_map={
                            user_unclaimed_token_meta_map
                          }
                          maxLoveShareAmount={maxLoveShareAmount}
                        ></FarmView>
                      </div>
                    );
                  })}
                  {showEndedFarmList ? (
                    <>
                      {farm_display_ended_List.map(
                        (seed: Seed, index: number) => {
                          return (
                            <div
                              key={seed.seed_id + index}
                              className={seed.hidden ? "hidden" : ""}
                            >
                              <FarmView
                                seed={seed}
                                all_seeds={farm_display_List}
                                tokenPriceList={tokenPriceList}
                                getDetailData={getDetailData}
                                dayVolumeMap={dayVolumeMap}
                                boostConfig={boostConfig || ({} as BoostConfig)}
                                loveSeed={loveSeed || ({} as Seed)}
                                user_seeds_map={user_seeds_map}
                                user_unclaimed_map={user_unclaimed_map}
                                user_unclaimed_token_meta_map={
                                  user_unclaimed_token_meta_map
                                }
                                maxLoveShareAmount={maxLoveShareAmount}
                              ></FarmView>
                            </div>
                          );
                        }
                      )}
                    </>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* mobile */}
      <div className="lg:hidden">
        <div className="bg-white bg-opacity-5 px-3 pb-3.5">
          <div className="w-full bg-farmMobileBgColor p-4 rounded-tl-xl rounded-tr-xl text-black mb-3.5">
            <p className="text-sm text-dark-230 text-opacity-80 mb-1">
              Claimed Rewards
            </p>
            <WithDrawBox
              userRewardList={user_unWithdraw_rewards}
              tokenPriceList={tokenPriceList}
              farmDisplayList={farm_display_List}
              get_user_unWithDraw_rewards={get_user_unWithDraw_rewards}
            ></WithDrawBox>
          </div>
          <div className="mb-5 flex border border-dark-40 rounded-md">
            <SelectBox
              list={farmTypeList}
              containerClass="lg:mr-2.5 xsm:mr-1"
              type="farm_type"
              selectedId={farm_type_selectedId}
              setSelectedId={set_farm_type_selectedId}
            ></SelectBox>
          </div>
          <div className="flex items-center mb-4">
            <div
              className={`bg-gray-60 bg-opacity-15 w-8/12 h-9 frc p-2 rounded ${
                keyWords ? "border border-borderLightBlueColor" : ""
              }`}
            >
              <span
                className={`${
                  keyWords ? "text-lightGreenColor" : "text-gray-10"
                }`}
              >
                <SearchIcon />
              </span>
              <input
                ref={searchRef}
                type="text"
                className="border-none w-40 bg-transparent outline-none caret-white mr-1 ml-1 text-white text-sm"
                onWheel={(event) => searchRef.current?.blur()}
                onChange={({ target }) => searchByKeyWords(target.value)}
                placeholder="Search Farms"
              ></input>
            </div>
            <div className="ml-4 frcc">
              <FarmSortMobIcon />
              {Object.keys(sortList).map((item, index) => {
                const value = sortList[item];
                const disabled = has_dcl_farms_in_display_list && item == "tvl";
                return (
                  <div
                    className={`flex items-center rounded-lg h-9  px-3 py-0.5 ml-1 text-xs ${
                      sort == item ? "text-white" : "text-gray-60"
                    } ${
                      disabled
                        ? "text-opacity-50 cursor-not-allowed"
                        : "hover:bg-cardBg cursor-pointer"
                    }`}
                    key={index}
                    onClick={() => {
                      if (disabled) return;
                      changeSort(item);
                    }}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          </div>
          <SelectBox
            list={filterTypeList}
            type="filter"
            disabled={farmTab == "yours"}
            selectedId={filter_type_selectedId}
            setSelectedId={set_filter_type_selectedId}
          ></SelectBox>
        </div>
        <div className="py-7 px-4">
          {!homePageLoading && getUrlParams() ? null : !homePageLoading ? (
            <div className="flex mb-6">
              {accountId ? (
                <div
                  className="frcc cursor-pointer"
                  onClick={() => {
                    if (farmTab === "yours") {
                      switchFarmTab("all");
                    } else {
                      switchFarmTab("yours");
                      if (showEndedFarmList) {
                        setShowEndedFarmList(false);
                      }
                    }
                  }}
                >
                  {farmTab === "yours" ? (
                    <CheckboxSelected></CheckboxSelected>
                  ) : (
                    <Checkbox></Checkbox>
                  )}
                  <span className="ml-1.5 text-gray-10 text-sm">
                    Staked only
                  </span>
                </div>
              ) : null}
              <div
                className="frcc ml-6 cursor-pointer"
                onClick={() => {
                  if (showEndedFarmList === true) {
                    setShowEndedFarmList(false);
                  } else {
                    setShowEndedFarmList(true);
                    if (farmTab === "yours") {
                      setFarmTab("all");
                    }
                  }
                }}
              >
                {showEndedFarmList === true ? (
                  <CheckboxSelected></CheckboxSelected>
                ) : (
                  <Checkbox></Checkbox>
                )}
                <span className="ml-1.5 text-gray-10 text-sm">
                  Show Ended Farms
                </span>
              </div>
            </div>
          ) : null}
          {homePageLoading && getUrlParams() ? null : homePageLoading ? (
            <div className="flex justify-between">
              <SkeletonTheme
                baseColor="rgba(33, 43, 53, 0.3)"
                highlightColor="#2A3643"
                duration={3}
              >
                <Skeleton
                  style={{ width: "100%" }}
                  height={200}
                  count={2}
                  className="mt-4"
                />
              </SkeletonTheme>
            </div>
          ) : farm_display_List.every((seed: any) => seed.hidden) &&
            (!showEndedFarmList ||
              farm_display_ended_List.every((seed: any) => seed.hidden)) ? (
            <NoContent />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-10 gap-y-6 m-auto pb-6">
                {farm_display_List.map((seed: Seed, index: number) => {
                  return (
                    <div
                      key={seed.seed_id + index}
                      className={
                        seed.hidden
                          ? "hidden"
                          : index < 2
                          ? "bg-farmItemBg rounded-lg"
                          : "bg-gray-20 bg-opacity-30 rounded-lg"
                      }
                    >
                      <FarmView
                        seed={seed}
                        all_seeds={farm_display_List}
                        tokenPriceList={tokenPriceList}
                        getDetailData={getDetailData}
                        dayVolumeMap={dayVolumeMap}
                        boostConfig={boostConfig || ({} as BoostConfig)}
                        loveSeed={loveSeed || ({} as Seed)}
                        user_seeds_map={user_seeds_map}
                        user_unclaimed_map={user_unclaimed_map}
                        user_unclaimed_token_meta_map={
                          user_unclaimed_token_meta_map
                        }
                        maxLoveShareAmount={maxLoveShareAmount}
                      ></FarmView>
                    </div>
                  );
                })}
                {showEndedFarmList ? (
                  <>
                    {farm_display_ended_List.map(
                      (seed: Seed, index: number) => {
                        return (
                          <div
                            key={seed.seed_id + index}
                            className={
                              seed.hidden
                                ? "hidden"
                                : "bg-gray-20 opacity-50 rounded-lg"
                            }
                          >
                            <FarmView
                              seed={seed}
                              all_seeds={farm_display_List}
                              tokenPriceList={tokenPriceList}
                              getDetailData={getDetailData}
                              dayVolumeMap={dayVolumeMap}
                              boostConfig={boostConfig || ({} as BoostConfig)}
                              loveSeed={loveSeed || ({} as Seed)}
                              user_seeds_map={user_seeds_map}
                              user_unclaimed_map={user_unclaimed_map}
                              user_unclaimed_token_meta_map={
                                user_unclaimed_token_meta_map
                              }
                              maxLoveShareAmount={maxLoveShareAmount}
                            ></FarmView>
                          </div>
                        );
                      }
                    )}
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default React.memo(FarmsPage);
