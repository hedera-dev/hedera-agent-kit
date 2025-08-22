import { Context } from '@/shared';
import { Plugin } from '@/shared/plugin';
import transferHbarTool, {
  TRANSFER_HBAR_TOOL,
} from '@/plugins/core-account-plugin/tools/account/transfer-hbar';
import updateAccountTool, {
  UPDATE_ACCOUNT_TOOL,
} from '@/plugins/core-account-plugin/tools/account/update-account';

export const coreAccountPlugin: Plugin = {
  name: 'core-account-plugin',
  version: '1.0.0',
  description: 'A plugin for the Hedera Account Service',
  tools: (context: Context) => {
    return [transferHbarTool(context), updateAccountTool(context)];
  },
};

export const coreAccountPluginToolNames = {
  TRANSFER_HBAR_TOOL,
  UPDATE_ACCOUNT_TOOL,
} as const;

export default { coreAccountPlugin, coreAccountPluginToolNames };
