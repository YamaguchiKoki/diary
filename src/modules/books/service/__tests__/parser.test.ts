import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { describe, expect, it } from "vitest";
import { parseReadingNotePage } from "../parser";

describe("parseReadingNotePage", () => {
  it("正常なページオブジェクトをパースできる", () => {
    const mockPage: PageObjectResponse = {
      object: "page",
      id: "test-id-123",
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-1" },
      last_edited_by: { object: "user", id: "user-1" },
      cover: null,
      icon: null,
      parent: { type: "database_id", database_id: "db-123" },
      archived: false,
      in_trash: false,
      is_locked: false,
      properties: {
        title: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: { content: "テスト読書メモ", link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "テスト読書メモ",
              href: null,
            },
          ],
        },
        topic: {
          id: "topic",
          type: "multi_select",
          multi_select: [
            { id: "1", name: "プログラミング", color: "blue" },
            { id: "2", name: "技術書", color: "green" },
          ],
        },
        created_at: {
          id: "created_at",
          type: "date",
          date: { start: "2024-01-01", end: null, time_zone: null },
        },
        is_public: {
          id: "is_public",
          type: "checkbox",
          checkbox: true,
        },
      },
      url: "https://notion.so/test-id-123",
      public_url: null,
    };

    const result = parseReadingNotePage(mockPage);

    expect(result).toEqual({
      id: "test-id-123",
      title: "テスト読書メモ",
      topics: ["プログラミング", "技術書"],
      createdAt: "2024-01-01",
      isPublic: true,
    });
  });

  it("タイトルが空の場合は「無題」を返す", () => {
    const mockPage: PageObjectResponse = {
      object: "page",
      id: "test-id-123",
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-1" },
      last_edited_by: { object: "user", id: "user-1" },
      cover: null,
      icon: null,
      parent: { type: "database_id", database_id: "db-123" },
      archived: false,
      in_trash: false,
      is_locked: false,
      properties: {
        title: { id: "title", type: "title", title: [] },
        topic: { id: "topic", type: "multi_select", multi_select: [] },
        created_at: { id: "created_at", type: "date", date: null },
        is_public: { id: "is_public", type: "checkbox", checkbox: true },
      },
      url: "https://notion.so/test-id-123",
      public_url: null,
    };

    const result = parseReadingNotePage(mockPage);

    expect(result.title).toBe("無題");
  });

  it("トピックが空の場合は空配列を返す", () => {
    const mockPage: PageObjectResponse = {
      object: "page",
      id: "test-id-123",
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-1" },
      last_edited_by: { object: "user", id: "user-1" },
      cover: null,
      icon: null,
      parent: { type: "database_id", database_id: "db-123" },
      archived: false,
      in_trash: false,
      is_locked: false,
      properties: {
        title: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: { content: "テスト", link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "テスト",
              href: null,
            },
          ],
        },
        topic: { id: "topic", type: "multi_select", multi_select: [] },
        created_at: { id: "created_at", type: "date", date: null },
        is_public: { id: "is_public", type: "checkbox", checkbox: true },
      },
      url: "https://notion.so/test-id-123",
      public_url: null,
    };

    const result = parseReadingNotePage(mockPage);

    expect(result.topics).toEqual([]);
  });

  it("is_publicがfalseの場合も正しくパースできる", () => {
    const mockPage: PageObjectResponse = {
      object: "page",
      id: "test-id-123",
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-1" },
      last_edited_by: { object: "user", id: "user-1" },
      cover: null,
      icon: null,
      parent: { type: "database_id", database_id: "db-123" },
      archived: false,
      in_trash: false,
      is_locked: false,
      properties: {
        title: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: { content: "非公開メモ", link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "非公開メモ",
              href: null,
            },
          ],
        },
        topic: { id: "topic", type: "multi_select", multi_select: [] },
        created_at: {
          id: "created_at",
          type: "date",
          date: { start: "2024-01-15", end: null, time_zone: null },
        },
        is_public: { id: "is_public", type: "checkbox", checkbox: false },
      },
      url: "https://notion.so/test-id-123",
      public_url: null,
    };

    const result = parseReadingNotePage(mockPage);

    expect(result.isPublic).toBe(false);
  });
});
