import { getSelectedWalletId } from "@/utils/wallet";
export function addQueryParams(
  baseUrl: string,
  queryParams: {
    [name: string]: string;
  }
) {
  const url = new URL(baseUrl);
  for (const key in queryParams) {
    const param = queryParams[key];
    if (param) url.searchParams.set(key, param);
  }
  return url.toString();
}
const ERROR_PATTERN = {
  slippageErrorPattern: /ERR_MIN_AMOUNT|slippage error/i,
  invaliParamsErrorPattern: /invalid params/i,
  ratesExpiredErrorPattern: /Rates expired/i,
  integerOverflowErrorPattern: /Integer overflow/i,
  ShareSupplyOverflowErrorPattern: /shares_total_supply overflow/i,
  tokenFrozenErrorPattern: /token frozen/i,
  poolBalanceLessPattern: /pool reserved token balance less than MIN_RESERVE/i,
  nethErrorPattern: /Smart contract panicked: explicit guest panic/i,
};
export enum TRANSACTION_WALLET_TYPE {
  NEAR_WALLET = "transactionHashes",
  SENDER_WALLET = "transactionHashesSender",
  WalletSelector = "transactionHashesWallets",
}
export enum TRANSACTION_ERROR_TYPE {
  SLIPPAGE_VIOLATION = "Slippage Violation",
  INVALID_PARAMS = "Invalid Params",
  RATES_EXPIRED = "Rates Expired",
  INTEGEROVERFLOW = "Integer Overflow",
  SHARESUPPLYOVERFLOW = "Share Supply Overflow",
  TOKEN_FROZEN = "Token Frozen",
  POOL_BALANCE_LESS = "Pool Balance Less Than MIN_RESERVE",
  NETH_ERROR = "Smart contract panicked",
}

export const extraWalletsError = [
  "Couldn't open popup window to complete wallet action",
];

export const walletsRejectError = [
  "User reject",
  "User rejected the signature request",
  "User rejected transaction", // myNearWallet
  "Invalid message. Only transactions can be signed",
  "Ledger device: Condition of use not satisfied (denied by the user?) (0x6985)",
  "User cancelled the action",
  "User closed the window", // meteor wallet
  "User closed the window before completing the action",
];

export const getURLInfo = () => {
  if (typeof window !== "object") return {};
  const selectedWalletId = getSelectedWalletId();
  if (!selectedWalletId) return {};
  const search = window.location.search;

  const pathname = window.location.pathname;

  const errorType = new URLSearchParams(search).get("errorType");

  const errorCode = new URLSearchParams(search).get("errorCode");

  const signInErrorType = new URLSearchParams(search).get("signInErrorType");
  let txHashes = [];
  const txHashesStr =
    new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.NEAR_WALLET) ||
    new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.SENDER_WALLET) ||
    new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.WalletSelector);
  if (selectedWalletId == "bitte-wallet") {
    txHashes = decodeURIComponent(decodeURIComponent(txHashesStr || "")).split(
      ","
    );
  } else {
    txHashes = (txHashesStr || "").split(",");
  }
  return {
    txHash:
      txHashes && txHashes.length > 0 ? txHashes[txHashes.length - 1] : "",
    pathname,
    errorType,
    signInErrorType,
    errorCode,
    txHashes,
  };
};
export const getURLInfoSubFirst = () => {
  if (typeof window !== "object") return {};
  const selectedWalletId = getSelectedWalletId();
  if (!selectedWalletId) return {};
  const search = window.location.search;

  const pathname = window.location.pathname;

  const errorType = new URLSearchParams(search).get("errorType");

  const errorCode = new URLSearchParams(search).get("errorCode");

  const signInErrorType = new URLSearchParams(search).get("signInErrorType");
  let txHashes = [];
  const txHashesStr =
    new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.NEAR_WALLET) ||
    new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.SENDER_WALLET) ||
    new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.WalletSelector);
  if (selectedWalletId == "bitte-wallet") {
    txHashes = decodeURIComponent(decodeURIComponent(txHashesStr || "")).split(
      ","
    );
  } else {
    txHashes = (txHashesStr || "").split(",");
  }

  return {
    txHash: txHashes.length > 0 ? txHashes[0] : "",
    pathname,
    errorType,
    signInErrorType,
    errorCode,
    txHashes,
  };
};
export const parsedArgs = (res: any) => {
  const buff = Buffer.from(res, "base64");
  const parsedData = buff.toString("ascii");
  return parsedData;
};
export const parsedTransactionSuccessValueNeth = (res: any) => {
  const status: any = res?.receipts_outcome?.[1]?.outcome?.status;

  const data: string | undefined = status.SuccessValue;

  if (data) {
    const buff = Buffer.from(data, "base64");
    const parsedData = buff.toString("ascii");
    return parsedData;
  }
};
export const parsedTransactionSuccessValue = (res: any) => {
  const status: any = res?.status;

  const data: string | undefined = status?.SuccessValue;

  if (data) {
    const buff = Buffer.from(data, "base64");
    const parsedData = buff.toString("ascii");
    return parsedData;
  }
};
export const getTransactionStatus = (res: any): "failure" | "success" => {
  if (res?.status?.Failure) return "failure";
  if (res?.transaction_outcome?.outcome.status?.Failure) return "failure";
  const isFailure = res.receipts_outcome.some((outcome: any) => {
    return outcome?.outcome?.status?.Failure;
  });
  if (isFailure) return "failure";
  return "success";
};
export const getErrorMessage = (res: any) => {
  const isSlippageError = res.receipts_outcome.some((outcome: any) => {
    return ERROR_PATTERN.slippageErrorPattern.test(
      outcome?.outcome?.status?.Failure?.ActionError?.kind?.FunctionCallError
        ?.ExecutionError
    );
  });

  const isInvalidAmountError = res.receipts_outcome.some((outcome: any) => {
    return ERROR_PATTERN.invaliParamsErrorPattern.test(
      outcome?.outcome?.status?.Failure?.ActionError?.kind?.FunctionCallError
        ?.ExecutionError
    );
  });

  const isRatesExpiredError = res.receipts_outcome.some((outcome: any) => {
    return ERROR_PATTERN.ratesExpiredErrorPattern.test(
      outcome?.outcome?.status?.Failure?.ActionError?.kind?.FunctionCallError
        ?.ExecutionError
    );
  });

  const isIntegerOverFlowError = res.receipts_outcome.some((outcome: any) => {
    return ERROR_PATTERN.integerOverflowErrorPattern.test(
      outcome?.outcome?.status?.Failure?.ActionError?.kind?.FunctionCallError
        ?.ExecutionError
    );
  });

  const isShareSupplyOerflowError = res.receipts_outcome.some(
    (outcome: any) => {
      return ERROR_PATTERN.ShareSupplyOverflowErrorPattern.test(
        outcome?.outcome?.status?.Failure?.ActionError?.kind?.FunctionCallError
          ?.ExecutionError
      );
    }
  );

  const isTokenFrozen = res.receipts_outcome.some((outcome: any) => {
    return ERROR_PATTERN.tokenFrozenErrorPattern.test(
      outcome?.outcome?.status?.Failure?.ActionError?.kind?.FunctionCallError
        ?.ExecutionError
    );
  });

  const isPoolBalanceLess = res.receipts_outcome.some((outcome: any) => {
    return ERROR_PATTERN.poolBalanceLessPattern.test(
      outcome?.outcome?.status?.Failure?.ActionError?.kind?.FunctionCallError
        ?.ExecutionError
    );
  });

  const isNETHErrpr = res.receipts_outcome.some((outcome: any) => {
    return ERROR_PATTERN.nethErrorPattern.test(
      outcome?.outcome?.status?.Failure?.ActionError?.kind?.FunctionCallError
        ?.ExecutionError
    );
  });

  if (isSlippageError) {
    return TRANSACTION_ERROR_TYPE.SLIPPAGE_VIOLATION;
  } else if (isInvalidAmountError) {
    return TRANSACTION_ERROR_TYPE.INVALID_PARAMS;
  } else if (isRatesExpiredError) {
    return TRANSACTION_ERROR_TYPE.RATES_EXPIRED;
  } else if (isIntegerOverFlowError) {
    return TRANSACTION_ERROR_TYPE.INTEGEROVERFLOW;
  } else if (isShareSupplyOerflowError) {
    return TRANSACTION_ERROR_TYPE.SHARESUPPLYOVERFLOW;
  } else if (isTokenFrozen) {
    return TRANSACTION_ERROR_TYPE.TOKEN_FROZEN;
  } else if (isPoolBalanceLess) {
    return TRANSACTION_ERROR_TYPE.POOL_BALANCE_LESS;
  } else if (isNETHErrpr) {
    return TRANSACTION_ERROR_TYPE.NETH_ERROR;
  } else {
    return null;
  }
};
