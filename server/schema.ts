import { isObject } from '../src/lib/aiTypes';

export interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: JsonSchema;
  minItems?: number;
  maxItems?: number;
  description?: string;
}
// The reference schema uses only these JSON Schema keywords; unknown output fields are rejected.
export function matchesSchema(value: unknown, schema: JsonSchema): boolean {
  if (schema.type === 'string') return typeof value === 'string' && value.trim().length > 0;
  if (schema.type === 'array') {
    return Array.isArray(value) && value.length >= (schema.minItems ?? 0)
      && value.length <= (schema.maxItems ?? Infinity)
      && value.every((item) => schema.items && matchesSchema(item, schema.items));
  }
  if (schema.type !== 'object' || !isObject(value)) return false;
  const properties = schema.properties ?? {};
  return (schema.required ?? []).every((key) => Object.hasOwn(value, key))
    && Object.entries(value).every(([key, item]) =>
      Object.hasOwn(properties, key) ? matchesSchema(item, properties[key]) : schema.additionalProperties !== false);
}
export function clipWords(value: string, limit: number) {
  const text = value.trim();
  if (text.length <= limit) return text;
  const prefix = text.slice(0, limit - 1);
  const boundary = prefix.search(/\s+\S*$/u);
  return (boundary > 0 ? prefix.slice(0, boundary) : prefix).trimEnd() + '…';
}
