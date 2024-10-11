import Big from "big.js";
import { FarmBoost, Seed, Transaction } from "./farm";
import {
  currentStorageBalanceOfMeme_farm,
  currentStorageBalanceOfXref_farm,
} from "./account";
import { getAccountId } from "@/utils/wallet";
import {
  ONE_YOCTO_NEAR,
  REF_FARM_BOOST_CONTRACT_ID,
  refMeMeFarmViewFunction,
  xrefMeMeFarmViewFunction,
} from "@/utils/contract";
import { executeMultipleTransactions } from "@/utils/near";
import getConfig from "@/utils/config";
import {
  STORAGE_TO_REGISTER_WITH_MFT,
  storageDepositAction,
} from "./creator/storage";
import { ftGetBalance } from "./token";
import {
  DONATE_RECEIVER_ID,
  getMemeContractConfig,
} from "@/components/meme/memeConfig";
import { WRAP_NEAR_CONTRACT_ID } from "./wrap-near";
import {
  FTStorageBalance,
  check_registration,
  ftViewFunction,
  native_usdc_has_upgrated,
} from "./ft-contract";
import getConfigV2 from "@/utils/configV2";
import { useEffect, useRef, useState } from "react";
import { introCurrentPageStore } from "@/stores/introCurrentPage";

const config = getConfig();
export const REF_MEME_FARM_CONTRACT_ID = config.REF_MEME_FARM_CONTRACT_ID;
const configV2 = getConfigV2();

interface StakeOptions {
  seed: Seed;
  amount: string;
  msg?: string;
  contractId?: any;
}
interface UnStakeOptions {
  seed: Seed;
  amount: string;
  withdrawAmount?: string;
  contractId?: any;
}
export interface IMemefarmConfig {
  delay_withdraw_sec: number;
  seed_slash_rate: number;
  booster_seeds: any;
  max_num_farms_per_booster: number;
  max_num_farms_per_seed: number;
  maximum_locking_duration_sec: number;
  max_locking_multiplier: number;
}
export interface IFarmerWithdraw {
  amount: string;
  apply_timestamp: string;
}
export const checkTokenNeedsStorageDeposit_meme = async () => {
  let storageNeeded;
  const balance = await currentStorageBalanceOfMeme_farm(getAccountId());

  if (!balance) {
    // TDOO
    storageNeeded = "0.1";
  }
  return storageNeeded;
};
export const checkTokenNeedsStorageDeposit_xref = async (contractId: any) => {
  let storageNeeded;
  const balance = await currentStorageBalanceOfXref_farm(
    getAccountId(),
    contractId
  );

  if (!balance) {
    // TDOO
    storageNeeded = "0.1";
  }
  return storageNeeded;
};

export const list_seeds_info = async () => {
  return await refMeMeFarmViewFunction({
    methodName: "list_seeds_info",
  });
};

export const list_seed_farms = async (seed_id: string) => {
  try {
    return await refMeMeFarmViewFunction({
      methodName: "list_seed_farms",
      args: { seed_id },
    });
  } catch {
    return null;
  }
};

export const list_farmer_seeds = async () => {
  const accountId = getAccountId();
  return await refMeMeFarmViewFunction({
    methodName: "list_farmer_seeds",
    args: { farmer_id: accountId },
  });
};

export const list_farmer_withdraws = async () => {
  const accountId = getAccountId();
  return await refMeMeFarmViewFunction({
    methodName: "list_farmer_withdraws",
    args: { farmer_id: accountId },
  });
};

export const get_config = async () => {
  return await refMeMeFarmViewFunction({
    methodName: "get_config",
  });
};
export const get_unclaimed_rewards = async (seed_id: string) => {
  const accountId = getAccountId();
  return await refMeMeFarmViewFunction({
    methodName: "get_unclaimed_rewards",
    args: { farmer_id: accountId, seed_id },
  });
};
export const stake = async ({ seed, amount = "" }: StakeOptions) => {
  const { seed_id } = seed;
  let transactions: Transaction[] = [];
  const functionCalls = [];
  functionCalls.push({
    methodName: "ft_transfer_call",
    args: {
      receiver_id: REF_MEME_FARM_CONTRACT_ID,
      amount,
      msg: JSON.stringify("Free"),
    },
    amount: ONE_YOCTO_NEAR,
    gas: "180000000000000",
  });
  transactions.push({
    receiverId: seed_id,
    functionCalls,
  });
  const neededStorage = await checkTokenNeedsStorageDeposit_meme();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_MEME_FARM_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  transactions = await withdrawRewards(seed, transactions);
  return executeMultipleTransactions(transactions, false);
};
export const unStake = async ({
  seed,
  amount,
  withdrawAmount,
}: UnStakeOptions) => {
  const { seed_id } = seed;
  let transactions: Transaction[] = [];
  if (withdrawAmount) {
    transactions.push({
      receiverId: REF_MEME_FARM_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "withdraw_seed",
          args: {
            seed_id,
            amount: withdrawAmount,
          },
          gas: "200000000000000",
        },
      ],
    });
  }
  transactions.push({
    receiverId: REF_MEME_FARM_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "unlock_and_unstake_seed",
        args: {
          seed_id,
          unlock_amount: "0",
          unstake_amount: amount,
        },
        amount: ONE_YOCTO_NEAR,
        gas: "200000000000000",
      },
    ],
  });
  const neededStorage = await checkTokenNeedsStorageDeposit_meme();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  transactions = await withdrawRewards(seed, transactions);

  return executeMultipleTransactions(transactions, false);
};
export const withdraw = async ({
  seed_id,
  amount,
}: {
  seed_id: string;
  amount: string;
}) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_MEME_FARM_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "withdraw_seed",
          args: {
            seed_id,
            amount,
          },
          gas: "200000000000000",
        },
      ],
    },
  ];

  const neededStorage_boost = await checkTokenNeedsStorageDeposit_meme();
  if (neededStorage_boost) {
    transactions.push({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage_boost })],
    });
  }
  return executeMultipleTransactions(transactions, false);
};
export const claim_all = async ({
  seed,
  xrefSeed,
  xrefContractId,
}: {
  seed?: Seed;
  xrefSeed?: Seed;
  xrefContractId?: any;
}): Promise<any> => {
  let transactions: Transaction[] = [];
  if (seed) {
    const { seed_id } = seed;
    transactions.push({
      receiverId: REF_MEME_FARM_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "claim_reward_by_seed",
          args: { seed_id },
          gas: "200000000000000",
        },
      ],
    });
    transactions = await withdrawRewards(seed, transactions);
  }
  if (xrefSeed) {
    const { seed_id } = xrefSeed;
    transactions.push({
      receiverId: xrefContractId,
      functionCalls: [
        {
          methodName: "claim_reward_by_seed",
          args: { seed_id },
          gas: "200000000000000",
        },
      ],
    });
    transactions = await withdrawRewardsXref(
      xrefSeed,
      transactions,
      xrefContractId
    );
  }
  return executeMultipleTransactions(transactions, false);
};
export const claim = async (seed: Seed): Promise<any> => {
  const { seed_id } = seed;
  let transactions: Transaction[] = [];
  transactions.push({
    receiverId: REF_MEME_FARM_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "claim_reward_by_seed",
        args: { seed_id },
        gas: "200000000000000",
      },
    ],
  });
  transactions = await withdrawRewards(seed, transactions);
  return executeMultipleTransactions(transactions, false);
};
export const xrefClaim = async (
  contractId: string,
  seed: Seed
): Promise<any> => {
  let transactions: Transaction[] = [];
  const { seed_id } = seed;
  transactions.push({
    receiverId: contractId,
    functionCalls: [
      {
        methodName: "claim_reward_by_seed",
        args: { seed_id },
        gas: "200000000000000",
      },
    ],
  });
  transactions = await withdrawRewardsXref(seed, transactions, contractId);
  return executeMultipleTransactions(transactions);
};

export const xref_list_seeds_info = async (contractId: any) => {
  return xrefMeMeFarmViewFunction({
    contractId,
    methodName: "list_seeds_info",
  });
};
export const xref_list_farmer_seeds = async (contractId: any) => {
  const accountId = getAccountId();
  return await xrefMeMeFarmViewFunction({
    contractId,
    methodName: "list_farmer_seeds",
    args: { farmer_id: accountId },
  });
};
export const get_xref_unclaimed_rewards = async (
  contractId: string,
  seed_id: string
) => {
  const accountId = getAccountId();
  return await xrefMeMeFarmViewFunction({
    contractId,
    methodName: "get_unclaimed_rewards",
    args: { farmer_id: accountId, seed_id },
  });
};
export const xref_list_farmer_withdraws = async (contractId: any) => {
  const accountId = getAccountId();
  return await xrefMeMeFarmViewFunction({
    contractId,
    methodName: "list_farmer_withdraws",
    args: { farmer_id: accountId },
  });
};
export const get_xref_config = async (contractId: any) => {
  return await xrefMeMeFarmViewFunction({
    contractId,
    methodName: "get_config",
  });
};
export const xref_list_seed_farms = async (
  contractId: any,
  seed_id: string
) => {
  try {
    return await xrefMeMeFarmViewFunction({
      contractId,
      methodName: "list_seed_farms",
      args: { seed_id },
    });
  } catch {
    return null;
  }
};
export const get_donate_list = async () => {
  const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
  const balances = await Promise.all(
    Object.keys(MEME_TOKEN_XREF_MAP).map((tokenId) =>
      ftGetBalance(tokenId, DONATE_RECEIVER_ID)
    )
  );
  return balances.reduce(
    (acc, balance, index) => ({
      ...acc,
      [Object.keys(MEME_TOKEN_XREF_MAP)[index]]: balance,
    }),
    {}
  );
};

export const xrefStake = async ({
  seed,
  amount = "",
  contractId,
}: StakeOptions) => {
  const { seed_id } = seed;
  let transactions: Transaction[] = [];
  const functionCalls = [];
  functionCalls.push({
    methodName: "ft_transfer_call",
    args: {
      receiver_id: contractId,
      amount,
      msg: JSON.stringify("Free"),
    },
    amount: ONE_YOCTO_NEAR,
    gas: "180000000000000",
  });
  transactions.push({
    receiverId: seed_id,
    functionCalls,
  });
  const neededStorage = await checkTokenNeedsStorageDeposit_xref(contractId);
  if (neededStorage) {
    transactions.unshift({
      receiverId: contractId,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  transactions = await withdrawRewardsXref(seed, transactions, contractId);
  return executeMultipleTransactions(transactions, false);
};
export const xrefUnStake = async ({
  seed,
  amount,
  withdrawAmount,
  contractId,
}: UnStakeOptions) => {
  const { seed_id } = seed;
  let transactions: Transaction[] = [];
  if (withdrawAmount) {
    transactions.push({
      receiverId: contractId,
      functionCalls: [
        {
          methodName: "withdraw_seed",
          args: {
            seed_id,
            amount: withdrawAmount,
          },
          gas: "200000000000000",
        },
      ],
    });
  }
  transactions.push({
    receiverId: contractId,
    functionCalls: [
      {
        methodName: "unlock_and_unstake_seed",
        args: {
          seed_id,
          unlock_amount: "0",
          unstake_amount: amount,
        },
        amount: ONE_YOCTO_NEAR,
        gas: "200000000000000",
      },
    ],
  });
  const neededStorage = await checkTokenNeedsStorageDeposit_xref(contractId);
  if (neededStorage) {
    transactions.unshift({
      receiverId: contractId,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  transactions = await withdrawRewardsXref(seed, transactions, contractId);
  return executeMultipleTransactions(transactions, false);
};
export const xrefWithdraw = async ({
  contractId,
  seed_id,
  amount,
}: {
  contractId: string;
  seed_id: string;
  amount: string;
}) => {
  const transactions: Transaction[] = [
    {
      receiverId: contractId,
      functionCalls: [
        {
          methodName: "withdraw_seed",
          args: {
            seed_id,
            amount,
          },
          gas: "200000000000000",
        },
      ],
    },
  ];

  const neededStorage_boost = await checkTokenNeedsStorageDeposit_xref(
    contractId
  );
  if (neededStorage_boost) {
    transactions.push({
      receiverId: contractId,
      functionCalls: [storageDepositAction({ amount: neededStorage_boost })],
    });
  }
  return executeMultipleTransactions(transactions, false);
};

export const ftGetStorageBalance = async (
  tokenId: string,
  accountId = getAccountId()
): Promise<FTStorageBalance | null> => {
  if (configV2.NO_REQUIRED_REGISTRATION_TOKEN_IDS.includes(tokenId)) {
    const r = await native_usdc_has_upgrated(tokenId);
    if (r) {
      return ftViewFunction(tokenId, {
        methodName: "storage_balance_of",
        args: { account_id: accountId },
      });
    } else {
      return check_registration(tokenId).then((is_registration) => {
        if (is_registration) {
          return new Promise((resove) => {
            resove({ available: "1", total: "1" });
          });
        } else {
          return new Promise((resove) => {
            resove(null);
          });
        }
      });
    }
  }
  return ftViewFunction(tokenId, {
    methodName: "storage_balance_of",
    args: { account_id: accountId },
  });
};

export const donate = async ({
  tokenId,
  amount,
}: {
  tokenId: string;
  amount: string;
}) => {
  const transactions: Transaction[] = [];
  const ftBalance = await ftGetStorageBalance(tokenId, DONATE_RECEIVER_ID);
  if (!ftBalance) {
    transactions.push({
      receiverId: tokenId,
      functionCalls: [
        storageDepositAction({
          accountId: DONATE_RECEIVER_ID,
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  transactions.push({
    receiverId: tokenId,
    functionCalls: [
      {
        methodName: "ft_transfer",
        args: {
          receiver_id: DONATE_RECEIVER_ID,
          amount,
        },
        amount: ONE_YOCTO_NEAR,
        gas: "180000000000000",
      },
    ],
  });
  return executeMultipleTransactions(transactions, false);
};
async function withdrawRewards(seed: Seed, transactions: Transaction[]) {
  const { farmList, seed_id } = seed;
  const rewardIds = farmList
    ? farmList.map((farm: FarmBoost) => farm.terms.reward_token)
    : [];
  const functionCalls: any[] = [];
  const ftBalancePromiseList: any[] = [];
  rewardIds?.forEach((token_id) => {
    const ftBalance = ftGetStorageBalance(token_id);
    ftBalancePromiseList.push(ftBalance);
    functionCalls.push({
      methodName: "withdraw_reward",
      args: {
        token_id,
      },
      gas: "50000000000000",
    });
  });
  const resolvedBalanceList = await Promise.all(ftBalancePromiseList);
  resolvedBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.unshift({
        receiverId: rewardIds[index],
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_MFT,
          }),
        ],
      });
    }
  });
  if (functionCalls.length) {
    transactions.push({
      receiverId: REF_MEME_FARM_CONTRACT_ID,
      functionCalls,
    });
  }
  let unclaimed_rewards: { [key: string]: any } = {};
  try {
    unclaimed_rewards = await get_unclaimed_rewards(seed_id);
  } catch (error) {}
  const wnear_rewards_amount = unclaimed_rewards[WRAP_NEAR_CONTRACT_ID];
  if (Big(wnear_rewards_amount || 0).gt(0)) {
    transactions.push({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "near_withdraw",
          args: {
            amount: wnear_rewards_amount,
          },
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }
  return transactions;
}
async function withdrawRewardsXref(
  seed: Seed,
  transactions: Transaction[],
  contractId: string
) {
  const { farmList, seed_id } = seed;
  const rewardIds =
    farmList?.map((farm: FarmBoost) => farm.terms.reward_token) || [];
  const functionCalls: any[] = [];
  const ftBalancePromiseList: any[] = [];
  rewardIds?.forEach((token_id) => {
    const ftBalance = ftGetStorageBalance(token_id);
    ftBalancePromiseList.push(ftBalance);
    functionCalls.push({
      methodName: "withdraw_reward",
      args: {
        token_id,
      },
      gas: "50000000000000",
    });
  });
  const resolvedBalanceList = await Promise.all(ftBalancePromiseList);
  resolvedBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.unshift({
        receiverId: rewardIds[index],
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_MFT,
          }),
        ],
      });
    }
  });
  if (functionCalls.length) {
    transactions.push({
      receiverId: contractId,
      functionCalls,
    });
  }
  let unclaimed_rewards: {
    [key: string]: any;
  } = {};
  try {
    unclaimed_rewards = await get_xref_unclaimed_rewards(contractId, seed_id);
  } catch (error) {}
  const wnear_rewards_amount = unclaimed_rewards[WRAP_NEAR_CONTRACT_ID];
  if (Big(wnear_rewards_amount || 0).gt(0)) {
    transactions.push({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: "near_withdraw",
          args: {
            amount: wnear_rewards_amount,
          },
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }
  return transactions;
}

export function useScrollToTopOnFirstPage() {
  const [hasGuided, setHasGuided] = useState(false);
  const introRef = useRef<HTMLDivElement | null>(null);
  const { currentPage, hasLoaingOver } = introCurrentPageStore() as any;

  useEffect(() => {
    const guided = JSON.parse(localStorage.getItem("hasGuided") || "false");
    setHasGuided(guided);
  }, []);
  useEffect(() => {
    if (introRef.current && hasLoaingOver) {
      const rect = introRef.current.getBoundingClientRect();
      const offset = window.innerHeight / 2;
      const scrollTop = rect.top + window.pageYOffset - offset;

      window.scroll({
        top: scrollTop,
        behavior: "smooth",
      });

      // introRef.current.scrollIntoView({
      //   behavior: 'smooth',
      // });
    }
  }, [currentPage, hasLoaingOver]);
  return { introRef, currentPage, hasGuided };
}
