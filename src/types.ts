/**
 * Type definitions for yamlocale
 */

export type OutputFormat = "flat" | "nested";

export interface ConversionOptions {
  sourceDir: string;
  outputDir: string;
  languages?: string[];
  format?: OutputFormat;
  watch?: boolean;
}

export interface YamlTranslations {
  [key: string]: YamlTranslations | { [locale: string]: string };
}

export interface FlatTranslations {
  [key: string]: string;
}

export interface TranslationEntry {
  key: string;
  translations: { [locale: string]: string };
}

export interface NestedTranslations {
  [key: string]: string | NestedTranslations;
}

export interface ValidationError {
  type: "missing" | "duplicate";
  key: string;
  message: string;
  languages?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface FileNamespace {
  namespace: string;
  prefix: string;
  filePath: string;
}
