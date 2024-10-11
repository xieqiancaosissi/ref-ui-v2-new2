export interface Transaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

export interface RefFiFunctionCallOptions {
  methodName: string;
  args?: object;
  gas?: string;
  amount?: string;
}

export interface IExecutionResult {
  status: "success" | "error";
  txHashes: string;
  txHash: string;
  successResult: any;
  errorResult: Error;
}
