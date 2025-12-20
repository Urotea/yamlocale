import { describe, expect, test } from "bun:test";
import { validateTranslations } from "./validation";

describe("validateTranslations", () => {
  test("should pass validation for complete translations", () => {
    const translations = [
      {
        key: "title",
        translations: { ja: "タイトル", en: "Title" },
      },
      {
        key: "description",
        translations: { ja: "説明", en: "Description" },
      },
    ];

    const result = validateTranslations(translations, ["ja", "en"]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("should detect missing translations", () => {
    const translations = [
      {
        key: "title",
        translations: { ja: "タイトル" },
      },
    ];

    const result = validateTranslations(translations, ["ja", "en"]);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe("missing");
    expect(result.errors[0].key).toBe("title");
    expect(result.errors[0].languages).toEqual(["en"]);
  });

  test("should detect duplicate keys", () => {
    const translations = [
      {
        key: "title",
        translations: { ja: "タイトル", en: "Title" },
      },
      {
        key: "title",
        translations: { ja: "タイトル2", en: "Title 2" },
      },
    ];

    const result = validateTranslations(translations, ["ja", "en"]);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe("duplicate");
    expect(result.errors[0].key).toBe("title");
  });

  test("should detect multiple missing languages", () => {
    const translations = [
      {
        key: "title",
        translations: { ja: "タイトル" },
      },
    ];

    const result = validateTranslations(translations, ["ja", "en", "fr"]);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].languages).toEqual(["en", "fr"]);
  });
});
