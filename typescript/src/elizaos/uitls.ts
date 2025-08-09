import { Tool } from '@/shared';
import z from 'zod';
import { ModelType } from '@elizaos/core';

export function generateExtractionTemplate(tool: Tool): string {
  const schema = tool.parameters;

  const shape = schema.shape;

  // Separate required and optional fields
  const requiredFields = Object.entries(shape).filter(
    ([, val]: any) => !val.isOptional?.()
  );

  const optionalFields = Object.entries(shape).filter(
    ([, val]: any) => val.isOptional?.()
  );

  const renderField = ([key, val]: [string, any]) => {
    const description = val.description || '';
    return `- **${key}** (${getReadableTypeName(val)}): ${description}`;
  };

  function getReadableTypeName(val: any): string {
    const type = val._def?.typeName;
    switch (type) {
      case 'ZodString': return 'string';
      case 'ZodNumber': return 'number';
      case 'ZodBoolean': return 'boolean';
      case 'ZodEnum': return `"${val._def.values.join('" | "')}"`;
      default: return 'unknown';
    }
  }

  return `Given the recent messages and Hedera wallet information below:
{{recentMessages}}

Extract the following parameters required to create a fungible token on the Hedera network.

### Required:
${requiredFields.map(renderField).join('\n')}

### Optional (Include only if **explicitly mentioned** in the latest user message):
${optionalFields.map(renderField).join('\n')}

⚠️ Do **not** assume values or apply defaults. Do **not** set a field unless it is clearly specified in the latest user input.

---

### Response format:

Respond with a JSON markdown block that includes **only** the fields that were explicitly mentioned in the most recent user message.

\`\`\`json
{
${requiredFields.map(([key, val]) => `  "${key}": ${exampleForType(val)},`).join('\n')}
// Optional fields only if present in input:
${optionalFields.map(([key, val]) => `// "${key}": ${exampleForType(val)},`).join('\n')}
}
\`\`\`

---

Always extract values **only from the last user message**. Do not infer or carry forward values from previous interactions.
`;
}

function exampleForType(val: any): string | boolean | number {
  const type = val._def?.typeName;
  switch (type) {
    case 'ZodString': return `"string"`;
    case 'ZodNumber': return 123;
    case 'ZodBoolean': return true;
    case 'ZodEnum': return `"${val._def.values[0]}"`; // pick the first enum value as an example
    default: return `"value"`;
  }
}

export const fixParsedParams = (parsedParams: Record<string, any>) => {
  if (!parsedParams || typeof parsedParams !== 'object') return parsedParams;

  const fieldsToFix = ['initialSupply', 'maxSupply', 'decimals'];

  const fixed: Record<string, any> = { ...parsedParams };

  for (const field of fieldsToFix) {
    const value = fixed[field];
    const coerced = Number(value);
    if (value !== undefined && typeof value === 'string' && !Number.isNaN(coerced)) {
      fixed[field] = coerced;
    }
  }

  return fixed;
};

// Define a type that covers the structure we need to access
interface ZodTypeWithDef {
  _def?: {
    innerType?: ZodTypeWithDef;
  };
}

// Helper function to check if a field schema has _def property in a type-safe way
function hasDefProperty(obj: any): obj is ZodTypeWithDef {
  return obj && typeof obj === 'object' && '_def' in obj;
}

// Helper function to extract numeric fields from a schema
function extractNumericFields(schema: any): string[] {
  // Default to an empty array if we can't determine fields
  if (!schema || typeof schema !== 'object') return [];

  // For direct object schemas
  if (schema instanceof z.ZodObject && schema.shape) {
    const numericFields: string[] = [];

    for (const [field, fieldSchema] of Object.entries(schema.shape)) {
      if (!fieldSchema) continue;

      // Handle direct ZodNumber
      if (fieldSchema instanceof z.ZodNumber) {
        numericFields.push(field);
        continue;
      }

      // Handle wrapped ZodNumber (optional, default, etc.)
      if (hasDefProperty(fieldSchema) && fieldSchema._def && fieldSchema._def.innerType) {
        let innerType: any = fieldSchema._def.innerType;
        // Go through nested wrappers if needed
        while (hasDefProperty(innerType) && innerType._def && innerType._def.innerType) {
          innerType = innerType._def.innerType;
        }
        if (innerType instanceof z.ZodNumber) {
          numericFields.push(field);
        }
      }
    }

    return numericFields;
  }

  return [];
}

// Helper function to extract boolean fields from a schema
function extractBooleanFields(schema: any): string[] {
  // Default to an empty array if we can't determine fields
  if (!schema || typeof schema !== 'object') return [];

  // For direct object schemas
  if (schema instanceof z.ZodObject && schema.shape) {
    const booleanFields: string[] = [];

    for (const [field, fieldSchema] of Object.entries(schema.shape)) {
      if (!fieldSchema) continue;

      // Handle direct ZodBoolean
      if (fieldSchema instanceof z.ZodBoolean) {
        booleanFields.push(field);
        continue;
      }

      // Handle wrapped ZodBoolean (optional, default, etc.)
      if (hasDefProperty(fieldSchema) && fieldSchema._def && fieldSchema._def.innerType) {
        let innerType: any = fieldSchema._def.innerType;
        // Go through nested wrappers if needed
        while (hasDefProperty(innerType) && innerType._def && innerType._def.innerType) {
          innerType = innerType._def.innerType;
        }
        if (innerType instanceof z.ZodBoolean) {
          booleanFields.push(field);
        }
      }
    }

    return booleanFields;
  }

  return [];
}

export const universalFixParsedParams = (parsedParams: Record<string, any>, zodSchema: any): Record<string, any> => {
  if (!parsedParams || typeof parsedParams !== 'object') return parsedParams;

  // If we can't determine the schema, or it's not a valid Zod object, fall back to the default behavior
  if (!zodSchema) {
    return fixParsedParams(parsedParams);
  }

  try {
    // Get numeric and boolean fields from the schema
    const numericFields = extractNumericFields(zodSchema);
    const booleanFields = extractBooleanFields(zodSchema);

    // If we couldn't determine any fields to fix, fall back to default behavior
    if (numericFields.length === 0 && booleanFields.length === 0) {
      return fixParsedParams(parsedParams);
    }

    // Fix the parsed parameters
    const fixed: Record<string, any> = {...parsedParams};

    // Fix numeric fields
    for (const field of numericFields) {
      const value = fixed[field];
      const coerced = Number(value);
      if (value !== undefined && typeof value === 'string' && !Number.isNaN(coerced)) {
        fixed[field] = coerced;
      }
    }

    // Fix boolean fields
    for (const field of booleanFields) {
      const value = fixed[field];
      if (value !== undefined) {
        if (typeof value === 'string') {
          const lowercased = value.toLowerCase();
          if (lowercased === 'true' || lowercased === 'yes' || lowercased === '1') {
            fixed[field] = true;
          } else if (lowercased === 'false' || lowercased === 'no' || lowercased === '0') {
            fixed[field] = false;
          }
        } else if (typeof value === 'number') {
          fixed[field] = value !== 0;
        }
      }
    }

    return fixed;
  } catch (error) {
    // If any error occurs during schema analysis, fall back to the default behavior
    console.warn('Error analyzing schema for fields:', error);
    return fixParsedParams(parsedParams);
  }
};

export const generateResponse = async (data: any, toolName: string, runtime: any) => {
  const prompt = `
You are a summarization engine for outputs of Hedera SDK tools.

The current tool is: "${toolName}"

Your task is to extract only the most relevant, human-readable information from the following raw JSON data. Do not include any markdown, explanations, or field names that are not relevant to the user.

Use plain text. All identifiers (account IDs, transaction IDs, token IDs) should be formatted in Hedera-style, e.g., 0.0.123@1234567890.123456789.

Data:
${JSON.stringify(data)}

-- Output Rules --

1. Include the following **whenever present**:
  - Transaction ID (with timestamp if available)
  - Token ID, Name, Type (fungible/NFT), Decimals, Supply, Set Fields
  - Account IDs involved
  - Message timestamps, sequence numbers, and **full message body**
  - Transfer amounts and target accounts
  - Topic ID and related metadata
  - Status: SUCCESS / FAILED / PENDING
  - Any base64-encoded message body: try to decode if possible, or show as-is

2. Do **not** show raw JSON keys or internal fields (e.g., 'consensusTimestampNanos', etc.)

3. If multiple items are returned (e.g., messages or balances), format each block separately but consistently.

4. Your output should be clean, readable, and minimal — just the useful details, nothing else.

Begin.
`;

  return await runtime.useModel(ModelType.TEXT_LARGE, { prompt });
};