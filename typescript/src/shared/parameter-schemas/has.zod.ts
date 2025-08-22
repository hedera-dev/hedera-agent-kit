import { Context } from '@/shared/configuration';
import { z } from 'zod';
import { AccountId, Hbar } from '@hashgraph/sdk';
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

export const updateAccountParameters = (_context: Context = {}) =>
  z.object({
    // If not passed, will be injected from context in normalisation
    accountId: z.string().optional().describe('Account ID to update (e.g., 0.0.xxxxx). If not provided, operator account ID will be used'),

    maxAutomaticTokenAssociations: z
      .number()
      .int()
      .optional()
      .describe('Max automatic token associations, positive, zero or -1 if unlimited'),
    stakedAccountId: z.string().optional().describe('Staked account ID'),
    accountMemo: z.string().optional().describe('Account memo'),
    declineStakingReward: z.boolean().optional().describe('Decline staking rewards'),
  });

export const updateAccountParametersNormalised = (_context: Context = {}) =>
  z.object({
    accountId: z.instanceof(AccountId),
    maxAutomaticTokenAssociations: z.union([z.number(), z.instanceof(Long)]).optional(),
    stakedAccountId: z.union([z.string(), z.instanceof(AccountId)]).optional(),
    accountMemo: z.string().optional(),
    declineStakingReward: z.boolean().optional(),
  });
