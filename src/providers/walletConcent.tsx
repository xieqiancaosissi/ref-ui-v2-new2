import React, { createContext, useEffect, useMemo } from "react";
import { setupWeb3Onboard } from "@/hooks/useWeb3Onboard";
import {
  Web3OnboardProvider,
  useConnectWallet,
  useSetChain,
} from "@web3-onboard/react";
import { ethers } from "ethers";
import { EVMConfig } from "@/config/bridge";
import { useAccountStore } from "@/stores/account";
import { showWalletSelectorModal } from "@/utils/wallet";
import { useAppStore } from "@/stores/app";

declare global {
  interface Window {
    ethProvider?: ReturnType<typeof useConnectWallet>[0]["wallet"]["provider"];
    ethWeb3Provider?: ethers.providers.Web3Provider;
  }
}

const WalletConnectContext = createContext(null);

const web3Onboard = setupWeb3Onboard();

export function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletConnectContext.Provider value={null}>
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        {children}
      </Web3OnboardProvider>
    </WalletConnectContext.Provider>
  );
}

export function useWalletConnectContext() {
  const { accountId, isSignedIn } = useAccountStore();
  const { setShowRiskModal } = useAppStore();

  const walletNearHooks = {
    open: () => {
      if (typeof window !== "undefined")
        showWalletSelectorModal(setShowRiskModal);
    },
    accountId,
    isSignedIn,
    async disconnect() {
      try {
        const curWallet = await window.selector.wallet();
        await curWallet?.signOut();
        window.location.reload();
      } catch (error) {
        console.error("disconnect error: ", error);
      }
    },
  };

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const [{ connectedChain }, setChain] = useSetChain();

  const isEVMSignedIn = wallet && !connecting;
  const walletEvmHooks = {
    accountId: wallet?.accounts?.[0]?.address,
    isSignedIn: isEVMSignedIn,
    open: connect,
    chain:
      Object.values(EVMConfig.chains).find((c) => c.id === connectedChain?.id)
        ?.label || "Ethereum",
    setChain: (id: string) => {
      if (!isEVMSignedIn) return;
      if (id !== connectedChain?.id) setChain({ chainId: id });
    },
    disconnect: () => disconnect({ label: wallet.label }),
  };

  useEffect(() => {
    if (wallet?.provider && walletEvmHooks.accountId) {
      window.ethProvider = wallet?.provider;
      window.ethWeb3Provider = new ethers.providers.Web3Provider(
        wallet?.provider,
        "any"
      );
    }
  }, [wallet?.provider, walletEvmHooks.accountId]);

  const getWallet = (chain: string) => {
    if (chain === "NEAR") {
      return walletNearHooks;
    } else {
      return walletEvmHooks;
    }
  };

  return {
    NEAR: walletNearHooks,
    EVM: walletEvmHooks,
    getWallet,
  };
}
