import React, { useEffect, useState, useMemo } from "react";
import { vaultConfig, VaultColorConfig } from "./vaultConfig";
import { openUrl } from "@/services/commonV3";
import { useRouter } from "next/router";
import { getSearchResult } from "@/services/pool";
import {
  getBurrowApy,
  getDeltaGridApy,
  getDeltaSwingApy,
  getDeltaDCAApy,
} from "./apy";
import { usePoolStore } from "@/stores/pool";

const fetchMaxApr = async (poolType, label) => {
  try {
    const res: any = await getSearchResult({
      type: poolType,
      sort: "apy",
      limit: "20",
      offset: "0",
      hide_low_pool: true,
      order: "desc",
      token_type: "",
      token_list: "",
      pool_id_list: "",
      onlyUseId: false,
      labels: label,
    });

    if (res?.list?.length > 0) {
      const aprs = res.list.map((item) => item.apy * 1 + item.farm_apy * 1);
      return Math.max(...aprs);
    }
  } catch (error) {
    console.error(`Failed to fetch APR for ${poolType}:`, error);
  }
  return 0; // Default value if no data is available
};

export default function VaultList(props: any) {
  const { currentTag } = props;
  const router = useRouter();
  const poolStore = usePoolStore();
  const blink = (params: any) => {
    if (params?.path) {
      if (["classic", "dcl", "stable"].includes(params.name)) {
        poolStore.setPoolActiveTab(params.name);
        poolStore.setClassicHideLowTVL(true);
      }
      router.push(params.path + "?vault=true");
    }
    if (params?.url) {
      openUrl(params.url + "?vault=true");
    }
  };
  // pool
  const [classicApr, setClassicApr] = useState(0);
  const [stableApr, setStableApr] = useState(0);
  const [dclApr, setDclApr] = useState(0);

  // farm
  const [classicAprFarm, setClassicAprFarm] = useState(0);
  const [stableAprFarm, setStableAprFarm] = useState(0);
  const [dclAprFarm, setDclAprFarm] = useState(0);

  // burrow
  const [burrowApr, setBurrowApr] = useState(0);

  // delta
  const [gridApr, setGridApr] = useState(0);
  const [swingApr, setSwingApr] = useState(0);
  const [dcaApr, setDcaApr] = useState(0);

  const maxFarm = useMemo(
    () => Math.max(classicAprFarm, stableAprFarm, dclAprFarm),
    [classicAprFarm, stableAprFarm, dclAprFarm]
  );

  useEffect(() => {
    // Concurrently fetch APR values for all pool types
    const fetchAllAprs = async () => {
      const [classicApr, stableApr, dclApr] = await Promise.all([
        fetchMaxApr("classic", ""),
        fetchMaxApr("stable", ""),
        fetchMaxApr("dcl", ""),
      ]);
      setClassicApr(classicApr);
      setStableApr(stableApr);
      setDclApr(dclApr);
    };

    fetchAllAprs();
  }, []);

  useEffect(() => {
    // Concurrently fetch farm APR values for all pool types
    const fetchAllFarmAprs = async () => {
      const [classicAprFarm, stableAprFarm, dclAprFarm] = await Promise.all([
        fetchMaxApr("classic", "farm"),
        fetchMaxApr("stable", "farm"),
        fetchMaxApr("dcl", "farm"),
      ]);
      setClassicAprFarm(classicAprFarm);
      setStableAprFarm(stableAprFarm);
      setDclAprFarm(dclAprFarm);
    };

    fetchAllFarmAprs();
  }, []);

  // delta
  useEffect(() => {
    getDeltaGridApy().then((res: any) => {
      if (res?.list?.length > 0) {
        setGridApr(res.list[0].apy_24);
      }
    });
    getDeltaDCAApy().then((res: any) => {
      if (res?.list?.length > 0) {
        setDcaApr(res.list[0].profit_percent);
      }
    });
    getDeltaSwingApy().then((res: any) => {
      if (res?.list?.length > 0) {
        setSwingApr(res.list[0].apy_24);
      }
    });
  }, []);

  useEffect(() => {
    getBurrowApy().then((res: any) => {
      if (res?.length > 0) {
        const aprs = res?.map(
          (item) => Number(item.base_apy) + Number(item?.net_apy || 0)
        );
        setBurrowApr(Math.max(...aprs));
      }
    });
  }, []);

  return (
    <div
      className={`vlg:flex vlg:items-center vlg:flex-wrap vlg:w-[1104px] xsm:w-full xsm:px-[12px]`}
    >
      {vaultConfig().map((item: any, index: any) => {
        if (currentTag != "All" && item.category != currentTag) return null;
        return (
          <div
            key={"VaultList" + index}
            className={`vlg:mr-[30px] cursor-pointer vlg:hover:border-green-10 vlg:w-[334px] vxsm:w-full xsm:my-[15px] rounded-lg bg-dark-290 border border-gray-90 p-[20px] h-[159px] vlg:mb-[30px] flex flex-col justify-between`}
            onClick={() => blink(item)}
          >
            <div className="flex items-center">
              <div className="w-[38px] h-[38px]">{item.icon}</div>
              <div className="ml-[12px]">
                <p className="text-lg"> {item.title}</p>
                <span
                  className={`italic text-xs px-[12px] py-[2px] rounded-[14px] font-medium ${VaultColorConfig(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
              </div>
            </div>
            <div className="text-sm">
              <p className="flex items-center justify-between">
                <span className="text-gray-60"> {item.aprName}</span>
                {/* <span>{item.aprValue}</span> */}
                {item.name == "classic" && (
                  <span>{classicApr.toFixed(2)}%</span>
                )}
                {item.name == "stable" && <span>{stableApr.toFixed(2)}%</span>}
                {item.name == "dcl" && <span>{dclApr.toFixed(2)}%</span>}
                {item.name == "farm" && <span>{maxFarm.toFixed(2)}%</span>}
                {item.name == "burrow" && <span>{burrowApr.toFixed(2)}%</span>}
                {item.name == "swing" && (
                  <span>{Number(swingApr).toFixed(2)}%</span>
                )}
                {item.name == "dca" && (
                  <span>{Number(dcaApr).toFixed(2)}%</span>
                )}
                {item.name == "grid" && (
                  <span>{Number(gridApr).toFixed(2)}%</span>
                )}
              </p>
              <p className="flex items-center justify-between mt-[14px]">
                <span className="text-gray-60">Risk Level </span>
                <span>{item.riskLevel}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
