import { StackCleaner } from '../cleaner';
import { StackFrame, ParsedError } from '../types';

describe('StackCleaner', () => {
  let cleaner: StackCleaner;

  beforeEach(() => {
    cleaner = new StackCleaner({ cwd: '/app' });
  });

  describe('parse', () => {
    it('should parse basic Node.js stack trace', () => {
      const trace = `Error: Something went wrong
    at myFunction (/app/src/index.ts:10:5)
    at main (/app/src/main.ts:20:3)`;
      
      const result = cleaner.parse(trace);
      
      expect(result.type).toBe('Error');
      expect(result.message).toBe('Something went wrong');
      expect(result.frames).toHaveLength(2);
      expect(result.frames[0].functionName).toBe('myFunction');
      expect(result.frames[0].lineNumber).toBe(10);
    });

    it('should handle multi-line error messages', () => {
      const trace = `TypeError: Cannot read property: foo
    at test (/app/test.js:1:1)`;
      
      const result = cleaner.parse(trace);
      
      expect(result.type).toBe('TypeError');
      expect(result.message).toBe('Cannot read property: foo');
    });

    it('should parse async stack frames', () => {
      const trace = `Error: Async error
    at async asyncFunc (/app/async.ts:5:10)`;
      
      const result = cleaner.parse(trace);
      
      expect(result.frames[0].isAsync).toBe(true);
      expect(result.frames[0].functionName).toBe('asyncFunc');
    });

    it('should handle native and anonymous frames', () => {
      const trace = `Error: Test
    at <anonymous>
    at native code`;
      
      const result = cleaner.parse(trace);
      
      expect(result.frames[0].functionName).toBe('<anonymous>');
      expect(result.frames[1].isNative).toBe(true);
    });
  });

  describe('filter', () => {
    it('should filter out node_modules by default', () => {
      const frames: StackFrame[] = [
        { raw: '', fileName: '/app/src/index.ts', isNodeModule: false, isNative: false, isAsync: false, lineNumber: 1, columnNumber: 1 },
        { raw: '', fileName: '/app/node_modules/lib/index.js', isNodeModule: true, isNative: false, isAsync: false, lineNumber: 1, columnNumber: 1 }
      ];
      
      const filtered = cleaner.filter(frames);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].fileName).toBe('/app/src/index.ts');
    });

    it('should apply compact mode filtering', () => {
      const frames: StackFrame[] = [
        { raw: '', fileName: '/app/src/app.ts', isNodeModule: false, isNative: false, isAsync: false },
        { raw: '', fileName: '/app/node_modules/jest/index.js', isNodeModule: true, isNative: false, isAsync: false }
      ];
      
      const filtered = cleaner.filter(frames, true);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].fileName).toBe('/app/src/app.ts');
    });

    it('should apply custom filter patterns', () => {
      const customCleaner = new StackCleaner({ filter: ['test\\.ts$'] });
      const frames: StackFrame[] = [
        { raw: '', fileName: '/app/src/index.ts', isNodeModule: false, isNative: false, isAsync: false },
        { raw: '', fileName: '/app/src/test.ts', isNodeModule: false, isNative: false, isAsync: false }
      ];
      
      const filtered = customCleaner.filter(frames);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].fileName).toBe('/app/src/index.ts');
    });
  });
});