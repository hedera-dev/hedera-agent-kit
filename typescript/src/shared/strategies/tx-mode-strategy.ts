import { AccountId, Client, TokenId, TopicId, Transaction, TransactionId } from '@hashgraph/sdk';
import { AgentMode, Context } from '@/shared/configuration';

interface TxModeStrategy {
  handle<T extends Transaction>(
    tx: T,
    client: Client,
    context: Context,
    postProcess?: (response: RawTransactionResponse) => unknown,
  ): Promise<unknown>;
}

export interface RawTransactionResponse {
  status: number;
  accountId: AccountId | null;
  tokenId: TokenId | null;
  transactionId: string;
  topicId: TopicId | null;
}

export interface ExecuteStrategyResult {
  raw: RawTransactionResponse;
  humanMessage: string;
}

class ExecuteStrategy implements TxModeStrategy {
  defaultPostProcess(response: RawTransactionResponse): string {
    return JSON.stringify(response, null, 2);
  }

  async handle(
    tx: Transaction,
    client: Client,
    context: Context,
    postProcess: (response: RawTransactionResponse) => string = this.defaultPostProcess,
  ) {
    const submit = await tx.execute(client);
    const receipt = await submit.getReceipt(client);
    const rawTransactionResponse: RawTransactionResponse = {
      status: receipt.status._code,
      accountId: receipt.accountId,
      tokenId: receipt.tokenId,
      transactionId: tx.transactionId?.toString() ?? '',
      topicId: receipt.topicId,
    };
    return {
      raw: rawTransactionResponse,
      humanMessage: postProcess(rawTransactionResponse),
    };
  }
}

class ReturnBytesStrategy implements TxModeStrategy {
  async handle(tx: Transaction, _client: Client, context: Context) {
    if (!context.accountId) throw new Error('…');
    const id = TransactionId.generate(context.accountId);
    tx.setNodeAccountIds([new AccountId(4), new AccountId(5)])
      .setTransactionId(id)
      .freeze();
    return { bytes: tx.toBytes() };
  }
}

const getStrategyFromContext = (context: Context) => {
  if (context.mode === AgentMode.RETURN_BYTES) {
    return new ReturnBytesStrategy();
  }
  return new ExecuteStrategy();
};

export const handleTransaction = async (
  tx: Transaction,
  client: Client,
  context: Context,
  postProcess?: (response: RawTransactionResponse) => string,
) => {
  const strategy = getStrategyFromContext(context);
  return await strategy.handle(tx, client, context, postProcess);
};
