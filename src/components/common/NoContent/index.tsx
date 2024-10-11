import React from "react";
import { NoContentIcon } from "@/components/pools/icon";

export default function NoContent({ tips, h }: { tips?: string; h?: string }) {
  return (
    <div className={`fccc ${h ? h : "h-100"} select-none`}>
      <NoContentIcon />
      <div className="text-lg font-normal text-gray-60 mt-5">
        {tips ? tips : `There’s no content`}
      </div>
    </div>
  );
}
