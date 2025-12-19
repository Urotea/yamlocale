import type {
  FlatTranslations,
  NestedTranslations,
  OutputFormat,
} from "./types";

/**
 * Convert flat key-value pairs to the specified output format
 */
export function convertToOutputFormat(
  translationEntries: Array<{
    key: string;
    translations: { [locale: string]: string };
  }>,
  format: OutputFormat = "nested"
): { [locale: string]: FlatTranslations | NestedTranslations } {
  const result: { [locale: string]: FlatTranslations | NestedTranslations } =
    {};

  // First, organize by locale
  const byLocale: { [locale: string]: Array<{ key: string; value: string }> } =
    {};

  for (const { key, translations } of translationEntries) {
    for (const [locale, value] of Object.entries(translations)) {
      if (!byLocale[locale]) {
        byLocale[locale] = [];
      }
      byLocale[locale].push({ key, value });
    }
  }

  // Convert each locale to the desired format
  for (const [locale, items] of Object.entries(byLocale)) {
    if (format === "flat") {
      result[locale] = convertToFlat(items);
    } else {
      result[locale] = convertToNested(items);
    }
  }

  return result;
}

/**
 * Convert to flat format (dot-separated keys)
 */
function convertToFlat(
  items: Array<{ key: string; value: string }>
): FlatTranslations {
  const result: FlatTranslations = {};
  for (const { key, value } of items) {
    result[key] = value;
  }
  return result;
}

/**
 * Convert to nested format (object hierarchy)
 */
function convertToNested(
  items: Array<{ key: string; value: string }>
): NestedTranslations {
  const result: NestedTranslations = {};

  for (const { key, value } of items) {
    const parts = key.split(".");
    let current: NestedTranslations | string | undefined = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (typeof current === "object" && current !== null) {
        if (!(part in current)) {
          current[part] = {};
        }
        current = current[part];
      }
    }

    if (typeof current === "object" && current !== null) {
      current[parts[parts.length - 1]] = value;
    }
  }

  return result;
}
