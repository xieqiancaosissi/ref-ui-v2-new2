import BridgeLayout from "@/layout/bridge";
import dynamic from "next/dynamic";

const BridgeEntry = dynamic(() => import("@/components/bridge/BridgeEntry"), {
  ssr: false,
});

const Page = () => {
  return <BridgeEntry />;
};

Page.customLayout = (page) => <BridgeLayout>{page}</BridgeLayout>;

export default Page;
