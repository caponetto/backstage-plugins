import { flattenParametersFromFormState, isJsonObject } from './formState';

describe('formState::isJsonObject', () => {
  it('should return true for JsonObject types', () => {
    expect(isJsonObject({ key: 'value' })).toBe(true);
  });

  it('should return false for non-JsonObject types', () => {
    expect(isJsonObject('string')).toBe(false);
    expect(isJsonObject(['array'])).toBe(false);
    expect(isJsonObject(null)).toBe(false);
  });
});

describe('formState::flattenParametersFromFormState', () => {
  it('should flatten parameters from formState', () => {
    const formState = {
      key1: 'value1',
      key2: {
        nestedKey: 'nestedValue',
        nestedObject: {
          nestedKey: 'nestedValue',
        },
        nestedArray: ['nestedValue'],
      },
      key3: 42,
    };

    const result = flattenParametersFromFormState(formState);

    expect(result).toEqual({
      key1: 'value1',
      nestedKey: 'nestedValue',
      nestedObject: { nestedKey: 'nestedValue' },
      nestedArray: ['nestedValue'],
      key3: 42,
    });
  });

  it('should return parameters as-is when there are no nested objects', () => {
    const formState = {
      key1: 'value1',
      key2: false,
      key3: 42,
    };

    const result = flattenParametersFromFormState(formState);

    expect(result).toEqual({
      key1: 'value1',
      key2: false,
      key3: 42,
    });
  });

  it('should handle undefined formState', () => {
    const result = flattenParametersFromFormState();

    expect(result).toEqual({});
  });
});
