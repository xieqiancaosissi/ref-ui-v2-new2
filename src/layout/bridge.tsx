import BridgeFormProvider from "@/providers/bridgeForm";
import BridgeTransactionProvider from "@/providers/bridgeTransaction";
import { WalletConnectProvider } from "@/providers/walletConcent";

export default function BridgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bridge-page">
      <WalletConnectProvider>
        <BridgeTransactionProvider>
          <BridgeFormProvider>
            <>{children}</>
          </BridgeFormProvider>
        </BridgeTransactionProvider>
      </WalletConnectProvider>
    </div>
  );
}
