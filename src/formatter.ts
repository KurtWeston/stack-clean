import chalk from 'chalk';
import { StackFrame, ParsedError, CleanOptions } from './types';
import { COLOR_SCHEME } from './config';

export class StackFormatter {
  private useColor: boolean;

  constructor(options: CleanOptions = {}) {
    this.useColor = !options.noColor;
  }

  format(error: ParsedError, frames: StackFrame[]): string {
    const lines: string[] = [];
    
    const errorHeader = this.formatError(error);
    lines.push(errorHeader);
    
    frames.forEach(frame => {
      lines.push(this.formatFrame(frame));
    });

    return lines.join('\n');
  }

  private formatError(error: ParsedError): string {
    const type = this.colorize(error.type || 'Error', COLOR_SCHEME.errorType);
    const message = this.colorize(error.message, COLOR_SCHEME.error);
    return `${type}: ${message}`;
  }

  private formatFrame(frame: StackFrame): string {
    if (!frame.fileName) {
      return `  at ${this.colorize(frame.functionName || '<anonymous>', COLOR_SCHEME.thirdParty)}`;
    }

    const prefix = frame.isAsync ? 'async ' : '';
    const func = frame.functionName || '<anonymous>';
    const funcColor = frame.isNodeModule ? COLOR_SCHEME.thirdParty : COLOR_SCHEME.appCode;
    
    const fileName = this.colorize(frame.fileName, COLOR_SCHEME.fileName);
    const location = `${fileName}:${this.colorize(String(frame.lineNumber), COLOR_SCHEME.lineNumber)}:${frame.columnNumber}`;
    
    if (frame.isNative) {
      return `  at ${this.colorize(prefix + func, COLOR_SCHEME.native)} (${location})`;
    }
    
    if (frame.isAsync) {
      return `  at ${this.colorize(prefix, COLOR_SCHEME.async)}${this.colorize(func, funcColor)} (${location})`;
    }

    return `  at ${this.colorize(func, funcColor)} (${location})`;
  }

  private colorize(text: string, color: string): string {
    if (!this.useColor) return text;
    return (chalk as any)[color](text);
  }
}