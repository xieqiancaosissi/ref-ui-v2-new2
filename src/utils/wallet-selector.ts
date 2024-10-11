import { map, distinctUntilChanged } from "rxjs";

import { NetworkId, setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelector, Network } from "@near-wallet-selector/core";
import { setupModal } from "ref-modal-ui";
import type { WalletSelectorModal } from "ref-modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupNeth } from "@near-wallet-selector/neth";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet";
import { setupKeypom } from "@keypom/selector";
import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet";
import { setupOKXWallet } from "@near-wallet-selector/okx-wallet";
import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import "ref-modal-ui/styles.css";
import getConfig from "./config";
import { getSelectedRpc } from "./rpc";
import type { Config } from "@wagmi/core";
import { reconnect, http, createConfig } from "@wagmi/core";
import { walletConnect, injected } from "@wagmi/connectors";
import { setupEthereumWallets } from "@near-wallet-selector/ethereum-wallets";
import { createWeb3Modal } from "@web3modal/wagmi";
declare global {
  interface Window {
    selector: WalletSelector & { getAccountId: () => string };
    selectorSubscription: any;
    modal: WalletSelectorModal;
    accountId: string;
    sender?: any;
    adaptiveRPC?: string;
    selectTokenUpdated?: boolean;
  }
}
interface GetWalletSelectorArgs {
  onAccountChange: (accountId: string) => Promise<void>;
}
export async function getWalletSelector({
  onAccountChange,
}: GetWalletSelectorArgs) {
  const KEYPOM_OPTIONS = {
    beginTrial: {
      landing: {
        title: "Welcome!",
      },
    },
    wallets: [
      {
        name: "MyNEARWallet",
        description: "Secure your account with a Seed Phrase",
        redirectUrl: `https://${
          getConfig().networkId
        }.mynearwallet.com/linkdrop/ACCOUNT_ID/SECRET_KEY`,
        iconUrl: "INSERT_ICON_URL_HERE",
      },
    ],
  };
  const RPC = getSelectedRpc();
  console.log("0000000000000-wallet loading start");
  const projectId = "87e549918631f833447b56c15354e450";
  const signInContractId = getConfig().REF_FARM_BOOST_CONTRACT_ID;
  // evm wallet config start
  const nearBlock = {
    id: 397,
    name: "NEAR Mainnet",
    nativeCurrency: {
      decimals: 18,
      name: "NEAR",
      symbol: "NEAR",
    },
    rpcUrls: {
      default: { http: ["https://eth-rpc.mainnet.near.org"] },
      public: { http: ["https://eth-rpc.mainnet.near.org"] },
    },
    blockExplorers: {
      default: {
        name: "NEAR Explorer",
        url: "https://eth-explorer.near.org",
      },
    },
    testnet: false,
  };
  const wagmiConfig: Config = createConfig({
    chains: [nearBlock],
    transports: {
      [nearBlock.id]: http(),
    },
    connectors: [
      walletConnect({
        projectId,
        showQrModal: false,
      }),
      injected({ shimDisconnect: true }),
    ],
  });
  reconnect(wagmiConfig);
  const web3Modal = createWeb3Modal({
    wagmiConfig,
    projectId,
    allowUnsupportedChain: true,
  });
  // evm wallet config end
  const selector: any = await setupWalletSelector({
    network: {
      networkId: getConfig().networkId as NetworkId,
      nodeUrl: RPC.url,
    } as Network,
    debug: false,
    modules: [
      setupOKXWallet({}),
      setupMyNearWallet(),
      setupHereWallet(),
      setupSender(),
      setupMeteorWallet(),
      setupNearMobileWallet({
        dAppMetadata: {
          name: "ref finance",
          logoUrl: "https://img.ref.finance/images/REF-black-logo.png",
          url: "https://old.app.ref.finance",
        },
      }),
      setupNeth({
        gas: "300000000000000",
        bundle: false,
      }) as any,
      setupNightly(),
      setupLedger(),
      setupWalletConnect({
        projectId,

        metadata: {
          name: "ref finance",
          description: "Example dApp used by NEAR Wallet Selector",
          url: "https://github.com/ref-finance/ref-ui",
          icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
        chainId: `near:${getConfig().networkId}`,
      }),
      setupKeypom({
        networkId: getConfig().networkId as NetworkId,
        signInContractId: "",
        trialAccountSpecs: {
          url: "/trial-accounts/ACCOUNT_ID#SECRET_KEY",
          modalOptions: KEYPOM_OPTIONS,
        },
        instantSignInSpecs: {
          url: "/#instant-url/ACCOUNT_ID#SECRET_KEY/MODULE_ID",
        },
      }),
      setupMintbaseWallet({
        walletUrl: "https://wallet.mintbase.xyz",
        deprecated: false,
        contractId: signInContractId,
      }),
      setupBitteWallet({
        walletUrl: "https://wallet.bitte.ai",
        deprecated: false,
        contractId: signInContractId,
      }),
      setupCoin98Wallet({}),
      setupEthereumWallets({
        wagmiConfig,
        web3Modal,
        alwaysOnboardDuringSignIn: true,
      } as any),
    ],
  });
  console.log("2222222222222-wallet loading end");
  const modal = setupModal(selector, {
    contractId: signInContractId,
    blockFunctionKeyWallets: [
      "okx-wallet",
      "my-near-wallet",
      "meteor-wallet",
      "neth",
      "nightly",
      "ledger",
      "wallet-connect",
      "keypom",
      "mintbase-wallet",
      "bitte-wallet",
      "ethereum-wallets",
      "sender",
      "coin98-wallet",
    ],
  });
  const { observable }: { observable: any } = selector.store;
  const subscription = observable
    .pipe(
      map((s: any) => s.accounts),
      distinctUntilChanged()
    )
    .subscribe((nextAccounts: any) => {
      console.info("Accounts Update", nextAccounts);
      window.accountId = nextAccounts[0]?.accountId;
      onAccountChange(window.accountId || "");
    });
  window.selector = selector as WalletSelector & { getAccountId: () => string };
  window.modal = modal;
  window.selectorSubscription = subscription;
}
