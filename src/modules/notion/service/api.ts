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
import type { Block, Post } from "../types";

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

    const blocks = (
      await Promise.all(
        blocksResponse.results.filter(isFullBlock).map(parseBlockWithChildren),
      )
    ).filter((block): block is Block => block !== null);

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

async function parseBlockWithChildren(
  block: BlockObjectResponse,
): Promise<Block | null> {
  if (
    (block.type === "bulleted_list_item" ||
      block.type === "numbered_list_item") &&
    block.has_children
  ) {
    const res = await notion.blocks.children.list({ block_id: block.id });
    return parseBlock(block, res.results.filter(isFullBlock));
  }
  return parseBlock(block);
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

  if (options?.topic) {
    const targetTopic = options.topic;
    notes = notes.filter((note) => note.topics.includes(targetTopic));
  }

  return notes;
}

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

    const blocks = (
      await Promise.all(
        blocksResponse.results.filter(isFullBlock).map(parseBlockWithChildren),
      )
    ).filter((block): block is Block => block !== null);

    return {
      ...parsedPage,
      blocks,
    };
  } catch {
    return null;
  }
}

export async function getAllTopics(): Promise<string[]> {
  "use cache";
  cacheTag("reading-notes", "reading-notes-topics");
  cacheLife("hours");

  const notes = await getReadingNotes();
  const topicsSet = new Set<string>();
  for (const note of notes) {
    for (const topic of note.topics) {
      topicsSet.add(topic);
    }
  }

  return Array.from(topicsSet).sort((a, b) => a.localeCompare(b, "ja"));
}
