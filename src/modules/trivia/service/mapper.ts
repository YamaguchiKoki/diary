import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Trivia } from "@/modules/trivia/types";

/**
 * PageObjectResponseからタイトルを抽出します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns タイトル文字列、取得できない場合は"無題"
 */
export function extractTitle(page: PageObjectResponse): string {
  const titleProp = page.properties.title;
  if (titleProp?.type === "title") {
    const text = titleProp.title
      .map((t) => t.plain_text)
      .join("")
      .trim();
    if (text) {
      return text;
    }
  }
  return "無題";
}

/**
 * PageObjectResponseをTrivia型（blocksなし）に変換します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns Trivia型オブジェクト（blocksなし）
 */
export function mapPageToTrivia(
  page: PageObjectResponse,
): Omit<Trivia, "blocks"> {
  return {
    id: page.id,
    title: extractTitle(page),
  };
}
