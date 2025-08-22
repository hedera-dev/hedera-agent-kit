import { Context } from '@/shared/configuration';
import { z } from 'zod';
import { AccountId, Hbar, Key } from '@hashgraph/sdk';
import BigNumber from 'bignumber.js';
import Long from 'long';

export const transferHbarParameters = (_context: Context = {}) =>
  z.object({
    transfers: z
      .array(
        z.object({
          accountId: z.string().describe('Recipient account ID'),
          amount: z.number().describe('Amount of HBAR to transfer'),
        }),
      )
      .describe('Array of HBAR transfers'),
    sourceAccountId: z.string().optional().describe('Sender account ID'),
    transactionMemo: z.string().optional().describe('Memo to include with the transaction'),
  });

export const transferHbarParametersNormalised = (_context: Context = {}) =>
  z.object({
    hbarTransfers: z.array(
      z.object({
        accountId: z.union([z.string(), z.instanceof(AccountId)]),
        amount: z.union([
          z.number(),
          z.string(),
          z.instanceof(Hbar),
          z.instanceof(Long),
          z.instanceof(BigNumber),
        ]),
      }),
    ),
    transactionMemo: z.string().optional(),
  });

export const createAccountParameters = (_context: Context = {}) =>
  z.object({
    publicKey: z
      .string()
      .optional()
      .describe('Account public key. If not provided, a public key of the operator will be used'),
    accountMemo: z.string().optional().describe('Optional memo for the account'),
    initialBalance: z
      .number()
      .optional()
      .default(0)
      .describe('Initial HBAR balance to fund the account (defaults to 0)'),
    maxAutomaticTokenAssociations: z
      .number()
      .optional()
      .default(-1)
      .describe('Max automatic token associations (-1 for unlimited)'),
  });

// Normalized schema that matches AccountCreateTransaction props
export const createAccountParametersNormalised = (_context: Context = {}) =>
  z.object({
    accountMemo: z.string().optional(),
    initialBalance: z.union([z.string(), z.number()]).optional(),
    key: z.instanceof(Key).optional(),
    maxAutomaticTokenAssociations: z.union([z.number(), z.instanceof(Long)]).optional(),
  });
