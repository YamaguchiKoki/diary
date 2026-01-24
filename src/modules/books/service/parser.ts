import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { ReadingNoteForListView } from "../types";

/**
 * Notion APIのPageObjectResponseをReadingNoteForListViewにパース
 */
export function parseReadingNotePage(
  page: PageObjectResponse,
): ReadingNoteForListView {
  const properties = page.properties;

  // titleプロパティの取得
  const titleProp = properties.title;
  const titleText =
    titleProp?.type === "title"
      ? titleProp.title.map((t) => t.plain_text).join("")
      : "";
  const title = titleText.trim() || "無題";

  // topicプロパティの取得（マルチセレクト）
  const topicProp = properties.topic;
  const topics =
    topicProp?.type === "multi_select"
      ? topicProp.multi_select.map((t) => t.name)
      : [];

  // created_atプロパティの取得
  const createdAtProp = properties.created_at;
  const createdAt =
    createdAtProp?.type === "date" ? (createdAtProp.date?.start ?? null) : null;

  // is_publicプロパティの取得
  const isPublicProp = properties.is_public;
  const isPublic =
    isPublicProp?.type === "checkbox" ? isPublicProp.checkbox : false;

  return {
    id: page.id,
    title,
    topics,
    createdAt,
    isPublic,
  };
}
