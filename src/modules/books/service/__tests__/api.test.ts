import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  childrenList: vi.fn(),
  pagesRetrieve: vi.fn(),
  dataSourcesQuery: vi.fn(),
}));

vi.mock("@/modules/notion/client", () => ({
  notion: {
    blocks: { children: { list: mocks.childrenList } },
    pages: { retrieve: mocks.pagesRetrieve },
    dataSources: { query: mocks.dataSourcesQuery },
  },
  databaseId: "test-db-id",
  dataSourceId: "test-data-source-id",
}));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("../../../../../env", () => ({
  env: {
    NOTION_SECRET: "test",
    NOTION_DATABASE_ID: "test-db-id",
    NOTION_DATA_SOURCE_ID: "test-data-source-id",
    NOTION_READING_NOTES_DATABASE_ID: "test-reading-notes-db-id",
  },
}));

import { getAllTopics, getReadingNotes } from "../api";

const MOCK_READING_NOTE_PAGE = (id: string, title: string, topics: string[]) =>
  ({
    object: "page" as const,
    id,
    properties: {
      title: {
        type: "title" as const,
        title: [{ plain_text: title }],
      },
      topic: {
        type: "multi_select" as const,
        multi_select: topics.map((name) => ({ name })),
      },
      is_public: {
        type: "checkbox" as const,
        checkbox: true,
      },
      created_at: {
        type: "created_time" as const,
        created_time: "2024-01-01T00:00:00.000Z",
      },
    },
  }) as unknown as PageObjectResponse;

describe("getAllTopics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getReadingNotesの結果からトピックを重複なくソート済みで返す", async () => {
    mocks.dataSourcesQuery.mockResolvedValue({
      results: [
        MOCK_READING_NOTE_PAGE("1", "本A", ["React", "TypeScript"]),
        MOCK_READING_NOTE_PAGE("2", "本B", ["React", "Next.js"]),
        MOCK_READING_NOTE_PAGE("3", "本C", ["Go"]),
      ],
    });

    const topics = await getAllTopics();

    expect(topics).toEqual(["Go", "Next.js", "React", "TypeScript"]);
  });

  it("getReadingNotesを再利用し、追加のAPIクエリを発行しない", async () => {
    mocks.dataSourcesQuery.mockResolvedValue({
      results: [MOCK_READING_NOTE_PAGE("1", "本A", ["React"])],
    });

    await getReadingNotes();
    await getAllTopics();

    const calls = mocks.dataSourcesQuery.mock.calls;
    for (const call of calls) {
      expect(call[0]).toMatchObject({
        filter: {
          property: "is_public",
          checkbox: { equals: true },
        },
      });
    }
  });

  it("読書メモがない場合は空配列を返す", async () => {
    mocks.dataSourcesQuery.mockResolvedValue({ results: [] });

    const topics = await getAllTopics();

    expect(topics).toEqual([]);
  });
});
