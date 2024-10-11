import getConfig from "@/utils/config";
import { Transaction } from "@/interfaces/swap";
import { executeMultipleTransactions, viewFunction } from "@/utils/near";
import { ftGetStorageBalance } from "../services/ft-contract";
import { getMemeCheckInConfig } from "../components/meme/memeConfig";
import { STORAGE_TO_REGISTER_WITH_FT } from "@/services/creator/storage";
import { getAccountId } from "@/utils/wallet";
const config = getConfig();
const memeCheckInConfig = getMemeCheckInConfig();
export async function query_user_claimed(tokenId: string) {
  const accountId = getAccountId();
  return await checkInViewFunction({
    methodName: "query_user_claimed",
    args: { token: tokenId, user: accountId },
  });
}
export async function query_user_nftInfo() {
  const accountId = getAccountId();
  return await nftViewFunction({
    methodName: "nft_tokens_for_owner",
    args: { account_id: accountId },
  });
}
export async function check_in(tokenIds: string[]) {
  const transactions: Transaction[] = [];
  const accountId = getAccountId();
  const pending = tokenIds.map((tokenId: string) =>
    ftGetStorageBalance(tokenId)
  );
  const resolved = await Promise.all(pending);
  resolved.forEach((balance, index) => {
    if (!balance) {
      transactions.push({
        receiverId: tokenIds[index],
        functionCalls: [
          {
            methodName: "storage_deposit",
            args: {
              account_id: accountId,
              registration_only: true,
            },
            amount: STORAGE_TO_REGISTER_WITH_FT,
            gas: "30000000000000",
          },
        ],
      });
    }
  });
  const funs = tokenIds.map((tokenId: string) => {
    return {
      methodName: "check_in",
      args: { token: tokenId },
      gas: "42000000000000",
      amount: "0.0015",
    };
  });
  transactions.push({
    receiverId: config.MEME_CHECK_IN_CONTRACT_ID,
    functionCalls: funs,
  });
  return executeMultipleTransactions(transactions, false);
}

export async function claim_nft({ media }: { media: string }) {
  const transactions: Transaction[] = [];
  const accountId = getAccountId();
  transactions.push({
    receiverId: config.MEME_NFT_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "nft_mint",
        args: {
          token_owner_id: accountId,
          token_metadata: {
            title: memeCheckInConfig.nftMetaData.title,
            description: memeCheckInConfig.nftMetaData.description,
            media,
          },
        },
        gas: "250000000000000",
        amount: "0.01",
      },
    ],
  });
  return executeMultipleTransactions(transactions, false);
}
export async function get_nft_metadata() {
  const metadata = await nftViewFunction({
    methodName: "nft_metadata",
    args: {},
  });
  return metadata;
}
export async function is_account_already_minted() {
  const accountId = getAccountId();
  return await nftViewFunction({
    methodName: "is_account_already_minted",
    args: {
      account_id: accountId,
    },
  });
}
export const checkInViewFunction = ({ methodName, args }: any) => {
  return viewFunction({
    contractId: config.MEME_CHECK_IN_CONTRACT_ID,
    methodName,
    args,
  });
};
export const nftViewFunction = ({ methodName, args }: any) => {
  return viewFunction({
    contractId: config.MEME_NFT_CONTRACT_ID,
    methodName,
    args,
  });
};
