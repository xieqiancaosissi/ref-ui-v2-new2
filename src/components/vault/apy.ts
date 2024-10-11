// https://api.burrow.finance/list_token_data
import getConfig from "@/utils/config";
import { getAuthenticationHeaders } from "@/services/signature";

export const getBurrowApy = async () => {
  return await fetch("https://api.burrow.finance/list_token_data", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      return res.data;
    })
    .catch((err: any) => {
      console.log(err);
    });
};

export const getDeltaGridApy = async () => {
  return await fetch(
    "https://api.deltatrade.ai/api/market/bots/all?bot_type=grid&limit=1&offset=0&order_by=apy_24&dir=desc&status=active&grid_style=grid",
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res.data;
    })
    .catch((err: any) => {
      console.log(err);
    });
};

export const getDeltaSwingApy = async () => {
  return await fetch(
    "https://api.deltatrade.ai/api/market/bots/all?bot_type=grid&limit=1&offset=0&order_by=apy_24&dir=desc&status=active&grid_style=swing",
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res.data;
    })
    .catch((err: any) => {
      console.log(err);
    });
};

export const getDeltaDCAApy = async () => {
  return await fetch(
    "https://api.deltatrade.ai/api/dca/list?limit=1&offset=0&closed=0&order_by=profit_percent&sort=desc&bot_type=dca",
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res.data;
    })
    .catch((err: any) => {
      console.log(err);
    });
};
