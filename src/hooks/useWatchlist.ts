import React, { useEffect, useState } from "react";
import { getAllWatchListFromDb } from "@/services/pool";
import db from "@/db/RefDatabase";
import { useAccountStore } from "@/stores/account";
export const useWatchList = () => {
  const [watchListId, setIdList] = useState<any>([]);
  const [currentwatchListId, setCurrentwatchListId] = useState<any>([]);
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  async function getwatch() {
    return await db.queryWatchList();
  }

  useEffect(() => {
    //
    if (accountId) {
      getwatch().then((res) => {
        const id: any = [];
        res.map((item) => {
          item.account == accountId && id.push(item.pool_id);
        });
        setCurrentwatchListId(id);
      });
    }
    //
    getAllWatchListFromDb({ account: accountId }).then((res) => {
      const id: any = [];
      res.map((item) => {
        id.push(item.pool_id);
      });
      setIdList(id);
    });
  }, [accountId]);
  return { watchListId, currentwatchListId, accountId };
};
