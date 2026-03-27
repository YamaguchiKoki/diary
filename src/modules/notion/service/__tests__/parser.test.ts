import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { describe, expect, it } from "vitest";
import { parseBlock, parseRichText } from "../parser";

/**
 * テスト用のRichTextItemResponseを作成するファクトリー関数
 */
function createRichText(
  text: string,
  options: Partial<RichTextItemResponse["annotations"]> = {},
  href: string | null = null,
): RichTextItemResponse {
  return {
    type: "text",
    text: { content: text, link: href ? { url: href } : null },
    annotations: {
      bold: options.bold ?? false,
      italic: options.italic ?? false,
      strikethrough: options.strikethrough ?? false,
      underline: options.underline ?? false,
      code: options.code ?? false,
      color: "default",
    },
    plain_text: text,
    href,
  };
}

/**
 * テスト用のBlockObjectResponseを作成するファクトリー関数
 */
function createBlock<T extends BlockObjectResponse["type"]>(
  type: T,
  content: Partial<Extract<BlockObjectResponse, { type: T }>>,
): BlockObjectResponse {
  const base = {
    object: "block" as const,
    id: "test-block-id",
    parent: { type: "page_id" as const, page_id: "test-page-id" },
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    created_by: { object: "user" as const, id: "test-user-id" },
    last_edited_by: { object: "user" as const, id: "test-user-id" },
    has_children: false,
    archived: false,
    in_trash: false,
    type,
  };

  return { ...base, ...content } as BlockObjectResponse;
}

describe("parseRichText", () => {
  it("プレーンテキストをパースできる", () => {
    const input = [createRichText("Hello World")];
    const result = parseRichText(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      text: "Hello World",
      annotations: {
        bold: false,
        italic: false,
        code: false,
        strikethrough: false,
        underline: false,
      },
      link: undefined,
    });
  });

  it("太字テキストをパースできる", () => {
    const input = [createRichText("Bold Text", { bold: true })];
    const result = parseRichText(input);

    expect(result[0].annotations.bold).toBe(true);
  });

  it("イタリックテキストをパースできる", () => {
    const input = [createRichText("Italic Text", { italic: true })];
    const result = parseRichText(input);

    expect(result[0].annotations.italic).toBe(true);
  });

  it("コードテキストをパースできる", () => {
    const input = [createRichText("const x = 1", { code: true })];
    const result = parseRichText(input);

    expect(result[0].annotations.code).toBe(true);
  });

  it("取り消し線テキストをパースできる", () => {
    const input = [createRichText("Deleted", { strikethrough: true })];
    const result = parseRichText(input);

    expect(result[0].annotations.strikethrough).toBe(true);
  });

  it("下線テキストをパースできる", () => {
    const input = [createRichText("Underlined", { underline: true })];
    const result = parseRichText(input);

    expect(result[0].annotations.underline).toBe(true);
  });

  it("リンク付きテキストをパースできる", () => {
    const input = [createRichText("Link", {}, "https://example.com")];
    const result = parseRichText(input);

    expect(result[0].link).toBe("https://example.com");
  });

  it("複数のアノテーションを組み合わせたテキストをパースできる", () => {
    const input = [createRichText("Bold Italic", { bold: true, italic: true })];
    const result = parseRichText(input);

    expect(result[0].annotations.bold).toBe(true);
    expect(result[0].annotations.italic).toBe(true);
  });

  it("複数のリッチテキストをパースできる", () => {
    const input = [
      createRichText("Normal "),
      createRichText("Bold", { bold: true }),
      createRichText(" End"),
    ];
    const result = parseRichText(input);

    expect(result).toHaveLength(3);
    expect(result[0].text).toBe("Normal ");
    expect(result[1].text).toBe("Bold");
    expect(result[1].annotations.bold).toBe(true);
    expect(result[2].text).toBe(" End");
  });
});

describe("parseBlock", () => {
  describe("paragraph", () => {
    it("段落ブロックをパースできる", () => {
      const block = createBlock("paragraph", {
        paragraph: {
          rich_text: [createRichText("Hello World")],
          color: "default",
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "paragraph",
        children: [
          {
            text: "Hello World",
            annotations: {
              bold: false,
              italic: false,
              code: false,
              strikethrough: false,
              underline: false,
            },
            link: undefined,
          },
        ],
      });
    });
  });

  describe("heading", () => {
    it("heading_1をパースできる", () => {
      const block = createBlock("heading_1", {
        heading_1: {
          rich_text: [createRichText("Heading 1")],
          is_toggleable: false,
          color: "default",
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "heading",
        level: 1,
        children: expect.any(Array),
      });
      if (result?.type === "heading") {
        expect(result.children[0].text).toBe("Heading 1");
      }
    });

    it("heading_2をパースできる", () => {
      const block = createBlock("heading_2", {
        heading_2: {
          rich_text: [createRichText("Heading 2")],
          is_toggleable: false,
          color: "default",
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "heading",
        level: 2,
        children: expect.any(Array),
      });
    });

    it("heading_3をパースできる", () => {
      const block = createBlock("heading_3", {
        heading_3: {
          rich_text: [createRichText("Heading 3")],
          is_toggleable: false,
          color: "default",
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "heading",
        level: 3,
        children: expect.any(Array),
      });
    });
  });

  describe("code", () => {
    it("コードブロックをパースできる", () => {
      const block = createBlock("code", {
        code: {
          rich_text: [createRichText("const x = 1;")],
          language: "typescript",
          caption: [],
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "code",
        language: "typescript",
        content: "const x = 1;",
      });
    });

    it("複数行のコードをパースできる", () => {
      const block = createBlock("code", {
        code: {
          rich_text: [
            createRichText("const x = 1;"),
            createRichText("\nconst y = 2;"),
          ],
          language: "javascript",
          caption: [],
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "code",
        language: "javascript",
        content: "const x = 1;\nconst y = 2;",
      });
    });
  });

  describe("image", () => {
    it("外部画像ブロックをパースできる", () => {
      const block = createBlock("image", {
        image: {
          type: "external",
          external: { url: "https://example.com/image.png" },
          caption: [createRichText("Image caption")],
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "image",
        url: "https://example.com/image.png",
        caption: "Image caption",
      });
    });

    it("ファイル画像ブロックをパースできる", () => {
      const block = createBlock("image", {
        image: {
          type: "file",
          file: {
            url: "https://s3.amazonaws.com/image.png",
            expiry_time: "2024-01-01T00:00:00.000Z",
          },
          caption: [],
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "image",
        url: "https://s3.amazonaws.com/image.png",
        caption: undefined,
      });
    });
  });

  describe("quote", () => {
    it("引用ブロックをパースできる", () => {
      const block = createBlock("quote", {
        quote: {
          rich_text: [createRichText("This is a quote")],
          color: "default",
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "quote",
        children: expect.any(Array),
      });
      if (result?.type === "quote") {
        expect(result.children[0].text).toBe("This is a quote");
      }
    });
  });

  describe("list items", () => {
    it("箇条書きリストをパースできる", () => {
      const block = createBlock("bulleted_list_item", {
        bulleted_list_item: {
          rich_text: [createRichText("List item")],
          color: "default",
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "bulleted_list_item",
        children: expect.any(Array),
      });
    });

    it("番号付きリストをパースできる", () => {
      const block = createBlock("numbered_list_item", {
        numbered_list_item: {
          rich_text: [createRichText("Numbered item")],
          color: "default",
        },
      });

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "numbered_list_item",
        children: expect.any(Array),
      });
    });
  });

  describe("unsupported blocks", () => {
    it("サポート外のブロックタイプはnullを返す", () => {
      const block = createBlock("divider", {
        divider: {},
      });

      const result = parseBlock(block);

      expect(result).toBeNull();
    });
  });
});
