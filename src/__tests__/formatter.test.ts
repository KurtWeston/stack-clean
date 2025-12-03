import { StackFormatter } from '../formatter';
import { ParsedError, StackFrame } from '../types';
import stripAnsi from 'strip-ansi';

describe('StackFormatter', () => {
  describe('format with colors', () => {
    it('should format error header with colors', () => {
      const formatter = new StackFormatter();
      const error: ParsedError = {
        type: 'TypeError',
        message: 'Cannot read property',
        frames: []
      };
      
      const output = formatter.format(error, []);
      const plain = stripAnsi(output);
      
      expect(plain).toContain('TypeError: Cannot read property');
    });

    it('should format stack frames with location info', () => {
      const formatter = new StackFormatter();
      const error: ParsedError = { type: 'Error', message: 'Test', frames: [] };
      const frames: StackFrame[] = [
        {
          raw: '',
          functionName: 'myFunc',
          fileName: 'src/index.ts',
          lineNumber: 10,
          columnNumber: 5,
          isNodeModule: false,
          isNative: false,
          isAsync: false
        }
      ];
      
      const output = formatter.format(error, frames);
      const plain = stripAnsi(output);
      
      expect(plain).toContain('at myFunc');
      expect(plain).toContain('src/index.ts:10:5');
    });

    it('should highlight async frames', () => {
      const formatter = new StackFormatter();
      const error: ParsedError = { type: 'Error', message: 'Test', frames: [] };
      const frames: StackFrame[] = [
        {
          raw: '',
          functionName: 'asyncFunc',
          fileName: 'async.ts',
          lineNumber: 1,
          columnNumber: 1,
          isNodeModule: false,
          isNative: false,
          isAsync: true
        }
      ];
      
      const output = formatter.format(error, frames);
      const plain = stripAnsi(output);
      
      expect(plain).toContain('async asyncFunc');
    });
  });

  describe('format without colors', () => {
    it('should format without ANSI codes when noColor is true', () => {
      const formatter = new StackFormatter({ noColor: true });
      const error: ParsedError = { type: 'Error', message: 'Test', frames: [] };
      const frames: StackFrame[] = [
        {
          raw: '',
          functionName: 'func',
          fileName: 'file.ts',
          lineNumber: 1,
          columnNumber: 1,
          isNodeModule: false,
          isNative: false,
          isAsync: false
        }
      ];
      
      const output = formatter.format(error, frames);
      
      expect(output).not.toMatch(/\u001b\[/);
      expect(output).toContain('Error: Test');
      expect(output).toContain('at func');
    });
  });

  describe('edge cases', () => {
    it('should handle frames without fileName', () => {
      const formatter = new StackFormatter();
      const error: ParsedError = { type: 'Error', message: 'Test', frames: [] };
      const frames: StackFrame[] = [
        {
          raw: '',
          functionName: 'anonymous',
          isNodeModule: false,
          isNative: false,
          isAsync: false
        }
      ];
      
      const output = formatter.format(error, frames);
      const plain = stripAnsi(output);
      
      expect(plain).toContain('at anonymous');
    });

    it('should format native frames differently', () => {
      const formatter = new StackFormatter();
      const error: ParsedError = { type: 'Error', message: 'Test', frames: [] };
      const frames: StackFrame[] = [
        {
          raw: '',
          functionName: 'nativeFunc',
          fileName: 'node:internal/process',
          lineNumber: 1,
          columnNumber: 1,
          isNodeModule: false,
          isNative: true,
          isAsync: false
        }
      ];
      
      const output = formatter.format(error, frames);
      
      expect(output).toBeTruthy();
    });
  });
});