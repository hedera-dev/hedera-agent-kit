import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  ModelType,
  composePromptFromState,
  logger,
  ActionResult,
} from '@elizaos/core';
import { Client } from '@hashgraph/sdk';
import type { Tool } from '@/shared/tools';
import { Context } from '@/shared/configuration';
import {
  generateExtractionTemplate,
} from '@/elizaos/utils/extraction';
import { customParseJSONObjectFromText } from '@/elizaos/utils/parser';

export class ElizaOSAdapter {
  private readonly client: Client;
  private readonly context: Context;
  private tools: Tool[];

  constructor(client: Client, context: Context, tools: Tool[]) {
    this.client = client;
    this.context = context;
    this.tools = tools;
  }

  /**
   * Generates and returns actions
   */
  getActions(): Action[] {
    return this.tools.map(tool => this.createActionFromTool(tool));
  }

  createActionFromTool(tool: Tool): Action {
    const parameterSchema = tool.parameters;

    return {
      name: tool.method.toUpperCase(),
      similes: [tool.method.toUpperCase()],
      description: tool.description,
      validate: async (_runtime: IAgentRuntime, _message: Memory) => true, // no specific validation is needed
      handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State | undefined,
        _options: any,
        callback?: HandlerCallback,
      ): Promise<ActionResult> => {
        logger.log(`Running ${tool.method} handler...`);
        if (!state) {
          throw new Error('State is undefined');
        }

        const prompt = composePromptFromState({
          state,
          template: generateExtractionTemplate(tool),
        });
        console.log(`prompt: ${prompt}`);

        const modelOutput = await runtime.useModel(ModelType.TEXT_LARGE, {prompt});
        console.debug(`modelOutput: ${modelOutput}`);

        const parsedParams = customParseJSONObjectFromText(modelOutput) as Record<string, any>;
        console.debug('parsedParams (raw)', parsedParams);

        const validation = parameterSchema.safeParse(parsedParams); // parsing extracted params before calling a tool
        console.log('validated input:' + JSON.stringify(validation, null, 2));

        if (!validation.success) {
          if (callback) {
            callback({
              text: 'Invalid or incomplete parameters.',
              content: { error: validation.error.format() },
            });
          }
          return {
            success: false,
            text: 'Invalid or incomplete parameters.',
            error: validation.error.toString(),
          };
        }

        try {
          const result = await tool.execute(this.client, this.context, validation.data);
          const responseText = result.humanMessage;

          if (callback) {
            callback({
              text: responseText,
              content: result,
            });
          }

          return { success: true, text: responseText };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          logger.error(`Error running tool ${tool.method}:`, err);

          if (callback) {
            callback({
              text: `Execution failed: ${message}`,
              content: { error: message },
            });
          }

          return { success: false, text: `Execution failed: ${message}`, error: message };
        }
      },
    };
  }
}
