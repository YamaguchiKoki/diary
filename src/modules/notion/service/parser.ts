import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { Block, RichText, RichTextAnnotations } from "../types";

/**
 * RichTextItemResponseからアノテーションを抽出します。
 * @param annotations - Notion APIのアノテーション
 * @returns RichTextAnnotations
 */
function parseAnnotations(
  annotations: RichTextItemResponse["annotations"],
): RichTextAnnotations {
  return {
    bold: annotations.bold,
    italic: annotations.italic,
    code: annotations.code,
    strikethrough: annotations.strikethrough,
    underline: annotations.underline,
  };
}

/**
 * NotionのリッチテキストをアプリケーションのRichText型にパースします。
 * @param richTexts - Notion APIから取得したリッチテキスト配列
 * @returns パース済みRichText配列
 */
export function parseRichText(richTexts: RichTextItemResponse[]): RichText[] {
  return richTexts.map((rt) => ({
    text: rt.plain_text,
    annotations: parseAnnotations(rt.annotations),
    link: rt.href ?? undefined,
  }));
}

/**
 * 見出しブロックをパースするヘルパー関数。
 * heading_1, heading_2, heading_3の共通処理を統合します。
 * @param richText - 見出しのリッチテキスト
 * @param level - 見出しレベル（1, 2, 3）
 * @returns HeadingBlock
 */
function parseHeadingBlock(
  richText: RichTextItemResponse[],
  level: 1 | 2 | 3,
): Block {
  return {
    type: "heading",
    level,
    children: parseRichText(richText),
  };
}

/**
 * NotionブロックをアプリケーションのBlock型にパースします。
 * @param block - Notion APIから取得したブロックオブジェクト
 * @returns パース済みBlock、またはサポート外のブロックタイプの場合null
 */
export function parseBlock(block: BlockObjectResponse): Block | null {
  switch (block.type) {
    case "paragraph":
      return {
        type: "paragraph",
        children: parseRichText(block.paragraph.rich_text),
      };
    case "heading_1":
      return parseHeadingBlock(block.heading_1.rich_text, 1);
    case "heading_2":
      return parseHeadingBlock(block.heading_2.rich_text, 2);
    case "heading_3":
      return parseHeadingBlock(block.heading_3.rich_text, 3);
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
