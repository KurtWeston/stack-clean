export interface StackFrame {
  raw: string;
  functionName?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  isNodeModule: boolean;
  isNative: boolean;
  isAsync: boolean;
}

export interface CleanOptions {
  filter?: string[];
  noColor?: boolean;
  compact?: boolean;
  context?: number;
  cwd?: string;
}

export interface ParsedError {
  message: string;
  type?: string;
  frames: StackFrame[];
}

export interface FilterRule {
  pattern: RegExp;
  exclude: boolean;
}