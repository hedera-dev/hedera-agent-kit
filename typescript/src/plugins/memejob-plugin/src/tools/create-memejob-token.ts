import { z } from 'zod';
import { AgentMode, Context, PromptGenerator, Tool } from 'hedera-agent-kit';
import { createMemejobTokenParameters } from '../memejob.zod';
import { Client } from '@hashgraph/sdk';
import { createMemejob } from '../client';
import { toTiny } from '../utils';

const createMemejobTokenPrompt = (context: Context = {}) => {
  const contextSnippet = PromptGenerator.getContextSnippet(context);
  const usageInstructions = PromptGenerator.getParameterUsageInstructions();

  return `
${contextSnippet}

This tool creates a memecoin/meme token on memejob.

Parameters:
- required.name (str, required): The name of the token.
- required.symbol (str, required): The symbol of the token.
- required.memo (str, required): The token metadata IPFS path.
- optional.amount (number, optional): The initial token amount to buy.
- optional.distributeRewards (boolean, optional): Whether to distribute rewards.
- optional.referrer (string, optional): The referrer EVM address.
${usageInstructions}

IMPORTANT: When Mode is Return Bytes, always present the transaction bytes to the user.
`;
};

/**
 * Executes the create memejob token operation.
 *
 * This function handles the core logic for creating memecoin tokens on the memejob platform.
 * It supports both autonomous execution and manual transaction signing based on the agent mode.
 *
 * @param client - The Hedera client instance
 * @param context - The agent context containing the operational mode
 * @param params - The validated parameters for the create operation
 * @returns Promise resolving to either MJToken instance or transaction bytes based on the operational mode
 *
 * @example
 * ```typescript
 * const result = await createMemejobToken(client, context, {
 *   required: {
 *     name: 'My Awesome Token',
 *     symbol: 'MAT',
 *     memp: 'ipfs://<cid>'
 *   },
 *   optional: {
 *     amount: 100_000,
 *     distributeRewards: true,
 *     referrer: '0x1234567890abcdef1234567890abcdef12345678'
 *   }
 * });
 * ```
 */
const createMemejobToken = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof createMemejobTokenParameters>>,
) => {
  try {
    const { required, optional } = params;
    const { name, symbol, memo } = required;
    const { amount = 0, distributeRewards = false, referrer } = optional || {};

    const memejob = createMemejob(client, context);
    const response = await memejob.createToken(
      {
        name,
        symbol,
        memo,
      },
      {
        amount: BigInt(toTiny(amount)),
        distributeRewards: distributeRewards,
        referrer: referrer,
      },
    );

    if (context.mode === AgentMode.AUTONOMOUS) {
      const tokenId = (response as any).tokenId.toString();

      return {
        tokenId,
      };
    }

    return {
      bytes: Buffer.from(response as Uint8Array<ArrayBufferLike>).toString('hex'),
    };
  } catch (error) {
    console.error('[CreateMemejobToken] Error creating memejob token:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'Failed to create memejob token';
  }
};

export const CREATE_MEMEJOB_TOKEN_TOOL = 'create_memejob_token_tool';

const tool = (context: Context): Tool => ({
  method: CREATE_MEMEJOB_TOKEN_TOOL,
  name: 'Create Memejob Token',
  description: createMemejobTokenPrompt(context),
  parameters: createMemejobTokenParameters(context),
  execute: createMemejobToken,
});

export default tool;
