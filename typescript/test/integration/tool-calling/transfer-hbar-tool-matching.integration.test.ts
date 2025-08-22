import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AgentExecutor } from 'langchain/agents';
import { HederaLangchainToolkit } from '@/langchain';
import {
  createLangchainTestSetup,
  getToolCallFromResult,
  expectToolCall,
  type LangchainTestSetup,
} from '../../utils/langchain-test-setup';

describe('Transfer HBAR Tool Matching Integration Tests', () => {
  let testSetup: LangchainTestSetup;
  let agentExecutor: AgentExecutor;
  let toolkit: HederaLangchainToolkit;

  beforeAll(async () => {
    testSetup = await createLangchainTestSetup();
    agentExecutor = testSetup.agentExecutor;
    toolkit = testSetup.toolkit;
  });

  afterAll(async () => {
    if (testSetup) {
      testSetup.cleanup();
    }
  });

  describe('Tool Matching and Parameter Extraction', () => {
    it('should match transfer HBAR tool for simple transfer request', async () => {
      const input = 'Transfer 1 HBAR to 0.0.1';

      const result = await agentExecutor.invoke({ input });
      const toolCall = getToolCallFromResult(result);

      expectToolCall(toolCall, 'transfer_hbar_tool', toolInput => {
        expect(toolInput.transfers).toBeDefined();
        expect(toolInput.transfers).toHaveLength(1);
        expect(toolInput.transfers[0].accountId).toBe('0.0.1');
        expect(toolInput.transfers[0].amount).toBe(1);
      });
    });

    it('should match transfer HBAR tool with decimal amount', async () => {
      const input = 'Send 0.5 HBAR to account 0.0.2222';

      const result = await agentExecutor.invoke({ input });
      const toolCall = getToolCallFromResult(result);

      expectToolCall(toolCall, 'transfer_hbar_tool', toolInput => {
        expect(toolInput.transfers[0].accountId).toBe('0.0.2222');
        expect(toolInput.transfers[0].amount).toBe(0.5);
      });
    });

    it('should match transfer HBAR tool with memo', async () => {
      const input = 'Transfer 2 HBAR to 0.0.3333 with memo "Payment for services"';

      const result = await agentExecutor.invoke({ input });
      const toolCall = getToolCallFromResult(result);

      expectToolCall(toolCall, 'transfer_hbar_tool', toolInput => {
        expect(toolInput.transfers[0].accountId).toBe('0.0.3333');
        expect(toolInput.transfers[0].amount).toBe(2);
        expect(toolInput.transactionMemo).toBe('Payment for services');
      });
    });

    it('should match transfer HBAR tool for multiple recipients', async () => {
      const input = 'Send 1 HBAR to 0.0.1111 and 2 HBAR to 0.0.2222';

      const result = await agentExecutor.invoke({ input });
      const toolCall = getToolCallFromResult(result);

      expectToolCall(toolCall, 'transfer_hbar_tool', toolInput => {
        expect(toolInput.transfers).toHaveLength(2);
        expect(toolInput.transfers[0].accountId).toBe('0.0.1111');
        expect(toolInput.transfers[0].amount).toBe(1);
        expect(toolInput.transfers[1].accountId).toBe('0.0.2222');
        expect(toolInput.transfers[1].amount).toBe(2);
      });
    });

    it('should match transfer HBAR tool with explicit source account', async () => {
      const input = 'Transfer 0.1 HBAR from 0.0.5555 to 0.0.6666';

      const result = await agentExecutor.invoke({ input });
      const toolCall = getToolCallFromResult(result);

      expectToolCall(toolCall, 'transfer_hbar_tool', toolInput => {
        expect(toolInput.transfers[0].accountId).toBe('0.0.6666');
        expect(toolInput.transfers[0].amount).toBe(0.1);
        expect(toolInput.sourceAccountId).toBe('0.0.5555');
      });
    });

    it('should handle various natural language variations', async () => {
      const variations = [
        { input: 'Please send 5 HBAR to account 0.0.7777', accountId: '0.0.7777', amount: 5 },
        { input: 'I want to transfer 3.14 HBAR to 0.0.8888', accountId: '0.0.8888', amount: 3.14 },
        { input: 'Can you move 10 HBAR to 0.0.9999?', accountId: '0.0.9999', amount: 10 },
        { input: 'Pay 0.01 HBAR to 0.0.1010', accountId: '0.0.1010', amount: 0.01 },
      ];

      for (const variation of variations) {
        const result = await agentExecutor.invoke({ input: variation.input });
        const toolCall = getToolCallFromResult(result);

        expectToolCall(toolCall, 'transfer_hbar_tool', toolInput => {
          expect(toolInput.transfers).toBeDefined();
          expect(toolInput.transfers).toHaveLength(1);
          expect(toolInput.transfers[0].accountId).toBe(variation.accountId);
          expect(toolInput.transfers[0].amount).toBe(variation.amount);
        });
      }
    });

    it('should extract correct parameters for complex transfer request', async () => {
      const input =
        'Transfer 15.5 HBAR to 0.0.12345 with the memo "Monthly payment - invoice #123"';

      const result = await agentExecutor.invoke({ input });
      const toolCall = getToolCallFromResult(result);

      expectToolCall(toolCall, 'transfer_hbar_tool', toolInput => {
        expect(toolInput.transfers[0].accountId).toBe('0.0.12345');
        expect(toolInput.transfers[0].amount).toBe(15.5);
        expect(toolInput.transactionMemo).toBe('Monthly payment - invoice #123');
      });
    });

    it('should extract correct parameters for not straight forward user input', async () => {
      const input = 'Transfer 15.5 HBAR to account 0.0.12345 with "Monthly payment - invoice #123"';

      const result = await agentExecutor.invoke({ input });
      const toolCall = getToolCallFromResult(result);

      expectToolCall(toolCall, 'transfer_hbar_tool', toolInput => {
        expect(toolInput.transfers[0].accountId).toBe('0.0.12345');
        expect(toolInput.transfers[0].amount).toBe(15.5);
        expect(toolInput.transactionMemo).toBe('Monthly payment - invoice #123');
      });
    });
  });

  describe('Tool Available', () => {
    it('should have transfer HBAR tool available', () => {
      const tools = toolkit.getTools();
      const transferHbarTool = tools.find(tool => tool.name === 'transfer_hbar_tool');

      expect(transferHbarTool).toBeDefined();
      expect(transferHbarTool!.name).toBe('transfer_hbar_tool');
      expect(transferHbarTool!.description).toContain('transfer HBAR');
    });
  });
});
