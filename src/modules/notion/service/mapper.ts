import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Post } from "../types";

/**
 * PageObjectResponseからタイトルを抽出します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns タイトル文字列、取得できない場合は"Untitled"
 */
export function extractTitle(page: PageObjectResponse): string {
  const titleProp = page.properties.title;
  if (titleProp.type === "title") {
    return titleProp.title[0]?.plain_text ?? "Untitled";
  }
  return "Untitled";
}

/**
 * PageObjectResponseから公開状態を抽出します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns 公開されている場合true
 */
export function extractPublished(page: PageObjectResponse): boolean {
  const prop = page.properties.published;
  if (prop.type === "checkbox") {
    return prop.checkbox;
  }
  return false;
}

/**
 * 日付文字列をフォーマットします。
 * @param dateString - ISO形式の日付文字列
 * @returns フォーマットされた日付文字列（例: "Jan 24, 2026"）
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * PageObjectResponseから公開日を抽出します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns フォーマットされた公開日、設定されていない場合はnull
 */
export function extractPublishedAt(page: PageObjectResponse): string | null {
  const prop = page.properties.published_at;
  if (prop.type === "date" && prop.date?.start) {
    return formatDate(prop.date.start);
  }
  return null;
}

/**
 * PageObjectResponseからサムネイルURLを抽出します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns サムネイルURL、設定されていない場合はnull
 */
export function extractThumbnail(page: PageObjectResponse): string | null {
  const prop = page.properties.thumbnail;
  if (prop.type === "files" && prop.files.length > 0) {
    const file = prop.files[0];
    if (file.type === "external") {
      return file.external.url;
    }
    if (file.type === "file") {
      return file.file.url;
    }
  }
  return null;
}

/**
 * PageObjectResponseをPost型（blocksなし）に変換します。
 * @param page - Notion APIから取得したページオブジェクト
 * @returns Post型オブジェクト（blocksなし）
 */
export function mapPageToPost(page: PageObjectResponse): Omit<Post, "blocks"> {
  return {
    id: page.id,
    title: extractTitle(page),
    published: extractPublished(page),
    publishedAt: extractPublishedAt(page),
    thumbnail: extractThumbnail(page),
  };
}
