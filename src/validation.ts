import type { ValidationError, ValidationResult } from "./types";

/**
 * Validate translations for completeness and consistency
 */
export function validateTranslations(
  translationEntries: Array<{
    key: string;
    translations: { [locale: string]: string };
  }>,
  requiredLanguages: string[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const seenKeys = new Set<string>();

  for (const { key, translations } of translationEntries) {
    // Check for duplicates
    if (seenKeys.has(key)) {
      errors.push({
        type: "duplicate",
        key,
        message: `Duplicate key found: ${key}`,
      });
      continue;
    }
    seenKeys.add(key);

    // Check for missing translations
    const missingLanguages = requiredLanguages.filter(
      (lang) => !(lang in translations)
    );

    if (missingLanguages.length > 0) {
      errors.push({
        type: "missing",
        key,
        message: `Missing translations for key: ${key}`,
        languages: missingLanguages,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
