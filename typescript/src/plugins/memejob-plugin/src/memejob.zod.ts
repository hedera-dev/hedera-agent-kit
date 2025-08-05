import z from 'zod';
import { Context } from 'hedera-agent-kit';

export const createMemejobTokenParameters = (_: Context = {}) =>
  z.object({
    required: z.object({
      name: z.string().describe('The name of the token.'),
      symbol: z.string().describe('The symbol of the token.'),
      memo: z.string().describe('The token metadata IPFS path.'),
    }),
    optional: z
      .object({
        amount: z.number().optional().default(0).describe('The initial token amount to buy.'),
        distributeRewards: z
          .boolean()
          .optional()
          .default(true)
          .describe('Whether to distribute rewards.'),
        referrer: z.string().optional().describe('The referrer EVM address.'),
      })
      .optional(),
  });

export const buyMemejobTokenParameters = (_: Context = {}) =>
  z.object({
    required: z.object({
      tokenId: z.string().describe('The ID of the token to be bought'),
      amount: z.number().describe('The amount of the token to be bought.'),
    }),
    optional: z
      .object({
        autoAssociate: z
          .boolean()
          .optional()
          .default(true)
          .describe('Whether to associate the token or not before buying.'),
        referrer: z
          .string()
          .optional()
          .describe('The EVM address of the referrer (e.g. 0x000...000)'),
      })
      .optional(),
  });

export const sellMemejobTokenParameters = (_: Context = {}) =>
  z.object({
    required: z.object({
      tokenId: z.string().describe('The ID of the token to be sold'),
      amount: z.number().describe('The amount of the token to be sold.'),
    }),
    optional: z
      .object({
        instant: z
          .boolean()
          .optional()
          .default(true)
          .describe('Whether to approve token allowance or not before selling.'),
      })
      .optional(),
  });
