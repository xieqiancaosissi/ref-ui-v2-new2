import React from "react";
import { useTokenMetadata } from "@/hooks/usePools";
import PoolRowChild from "./poolRowChild";

function PoolRow({
  list,
}: {
  list: Array<any>;
  loading: boolean;
  pureIdList: any;
}) {
  const { updatedMapList } = useTokenMetadata(list);

  return (
    <div className="xsm:w-full mb-2 min-h-90 overflow-y-auto overflow-x-hidden hover:cursor-pointer">
      {updatedMapList.map((item, index) => {
        return (
          <div key={item.id + index}>
            <PoolRowChild item={item} index={index}></PoolRowChild>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(PoolRow);
