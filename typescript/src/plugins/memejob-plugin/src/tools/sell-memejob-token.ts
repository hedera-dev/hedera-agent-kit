import { z } from 'zod';
import { AgentMode, Context, PromptGenerator, Tool } from 'hedera-agent-kit';
import { Client } from '@hashgraph/sdk';
import { MJSellResult } from '@buidlerlabs/memejob-sdk-js';
import { sellMemejobTokenParameters } from '../memejob.zod';
import { createMemejob } from '../client';
import { toTiny } from '../utils';

const sellMemejobTokenPrompt = (context: Context = {}) => {
  const contextSnippet = PromptGenerator.getContextSnippet(context);
  const usageInstructions = PromptGenerator.getParameterUsageInstructions();

  return `
${contextSnippet}

This tool sells a memecoin/meme token on memejob.

Parameters:
- required.tokenId (string, required): The id of the token to be sold
- required.amount (number, required): The amount of the token to be sold
- optional.instant (boolean, optional): Whether to approve token allowance or not before selling
${usageInstructions}

IMPORTANT: When Mode is Return Bytes, always present the transaction bytes to the user.
`;
};

/**
 * Executes the sell memejob token operation.
 *
 * This function handles the core logic for purchasing memecoin tokens on the memejob platform.
 * It supports both autonomous execution and manual transaction signing based on the agent mode.
 *
 * @param client - The Hedera client instance
 * @param context - The agent context containing the operational mode
 * @param params - The validated parameters for the sell operation
 * @returns Promise resolving to either MJSellResult data or transaction bytes based on the operational mode
 *
 * The token amount is automatically converted from decimal to tiny units using the
 * {@link toTiny} utility function.
 *
 * @example
 * ```typescript
 * const result = await sellMemejobToken(client, context, {
 *   required: {
 *     tokenId: '0.0.12345',
 *     amount: 100_000n
 *   },
 *   optional: {
 *     instant: true
 *   }
 * });
 * ```
 */
const sellMemejobToken = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof sellMemejobTokenParameters>>,
) => {
  try {
    const { required, optional } = params;
    const { tokenId, amount } = required;
    const { instant = true } = optional || {};

    const memejob = createMemejob(client, context);
    const token = await memejob.getToken(tokenId as `0.0.${number}`);

    const response = await token.sell({
      amount: BigInt(toTiny(amount)),
      instant: instant,
    });

    if (context.mode === AgentMode.AUTONOMOUS) {
      const sellResult = response as MJSellResult;

      return {
        ...sellResult,
        amount: Number(sellResult.amount),
      };
    }

    return {
      bytes: Buffer.from(response as Uint8Array<ArrayBufferLike>).toString('hex'),
    };
  } catch (error) {
    console.error('[SellMemejobToken] Error selling memejob token:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'Failed to sell memejob token';
  }
};

export const SELL_MEMEJOB_TOKEN_TOOL = 'sell_memejob_token_tool';

const tool = (context: Context): Tool => ({
  method: SELL_MEMEJOB_TOKEN_TOOL,
  name: 'Sell Memejob Token',
  description: sellMemejobTokenPrompt(context),
  parameters: sellMemejobTokenParameters(context),
  execute: sellMemejobToken,
});

export default tool;
