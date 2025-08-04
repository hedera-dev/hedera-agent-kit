import HederaAgentKitTool from '@/toolkits/langchain/tool';
import HederaAgentAPI from '@/shared/api';
import HederaBaseToolkit, { HederaBaseToolkitParameters } from '../HederaBaseToolkit';
import { Tool } from '@/shared';

class HederaLangchainToolkit extends HederaBaseToolkit<HederaAgentKitTool[]> {
  constructor({ client, configuration }: HederaBaseToolkitParameters) {
    super({
      client,
      configuration,
    });
  }

  override resolveTools(hedera: HederaAgentAPI, tools: Tool[]) {
    if (!this.tools) this.tools = [];

    tools.forEach(tool => {
      this.tools.push(
        new HederaAgentKitTool(hedera, tool.method, tool.description, tool.parameters),
      );
    });
  }
}

export default HederaLangchainToolkit;
