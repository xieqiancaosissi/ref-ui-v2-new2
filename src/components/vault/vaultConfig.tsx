import React from "react";
import { RefVaultIcon, BurrowVaultIcon, DeltaVaultIcon } from "./vaultIcon";

export function vaultConfig() {
  return [
    {
      icon: <RefVaultIcon />,
      aprName: "Highest APY",
      aprValue: "100%",
      riskLevel: "2",
      category: "POOL",
      title: "REF Classic",
      path: "/pools",
      name: "classic",
    },
    {
      icon: <RefVaultIcon />,
      aprName: "Highest APY",
      aprValue: "100%",
      riskLevel: "1",
      category: "POOL",
      title: "REF Stable",
      path: "/pools",
      name: "stable",
    },
    {
      icon: <RefVaultIcon />,
      aprName: "Top Bin APY",
      aprValue: "100%",
      riskLevel: "2",
      category: "POOL",
      title: "REF DCL",
      path: "/pools",
      name: "dcl",
    },
    {
      icon: <RefVaultIcon />,
      aprName: "Highest APY",
      aprValue: "100%",
      riskLevel: "1",
      category: "Farming",
      title: "REF Farming",
      path: "/v2farms",
      name: "farm",
    },
    {
      icon: <BurrowVaultIcon />,
      aprName: "Highest APY",
      aprValue: "100%",
      riskLevel: "1",
      category: "Lending",
      title: "Burrow Supply",
      url: "https://app.burrow.finance/",
      name: "burrow",
    },
    {
      icon: <DeltaVaultIcon />,
      aprName: "Highest APY",
      aprValue: "100%",
      riskLevel: "2",
      category: "AutoBot",
      title: "Delta Grid",
      url: "https://www.deltatrade.ai/bots/grid/vaults/",
      name: "grid",
    },
    {
      icon: <DeltaVaultIcon />,
      aprName: "Highest APY",
      aprValue: "100%",
      riskLevel: "2",
      category: "AutoBot",
      title: "Delta Swing",
      url: "https://www.deltatrade.ai/bots/swing/vaults/",
      name: "swing",
    },
    {
      icon: <DeltaVaultIcon />,
      aprName: "Historical ROI",
      aprValue: "100%",
      riskLevel: "2",
      category: "AutoBot",
      title: "Delta DCA",
      url: "https://www.deltatrade.ai/bots/dca/vaults/",
      name: "dca",
    },
  ];
}

export function VaultColorConfig(type: string) {
  switch (type) {
    case "POOL":
      return "text-black bg-green-10";
    case "Farming":
      return "text-black bg-vaultTagLaunchpad";
    case "Lending":
      return "text-white bg-vaultTagLending";
    case "Bot":
      return "text-white bg-vaultTagBot";
    default:
      return "text-white bg-vaultTagBot";
  }
}

export function vaultTabList() {
  const data = vaultConfig();
  const list = [
    {
      key: "All",
      value: "All",
      count: data.length,
    },
    {
      key: "pool",
      value: "POOL",
      count: 0,
    },
    {
      key: "autobot",
      value: "AutoBot",
      count: 0,
    },
    {
      key: "farming",
      value: "Farming",
      count: 0,
    },
    {
      key: "lending",
      value: "Lending",
      count: 0,
    },
  ];
  data.map((item: any) => {
    list.map((ite: any) => {
      if (item.category == ite.value) {
        ite.count = ite.count + 1;
      }
    });
  });

  return list;
}

export function vaultTabListMobile() {
  const data = vaultConfig();
  const list = [
    {
      key: "All",
      value: "All",
      count: data.length,
    },
    {
      key: "pool",
      value: "POOL",
      count: 0,
    },
    {
      key: "autobot",
      value: "AutoBot",
      count: 0,
    },
  ];
  data.map((item: any) => {
    list.map((ite: any) => {
      if (item.category == ite.value) {
        ite.count = ite.count + 1;
      }
    });
  });

  return list;
}
