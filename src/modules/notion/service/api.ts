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
import { parseBlock } from "@/modules/notion/service/parser";
import { env } from "../../../../env";
import type { Post } from "../types";

export async function getPosts(): Promise<Omit<Post, "blocks">[]> {
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
    .map((page) => ({
      id: page.id,
      title: extractTitle(page),
      published: extractPublished(page),
      publishedAt: extractPublishedAt(page),
      thumbnail: extractThumbnail(page),
    }));
}

export async function getPost(id: string): Promise<Post | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`posts-${id}`);
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

export async function getPostsByYear(
  year: number,
): Promise<Omit<Post, "blocks">[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(`posts-${year}`);
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
    .map((page) => ({
      id: page.id,
      title: extractTitle(page),
      published: extractPublished(page),
      publishedAt: extractPublishedAt(page),
      thumbnail: extractThumbnail(page),
    }));
}

function isFullBlock(
  block: BlockObjectResponse | PartialBlockObjectResponse,
): block is BlockObjectResponse {
  return "type" in block;
}

function extractTitle(page: PageObjectResponse): string {
  const titleProp = page.properties.title;
  if (titleProp.type === "title") {
    return titleProp.title[0]?.plain_text ?? "Untitled";
  }
  return "Untitled";
}

function extractPublished(page: PageObjectResponse): boolean {
  const prop = page.properties.published;
  if (prop.type === "checkbox") {
    return prop.checkbox;
  }
  return false;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function extractPublishedAt(page: PageObjectResponse): string | null {
  const prop = page.properties.published_at;
  if (prop.type === "date" && prop.date?.start) {
    return formatDate(prop.date.start);
  }
  return null;
}

function extractThumbnail(page: PageObjectResponse): string | null {
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
 * 読書メモ一覧を取得（公開のみ）
 */
export async function getReadingNotes(options?: {
  topic?: string;
}): Promise<ReadingNoteForListView[]> {
  "use cache";
  cacheTag("reading-notes-all");
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
  cacheTag(`reading-note-${id}`);
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
  cacheTag("reading-notes-topics");
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
