# stack-clean

Clean and prettify stack traces by removing noise and highlighting relevant code

## Features

- Read stack traces from stdin or file input
- Parse stack traces from multiple formats (Node.js, browser, V8)
- Filter out node_modules paths and framework internals
- Highlight application code vs third-party code with colors
- Show relative paths instead of absolute paths for clarity
- Add line numbers and column indicators
- Support custom filtering rules via CLI flags
- Preserve original error messages and types
- Handle multi-line error messages correctly
- Output clean traces to stdout for piping
- Configurable color schemes for different terminals
- Detect and format async stack traces
- Support for source map resolution (optional)
- Compact mode to show only relevant frames

## Installation

```bash
# Clone the repository
git clone https://github.com/KurtWeston/stack-clean.git
cd stack-clean

# Install dependencies
npm install
```

## Usage

```bash
npm start
```

## Built With

- typescript

## Dependencies

- `chalk`
- `commander`
- `strip-ansi`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
