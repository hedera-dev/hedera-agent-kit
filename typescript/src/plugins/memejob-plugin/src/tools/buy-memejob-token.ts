import { z } from 'zod';
import { AgentMode, Context, PromptGenerator, Tool } from 'hedera-agent-kit';
import { buyMemejobTokenParameters } from '../memejob.zod';
import { Client } from '@hashgraph/sdk';
import { MJBuyResult } from '@buidlerlabs/memejob-sdk-js';
import { createMemejob } from '../client';
import { toTiny } from '../utils';

const buyMemejobTokenPrompt = (context: Context = {}) => {
  const contextSnippet = PromptGenerator.getContextSnippet(context);
  const usageInstructions = PromptGenerator.getParameterUsageInstructions();

  return `
${contextSnippet}

This tool buys a memecoin/meme token on memejob.

Parameters:
- required.tokenId (string, required): The id of the token to be bought.
- required.amount (number, required): The amount of the token to be bought.
- optional.autoAssociate (boolean, optional): Whether to associate the token or not before buying.
- optional.referrer (evm address, optional): The EVM address of the referrer (e.g. 0x000...000).
${usageInstructions}

IMPORTANT: When Mode is Return Bytes, always present the transaction bytes to the user.
`;
};

/**
 * Executes the buy memejob token operation.
 *
 * This function handles the core logic for purchasing memecoin tokens on the memejob platform.
 * It supports both autonomous execution and manual transaction signing based on the agent mode.
 *
 * @param client - The Hedera client instance
 * @param context - The agent context containing the operational mode
 * @param params - The validated parameters for the buy operation
 * @returns Promise resolving to either MJBuyResult data or transaction bytes based on the operational mode
 *
 * The token amount is automatically converted from decimal to tiny units using the
 * {@link toTiny} utility function.
 *
 * @example
 * ```typescript
 * const result = await buyMemejobToken(client, context, {
 *   required: {
 *     tokenId: '0.0.12345',
 *     amount: 100_000n
 *   },
 *   optional: {
 *     autoAssociate: true,
 *     referrer: '0x1234567890abcdef1234567890abcdef12345678'
 *   }
 * });
 * ```
 */
const buyMemejobToken = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof buyMemejobTokenParameters>>,
) => {
  try {
    const { required, optional } = params;
    const { tokenId, amount } = required;
    const { autoAssociate = false, referrer } = optional || {};

    const memejob = createMemejob(client, context);
    const token = await memejob.getToken(tokenId as `0.0.${number}`);

    const response = await token.buy({
      amount: BigInt(toTiny(amount)),
      autoAssociate: autoAssociate,
      referrer: referrer as `0x${string}`,
    });

    if (context.mode === AgentMode.AUTONOMOUS) {
      const buyResult = response as MJBuyResult;

      return {
        ...buyResult,
        amount: Number(buyResult.amount),
      };
    }

    return {
      bytes: Buffer.from(response as Uint8Array<ArrayBufferLike>).toString('hex'),
    };
  } catch (error) {
    console.error('[BuyMemejobToken] Error creating memejob token:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'Failed to buy memejob token';
  }
};

export const BUY_MEMEJOB_TOKEN_TOOL = 'buy_memejob_token_tool';

const tool = (context: Context): Tool => ({
  method: BUY_MEMEJOB_TOKEN_TOOL,
  name: 'Buy Memejob Token',
  description: buyMemejobTokenPrompt(context),
  parameters: buyMemejobTokenParameters(context),
  execute: buyMemejobToken,
});

export default tool;
