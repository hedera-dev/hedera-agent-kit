import {
  type Action,
  ActionResult,
  composePromptFromState,
  type HandlerCallback,
  type IAgentRuntime,
  logger,
  type Memory,
  ModelType,
  type State,
} from '@elizaos/core';
import { Client } from '@hashgraph/sdk';
import type { Tool } from '@/shared/tools';
import { Configuration, Context } from '@/shared/configuration';
import { generateExtractionTemplate } from '@/elizaos/utils/extraction';
import { customParseJSONObjectFromText } from '@/elizaos/utils/parser';
import { ToolDiscovery } from '@/shared/tool-discovery';

export class ElizaOSAdapter {
  private readonly client: Client;
  private readonly context: Context;
  private tools: Tool[];

  constructor(client: Client, configuration: Configuration) {
    this.client = client;
    this.context = configuration.context || {};
    const toolDiscovery = ToolDiscovery.createFromConfiguration(configuration);
    this.tools = toolDiscovery.getAllTools(this.context, configuration);
  }

  /**
   * Maps hedera-agent-kit tools and returns ElizaOS compatible actions
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

        // create an extraction prompt for extracting tool parameters from recent user messages
        const prompt = composePromptFromState({
          state,
          template: generateExtractionTemplate(tool),
        });
        logger.debug(`prompt: ${prompt}`);

        // execute extraction prompt
        const modelOutput = await runtime.useModel(ModelType.TEXT_LARGE, { prompt });
        logger.debug(`Model extraction output: ${modelOutput}`);

        // custom parsing params from Markdown JSON notation to JS object
        const parsedParams = customParseJSONObjectFromText(modelOutput) as Record<string, any>;
        logger.debug('Parsed params object', parsedParams);

        // validating parameters with tools input zod schema
        const validation = parameterSchema.safeParse(parsedParams); // parsing extracted params before calling a tool
        logger.debug('Validated params:' + JSON.stringify(validation, null, 2));

        // print error if validation failed
        if (!validation.success) {
          // call llm to generate a comprehensive message to the user about missing params
          const promptText = `given the recent messages {{recent_messages}}, 
          tool description: ${tool.description}
          and the error message: ${validation.error.format()}
          generate a comprehensive message to the user about missing params
          `;

          const modelOutput = await runtime.useModel(ModelType.TEXT_LARGE, { promptText });
          if (callback) {
            callback({
              text: modelOutput,
              content: { error: validation.error.format() },
            });
          }
          return {
            success: false,
            text: modelOutput,
            error: validation.error.toString(),
          };
        }

        // call the action
        try {
          const result = await tool.execute(this.client, this.context, validation.data);
          const responseText = result.humanMessage; // extract the human-readable response provided by the tool

          if (callback) {
            callback({
              text: responseText,
              content: result,
            });
          }

          return { success: true, text: responseText };
        } catch (err) {
          // handle other errors
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
