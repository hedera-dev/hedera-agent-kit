import { Tool } from '@/shared';

interface FieldInfo {
  name: string;
  type: string;
  description: string;
  typeHint: string;
  isOptional: boolean;
  structure?: FieldInfo[];
}

class ZodTypeAnalyzer {
  static getBaseTypeName(val: any): string {
    if (!val?._def) return 'unknown';
    const typeName = val._def.typeName;
    const typeMap: Record<string, string> = {
      ZodString: 'string',
      ZodNumber: 'number',
      ZodBoolean: 'boolean',
      ZodRecord: 'record',
    };
    return typeMap[typeName] || typeName.replace(/^Zod/, '').toLowerCase();
  }

  static unwrapType(val: any): any {
    if (!val?._def) return val;
    const { typeName, innerType, type, schema } = val._def;
    const wrapperTypes = ['ZodOptional', 'ZodNullable', 'ZodDefault'];
    if (wrapperTypes.includes(typeName)) {
      return this.unwrapType(innerType || type || schema);
    }
    return val;
  }

  static isOptional(val: any): boolean {
    // Detect before unwrapping to preserve optionality
    if (val?._def?.typeName === 'ZodOptional') return true;
    if (typeof val.isOptional === 'function' && val.isOptional()) return true;
    return false;
  }

  static getTypeHint(readableType: string): string {
    const hints: Record<string, string> = {
      number: ' (numeric value, not a string)',
      boolean: ' (true or false, not a string)',
      enum: ' (quoted string value)',
    };
    if (readableType.includes('array')) return ' (list of values)';
    if (readableType.includes(' | ')) return ' (quoted string value)';
    return hints[readableType] || '';
  }
}

class FieldAnalyzer {
  static analyzeField(name: string, val: any): FieldInfo {
    const isOptional = ZodTypeAnalyzer.isOptional(val);
    const unwrapped = ZodTypeAnalyzer.unwrapType(val);
    const baseInfo = {
      name,
      description: val.description || '',
      isOptional,
    };

    const typeName = unwrapped._def?.typeName;
    switch (typeName) {
      case 'ZodArray':
        return this.analyzeArrayField(baseInfo, unwrapped);
      case 'ZodObject':
        return this.analyzeObjectField(baseInfo, unwrapped);
      case 'ZodUnion':
        return this.analyzeUnionField(baseInfo, unwrapped);
      case 'ZodEnum':
        return this.analyzeEnumField(baseInfo, unwrapped);
      case 'ZodLiteral':
        return this.analyzeLiteralField(baseInfo, unwrapped);
      default:
        return this.analyzeBasicField(baseInfo, unwrapped);
    }
  }

  private static analyzeArrayField(baseInfo: any, val: any): FieldInfo {
    const elementType = val._def.type;
    let elementInfo: FieldInfo | undefined;

    if (elementType._def?.typeName === 'ZodObject') {
      elementInfo = { ...this.analyzeObjectField({}, elementType) };
    } else if (['ZodEnum', 'ZodLiteral', 'ZodUnion'].includes(elementType._def?.typeName)) {
      elementInfo = this.analyzeField('element', elementType);
    }

    return {
      ...baseInfo,
      type: 'array',
      typeHint: ZodTypeAnalyzer.getTypeHint('array'),
      structure: elementInfo?.structure,
    };
  }

  private static analyzeObjectField(baseInfo: any, val: any): FieldInfo {
    return {
      ...baseInfo,
      type: 'object',
      typeHint: '',
      structure: this.getObjectStructure(val),
    };
  }

  private static analyzeUnionField(baseInfo: any, val: any): FieldInfo {
    const options = val._def.options || [];
    const types = options.map((opt: any) => {
      if (opt._def?.typeName === 'ZodLiteral') {
        const lit = opt._def.value;
        return typeof lit === 'string' ? `"${lit}"` : String(lit);
      }
      if (opt._def?.typeName === 'ZodEnum') {
        return opt._def.values.map((v: string) => `"${v}"`).join(' | ');
      }
      return ZodTypeAnalyzer.getBaseTypeName(opt);
    });
    return {
      ...baseInfo,
      type: types.join(' | '),
      typeHint: ZodTypeAnalyzer.getTypeHint(types.join(' | ')),
    };
  }

  private static analyzeEnumField(baseInfo: any, val: any): FieldInfo {
    const values = val._def.values || [];
    return {
      ...baseInfo,
      type: values.map((v: string) => `"${v}"`).join(' | '),
      typeHint: ZodTypeAnalyzer.getTypeHint('enum'),
    };
  }

  private static analyzeLiteralField(baseInfo: any, val: any): FieldInfo {
    const value = val._def.value;
    return {
      ...baseInfo,
      type: typeof value === 'string' ? `"${value}"` : String(value),
      typeHint: '',
    };
  }

  private static analyzeBasicField(baseInfo: any, val: any): FieldInfo {
    const type = ZodTypeAnalyzer.getBaseTypeName(val);
    return {
      ...baseInfo,
      type,
      typeHint: ZodTypeAnalyzer.getTypeHint(type),
    };
  }

  private static getObjectStructure(val: any): FieldInfo[] {
    let shapeObj = val.shape || (typeof val.shape === 'function' ? val.shape() : undefined);
    if (!shapeObj) return [];
    return Object.entries(shapeObj).map(([name, fieldVal]) =>
      this.analyzeField(name, fieldVal)
    );
  }
}

class TemplateFormatter {
  static formatField(field: FieldInfo, indentLevel = 0): string {
    const indent = '    '.repeat(indentLevel);
    const fieldLine = `${indent}- **${field.name}** (${field.type}${field.typeHint}): ${field.description}`;
    if (!field.structure?.length) return fieldLine;
    const structureLines = field.structure
      .map(sub => this.formatField(sub, indentLevel + 1))
      .join('\n');
    return `${fieldLine}\n${structureLines}`;
  }

  static generateExampleValue(field: FieldInfo): any {
    switch (field.type) {
      case 'string': return this.getStringExample(field);
      case 'number': return 123;
      case 'boolean': return true;
      case 'array':
        return field.structure?.length
          ? [this.generateObjectExample(field.structure)]
          : ['example_value'];
      case 'object':
        return field.structure ? this.generateObjectExample(field.structure) : {};
      case 'record': return { "key": "value" };
      default: return this.handleSpecialTypes(field);
    }
  }

  private static getStringExample(field: FieldInfo): string {
    const desc = (field.description || '').toLowerCase();
    const hederaPatterns = ['account', 'token', 'topic'];
    return hederaPatterns.some(p => desc.includes(p)) ? '0.0.123456' : 'string';
  }

  private static generateObjectExample(structure: FieldInfo[]): Record<string, any> {
    return structure.reduce((obj, field) => {
      obj[field.name] = this.generateExampleValue(field);
      return obj;
    }, {} as Record<string, any>);
  }

  private static handleSpecialTypes(field: FieldInfo): any {
    if (field.type.includes(' | ')) {
      const first = field.type.split(' | ')[0].trim();
      if (/^".*"$/.test(first)) return first.replace(/^"|"$/g, '');
      if (first === 'number') return 123;
      if (first === 'boolean') return true;
      return first;
    }
    return '"value"';
  }
}

export function generateExtractionTemplate(tool: Tool): string {
  const schema = tool.parameters;
  const shape = schema.shape || (typeof schema.shape === 'function' ? schema.shape() : {});
  const allFields = Object.entries(shape).map(([name, val]) =>
    FieldAnalyzer.analyzeField(name, val as any)
  );
  const requiredFields = allFields.filter(f => !f.isOptional);
  const optionalFields = allFields.filter(f => f.isOptional);
  const titleMatch = tool.description.match(/This tool will ([^.]+)/);
  const title = titleMatch ? titleMatch[1].trim() : 'perform the action';
  return buildTemplate(title, requiredFields, optionalFields);
}

function buildTemplate(title: string, required: FieldInfo[], optional: FieldInfo[]): string {
  const requiredSection = required.length
    ? `### Required:\n${required.map(f => TemplateFormatter.formatField(f)).join('\n')}\n`
    : '';
  const optionalSection = optional.length
    ? `### Optional (Include only if **explicitly mentioned** in the latest user message):\n${optional.map(f => TemplateFormatter.formatField(f)).join('\n')}\n`
    : '';
  const exampleJson = generateExampleJson(required, optional);
  return `Given the recent messages and Hedera wallet information below:
{{recentMessages}}

Extract the following parameters required to ${title}.

${requiredSection}${optionalSection}⚠️ Do **not** assume values or apply defaults. Do **not** set a field unless it is clearly specified in the latest user input.
⚠️ **IMPORTANT**: Always ensure numeric values are provided as NUMBERS WITHOUT QUOTES in the JSON response.
⚠️ **CRITICAL**: Enum values must be provided as QUOTED STRINGS (e.g., "finite", not finite).

---

### Response format:
Respond with a JSON markdown block that includes **only** the fields that were explicitly mentioned in the most recent user message.

${exampleJson}

---

Always extract values **only from the last user message**. Do not infer or carry forward values from previous interactions. Numeric values should be numbers without quotes. Enum values must be quoted strings.`;
}

function generateExampleJson(required: FieldInfo[], optional: FieldInfo[]): string {
  const exampleObj: Record<string, any> = {};
  const commented: string[] = [];
  required.forEach(f => {
    exampleObj[f.name] = TemplateFormatter.generateExampleValue(f);
  });
  optional.forEach(f => {
    const ex = TemplateFormatter.generateExampleValue(f);
    const serialized = typeof ex === 'string' ? `"${ex}"` : JSON.stringify(ex);
    commented.push(`// "${f.name}": ${serialized}`);
  });
  let jsonString = JSON.stringify(exampleObj, null, 2);
  if (commented.length > 0) {
    jsonString = jsonString.replace(
      /\n}$/,
      ',\n// Optional fields only if present in input:\n' + commented.join(',\n') + '\n}'
    );
  }
  return `\`\`\`json\n${jsonString}\n\`\`\``;
}
