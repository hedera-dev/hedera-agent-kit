import { Configuration, ToolDiscovery } from '@/shared';
import HederaAgentAPI from '@/shared/api';
import { Tool } from '@/shared/tools';
import { Client } from '@hashgraph/sdk';

export type HederaBaseToolkitParameters = {
  client: Client;
  configuration: Configuration;
};

abstract class HederaBaseToolkit<Tools> {
  protected hedera: HederaAgentAPI;
  protected tools!: Tools;

  constructor({ client, configuration }: HederaBaseToolkitParameters) {
    const context = configuration.context || {};
    const toolDiscovery = ToolDiscovery.createFromConfiguration(configuration);
    const allTools = toolDiscovery.getAllTools(context, configuration);

    this.hedera = new HederaAgentAPI(client, configuration.context, allTools);
    this.resolveTools(this.hedera, allTools);
  }

  abstract resolveTools(hedera: HederaAgentAPI, tools: Tool[]): void;

  getTools(): Tools {
    return this.tools;
  }
}

export default HederaBaseToolkit;
