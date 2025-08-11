import { Tool } from '@/shared';

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

  // Create a structured description of the field
  const renderField = ([key, val]: [string, any], indentLevel = 0) => {
    const description = val.description || '';
    const indent = '    '.repeat(indentLevel);

    // Special handling for arrays and objects
    if (val._def?.typeName === 'ZodArray' && val._def.type) {
      // First handle the array field itself
      const baseReadableType = 'array';
      const typeHint = ' (list of values)';
      const result = [`${indent}- **${key}** (${baseReadableType}${typeHint}): ${description}`];

      // Now handle the array element type
      const elementType = val._def.type;

      // Special handling for object array elements
      if (elementType._def?.typeName === 'ZodObject' && elementType.shape) {
        // Add description of each field in the object
        const fields = Object.entries(elementType.shape);
        fields.forEach(([fieldName, fieldVal]) => {
          let fieldType = getReadableTypeName(fieldVal as any);
          // Add type hints
          const fieldTypeHint = fieldType === 'number' ? ' (numeric value, not a string)' :
            fieldType === 'boolean' ? ' (true or false, not a string)' : '';
          result.push(`${indent}    ${fieldName} (${fieldType}${fieldTypeHint}): ${(fieldVal as any).description || ''}`);
        });
      } else {
        // For simple array elements, just mention the type
        const elementTypeStr = getReadableTypeName(elementType);
        result.push(`${indent}    items: ${elementTypeStr} values`);
      }
      return result.join('\n');
    }

    // Special handling for nested objects
    if (val._def?.typeName === 'ZodObject' && val.shape) {
      // First handle the object field itself
      const baseReadableType = 'object';
      const result = [`${indent}- **${key}** (${baseReadableType}): ${description}`];

      // Add description of each field in the object
      const fields = Object.entries(val.shape);
      fields.forEach(([fieldName, fieldVal]) => {
        let fieldType = getReadableTypeName(fieldVal as any);
        // Add type hints
        const fieldTypeHint = fieldType === 'number' ? ' (numeric value, not a string)' :
          fieldType === 'boolean' ? ' (true or false, not a string)' :
            fieldType.includes('array') ? ' (list of values)' : '';
        result.push(`${indent}    ${fieldName} (${fieldType}${fieldTypeHint}): ${(fieldVal as any).description || ''}`);
      });
      return result.join('\n');
    }

    // For basic types
    const readableType = getReadableTypeName(val);
    // Add type hints for different field types
    let typeHint = '';
    if (readableType === 'number') {
      typeHint = ' (numeric value, not a string)';
    } else if (readableType === 'boolean') {
      typeHint = ' (true or false, not a string)';
    } else if (readableType.includes('array')) {
      typeHint = ' (list of values)';
    } else if (readableType.includes(' | ')) {
      typeHint = ' (quoted string value)';
    }

    return `${indent}- **${key}** (${readableType}${typeHint}): ${description}`;
  };

  // Describes a field with its name, type, and any nested structure
  function getReadableTypeName(val: any, indentLevel = 0, isArrayItem = false): string {
    if (!val || !val._def) return 'unknown';

    const type = val._def.typeName;
    const indent = '    '.repeat(indentLevel);

    // Handle optional types by recursively getting the inner type
    if (type === 'ZodOptional' && val._def.innerType) {
      return getReadableTypeName(val._def.innerType, indentLevel, isArrayItem);
    }

    // Handle nullable types
    if (type === 'ZodNullable' && val._def.innerType) {
      return `${getReadableTypeName(val._def.innerType, indentLevel, isArrayItem)} | null`;
    }

    // Handle default values
    if (type === 'ZodDefault' && val._def.innerType) {
      return getReadableTypeName(val._def.innerType, indentLevel, isArrayItem);
    }

    // Handle arrays - show the element type
    if (type === 'ZodArray' && val._def.type) {
      const elementType = val._def.type;
      const elementTypeStr = getReadableTypeName(elementType, indentLevel + 1, true);

      // For simple types, just show "array of X"
      if (['ZodString', 'ZodNumber', 'ZodBoolean'].includes(elementType._def?.typeName)) {
        return `array of ${elementTypeStr} values`;
      }

      // For complex types like objects, return a more detailed description
      if (elementType._def?.typeName === 'ZodObject') {
        return `array`;
      }

      return `array`;
    }

    // Handle objects - describe their structure
    if (type === 'ZodObject' && val.shape) {
      // If this is a nested object or array item, we want to return the structure rather than just "object"
      if (indentLevel > 0 || isArrayItem) {
        const fields = Object.entries(val.shape)
          .map(([fieldName, fieldVal]) => {
            const fieldType = getReadableTypeName(fieldVal, indentLevel + 1);
            return `${indent}    ${fieldName} (${fieldType})`;
          })
          .join('\n');
        // Return structure with indentation
        return `object with:\n${fields}`;
      }
      // At top level, just return "object"
      return 'object';
    }

    // Handle unions
    if (type === 'ZodUnion' && val._def.options) {
      return val._def.options
        .map((option: any) => getReadableTypeName(option, indentLevel, isArrayItem))
        .join(' | ');
    }

    // Handle basic types
    switch (type) {
      case 'ZodString': return 'string';
      case 'ZodNumber': return 'number';
      case 'ZodBoolean': return 'boolean';
      case 'ZodEnum': return val._def.values ? `${val._def.values.join(' | ')}` : 'enum';
      case 'ZodLiteral': return typeof val._def.value === 'string' ? `"${val._def.value}"` : `${val._def.value}`;
      case 'ZodRecord': return 'record';
      default: return 'unknown';
    }
  }

  // Get the title from the description or use a default
  const titleMatch = tool.description.match(/This tool will ([^.]+)/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  return `Given the recent messages and Hedera wallet information below:
{{recentMessages}}

Extract the following parameters required to ${title}.

### Required:
${requiredFields.map(field => renderField(field)).join('\n')}

### Optional (Include only if **explicitly mentioned** in the latest user message):
${optionalFields.map(field => renderField(field)).join('\n')}

⚠️ Do **not** assume values or apply defaults. Do **not** set a field unless it is clearly specified in the latest user input.
⚠️ **IMPORTANT**: Always ensure numeric values are provided as NUMBERS WITHOUT QUOTES in the JSON response.
⚠️ **CRITICAL**: Enum values must be provided as QUOTED STRINGS (e.g., "finite", not finite).

---

### Response format:
Respond with a JSON markdown block that includes **only** the fields that were explicitly mentioned in the most recent user message.

${generateExampleJson(requiredFields, optionalFields)}

---

Always extract values **only from the last user message**. Do not infer or carry forward values from previous interactions. Numeric values should be numbers without quotes. Enum values must be quoted strings.
`;
}

// Enhanced example generation function
function generateExampleJson(requiredFields: [string, any][], optionalFields: [string, any][]): string {
  const exampleObj: any = {};
  const commentedFields: string[] = [];

  // Add required fields to the example
  requiredFields.forEach(([key, val]) => {
    exampleObj[key] = exampleForType(val);
  });

  // Add optional fields as comments
  optionalFields.forEach(([key, val]) => {
    const example = exampleForType(val);
    commentedFields.push(`// "${key}": ${example}`);
  });

  // Generate the JSON string with proper formatting
  let jsonString = JSON.stringify(exampleObj, null, 2);

  // Add optional fields as comments if there are any
  if (commentedFields.length > 0) {
    // Remove the closing brace and add commented optional fields
    jsonString = jsonString.replace(/\n}$/, ',\n// Optional fields only if present in input:\n' + commentedFields.join(',\n') + '\n}');
  }

  return '```json\n' + jsonString + '\n```';
}

function exampleForType(val: any): any {
  if (!val || !val._def) return '"value"';

  const type = val._def.typeName;

  // Handle optional types by recursively getting the inner type
  if (type === 'ZodOptional' && val._def.innerType) {
    return exampleForType(val._def.innerType);
  }

  // Handle nullable types
  if (type === 'ZodNullable' && val._def.innerType) {
    return exampleForType(val._def.innerType);
  }

  // Handle default values
  if (type === 'ZodDefault' && val._def.innerType) {
    return exampleForType(val._def.innerType);
  }

  // Handle arrays
  if (type === 'ZodArray' && val._def.type) {
    const elementExample = exampleForType(val._def.type);
    return [elementExample];
  }

  // Handle objects
  if (type === 'ZodObject' && val.shape) {
    const obj: any = {};
    Object.entries(val.shape).forEach(([fieldName, fieldVal]) => {
      obj[fieldName] = exampleForType(fieldVal);
    });
    return obj;
  }

  // Handle unions
  if (type === 'ZodUnion' && val._def.options && val._def.options.length > 0) {
    return exampleForType(val._def.options[0]);
  }

  // Handle basic types
  switch (type) {
    case 'ZodString':
      // Check if this looks like a Hedera ID pattern
      if (val.description?.toLowerCase().includes('account') ||
          val.description?.toLowerCase().includes('token') ||
          val.description?.toLowerCase().includes('topic')) {
        return '"0.0.123456"';
      }
      return '"string"';
    case 'ZodNumber': return 123;
    case 'ZodBoolean': return true;
    case 'ZodEnum':
      // Always return the first enum value as a properly quoted string
      return val._def.values && val._def.values.length > 0 ? `"${val._def.values[0]}"` : '"enum_value"';
    case 'ZodLiteral':
      // Ensure literal strings are properly quoted
      return typeof val._def.value === 'string' ? `"${val._def.value}"` : val._def.value;
    case 'ZodRecord':
      return {"key": "value"};
    default:
      return '"value"';
  }
}
