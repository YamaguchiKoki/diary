import type {
  BlockObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { cacheLife, cacheTag } from "next/cache";
import { parseReadingNotePage } from "@/modules/books/service/parser";
import type {
  ReadingNote,
  ReadingNoteForListView,
} from "@/modules/books/types";
import { dataSourceId, notion } from "@/modules/notion/client";
import {
  extractPublished,
  extractPublishedAt,
  extractThumbnail,
  extractTitle,
  mapPageToPost,
} from "@/modules/notion/service/mapper";
import { parseBlock } from "@/modules/notion/service/parser";
import { env } from "../../../../env";
import type { Post } from "../types";

/**
 * 全投稿を取得します（公開済みのみ）。
 * @returns 全投稿のリスト（blocksなし）
 */
export async function getPosts(): Promise<Omit<Post, "blocks">[]> {
  "use cache";
  cacheTag("posts", "posts-all");
  cacheLife("hours");

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      property: "published",
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: "published_at",
        direction: "descending",
      },
    ],
  });

  return response.results
    .filter((page): page is PageObjectResponse => page.object === "page")
    .map(mapPageToPost);
}

/**
 * 投稿詳細を取得します。
 * @param id - 投稿のID
 * @returns 投稿詳細、見つからない場合はnull
 */
export async function getPost(id: string): Promise<Post | null> {
  "use cache";
  cacheTag("posts", `posts-${id}`);
  cacheLife("days");

  try {
    const page = await notion.pages.retrieve({ page_id: id });

    if (!("properties" in page)) {
      return null;
    }

    const blocksResponse = await notion.blocks.children.list({ block_id: id });

    const blocks = blocksResponse.results
      .filter(isFullBlock)
      .map(parseBlock)
      .filter((block): block is NonNullable<typeof block> => block !== null);

    return {
      id: page.id,
      title: extractTitle(page),
      published: extractPublished(page),
      publishedAt: extractPublishedAt(page),
      thumbnail: extractThumbnail(page),
      blocks,
    };
  } catch {
    return null;
  }
}

/**
 * 特定年の投稿を取得します。
 * @param year - 取得する年
 * @returns 指定年の投稿リスト（blocksなし）
 */
export async function getPostsByYear(
  year: number,
): Promise<Omit<Post, "blocks">[]> {
  "use cache";
  cacheTag("posts", `posts-${year}`);
  cacheLife("hours");

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        {
          property: "published",
          checkbox: {
            equals: true,
          },
        },
        {
          property: "published_at",
          date: {
            on_or_after: `${year}-01-01`,
          },
        },
        {
          property: "published_at",
          date: {
            before: `${year + 1}-01-01`,
          },
        },
      ],
    },
    sorts: [
      {
        property: "published_at",
        direction: "descending",
      },
    ],
  });

  return response.results
    .filter((page): page is PageObjectResponse => page.object === "page")
    .map(mapPageToPost);
}

function isFullBlock(
  block: BlockObjectResponse | PartialBlockObjectResponse,
): block is BlockObjectResponse {
  return "type" in block;
}

/**
 * 読書メモ一覧を取得（公開のみ）
 */
export async function getReadingNotes(options?: {
  topic?: string;
}): Promise<ReadingNoteForListView[]> {
  "use cache";
  cacheTag("reading-notes", "reading-notes-all");
  cacheLife("hours");

  const response = await notion.dataSources.query({
    data_source_id: env.NOTION_READING_NOTES_DATABASE_ID,
    filter: {
      property: "is_public",
      checkbox: { equals: true },
    },
    sorts: [
      {
        property: "created_at",
        direction: "descending",
      },
    ],
  });

  let notes = response.results
    .filter((page): page is PageObjectResponse => page.object === "page")
    .map(parseReadingNotePage);

  // トピックフィルタリング（オプション）
  if (options?.topic) {
    const targetTopic = options.topic;
    notes = notes.filter((note) => note.topics.includes(targetTopic));
  }

  return notes;
}

/**
 * 読書メモ詳細を取得
 */
export async function getReadingNote(id: string): Promise<ReadingNote | null> {
  "use cache";
  cacheTag("reading-notes", `reading-note-${id}`);
  cacheLife("days");

  try {
    const [page, blocksResponse] = await Promise.all([
      notion.pages.retrieve({ page_id: id }),
      notion.blocks.children.list({ block_id: id }),
    ]);

    if (!("properties" in page)) {
      return null;
    }

    const parsedPage = parseReadingNotePage(page);

    if (!parsedPage.isPublic) {
      return null;
    }

    const blocks = blocksResponse.results
      .filter(isFullBlock)
      .map(parseBlock)
      .filter((block): block is NonNullable<typeof block> => block !== null);

    return {
      ...parsedPage,
      blocks,
    };
  } catch {
    return null;
  }
}

/**
 * 全トピックを取得
 */
export async function getAllTopics(): Promise<string[]> {
  "use cache";
  cacheTag("reading-notes", "reading-notes-topics");
  cacheLife("hours");

  const response = await notion.dataSources.query({
    data_source_id: env.NOTION_READING_NOTES_DATABASE_ID,
    filter: {
      property: "is_public",
      checkbox: { equals: true },
    },
  });

  const topicsSet = new Set<string>();
  for (const page of response.results) {
    if (page.object === "page" && "properties" in page) {
      const topicProp = page.properties.topic;
      if (topicProp?.type === "multi_select") {
        for (const topic of topicProp.multi_select) {
          topicsSet.add(topic.name);
        }
      }
    }
  }

  return Array.from(topicsSet).sort((a, b) => a.localeCompare(b, "ja"));
}
