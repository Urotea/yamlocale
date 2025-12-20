import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { convertToOutputFormat } from "./converter";
import {
  extractLanguages,
  flattenYaml,
  loadYamlFiles,
  parseYamlFile,
} from "./loader";
import type { ConversionOptions } from "./types";
import { validateTranslations } from "./validation";

/**
 * Main conversion function
 */
export async function convert(options: ConversionOptions): Promise<void> {
  const { sourceDir, outputDir, languages, format = "nested" } = options;

  console.log("🔄 Loading YAML files...");
  const files = await loadYamlFiles(sourceDir);

  if (files.length === 0) {
    throw new Error(`No YAML files found in ${sourceDir}`);
  }

  console.log(`📁 Found ${files.length} YAML file(s)`);

  // Group files by namespace
  const namespaces = new Map<string, typeof files>();
  for (const file of files) {
    const existing = namespaces.get(file.namespace) || [];
    existing.push(file);
    namespaces.set(file.namespace, existing);
  }

  // Detect languages if not specified
  let targetLanguages = languages;
  if (!targetLanguages) {
    console.log("🌐 Auto-detecting languages...");
    const allLanguages = new Set<string>();
    for (const file of files) {
      const data = await parseYamlFile(file.filePath);
      const langs = extractLanguages(data);
      langs.forEach((lang) => allLanguages.add(lang));
    }
    targetLanguages = Array.from(allLanguages);
    console.log(`   Detected languages: ${targetLanguages.join(", ")}`);
  }

  if (targetLanguages.length === 0) {
    throw new Error("No languages found or specified");
  }

  // Process each namespace
  for (const [namespace, namespaceFiles] of namespaces) {
    console.log(`\n📦 Processing namespace: ${namespace}`);

    // Collect all translations for this namespace
    const allTranslations: Array<{
      key: string;
      translations: { [locale: string]: string };
    }> = [];

    for (const file of namespaceFiles) {
      const data = await parseYamlFile(file.filePath);
      const flattened = flattenYaml(data, file.prefix);
      allTranslations.push(...flattened);
    }

    // Validate translations
    console.log("   ✓ Validating translations...");
    const validationResult = validateTranslations(
      allTranslations,
      targetLanguages
    );

    if (!validationResult.valid) {
      console.error(`   ❌ Validation failed for namespace: ${namespace}`);
      for (const error of validationResult.errors) {
        console.error(`      - ${error.message}`);
        if (error.languages) {
          console.error(`        Missing: ${error.languages.join(", ")}`);
        }
      }
      throw new Error(`Validation failed for namespace: ${namespace}`);
    }

    // Convert to output format
    console.log(`   ✓ Converting to ${format} format...`);
    const converted = convertToOutputFormat(allTranslations, format);

    // Write output files
    for (const locale of targetLanguages) {
      const localeDir = join(outputDir, locale);
      await mkdir(localeDir, { recursive: true });

      const outputPath = join(localeDir, `${namespace}.json`);
      const content = JSON.stringify(converted[locale], null, 2);
      await writeFile(outputPath, content, "utf-8");

      console.log(`   ✓ Generated: ${outputPath}`);
    }
  }

  console.log("\n✅ Conversion completed successfully!");
}
