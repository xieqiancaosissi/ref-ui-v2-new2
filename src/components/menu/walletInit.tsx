import React, { useEffect } from "react";
import { getWalletSelector } from "../../utils/wallet-selector";
import { useAccountStore } from "../../stores/account";
function WalletInit() {
  const accountStore = useAccountStore();
  useEffect(() => {
    getWalletSelector({ onAccountChange: changeAccount });
  }, []);
  async function changeAccount(accountId: string) {
    accountStore.setAccountId(accountId);
    accountStore.setIsSignedIn(!!accountId);
    accountStore.setWalletLoading(false);
  }

  return null;
}

export default React.memo(WalletInit);
