import React, { useState, useEffect } from "react";
import {
  getPoolMonthTVL,
  getPoolMonthVolume,
  getV3PoolVolumeById,
  getV3poolTvlById,
} from "@/services/pool_detail";
import _ from "lodash";
import moment from "moment";

const formatDate = (rawDate: string) => {
  const date = rawDate
    ?.split("-")
    .map((t) => (t.length >= 2 ? t : t.padStart(2, "0")))
    .join("-");

  return moment(date).format("ll");
};

export interface TVLDataType {
  pool_id: string;
  asset_amount: string;
  fiat_amount: string;
  asset_price: string;
  fiat_price: string;
  asset_tvl: number;
  fiat_tvl: number;
  date: string;
  total_tvl: number;
  scaled_tvl: number;
}

export const useMonthTVL = (pool_id: string) => {
  const [monthTVLById, setMonthTVLById] = useState<TVLDataType[]>();
  const [xTvl, setXData] = useState([]);
  const [yTvl, setYData] = useState([]);
  useEffect(() => {
    getPoolMonthTVL(pool_id).then((res) => {
      const minDay = _.minBy(res, (o) => {
        return Number(o.asset_tvl) + Number(o.fiat_tvl);
      });
      const minValue = Number(minDay?.asset_tvl) + Number(minDay?.fiat_tvl);

      const monthTVL = res
        .map((v, i) => {
          return {
            ...v,
            asset_tvl: Number(v?.asset_tvl),
            fiat_tvl: Number(v?.fiat_tvl),
            total_tvl: Number(v?.fiat_tvl) + Number(v?.asset_tvl),
            scaled_tvl:
              Number(v?.fiat_tvl) + Number(v?.asset_tvl) - minValue * 0.99,
          };
        })
        .reverse();
      const x: any = [];
      const y: any = [];
      monthTVL.map((item: any) => {
        x.push(formatDate(item.date));
        y.push(item.total_tvl);
      });
      setXData(x);
      setYData(y);

      setMonthTVLById(monthTVL);
    });
  }, []);
  return { monthTVLById, xTvl, yTvl };
};

export interface volumeDataType {
  pool_id: string;
  dateString: string;
  fiat_volume: string;
  asset_volume: string;
  volume_dollar: number;
}

export const useMonthVolume = (pool_id: string) => {
  const [monthVolumeById, setMonthVolumeById] = useState<volumeDataType[]>();
  const [xMonth, setXData] = useState([]);
  const [yMonth, setYData] = useState([]);
  useEffect(() => {
    getPoolMonthVolume(pool_id).then((res) => {
      const monthVolume = res
        .map((v, i) => {
          return {
            ...v,
            volume_dollar: Number(v.volume_dollar),
          };
        })
        .reverse();
      const x: any = [];
      const y: any = [];
      monthVolume.map((item: any) => {
        x.push(formatDate(item.dateString));
        y.push(item.volume_dollar);
      });
      setXData(x);
      setYData(y);
      setMonthVolumeById(monthVolume);
    });
  }, []);
  return { monthVolumeById, xMonth, yMonth };
};

export const useV3MonthTVL = (pool_id: string) => {
  const [monthTVLById, setMonthTVLById] = useState<TVLDataType[]>();
  const [xTvl, setXData] = useState([]);
  const [yTvl, setYData] = useState([]);
  useEffect(() => {
    getV3poolTvlById(pool_id).then((res) => {
      res.forEach((p) => {
        (p.total_tvl = +p.tvl || 0),
          (p.scaled_tvl = +p.tvl || 0),
          (p.date = p.dateString);
      });
      res.sort((t1, t2) => {
        return new Date(t2.date).getTime() - new Date(t1.date).getTime();
      });

      const monthTVL = res
        .map((v, i) => {
          return {
            ...v,
          };
        })
        .reverse();
      const x: any = [];
      const y: any = [];
      monthTVL.map((item: any) => {
        x.push(formatDate(item.date));
        y.push(item.total_tvl);
      });
      setXData(x);
      setYData(y);

      setMonthTVLById(monthTVL);
    });
  }, []);
  return { monthTVLById, xTvl, yTvl };
};

export interface volumeDataType {
  pool_id: string;
  dateString: string;
  fiat_volume: string;
  asset_volume: string;
  volume_dollar: number;
}

export const useV3MonthVolume = (pool_id: string) => {
  const [monthVolumeById, setMonthVolumeById] = useState<volumeDataType[]>();
  const [xMonth, setXData] = useState([]);
  const [yMonth, setYData] = useState([]);
  useEffect(() => {
    getV3PoolVolumeById(pool_id).then((res) => {
      const monthVolume = res.map((v, i) => {
        return {
          ...v,
          volume_dollar: Number(v.volume),
        };
      });

      const x: any = [];
      const y: any = [];
      monthVolume.map((item: any) => {
        x.push(formatDate(item.dateString));
        y.push(item.volume);
      });
      setXData(x);
      setYData(y);
      setMonthVolumeById(monthVolume);
    });
  }, []);
  return { monthVolumeById, xMonth, yMonth };
};
