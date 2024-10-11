import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from "react";
import { OverviewContextType, OverviewData } from "../index";
import {
  IAccountAllPositionsDetailed,
  IAsset,
  IPortfolioAssetOrigin,
  IUnclaimedReward,
} from "@/services/burrow-interfaces";
import { getAccount_all_positions, getAssets } from "@/services/burrow";
import Big from "big.js";
import { shrinkToken } from "@/services/burrow-utils";
import { formatWithCommas_usd } from "@/utils/uiNumber";
import { PortfolioArrow, PortfolioBurrowIcon } from "./icon";
import { BeatLoader } from "react-spinners";
function BurrowPanel() {
  const {
    isSignedIn,
    accountId,
    set_burrow_supplied_value,
    set_burrow_borrowied_value,
    set_burrow_rewards_value,
    set_burrow_done,
    is_mobile,
  } = useContext(OverviewData) as OverviewContextType;
  const [account, setAccount] = useState<IAccountAllPositionsDetailed>();
  const [assets, setAssets] = useState<IAsset[]>();
  const [accountDone, setAccountDone] = useState<boolean>(false);
  const [supplied, setSupplied] = useState<string | number>("0");
  const [borrowed, setBorrowed] = useState<string | number>("0");
  const [unclaimedRewards, setUnclaimedRewards] = useState<IUnclaimedReward[]>(
    []
  );
  const [burrow_data_done, set_burrow_data_done] = useState<boolean>(false);

  useEffect(() => {
    if (isSignedIn) {
      getAccount_all_positions().then(
        (account: IAccountAllPositionsDetailed) => {
          setAccount(account);
          setAccountDone(true);
        }
      );
    }
    getAssets().then((assets: IAsset[]) => {
      setAssets(assets);
    });
  }, [isSignedIn]);
  useEffect(() => {
    if (account && assets) {
      const assetsMap: { [key: string]: IAsset } = assets.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.token_id]: cur,
        };
      }, {});
      let total_deposit_usd = Big(0);
      let total_borrowed_usd = Big(0);
      const collateralTokens = new Set();
      const suppliedMap: { [key: string]: IPortfolioAssetOrigin } =
        account.supplied?.reduce(
          (acc, cur) => ({
            ...acc,
            [cur.token_id]: cur,
          }),
          {}
        ) || {};

      Object.values(account.positions || {}).forEach((positionDetail) => {
        const {
          borrowed,
          collateral,
        }: {
          borrowed: IPortfolioAssetOrigin[];
          collateral: IPortfolioAssetOrigin[];
        } = positionDetail;
        collateral.forEach((item: IPortfolioAssetOrigin) => {
          const { token_id, balance: collateralBalance } = item;
          const asset = assetsMap[token_id];
          const balance = Big(suppliedMap[token_id]?.balance || 0)
            .plus(collateralBalance || 0)
            .toFixed();
          const decimals =
            asset.metadata.decimals + asset.config.extra_decimals;
          total_deposit_usd = total_deposit_usd.plus(
            Big(shrinkToken(balance, decimals) || 0).mul(asset.price.usd || 0)
          );
          collateralTokens.add(token_id);
        });
        borrowed.forEach((item: IPortfolioAssetOrigin) => {
          const { token_id, balance: borrowBalance } = item;
          const asset = assetsMap[token_id];
          const decimals =
            asset.metadata.decimals + asset.config.extra_decimals;
          total_borrowed_usd = total_borrowed_usd.plus(
            Big(shrinkToken(borrowBalance, decimals) || 0).mul(
              asset.price.usd || 0
            )
          );
        });
      });
      Object.keys(suppliedMap).forEach((token_id: string) => {
        if (!collateralTokens.has(token_id)) {
          const asset = assetsMap[token_id];
          const balance = Big(suppliedMap[token_id]?.balance || 0).toFixed();
          const decimals =
            asset.metadata.decimals + asset.config.extra_decimals;
          total_deposit_usd = total_deposit_usd.plus(
            Big(shrinkToken(balance, decimals) || 0).mul(asset.price.usd || 0)
          );
        }
      });
      setSupplied(total_deposit_usd.toFixed());
      setBorrowed(total_borrowed_usd.toFixed());
      // unClaimed rewards
      const unclaimedRewards = getUnclaimedRewards();
      setUnclaimedRewards(unclaimedRewards);
      set_burrow_data_done(true);
    }
    if (accountDone && !account && assets) {
      set_burrow_data_done(true);
    }
  }, [account, assets, accountDone]);

  function getUnclaimedRewards() {
    if (!account || !assets) {
      return [];
    }
    const unclaimedRewardsMap = account
      ? account.farms?.reduce((prev: { [key: string]: string }, curr: any) => {
          for (const reward of curr.rewards) {
            const t = prev[reward.reward_token_id];
            if (t) {
              prev[reward.reward_token_id] = Big(t)
                .plus(reward.unclaimed_amount || 0)
                .toFixed();
            } else {
              prev[reward.reward_token_id] = Big(
                reward.unclaimed_amount || 0
              ).toFixed();
            }
          }
          return prev;
        }, {})
      : {};
    const unclaimedRewards = Object.keys(unclaimedRewardsMap).map((id) => {
      const asset = assets.find((a) => a.token_id === id);
      if (!asset) {
        return null;
      }
      const decimals = asset.metadata.decimals + asset.config.extra_decimals;
      return {
        id,
        unclaimed: shrinkToken(unclaimedRewardsMap[id], decimals),
        symbol: asset.metadata.symbol,
        icon: asset.metadata.icon,
        usd: asset.price.usd,
      };
    });
    return unclaimedRewards as IUnclaimedReward[];
  }
  const [unclaimedRewards$, unclaimedRewardsIcons] = useMemo(() => {
    const $ =
      unclaimedRewards?.reduce((acc, cur) => {
        return Big(cur.unclaimed).mul(cur.usd).plus(acc).toNumber();
      }, 0) || 0;
    const icons =
      unclaimedRewards?.map((i: IUnclaimedReward) => {
        return (
          <img
            key={i.id}
            className="w-4 h-4 -ml-1 rounded-full"
            src={i.icon}
          ></img>
        );
      }) || [];
    return [$, icons];
  }, [unclaimedRewards]);
  useEffect(() => {
    if (burrow_data_done) {
      set_burrow_done(true);
      set_burrow_borrowied_value(String(borrowed));
      set_burrow_supplied_value(String(supplied));
      set_burrow_rewards_value(String(unclaimedRewards$));
    }
  }, [unclaimedRewards$, burrow_data_done, supplied, borrowed]);

  const handleBurrowClick = () => {
    window.open("https://app.burrow.finance/", "_blank");
  };

  const isLoading = !burrow_data_done;
  return (
    <>
      <div
        className="bg-gray-20 bg-opacity-40 rounded-lg p-4 mb-4 hover:bg-gray-20 cursor-pointer text-white"
        onClick={() => {
          handleBurrowClick();
        }}
      >
        <div className="frcb mb-6">
          <div className="flex items-center">
            <div className="bg-gray-220 bg-opacity-60 rounded-md w-6 h-6 mr-2 frcc">
              <PortfolioBurrowIcon />
            </div>
            <p className="text-gray-10 text-sm">Burrow</p>
          </div>
          <PortfolioArrow className="cursor-pointer" />
        </div>
        <div className="flex">
          <div className="w-2/6">
            <p className="mb-1.5 text-base paceGrotesk-Bold">
              {isLoading ? (
                <BeatLoader size={5} color={"#ffffff"} />
              ) : (
                formatWithCommas_usd(supplied)
              )}
            </p>
            <p className="text-xs text-gray-50">Total Supplied</p>
          </div>
          <div className="w-2/6 text-center">
            <p className="mb-1.5 text-base paceGrotesk-Bold">
              {isLoading ? (
                <BeatLoader size={5} color={"#ffffff"} />
              ) : (
                formatWithCommas_usd(unclaimedRewards$)
              )}
            </p>
            <p className="text-xs text-gray-50">Claimable</p>
          </div>
          <div className="w-2/6 pl-8">
            <p className="mb-1.5 text-base paceGrotesk-Bold text-error">
              {isLoading ? (
                <BeatLoader size={5} color={"#ffffff"} />
              ) : (
                "-" + formatWithCommas_usd(borrowed)
              )}
            </p>
            <p className="text-xs text-gray-50">Total Debt</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(BurrowPanel);
