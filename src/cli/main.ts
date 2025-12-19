#!/usr/bin/env node

import { watch as watchFiles } from "chokidar";
import { Command } from "commander";
import { convert } from "../processor";
import type { ConversionOptions } from "../types";

const program = new Command();

program
  .name("yamlocale")
  .description("YAML to JSON i18n dictionary converter")
  .version("0.1.0");

program
  .argument("<source-dir>", "Source directory containing YAML files")
  .argument("<output-dir>", "Output directory for JSON files")
  .option(
    "-l, --languages <languages>",
    "Comma-separated list of languages (e.g., ja,en). If not specified, auto-detected from YAML files"
  )
  .option(
    "-f, --format <format>",
    "Output format: 'flat' or 'nested' (default: nested)",
    "nested"
  )
  .option("-w, --watch", "Watch mode: automatically regenerate on file changes")
  .action(
    async (
      sourceDir: string,
      outputDir: string,
      options: {
        languages?: string;
        format?: string;
        watch?: boolean;
      }
    ) => {
      try {
        const conversionOptions: ConversionOptions = {
          sourceDir,
          outputDir,
          languages: options.languages
            ? options.languages.split(",").map((s) => s.trim())
            : undefined,
          format: (options.format as "flat" | "nested") || "nested",
          watch: options.watch,
        };

        // Validate format
        if (
          conversionOptions.format !== "flat" &&
          conversionOptions.format !== "nested"
        ) {
          console.error(
            `❌ Invalid format: ${conversionOptions.format}. Must be 'flat' or 'nested'`
          );
          process.exit(1);
        }

        // Run initial conversion
        await convert(conversionOptions);

        // Set up watch mode if requested
        if (options.watch) {
          console.log("\n👀 Watch mode enabled. Watching for changes...");
          console.log("   Press Ctrl+C to stop\n");

          const watcher = watchFiles(`${sourceDir}/**/*.{yaml,yml}`, {
            ignoreInitial: true,
          });

          let timeout: NodeJS.Timeout | null = null;

          watcher.on("all", (event, path) => {
            console.log(`\n📝 File ${event}: ${path}`);

            // Debounce: wait for 500ms of inactivity before regenerating
            if (timeout) {
              clearTimeout(timeout);
            }

            timeout = setTimeout(async () => {
              try {
                await convert(conversionOptions);
              } catch (error) {
                console.error(
                  "❌ Error during regeneration:",
                  error instanceof Error ? error.message : String(error)
                );
              }
            }, 500);
          });

          // Keep process alive
          process.on("SIGINT", () => {
            console.log("\n\n👋 Stopping watch mode...");
            watcher.close();
            process.exit(0);
          });
        }
      } catch (error) {
        console.error(
          "❌ Error:",
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
    }
  );

program.parse();
