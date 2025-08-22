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

export const deleteAccountParameters = (_context: Context = {}) =>
  z.object({
    accountId: z.string().describe('The account ID to delete.'),
    transferAccountId: z.string().optional().describe('The ID of the account to transfer the remaining funds to. If not provided, the operator account ID will be used.'),
  });

export const deleteAccountParametersNormalised = (_context: Context = {}) =>
  z.object({
    accountId: z.instanceof(AccountId),
    transferAccountId: z.instanceof(AccountId),
  })