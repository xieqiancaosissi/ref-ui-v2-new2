import { useEffect, useState } from "react";
import "@/styles/globals.css";
import Layout from "@/layout/default";
import { NextUIProvider } from "@nextui-org/react";
// import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import { IntlProvider } from "react-intl";
import type { AppProps } from "next/app";
import LoadingBar from "react-top-loading-bar";
import Modal from "react-modal";
import dynamic from "next/dynamic";
import getConfig from "../utils/config";
import { ALL_STABLE_POOL_IDS } from "@/services/swap/swapConfig";
import LedgerTransactionModal from "@/components/common/ledger/ledgerTransactionModal";
import "@/components/common/ModalDefaultStyle";
import "@/components/modalGAPrivacy/modalGAPrivacy.css";
import "@/components/customModal/customModal.css";

import { useAccountStore } from "@/stores/account";
import { addUserWallet } from "@/services/indexer";
import Menu from "../components/menu";
import WalletInit from "../components/menu/walletInit";
import Blocked from "@/components/blocked/blocked";
const Footer = dynamic(() => import("../components/footer"), { ssr: false });
const RpcList = dynamic(() => import("@/components/rpc"), { ssr: false });
const ModalGAPrivacy = dynamic(
  () => import("@/components/modalGAPrivacy/modalGAPrivacy"),
  { ssr: false }
);
const ToastContainerEle = dynamic(() => import("../components/common/Toast"), {
  ssr: false,
});
const RiskModal = dynamic(
  () => import("../components/riskCheckModal/WalletRiskCheckBoxModal"),
  {
    ssr: false,
  }
);
export type AppPropsWithLayout = AppProps & {
  Component: {
    customLayout?: (page: React.ReactNode) => React.ReactNode;
    isClientRender?: boolean;
  };
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.customLayout ||
    ((page) => (
      <Layout isClientRender={Component.isClientRender}>{page}</Layout>
    ));

  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setProgress(30);
    };
    const handleRouteChangeComplete = () => {
      setProgress(100);
    };
    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, []);
  useEffect(() => {
    UIInit();
    DBInit();
  }, []);
  useEffect(() => {
    if (accountId) {
      const selectedWalletId =
        window.selector?.store?.getState()?.selectedWalletId;
      if (selectedWalletId) {
        addUserWallet({
          account_id: accountId,
          wallet_address: selectedWalletId,
        });
      }
    }
  }, [accountId]);
  function UIInit() {
    Modal.setAppElement("#root");
  }
  function DBInit() {
    const myWorker = new Worker(new URL("../db/worker.ts", import.meta.url), {
      type: "module",
    });
    sendWorkerData(myWorker);
  }
  function sendWorkerData(myWorker: Worker) {
    const config = getConfig();
    myWorker.postMessage({
      config,
      ALL_STABLE_POOL_IDS,
    });
  }
  return (
    <IntlProvider messages={{}} locale={"en"}>
      {/* <NextThemesProvider defaultTheme="light" attribute="class"> */}
      <NextUIProvider>
        <LoadingBar
          color="#9EFF00"
          height={3}
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
        />
        <div className="flex flex-col bg-primaryDark min-h-screen">
          <Menu />
          <div className="flex-grow lg:mt-20 xsm:mt-10">
            {getLayout(<Component {...pageProps} />)}
          </div>
          <RpcList />
          <Footer />
          <ToastContainerEle />
          <ModalGAPrivacy />
          <RiskModal />
          <LedgerTransactionModal />
          <WalletInit />
        </div>
        <Blocked />
      </NextUIProvider>
      {/* </NextThemesProvider> */}
    </IntlProvider>
  );
}
