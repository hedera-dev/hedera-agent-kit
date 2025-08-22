import { z } from 'zod';
import type { Context } from '@/shared/configuration';
import type { Tool } from '@/shared/tools';
import { Client } from '@hashgraph/sdk';
import { handleTransaction, RawTransactionResponse } from '@/shared/strategies/tx-mode-strategy';
import HederaBuilder from '@/shared/hedera-utils/hedera-builder';
import { createAccountParameters } from '@/shared/parameter-schemas/has.zod';
import HederaParameterNormaliser from '@/shared/hedera-utils/hedera-parameter-normaliser';
import { PromptGenerator } from '@/shared/utils/prompt-generator';
import { getMirrornodeService } from '@/shared/hedera-utils/mirrornode/hedera-mirrornode-utils';

const createAccountPrompt = (context: Context = {}) => {
  const contextSnippet = PromptGenerator.getContextSnippet(context);
  const usageInstructions = PromptGenerator.getParameterUsageInstructions();

  return `
${contextSnippet}

This tool will create a new Hedera account with a passed public key. If not passed, the tool will use operators public key.

Parameters:
- publicKey (string, optional): Public key to use for the account. If not provided, the tool will use the operators public key.
- accountMemo (string, optional): Optional memo for the account
- initialBalance (number, optional, default 0): Initial HBAR to fund the account
- maxAutomaticTokenAssociations (number, optional, default -1): -1 means unlimited
${usageInstructions}
`;
};

const postProcess = (response: RawTransactionResponse) => {
  const accountIdStr = response.accountId ? response.accountId.toString() : 'unknown';
  return `Account created successfully.\nTransaction ID: ${response.transactionId}\nNew Account ID: ${accountIdStr}\n}`;
};

const createAccount = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof createAccountParameters>>,
) => {
  try {
    const mirrornodeService = getMirrornodeService(context.mirrornodeService!, client.ledgerId!);

    // Normalise params to match AccountCreateTransaction props
    const normalisedParams = await HederaParameterNormaliser.normaliseCreateAccount(
      params,
      context,
      client,
      mirrornodeService,
    );

    // Build transaction
    const tx = HederaBuilder.createAccount(normalisedParams);

    const result = await handleTransaction(tx, client, context, postProcess);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Failed to create account';
  }
};

export const CREATE_ACCOUNT_TOOL = 'create_account_tool';

const tool = (context: Context): Tool => ({
  method: CREATE_ACCOUNT_TOOL,
  name: 'Create Account',
  description: createAccountPrompt(context),
  parameters: createAccountParameters(context),
  execute: createAccount,
});

export default tool;
