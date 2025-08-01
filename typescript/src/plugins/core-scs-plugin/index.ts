import { Plugin } from '@/shared/plugin';
import { Context } from '@/shared/configuration';
import createERC20Tool, { CREATE_ERC20_TOOL } from './tools/erc20/create-erc20';
import transferERC20Tool, { TRANSFER_ERC20_TOOL } from './tools/erc20/transfer-erc20';
import transferERC721Tool, {
  TRANSFER_ERC721_TOOL,
} from '@/plugins/core-scs-plugin/tools/erc721/transfer-erc721';

export const coreSCSPlugin: Plugin = {
  name: 'core-scs-plugin',
  version: '1.0.0',
  description: 'A plugin for the Hedera SCS Service',
  tools: (context: Context) => {
    return [
      createERC20Tool(context),
      transferERC20Tool(context),
      transferERC721Tool(context),
    ];
  },
};


// Export tool names as an object for destructuring
export const coreSCSPluginToolNames = {
  TRANSFER_ERC721_TOOL,
  CREATE_ERC20_TOOL,
  TRANSFER_ERC20_TOOL,
} as const;

export default { coreSCSPlugin, coreSCSPluginToolNames };
