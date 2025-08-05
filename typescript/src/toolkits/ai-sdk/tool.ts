import HederaAgentAPI from '@/shared/api';
import { tool } from 'ai';
import z from 'zod';

export default function HederaAgentKitTool(
  hederaAPI: HederaAgentAPI,
  method: string,
  description: string,
  schema: z.ZodObject<any, any>,
) {
  return tool({
    description: description,
    parameters: schema,
    execute: (arg: z.output<typeof schema>) => {
      return hederaAPI.run(method, arg);
    },
  });
}
