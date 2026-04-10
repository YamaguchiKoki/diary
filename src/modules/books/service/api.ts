import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { cacheLife, cacheTag } from "next/cache";
import {
  extractCreatedAt,
  extractIsPublic,
  extractTitle,
  extractTopics,
  mapPageToReadingNote,
} from "@/modules/books/service/mapper";
import type {
  ReadingNote,
  ReadingNoteForListView,
} from "@/modules/books/types";
import { notion } from "@/modules/notion/client";
import { fetchPageBlocks } from "@/modules/notion/service/blocks";
import { env } from "../../../../env";

/**
 * 読書メモ一覧を取得します（公開済みのみ）。
 * @param options - フィルタオプション
 * @returns 読書メモのリスト（blocksなし）
 */
export async function getReadingNotes(options?: {
  topic?: string;
}): Promise<ReadingNoteForListView[]> {
  "use cache";
  cacheTag("reading-notes", "reading-notes-all");
  cacheLife("cms");

  const response = await notion.dataSources.query({
    data_source_id: env.NOTION_READING_NOTES_DATABASE_ID,
    filter: {
      property: "is_public",
      checkbox: { equals: true },
    },
    sorts: [
      {
        property: "created_at",
        direction: "ascending",
      },
    ],
  });

  const notes = response.results
    .filter((page): page is PageObjectResponse => page.object === "page")
    .map(mapPageToReadingNote);

  if (options?.topic) {
    const targetTopic = options.topic;
    return notes.filter((note) => note.topics.includes(targetTopic));
  }

  return notes;
}

/**
 * 読書メモ詳細を取得します。
 * @param id - 読書メモのID
 * @returns 読書メモ詳細、見つからないか非公開の場合はnull
 */
export async function getReadingNote(id: string): Promise<ReadingNote | null> {
  "use cache";
  cacheTag("reading-notes", `reading-note-${id}`);
  cacheLife("cms");

  try {
    const [page, blocks] = await Promise.all([
      notion.pages.retrieve({ page_id: id }),
      fetchPageBlocks(id),
    ]);

    if (!("properties" in page)) {
      return null;
    }

    if (!extractIsPublic(page)) {
      return null;
    }

    return {
      id: page.id,
      title: extractTitle(page),
      topics: extractTopics(page),
      isPublic: true,
      createdAt: extractCreatedAt(page),
      blocks,
    };
  } catch {
    return null;
  }
}

/**
 * 全トピック一覧を取得します（重複なし、ソート済み）。
 * @returns トピック名の配列
 */
export async function getAllTopics(): Promise<string[]> {
  "use cache";
  cacheTag("reading-notes", "reading-notes-topics");
  cacheLife("cms");

  const notes = await getReadingNotes();
  const topicsSet = new Set<string>();
  for (const note of notes) {
    for (const topic of note.topics) {
      topicsSet.add(topic);
    }
  }

  return Array.from(topicsSet).sort((a, b) => a.localeCompare(b, "ja"));
}
