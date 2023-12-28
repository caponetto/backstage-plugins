import {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
} from '@backstage/types';

export function isJsonPrimitive(value: JsonValue): value is JsonPrimitive {
  return (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    value === null
  );
}

export function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isJsonArray(value: JsonValue): value is JsonArray {
  return Array.isArray(value);
}

export function flattenParametersFromFormState(
  formState?: Record<string, JsonValue>,
): Record<string, JsonValue> {
  if (!formState) {
    return {};
  }

  const parameters: Record<string, JsonValue> = {};

  Object.entries(formState).forEach(([key, value]) => {
    if (value === undefined) {
      parameters[key] = '';
    } else if (!isJsonObject(value)) {
      parameters[key] = value;
    } else {
      // Flatten nested objects
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        // Next levels are simply returned as-is
        if (nestedValue === undefined) {
          parameters[nestedKey] = '';
        } else {
          parameters[nestedKey] = nestedValue;
        }
      });
    }
  });

  return parameters;
}
