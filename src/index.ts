#!/usr/bin/env node
import { Command } from 'commander';
import { log } from '@onamfc/developer-log';
import * as fs from 'fs';
import { StackCleaner } from './cleaner';
import { StackFormatter } from './formatter';
import { CleanOptions } from './types';

const program = new Command();

program
  .name('stack-clean')
  .description('Clean and prettify stack traces by removing noise')
  .version('1.0.0')
  .option('-f, --filter <patterns...>', 'custom filter patterns to exclude')
  .option('--no-color', 'disable color output')
  .option('-c, --compact', 'show only application code frames')
  .option('--context <lines>', 'lines of context to show', '3')
  .argument('[file]', 'file containing stack trace (reads from stdin if omitted)')
  .action(async (file: string | undefined, options: CleanOptions) => {
    try {
      let input: string;

      if (file) {
        input = fs.readFileSync(file, 'utf-8');
      } else {
        input = await readStdin();
      }

      if (!input.trim()) {
        log.error('No input provided');
        process.exit(1);
      }

      const cleaner = new StackCleaner(options);
      const formatter = new StackFormatter(options);

      const parsed = cleaner.parse(input);
      const filtered = cleaner.filter(parsed.frames, options.compact);
      const output = formatter.format(parsed, filtered);

      console.log(output);
    } catch (error) {
      log.error('Failed to process stack trace:', error);
      process.exit(1);
    }
  });

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    process.stdin.on('data', chunk => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    process.stdin.on('error', reject);
  });
}

program.parse();
