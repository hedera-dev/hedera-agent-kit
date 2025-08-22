import { z } from 'zod';
import { Client } from '@hashgraph/sdk';
import { Context } from '@/shared/configuration';
import { getMirrornodeService } from '@/shared/hedera-utils/mirrornode/hedera-mirrornode-utils';
import { Tool } from '@/shared/tools';
import { PromptGenerator } from '@/shared/utils/prompt-generator';
import { TransactionDetailsResponse } from '@/shared/hedera-utils/mirrornode/types';
import { transactionDetailsQueryParameters } from '@/shared/parameter-schemas/account-query.zod';
import { toDisplayUnit } from '@/shared/hedera-utils/decimals-utils';

export const getTransactionDetailsQueryPrompt = (context: Context = {}) => {
  const contextSnippet = PromptGenerator.getContextSnippet(context);
  const usageInstructions = PromptGenerator.getParameterUsageInstructions();

  return `
${contextSnippet}

This tool will return the transaction details for a given Hedera transaction ID.

Parameters:
- transactionId (str, required): The transaction ID to fetch details for. Should be in format \\"shard.realm.num-sss-nnn\\" format where sss are seconds and nnn are nanoseconds
- nonce (number, optional): Optional nonce value for the transaction
${usageInstructions}

Additional information:
If user provides transaction ID in format 0.0.4177806@1755169980.651721264, parse it to 0.0.4177806-1755169980-651721264 and use it as transaction ID.
`;
};

const postProcess = (transactionDetails: TransactionDetailsResponse, transactionId: string) => {
  if (!transactionDetails.transactions || transactionDetails.transactions.length === 0) {
    return `No transaction details found for transaction ID: ${transactionId}`;
  }

  const results = transactionDetails.transactions.map((tx, index) => {
    let transfersInfo = '';
    if (tx.transfers && tx.transfers.length > 0) {
      transfersInfo = '\nTransfers:\n' + tx.transfers.map(transfer => 
        `  Account: ${transfer.account}, Amount: ${toDisplayUnit(transfer.amount, 8)}ℏ`
      ).join('\n');
    }

    const transactionHeader = transactionDetails.transactions.length > 1 
      ? `Transaction ${index + 1} Details for ${transactionId}`
      : `Transaction Details for ${transactionId}`;

    return `${transactionHeader}
Status: ${tx.result}
Consensus Timestamp: ${tx.consensus_timestamp}
Transaction Hash: ${tx.transaction_hash}
Transaction Fee: ${tx.charged_tx_fee}
Type: ${tx.name}
Entity ID: ${tx.entity_id}${transfersInfo}`;
  });

  return results.join('\n\n' + '='.repeat(50) + '\n\n');
};

export const getTransactionDetailsQuery = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof transactionDetailsQueryParameters>>,
) => {
  try {
    const mirrornodeService = getMirrornodeService(context.mirrornodeService!, client.ledgerId!);
    const transactionDetails = await mirrornodeService.getTransactionDetails(
      params.transactionId,
      params.nonce
    );
    return {
      raw: { transactionId: params.transactionId, transactionDetails },
      humanMessage: postProcess(transactionDetails, params.transactionId),
    };
  } catch (error) {
    console.error('Error getting transaction details', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'Failed to get transaction details';
  }
};

export const GET_TRANSACTION_DETAILS_QUERY_TOOL = 'get_transaction_details_query_tool';

const tool = (context: Context): Tool => ({
  method: GET_TRANSACTION_DETAILS_QUERY_TOOL,
  name: 'Get Transaction Details Query',
  description: getTransactionDetailsQueryPrompt(context),
  parameters: transactionDetailsQueryParameters(context),
  execute: getTransactionDetailsQuery,
});

export default tool;
