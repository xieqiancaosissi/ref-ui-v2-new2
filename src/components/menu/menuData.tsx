import Image from "next/image";
import {
  SwapIcon,
  LimitIcon,
  OrderbookIcon,
  PoolIcon,
  FarmsIcon,
  YoursIcon,
  StakeIcon,
  VaultIcon,
} from "./icons";
import {
  Rainbow,
  WalletCedeBridge,
  AggregateBridge,
  TokenBridge,
} from "./icons2";

export interface IMenu {
  id: string;
  label: string | React.ReactElement;
  path?: string;
  children?: IMenuChild[];
  icon?: string | React.ReactElement;
}
export interface IMenuChild {
  id: string;
  label: string | React.ReactElement;
  icon: React.ReactElement;
  path?: string;
  externalLink?: string;
  bridgeConfirm?: boolean;
}
export function menuData(): IMenu[] {
  return [
    {
      id: "trade",
      label: "TRADE",
      children: [
        {
          id: "swap",
          label: "Swap",
          icon: <SwapIcon />,
          path: "/",
        },
        {
          id: "limit",
          label: "Limit",
          icon: <LimitIcon />,
          path: "/limit",
        },
      ],
    },
    {
      id: "earn",
      label: "EARN",
      children: [
        {
          id: "pools",
          label: "Pools",
          icon: <PoolIcon />,
          path: "/pools",
        },
        {
          id: "farms",
          label: "Farms",
          icon: <FarmsIcon />,
          path: "/v2farms",
        },
        {
          id: "vault",
          label: "Vault",
          icon: <VaultIcon />,
          path: "/vault",
        },
        {
          id: "yours",
          label: "Yours",
          icon: <YoursIcon />,
          path: "/yours",
        },
        {
          id: "stake",
          label: "Stake",
          icon: <StakeIcon />,
          path: "/xref",
        },
      ],
    },
    {
      id: "bridge",
      label: "Bridge",
      children: [
        {
          id: "aggregate",
          label: "Aggregate",
          icon: <AggregateBridge />,
          path: "/bridge",
        },
        {
          id: "rainbow",
          label: "Rainbow",
          icon: <Rainbow />,
          externalLink: "https://rainbowbridge.app/transfer",
          bridgeConfirm: true,
        },
        {
          id: "cede",
          label: "Cede",
          icon: <WalletCedeBridge />,
          externalLink:
            "https://send.cede.store/?tokenSymbol=NEAR&network=near&source=ref_finance",
          bridgeConfirm: true,
        },
        {
          id: "tokenBridge",
          label: "Token",
          icon: <TokenBridge />,
          externalLink: "https://tokenbridge.app",
          bridgeConfirm: true,
        },
      ],
    },
    {
      id: "meme",
      icon: <Image src="/images/memeMenu.svg" width={24} height={24} alt="" />,
      label: "MEME SEASON",
      path: "/meme",
    },
  ];
}

export const routeMapIds = {
  "trade-swap": ["/"],
  "trade-limit": ["/limit"],
  "earn-pools": [
    "/pools",
    "/pool/[id]",
    "/sauce/[id]",
    "/poolV2/[id]",
    "/liquidity/[id]",
  ],
  "earn-farms": ["/v2farms", "/v2farms/[id]"],
  "earn-stake": ["/xref"],
  "earn-vault": ["/vault"],
  "earn-yours": ["/yours"],
  meme: ["/meme", "/memeAirdop"],
  "-": ["/risks"],
  "bridge-aggregate": ["/bridge", "/bridge/history"],
};
