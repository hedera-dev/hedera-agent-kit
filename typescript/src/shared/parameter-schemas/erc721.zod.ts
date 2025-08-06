import { Context } from '@/shared/configuration';
import { z } from 'zod';

export const createERC721Parameters = (_context: Context = {}) =>
  z.object({
    tokenName: z.string().describe('The name of the token.'),
    tokenSymbol: z.string().describe('The symbol of the token.'),
    baseURI: z.string().default('').describe('The base URI for token metadata.'),
  });
