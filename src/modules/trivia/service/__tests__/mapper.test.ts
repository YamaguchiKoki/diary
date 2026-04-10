import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { describe, expect, it } from "vitest";
import { mapPageToTrivia } from "../mapper";

describe("mapPageToTrivia", () => {
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
              text: { content: "テスト豆知識", link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "テスト豆知識",
              href: null,
            },
          ],
        },
      },
      url: "https://notion.so/test-id-123",
      public_url: null,
    };

    const result = mapPageToTrivia(mockPage);

    expect(result).toEqual({
      id: "test-id-123",
      title: "テスト豆知識",
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
      },
      url: "https://notion.so/test-id-123",
      public_url: null,
    };

    const result = mapPageToTrivia(mockPage);

    expect(result.title).toBe("無題");
  });
});
