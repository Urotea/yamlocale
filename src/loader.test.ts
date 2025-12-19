import { describe, expect, test } from "bun:test";
import { extractLanguages, flattenYaml } from "./loader";
import type { YamlTranslations } from "./types";

describe("extractLanguages", () => {
  test("should extract languages from YAML data", () => {
    const data: YamlTranslations = {
      title: {
        ja: "タイトル",
        en: "Title",
      },
      description: {
        ja: "説明",
        en: "Description",
      },
    };

    const languages = extractLanguages(data);
    expect(languages.has("ja")).toBe(true);
    expect(languages.has("en")).toBe(true);
    expect(languages.size).toBe(2);
  });

  test("should extract languages from nested YAML data", () => {
    const data: YamlTranslations = {
      button: {
        add: {
          ja: "追加",
          en: "Add",
        },
        delete: {
          ja: "削除",
          en: "Delete",
        },
      },
    };

    const languages = extractLanguages(data);
    expect(languages.has("ja")).toBe(true);
    expect(languages.has("en")).toBe(true);
    expect(languages.size).toBe(2);
  });
});

describe("flattenYaml", () => {
  test("should flatten YAML without prefix", () => {
    const data: YamlTranslations = {
      title: {
        ja: "タイトル",
        en: "Title",
      },
      description: {
        ja: "説明",
        en: "Description",
      },
    };

    const result = flattenYaml(data);
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("title");
    expect(result[0].translations).toEqual({
      ja: "タイトル",
      en: "Title",
    });
    expect(result[1].key).toBe("description");
  });

  test("should flatten YAML with prefix", () => {
    const data: YamlTranslations = {
      add: {
        ja: "追加",
        en: "Add",
      },
      delete: {
        ja: "削除",
        en: "Delete",
      },
    };

    const result = flattenYaml(data, "button");
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("button.add");
    expect(result[1].key).toBe("button.delete");
  });

  test("should flatten nested YAML", () => {
    const data: YamlTranslations = {
      user: {
        profile: {
          name: {
            ja: "名前",
            en: "Name",
          },
        },
      },
    };

    const result = flattenYaml(data);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("user.profile.name");
  });
});
