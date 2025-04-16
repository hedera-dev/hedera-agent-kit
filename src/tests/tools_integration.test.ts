import { describe, expect, it, beforeAll } from 'vitest';
import HederaAgentKit from '../agent';
import { createHederaTools } from '../langchain';
import * as dotenv from 'dotenv';
import { HederaGetBalanceTool } from '../langchain/tools/hbar/get_hbar_balance_tool';
import { initializeHCS10Client } from '@hashgraphonline/standards-agent-kit';

// Load environment variables
dotenv.config();

describe('Tools Integration Tests', () => {
  let hederaKit: HederaAgentKit;
  
  // Set up test variables
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  const networkType = process.env.HEDERA_NETWORK_TYPE as "mainnet" | "testnet" | "previewnet" || "testnet";
  
  beforeAll(() => {
    // Skip tests if required environment variables are not set
    if (!accountId || !privateKey) {
      console.warn('Skipping tool integration tests - required environment variables not set');
    }
    
    // Initialize HederaAgentKit
    hederaKit = new HederaAgentKit(
      accountId!,
      privateKey!,
      process.env.HEDERA_PUBLIC_KEY || undefined,
      networkType
    );
  });
  
  it('createHederaTools returns both Hedera and Standards tools', () => {
    // Skip test if environment variables are not available
    if (!accountId || !privateKey) {
      console.warn('Skipping test - required environment variables not set');
      return;
    }
    
    // Get all tools
    const tools = createHederaTools(hederaKit);
    
    // Verify tools array is not empty
    expect(tools.length).toBeGreaterThan(0);
    
    // Define expected tool names
    const expectedHederaTools = [
      'hedera_get_hbar_balance',
      'hedera_create_topic',
      'hedera_delete_topic',
      'hedera_get_topic_info',
      'hedera_get_topic_messages',
      'hedera_submit_topic_message',
      'hedera_airdrop_token',
      'hedera_associate_token',
      'hedera_claim_airdrop',
      'hedera_create_fungible_token',
      'hedera_create_non_fungible_token',
      'hedera_dissociate_token',
      'hedera_get_all_token_balances',
      'hedera_get_hts_balance',
      'hedera_get_pending_airdrop',
      'hedera_get_token_holders',
      'hedera_mint_fungible_token',
      'hedera_mint_nft',
      'hedera_reject_token',
      'hedera_transfer_hbar',
      'hedera_transfer_token'
    ];
    
    const expectedStandardsTools = [
      'register_agent',
      'connection',
      'initiate_connection',
      'list_connections',
      'check_messages',
      'find_registrations',
      'connection_monitor',
      'accept_connection_request',
      'send_message',
      'send_message_to_connection',
      'manage_connection_requests',
      'list_unapproved_connection_requests',
      'retrieve_profile'
    ];
    
    // Check for Hedera tools
    for (const toolName of expectedHederaTools) {
      const tool = tools.find(t => t.name === toolName);
      expect(tool).toBeDefined();
    }
    
    // Check for Standards tools
    for (const toolName of expectedStandardsTools) {
      const tool = tools.find(t => t.name === toolName);
      expect(tool).toBeDefined();
    }
    
    // Verify specific tool instance types
    const balanceTool = tools.find(t => t.name === 'hedera_get_hbar_balance');
    expect(balanceTool).toBeInstanceOf(HederaGetBalanceTool);
    
    // Verify total number of tools
    expect(tools.length).toBeGreaterThanOrEqual(
      expectedHederaTools.length + expectedStandardsTools.length
    );
  });
  
  it('Standards tools can be initialized independently', () => {
    // Skip test if environment variables are not available
    if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
      console.warn('Skipping test - required environment variables not set');
      return;
    }
    
    // Initialize the standards tools directly
    const { tools } = initializeHCS10Client({
      clientConfig: {
        operatorId: process.env.HEDERA_OPERATOR_ID,
        operatorKey: process.env.HEDERA_OPERATOR_KEY,
        network: networkType === 'mainnet' ? 'mainnet' : 'testnet',
        useEncryption: true,
      },
      createAllTools: true,
    });
    
    // Verify tools were created
    expect(Object.keys(tools).length).toBeGreaterThan(0);
    
    // Check for specific tools
    expect(tools.registerAgentTool).toBeDefined();
    expect(tools.connectionTool).toBeDefined();
    expect(tools.sendMessageTool).toBeDefined();
  });
}); 