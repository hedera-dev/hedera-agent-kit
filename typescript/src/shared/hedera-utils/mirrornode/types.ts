import { LedgerId, TokenType } from '@hashgraph/sdk';
import BigNumber from 'bignumber.js';

export const LedgerIdToBaseUrl: Map<string, string> = new Map([
  [LedgerId.MAINNET.toString(), 'https://mainnet-public.mirrornode.hedera.com/api/v1'],
  [LedgerId.TESTNET.toString(), 'https://testnet.mirrornode.hedera.com/api/v1'],
]);

export type AccountTokenBalancesQueryParams = {
  accountId: string;
  tokenId?: string;
};

export type TopicMessagesQueryParams = {
  topicId: string;
  lowerTimestamp: string;
  upperTimestamp: string;
  limit: number;
};

export type TopicMessage = {
  topicId: string;
  message: string;
  consensus_timestamp: string;
};

export type TopicMessagesResponse = {
  topicId: string;
  messages: TopicMessage[];
};

export type TokenBalance = {
  automatic_association: boolean;
  created_timestamp: string;
  token_id: string;
  freeze_status: string;
  kyc_status: string;
  balance: number;
  decimals: number;
};

export type TokenBalancesResponse = {
  tokens: TokenBalance[];
};

export type AccountResponse = {
  accountId: string;
  accountPublicKey: string;
  balance: AccountBalanceResponse;
  evmAddress: string;
};

export type AccountAPIResponse = {
  account: string;
  key: {
    key: string;
    _type: KeyEncryptionType;
  };
  balance: AccountBalanceResponse;
  evm_address: string;
};

export type AccountBalanceResponse = {
  balance: BigNumber;
  timestamp: string;
  tokens: TokenBalance[];
};

export type TopicMessagesAPIResponse = {
  messages: TopicMessage[];
  links: {
    next: string | null;
  };
};

export type KeyEncryptionType = 'ED25519' | 'ECDSA_SECP256K1';

export type TokenDetails = {
  decimals: string;
  name: string;
  symbol: string;
  maxSupply: number;
  type: TokenType;
};

export type TransferData = {
  account: string;
  amount: number;
  is_approval: boolean;
};

export type TransactionData = {
  batch_key: string | null;
  bytes: string | null;
  charged_tx_fee: number;
  consensus_timestamp: string;
  entity_id: string;
  max_fee: string;
  max_custom_fees: any[];
  memo_base64: string;
  name: string;
  nft_transfers: any[];
  node: string;
  nonce: number;
  parent_consensus_timestamp: string | null;
  result: string;
  scheduled: boolean;
  staking_reward_transfers: any[];
  token_transfers: any[];
  transaction_hash: string;
  transaction_id: string;
  transfers: TransferData[];
  valid_duration_seconds: string;
  valid_start_timestamp: string;
};

export type TransactionDetailsResponse = {
  transactions: TransactionData[];
};
