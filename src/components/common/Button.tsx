import { BeatLoader } from "react-spinners";
import { showWalletSelectorModal } from "@/utils/wallet";
export function ButtonTextWrapper({
  Text,
  loading,
  loadingColor,
}: {
  Text: () => JSX.Element;
  loading: boolean;
  loadingColor?: string;
}) {
  return (
    <>
      {loading ? (
        <BeatLoader size={5} color={loadingColor || "#ffffff"} />
      ) : (
        <Text />
      )}
    </>
  );
}

export function ConnectToNearBtn({ appStore }: any) {
  return (
    <div
      className="flex items-center justify-center bg-greenGradient rounded-2xl text-black font-bold text-base cursor-pointer"
      style={{ height: "42px" }}
      onClick={() => {
        showWalletSelectorModal(appStore.setShowRiskModal);
      }}
    >
      Connect Wallet
    </div>
  );
}
