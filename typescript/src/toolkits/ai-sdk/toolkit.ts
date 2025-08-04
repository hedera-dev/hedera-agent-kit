import HederaAgentAPI from '@/shared/api';
import type { Tool as AITool, LanguageModelV1Middleware } from 'ai';
import HederaAgentKitTool from './tool';
import HederaBaseToolkit, { HederaBaseToolkitParameters } from '../HederaBaseToolkit';
import { Tool } from '@/shared';

type HederaAITools = { [key: string]: AITool };

class HederaAIToolkit extends HederaBaseToolkit<HederaAITools> {
  constructor(parameters: HederaBaseToolkitParameters) {
    super(parameters);
  }

  override resolveTools(hedera: HederaAgentAPI, tools: Tool[]) {
    if (!this.tools) this.tools = {};

    tools.forEach(tool => {
      this.tools[tool.method] = HederaAgentKitTool(
        hedera,
        tool.method,
        tool.description,
        tool.parameters,
      );
    });
  }

  middleware(): LanguageModelV1Middleware {
    return {
      wrapGenerate: async ({ doGenerate }) => {
        return doGenerate();
      },
      wrapStream: async ({ doStream }) => {
        // Pre-processing can be added here if needed
        return doStream();
      },
    };
  }
}

export default HederaAIToolkit;
