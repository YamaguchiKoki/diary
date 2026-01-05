import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { Block, RichText } from "../types";

export function parseRichText(richTexts: RichTextItemResponse[]): RichText[] {
  return richTexts.map((rt) => ({
    text: rt.plain_text,
    bold: rt.annotations.bold,
    italic: rt.annotations.italic,
    code: rt.annotations.code,
    strikethrough: rt.annotations.strikethrough,
    underline: rt.annotations.underline,
    link: rt.href ?? undefined,
  }));
}

export function parseBlock(block: BlockObjectResponse): Block | null {
  switch (block.type) {
    case "paragraph":
      return {
        type: "paragraph",
        children: parseRichText(block.paragraph.rich_text),
      };
    case "heading_1":
      return {
        type: "heading",
        level: 1,
        children: parseRichText(block.heading_1.rich_text),
      };
    case "heading_2":
      return {
        type: "heading",
        level: 2,
        children: parseRichText(block.heading_2.rich_text),
      };
    case "heading_3":
      return {
        type: "heading",
        level: 3,
        children: parseRichText(block.heading_3.rich_text),
      };
    case "code":
      return {
        type: "code",
        language: block.code.language,
        content: block.code.rich_text.map((rt) => rt.plain_text).join(""),
      };
    case "image": {
      const url =
        block.image.type === "external"
          ? block.image.external.url
          : block.image.file.url;
      return {
        type: "image",
        url,
        caption: block.image.caption[0]?.plain_text,
      };
    }
    case "quote":
      return {
        type: "quote",
        children: parseRichText(block.quote.rich_text),
      };
    case "bulleted_list_item":
      return {
        type: "bulleted_list_item",
        children: parseRichText(block.bulleted_list_item.rich_text),
      };
    case "numbered_list_item":
      return {
        type: "numbered_list_item",
        children: parseRichText(block.numbered_list_item.rich_text),
      };
    default:
      return null;
  }
}
