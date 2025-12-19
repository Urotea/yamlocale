import { describe, expect, test } from "bun:test";
import { convertToOutputFormat } from "./converter";

describe("convertToOutputFormat", () => {
  test("should convert to flat format", () => {
    const input = [
      {
        key: "button.add",
        translations: { ja: "追加", en: "Add" },
      },
      {
        key: "button.delete",
        translations: { ja: "削除", en: "Delete" },
      },
    ];

    const result = convertToOutputFormat(input, "flat");

    expect(result.ja).toEqual({
      "button.add": "追加",
      "button.delete": "削除",
    });
    expect(result.en).toEqual({
      "button.add": "Add",
      "button.delete": "Delete",
    });
  });

  test("should convert to nested format", () => {
    const input = [
      {
        key: "button.add",
        translations: { ja: "追加", en: "Add" },
      },
      {
        key: "button.delete",
        translations: { ja: "削除", en: "Delete" },
      },
    ];

    const result = convertToOutputFormat(input, "nested");

    expect(result.ja).toEqual({
      button: {
        add: "追加",
        delete: "削除",
      },
    });
    expect(result.en).toEqual({
      button: {
        add: "Add",
        delete: "Delete",
      },
    });
  });

  test("should handle simple keys in nested format", () => {
    const input = [
      {
        key: "title",
        translations: { ja: "タイトル", en: "Title" },
      },
      {
        key: "description",
        translations: { ja: "説明", en: "Description" },
      },
    ];

    const result = convertToOutputFormat(input, "nested");

    expect(result.ja).toEqual({
      title: "タイトル",
      description: "説明",
    });
    expect(result.en).toEqual({
      title: "Title",
      description: "Description",
    });
  });

  test("should handle deeply nested keys", () => {
    const input = [
      {
        key: "user.profile.name",
        translations: { ja: "名前", en: "Name" },
      },
    ];

    const result = convertToOutputFormat(input, "nested");

    expect(result.ja).toEqual({
      user: {
        profile: {
          name: "名前",
        },
      },
    });
  });
});
