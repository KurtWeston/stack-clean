import { StackFrame, ParsedError, CleanOptions, FilterRule } from './types';
import { DEFAULT_FILTERS, FRAMEWORK_PATTERNS } from './config';
import * as path from 'path';

export class StackCleaner {
  private filters: FilterRule[];
  private cwd: string;

  constructor(options: CleanOptions = {}) {
    this.cwd = options.cwd || process.cwd();
    this.filters = [...DEFAULT_FILTERS];
    
    if (options.filter) {
      options.filter.forEach(pattern => {
        this.filters.push({ pattern: new RegExp(pattern), exclude: true });
      });
    }
  }

  parse(stackTrace: string): ParsedError {
    const lines = stackTrace.split('\n');
    const errorLine = lines[0];
    const [type, ...messageParts] = errorLine.split(':');
    
    const frames: StackFrame[] = [];
    let i = 1;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      if (line.startsWith('at ')) {
        const frame = this.parseFrame(line);
        if (frame) frames.push(frame);
      }
      i++;
    }

    return {
      type: type.trim(),
      message: messageParts.join(':').trim(),
      frames,
    };
  }

  private parseFrame(line: string): StackFrame | null {
    const atMatch = line.match(/^at\s+(.+)$/);
    if (!atMatch) return null;

    const content = atMatch[1];
    const isAsync = content.includes('async ');
    
    const locationMatch = content.match(/\((.+?):(\d+):(\d+)\)$/) || 
                         content.match(/(.+?):(\d+):(\d+)$/);
    
    if (!locationMatch) {
      return {
        raw: line,
        functionName: content,
        isNodeModule: false,
        isNative: content.includes('native'),
        isAsync,
      };
    }

    const fileName = locationMatch[1];
    const functionName = content.substring(0, content.lastIndexOf(fileName) - 2).replace('async ', '').trim();

    return {
      raw: line,
      functionName: functionName || undefined,
      fileName: this.relativePath(fileName),
      lineNumber: parseInt(locationMatch[2], 10),
      columnNumber: parseInt(locationMatch[3], 10),
      isNodeModule: fileName.includes('node_modules'),
      isNative: fileName.includes('node:') || fileName.includes('internal/'),
      isAsync,
    };
  }

  private relativePath(filePath: string): string {
    if (filePath.startsWith(this.cwd)) {
      return path.relative(this.cwd, filePath);
    }
    return filePath;
  }

  filter(frames: StackFrame[], compact: boolean = false): StackFrame[] {
    let filtered = frames.filter(frame => {
      if (!frame.fileName) return true;
      
      for (const rule of this.filters) {
        if (rule.pattern.test(frame.fileName) && rule.exclude) {
          return false;
        }
      }
      
      if (compact) {
        return !frame.isNodeModule && !FRAMEWORK_PATTERNS.some(p => 
          frame.fileName && p.test(frame.fileName)
        );
      }
      
      return true;
    });

    return filtered;
  }
}