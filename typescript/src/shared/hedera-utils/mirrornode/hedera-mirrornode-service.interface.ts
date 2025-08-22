import {
  TopicMessagesQueryParams,
  AccountResponse,
  TokenBalancesResponse,
  TopicMessagesResponse,
  TokenDetails,
  TransactionDetailsResponse,
} from './types';

export interface IHederaMirrornodeService {
  getAccount(accountId: string): Promise<AccountResponse>;
  getAccountHBarBalance(accountId: string): Promise<BigNumber>;
  getAccountTokenBalances(accountId: string): Promise<TokenBalancesResponse>;
  getTopicMessages(queryParams: TopicMessagesQueryParams): Promise<TopicMessagesResponse>;
  getTokenDetails(tokenId: string): Promise<TokenDetails>;
  getTransactionDetails(transactionId: string, nonce?: number): Promise<TransactionDetailsResponse>;
}
