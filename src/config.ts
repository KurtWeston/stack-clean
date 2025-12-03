import { FilterRule } from './types';

export const DEFAULT_FILTERS: FilterRule[] = [
  { pattern: /node_modules/, exclude: true },
  { pattern: /internal\//, exclude: true },
  { pattern: /node:internal/, exclude: true },
  { pattern: /<anonymous>/, exclude: true },
];

export const FRAMEWORK_PATTERNS = [
  /jest/,
  /mocha/,
  /jasmine/,
  /webpack/,
  /babel/,
  /ts-node/,
];

export const COLOR_SCHEME = {
  error: 'red',
  errorType: 'redBright',
  appCode: 'cyan',
  thirdParty: 'gray',
  fileName: 'yellow',
  lineNumber: 'green',
  native: 'magenta',
  async: 'blue',
} as const;

export const COMPACT_MAX_FRAMES = 10;