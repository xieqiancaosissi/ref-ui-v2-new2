import { wrap } from "comlink";
import { EstimateSwapView } from "@/interfaces/swap";

export function createSmartRouteLogicWorker() {
  try {
    return wrap<typeof import("./worker").default>(
      new Worker(new URL("./worker.ts", import.meta.url))
    );
  } catch (error) {
    console.error("Web Worker not supported");
  }
}
export function transformWorkerResult(
  data: string
): EstimateSwapView[] | undefined {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Error parsing worker result", error);
  }
}
