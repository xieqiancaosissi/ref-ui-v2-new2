import { useEffect, useState } from "react";
import { currentRefPrice } from "../services/indexer";

const REFRESH_TIME = 60 * 1000;
export const useRefPrice = () => {
  const [price, setPrice] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const callback = () =>
    currentRefPrice().then((res) => {
      res && setPrice(res);
      setLoading(false);
    });

  useEffect(() => {
    callback();
    const timer = setInterval(callback, REFRESH_TIME);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return {
    refPrice: price,
    priceLoading: loading,
  };
};
