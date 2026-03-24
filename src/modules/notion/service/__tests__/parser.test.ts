import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { describe, expect, it } from "vitest";
import { parseBlock } from "../parser";

function makeRichTextItem(
  plainText: string,
  annotations?: Partial<{
    bold: boolean;
    italic: boolean;
    code: boolean;
    strikethrough: boolean;
    underline: boolean;
  }>,
) {
  return {
    type: "text" as const,
    text: { content: plainText, link: null },
    annotations: {
      bold: false,
      italic: false,
      code: false,
      strikethrough: false,
      underline: false,
      color: "default" as const,
      ...annotations,
    },
    plain_text: plainText,
    href: null,
  };
}

const BASE_BLOCK_FIELDS = {
  object: "block" as const,
  id: "block-id",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  created_by: { object: "user" as const, id: "user-1" },
  last_edited_by: { object: "user" as const, id: "user-1" },
  has_children: false,
  archived: false,
  in_trash: false,
  parent: { type: "page_id" as const, page_id: "page-1" },
};

describe("parseBlock", () => {
  describe("heading_1", () => {
    it("heading_1 ブロックを正しい型・テキストに変換する", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "heading_1" as const,
        heading_1: {
          rich_text: [makeRichTextItem("見出し1テキスト")],
          is_toggleable: false,
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "heading",
        level: 1,
        is_toggleable: false,
        children: [expect.objectContaining({ text: "見出し1テキスト" })],
      });
    });

    it("heading_1 の is_toggleable が true の場合も正しく変換する", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "heading_1" as const,
        heading_1: {
          rich_text: [makeRichTextItem("トグル見出し")],
          is_toggleable: true,
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toMatchObject({
        type: "heading",
        level: 1,
        is_toggleable: true,
      });
    });
  });

  describe("heading_2", () => {
    it("heading_2 ブロックを正しい型・テキストに変換する", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "heading_2" as const,
        heading_2: {
          rich_text: [makeRichTextItem("見出し2テキスト")],
          is_toggleable: false,
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toMatchObject({
        type: "heading",
        level: 2,
        is_toggleable: false,
      });
    });
  });

  describe("heading_3", () => {
    it("heading_3 ブロックを正しい型・テキストに変換する", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "heading_3" as const,
        heading_3: {
          rich_text: [makeRichTextItem("見出し3テキスト")],
          is_toggleable: false,
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toMatchObject({
        type: "heading",
        level: 3,
        is_toggleable: false,
      });
    });
  });

  describe("quote", () => {
    it("quote ブロックのリッチテキストが正しくパースされる（通常テキスト）", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "quote" as const,
        quote: {
          rich_text: [makeRichTextItem("引用テキスト")],
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "quote",
        children: [expect.objectContaining({ text: "引用テキスト" })],
      });
    });

    it("quote ブロックの太字テキストが正しくパースされる", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "quote" as const,
        quote: {
          rich_text: [makeRichTextItem("太字テキスト", { bold: true })],
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toMatchObject({
        type: "quote",
        children: [
          expect.objectContaining({ text: "太字テキスト", bold: true }),
        ],
      });
    });

    it("quote ブロックの斜体テキストが正しくパースされる", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "quote" as const,
        quote: {
          rich_text: [makeRichTextItem("斜体テキスト", { italic: true })],
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toMatchObject({
        type: "quote",
        children: [
          expect.objectContaining({ text: "斜体テキスト", italic: true }),
        ],
      });
    });

    it("quote ブロックのコードテキストが正しくパースされる", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "quote" as const,
        quote: {
          rich_text: [makeRichTextItem("コードテキスト", { code: true })],
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toMatchObject({
        type: "quote",
        children: [
          expect.objectContaining({ text: "コードテキスト", code: true }),
        ],
      });
    });
  });

  describe("divider", () => {
    it("divider ブロックが正しく変換される", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "divider" as const,
        divider: {},
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toEqual({ type: "divider" });
    });
  });

  describe("bulleted_list_item", () => {
    it("子ブロックなしの bulleted_list_item が正しく変換される", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "bulleted_list_item" as const,
        bulleted_list_item: {
          rich_text: [makeRichTextItem("箇条書きテキスト")],
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "bulleted_list_item",
        children: [expect.objectContaining({ text: "箇条書きテキスト" })],
        nestedBlocks: [],
      });
    });

    it("rawChildren が渡された場合、bulleted_list_item の nestedBlocks に再帰的に変換される", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "bulleted_list_item" as const,
        bulleted_list_item: {
          rich_text: [makeRichTextItem("親テキスト")],
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const childBlock = {
        ...BASE_BLOCK_FIELDS,
        id: "child-block-id",
        type: "bulleted_list_item" as const,
        bulleted_list_item: {
          rich_text: [makeRichTextItem("子テキスト")],
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block, [childBlock]);

      expect(result).toMatchObject({
        type: "bulleted_list_item",
        nestedBlocks: [
          expect.objectContaining({
            type: "bulleted_list_item",
            children: [expect.objectContaining({ text: "子テキスト" })],
          }),
        ],
      });
    });
  });

  describe("numbered_list_item", () => {
    it("子ブロックなしの numbered_list_item が正しく変換される", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "numbered_list_item" as const,
        numbered_list_item: {
          rich_text: [makeRichTextItem("番号付きテキスト")],
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block);

      expect(result).toEqual({
        type: "numbered_list_item",
        children: [expect.objectContaining({ text: "番号付きテキスト" })],
        nestedBlocks: [],
      });
    });

    it("rawChildren が渡された場合、numbered_list_item の nestedBlocks に再帰的に変換される", () => {
      const block = {
        ...BASE_BLOCK_FIELDS,
        type: "numbered_list_item" as const,
        numbered_list_item: {
          rich_text: [makeRichTextItem("親テキスト")],
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const childBlock = {
        ...BASE_BLOCK_FIELDS,
        id: "child-block-id",
        type: "numbered_list_item" as const,
        numbered_list_item: {
          rich_text: [makeRichTextItem("子テキスト")],
          color: "default" as const,
        },
      } as unknown as BlockObjectResponse;

      const result = parseBlock(block, [childBlock]);

      expect(result).toMatchObject({
        type: "numbered_list_item",
        nestedBlocks: [
          expect.objectContaining({
            type: "numbered_list_item",
            children: [expect.objectContaining({ text: "子テキスト" })],
          }),
        ],
      });
    });
  });
});
