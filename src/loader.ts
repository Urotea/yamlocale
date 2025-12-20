import { readFile, readdir, stat } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { parse } from "yaml";
import type {
  FileNamespace,
  FlatTranslations,
  YamlTranslations,
} from "./types";

/**
 * Load all YAML files from a directory and its subdirectories
 */
export async function loadYamlFiles(
  sourceDir: string
): Promise<FileNamespace[]> {
  const files: FileNamespace[] = [];

  async function scanDirectory(dir: string, relativeDir: string = "") {
    const entries = await readdir(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // Scan subdirectories
        await scanDirectory(fullPath, join(relativeDir, entry));
      } else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) {
        // Process YAML files
        const namespace = getNamespaceFromPath(relativeDir, entry);
        const prefix = getPrefixFromPath(relativeDir, entry);

        files.push({
          namespace,
          prefix,
          filePath: fullPath,
        });
      }
    }
  }

  await scanDirectory(sourceDir);
  return files;
}

/**
 * Determine namespace from file path
 * - Root files: filename becomes namespace
 * - Subdirectory files: directory name becomes namespace
 */
function getNamespaceFromPath(relativeDir: string, filename: string): string {
  if (!relativeDir || relativeDir === ".") {
    // Root level file: use filename without extension
    const name = filename.replace(/\.(yaml|yml)$/, "");
    return name;
  }
  // Subdirectory: use first directory name
  return relativeDir.split("/")[0];
}

/**
 * Get prefix for keys based on file location
 * - Root files: no prefix
 * - Subdirectory files: filename becomes prefix
 */
function getPrefixFromPath(relativeDir: string, filename: string): string {
  if (!relativeDir || relativeDir === ".") {
    return "";
  }
  return filename.replace(/\.(yaml|yml)$/, "");
}

/**
 * Parse YAML file content
 */
export async function parseYamlFile(
  filePath: string
): Promise<YamlTranslations> {
  const content = await readFile(filePath, "utf-8");
  return parse(content) as YamlTranslations;
}

/**
 * Extract all available languages from YAML content
 */
export function extractLanguages(data: YamlTranslations): Set<string> {
  const languages = new Set<string>();

  function traverse(obj: YamlTranslations | { [locale: string]: string }) {
    if (typeof obj !== "object" || obj === null) {
      return;
    }

    // Check if this is a leaf node (all values are strings)
    const values = Object.values(obj);
    if (values.every((v) => typeof v === "string")) {
      // This is a leaf node with language keys
      Object.keys(obj).forEach((lang) => languages.add(lang));
    } else {
      // Continue traversing
      Object.values(obj).forEach(traverse);
    }
  }

  traverse(data);
  return languages;
}

/**
 * Flatten YAML structure with prefix
 */
export function flattenYaml(
  data: YamlTranslations,
  prefix: string = ""
): Array<{ key: string; translations: { [locale: string]: string } }> {
  const results: Array<{
    key: string;
    translations: { [locale: string]: string };
  }> = [];

  function traverse(
    obj: YamlTranslations | { [locale: string]: string },
    path: string[] = []
  ) {
    if (typeof obj !== "object" || obj === null) {
      return;
    }

    // Check if this is a leaf node (all values are strings)
    const values = Object.values(obj);
    if (values.every((v) => typeof v === "string")) {
      // This is a leaf node with translations
      const fullKey = prefix ? [prefix, ...path].join(".") : path.join(".");
      results.push({
        key: fullKey,
        translations: obj as { [locale: string]: string },
      });
    } else {
      // Continue traversing
      for (const [key, value] of Object.entries(obj)) {
        traverse(value, [...path, key]);
      }
    }
  }

  traverse(data);
  return results;
}
