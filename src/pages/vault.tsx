import React, { useState } from "react";
import ValutAssets from "@/components/vault/vaultAssets";
import Tab from "@/components/vault/Tab";
import VaultList from "@/components/vault/vaultList";

export default function Vault() {
  const [currentTag, setCurrentTag] = useState("All");
  return (
    <div>
      {/* menu */}
      <ValutAssets />
      <div className="h-[96px] w-full xsm:hidden"></div>
      <Tab setCurrentTag={setCurrentTag} />
      <div className="h-[56px] w-full xsm:hidden"></div>
      {/* list */}
      <div className="w-full frcc">
        <VaultList currentTag={currentTag} />
      </div>
    </div>
  );
}
