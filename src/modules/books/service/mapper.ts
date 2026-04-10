import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { ReadingNote } from "@/modules/books/types";

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
 * PageObjectResponseからトピック（マルチセレクト）を抽出します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns トピック名の配列、設定されていない場合は空配列
 */
export function extractTopics(page: PageObjectResponse): string[] {
  const prop = page.properties.topic;
  if (prop?.type === "multi_select") {
    return prop.multi_select.map((t) => t.name);
  }
  return [];
}

/**
 * PageObjectResponseから作成日を抽出します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns ISO形式の作成日、設定されていない場合はnull
 */
export function extractCreatedAt(page: PageObjectResponse): string | null {
  const prop = page.properties.created_at;
  if (prop?.type === "date") {
    return prop.date?.start ?? null;
  }
  return null;
}

/**
 * PageObjectResponseから公開フラグを抽出します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns 公開されている場合true
 */
export function extractIsPublic(page: PageObjectResponse): boolean {
  const prop = page.properties.is_public;
  if (prop?.type === "checkbox") {
    return prop.checkbox;
  }
  return false;
}

/**
 * PageObjectResponseをReadingNote型（blocksなし）に変換します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns ReadingNote型オブジェクト（blocksなし）
 */
export function mapPageToReadingNote(
  page: PageObjectResponse,
): Omit<ReadingNote, "blocks"> {
  return {
    id: page.id,
    title: extractTitle(page),
    topics: extractTopics(page),
    isPublic: extractIsPublic(page),
    createdAt: extractCreatedAt(page),
  };
}
