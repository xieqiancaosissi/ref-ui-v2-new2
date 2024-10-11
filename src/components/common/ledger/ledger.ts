export const ledgerTipTrigger = () => {
  const handlePopTrigger = () => {
    const el = document.getElementsByClassName(
      "ledger-transaction-pop-up"
    )?.[0];
    if (el) {
      el.setAttribute("style", "display:flex");
    }
  };

  const isLedger =
    window.selector.store.getState().selectedWalletId == "ledger";

  if (isLedger) {
    handlePopTrigger();
  }
};
export const ledgerTipClose = () => {
  const handlePopTrigger = () => {
    const el = document.getElementsByClassName(
      "ledger-transaction-pop-up"
    )?.[0];
    if (el) {
      el.setAttribute("style", "display:none");
    }
  };

  const isLedger =
    window.selector.store.getState().selectedWalletId == "ledger";

  if (isLedger) {
    handlePopTrigger();
  }
};
