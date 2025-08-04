import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import HederaBaseToolkit, { HederaBaseToolkitParameters } from '../HederaBaseToolkit';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';

class HederaMCPToolkit extends HederaBaseToolkit<RegisteredTool[]> {
  private _server!: McpServer;

  constructor({ client, configuration }: HederaBaseToolkitParameters) {
    super({ client, configuration });

    this._server = new McpServer({
      name: 'Hedera Agent Kit',
      version: '0.1.0',
      configuration: {
        ...configuration,
        context: {
          ...configuration.context,
          mode: 'modelcontextprotocol',
        },
      },
    });

    this.hedera.tools.map(tool => {
      this._server.tool(
        tool.method,
        tool.description,
        tool.parameters.shape,
        async (arg: any, _extra: RequestHandlerExtra<any, any>) => {
          const result = await this.hedera.run(tool.method, arg);
          return {
            content: [
              {
                type: 'text' as const,
                text: String(result),
              },
            ],
          };
        },
      );
    });
  }

  override resolveTools() {
    // no-op
  }

  get server() {
    return this._server;
  }
}

export default HederaMCPToolkit;
