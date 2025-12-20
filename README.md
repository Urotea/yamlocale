# yamlocale

YAML to JSON i18n dictionary converter with CLI support.

## Features

- 🌐 Convert YAML translation files to JSON format
- 📦 Smart namespace detection (file-based or directory-based)
- 🔄 Auto-detection of available languages
- ✅ Validation for missing translations and duplicate keys
- 🎯 Support for both flat and nested output formats
- 👀 Watch mode for automatic regeneration
- 🚀 Built with Bun, TypeScript, and modern tooling

## Installation

```bash
npm install yamlocale
# or
bun install yamlocale
```

## Usage

### CLI

```bash
yamlocale <source-dir> <output-dir> [options]
```

#### Options

- `-l, --languages <languages>` - Comma-separated list of languages (e.g., `ja,en`). Auto-detected if not specified.
- `-f, --format <format>` - Output format: `flat` or `nested` (default: `nested`)
- `-w, --watch` - Watch mode: automatically regenerate on file changes

#### Examples

```bash
# Basic usage with auto-detected languages
yamlocale ./src/i18n ./dist/locales

# Specify languages explicitly
yamlocale ./src/i18n ./dist/locales --languages ja,en,fr

# Use flat output format
yamlocale ./src/i18n ./dist/locales --format flat

# Enable watch mode
yamlocale ./src/i18n ./dist/locales --watch
```

### Programmatic API

```typescript
import { convert } from "yamlocale";

await convert({
  sourceDir: "./src/i18n",
  outputDir: "./dist/locales",
  languages: ["ja", "en"], // Optional: auto-detected if not specified
  format: "nested", // Optional: "flat" or "nested" (default: "nested")
});
```

## Directory Structure and Namespace Strategy

The output JSON filename (namespace) is automatically determined by the file placement in the source directory.

### Rules

1. **Root-level files**
   - Filename becomes the namespace
   - Source: `${sourceDir}/home.yaml`
   - Output: `${outputDir}/{locale}/home.json`

2. **Subdirectory files**
   - Directory name becomes the namespace
   - Filename becomes the key prefix
   - Source: `${sourceDir}/common/button.yaml`
   - Output: `${outputDir}/{locale}/common.json`

## YAML Format

- **Language co-location**: Include all languages in a single file
- **Completeness**: All leaf nodes must have translations for all languages
- **Nesting**: Support for arbitrary nesting depth (2-3 levels recommended)

### Example

```yaml
# src/i18n/common/button.yaml
add:
  ja: 追加
  en: Add
delete:
  ja: 削除
  en: Delete
```

## Output Formats

### Nested (default)

```json
{
  "button": {
    "add": "Add",
    "delete": "Delete"
  }
}
```

### Flat

```json
{
  "button.add": "Add",
  "button.delete": "Delete"
}
```

## Validation

The converter performs the following validations:

- **Missing translations**: Ensures all keys have translations for all target languages
- **Duplicate keys**: Detects duplicate keys within the same namespace

## Compatibility

Generated JSON files are compatible with popular i18n libraries:

- i18next
- react-intl
- vue-i18n
- And other standard JSON-based i18n solutions

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Format code
npm run format

# Type check
npm run typecheck
```

## License

MIT

## Credits

Inspired by [colocale](https://github.com/Urotea/colocale) by Urotea.
