import { Context, Plugin } from 'hedera-agent-kit';
import createMemejobToken, { CREATE_MEMEJOB_TOKEN_TOOL } from './tools/create-memejob-token';
import buyMemejobToken, { BUY_MEMEJOB_TOKEN_TOOL } from './tools/buy-memejob-token';
import sellMemejobToken, { SELL_MEMEJOB_TOKEN_TOOL } from './tools/sell-memejob-token';

/**
 * Plugin for interacting with the memejob platform to create, buy, and sell memecoins.
 *
 * This plugin provides three main tools:
 * - Create new memecoin tokens
 * - Buy existing memecoin tokens
 * - Sell memecoin tokens
 *
 * @example
 * ```hs
 * import { memejobPlugin } from '@hedera-agent-kit/memejob-plugin';
 *
 * const hederaAgentToolkit = new HederaAIToolkit({
 *   client,
 *   configuration: {
 *     context: {
 *       mode: AgentMode.AUTONOMOUS,
 *     },
 *     plugins: [memejobPlugin],
 *   },
 * });
 * ```
 */
export const memejobPlugin: Plugin = {
  name: '@hedera-agent-kit/memejob-plugin',
  version: '1.0.0',
  description: 'Create, buy, and sell memecoins on memejob platform',
  tools: (context: Context) => {
    return [createMemejobToken(context), buyMemejobToken(context), sellMemejobToken(context)];
  },
};

export const memejobPluginToolNames = {
  CREATE_MEMEJOB_TOKEN_TOOL,
  BUY_MEMEJOB_TOKEN_TOOL,
  SELL_MEMEJOB_TOKEN_TOOL,
} as const;

export default { memejobPlugin, memejobPluginToolNames };
