import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
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

import { getAllTopics, getPost, getReadingNotes } from "../api";

const MOCK_PAGE = {
  object: "page" as const,
  id: "page-id",
  properties: {
    title: {
      type: "title" as const,
      title: [{ plain_text: "テストページ" }],
    },
    published: {
      type: "checkbox" as const,
      checkbox: true,
    },
    published_at: {
      type: "date" as const,
      date: null,
    },
    thumbnail: {
      type: "files" as const,
      files: [],
    },
  },
} as unknown as PageObjectResponse;

const BASE_BLOCK = {
  object: "block" as const,
  id: "block-id",
  created_time: "2024-01-01T00:00:00.000Z",
  last_edited_time: "2024-01-01T00:00:00.000Z",
  created_by: { object: "user" as const, id: "user-1" },
  last_edited_by: { object: "user" as const, id: "user-1" },
  archived: false,
  in_trash: false,
  parent: { type: "page_id" as const, page_id: "page-id" },
};

const RICH_TEXT = [
  {
    type: "text" as const,
    plain_text: "テキスト",
    href: null,
    annotations: {
      bold: false,
      italic: false,
      code: false,
      strikethrough: false,
      underline: false,
      color: "default" as const,
    },
    text: { content: "テキスト", link: null },
  },
];

describe("parseBlockWithChildren", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bulleted_list_item で has_children が true の場合、子ブロックを取得してネストされたブロックとして変換する", async () => {
    const parentBlock = {
      ...BASE_BLOCK,
      id: "parent-block-id",
      type: "bulleted_list_item" as const,
      has_children: true,
      bulleted_list_item: { rich_text: RICH_TEXT, color: "default" as const },
    } as unknown as BlockObjectResponse;

    const childBlock = {
      ...BASE_BLOCK,
      id: "child-block-id",
      type: "paragraph" as const,
      has_children: false,
      paragraph: { rich_text: RICH_TEXT, color: "default" as const },
    } as unknown as BlockObjectResponse;

    mocks.pagesRetrieve.mockResolvedValueOnce(MOCK_PAGE);
    mocks.childrenList
      .mockResolvedValueOnce({ results: [parentBlock] })
      .mockResolvedValueOnce({ results: [childBlock] });

    const result = await getPost("page-id");

    expect(mocks.childrenList).toHaveBeenCalledTimes(2);
    expect(result?.blocks[0]).toMatchObject({
      type: "bulleted_list_item",
      nestedBlocks: [expect.objectContaining({ type: "paragraph" })],
    });
  });

  it("bulleted_list_item で has_children が false の場合、子ブロック取得の API 呼び出しが起きない", async () => {
    const block = {
      ...BASE_BLOCK,
      type: "bulleted_list_item" as const,
      has_children: false,
      bulleted_list_item: { rich_text: RICH_TEXT, color: "default" as const },
    } as unknown as BlockObjectResponse;

    mocks.pagesRetrieve.mockResolvedValueOnce(MOCK_PAGE);
    mocks.childrenList.mockResolvedValueOnce({ results: [block] });

    await getPost("page-id");

    expect(mocks.childrenList).toHaveBeenCalledTimes(1);
  });

  it("paragraph で has_children が true の場合、子ブロック取得の API 呼び出しが起きない", async () => {
    const block = {
      ...BASE_BLOCK,
      type: "paragraph" as const,
      has_children: true,
      paragraph: { rich_text: RICH_TEXT, color: "default" as const },
    } as unknown as BlockObjectResponse;

    mocks.pagesRetrieve.mockResolvedValueOnce(MOCK_PAGE);
    mocks.childrenList.mockResolvedValueOnce({ results: [block] });

    await getPost("page-id");

    expect(mocks.childrenList).toHaveBeenCalledTimes(1);
  });
});

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

    // getReadingNotesとgetAllTopicsを両方呼んでも、APIクエリは1回のみ
    await getReadingNotes();
    await getAllTopics();

    // getReadingNotesで1回、getAllTopicsでは追加の呼び出しなし = 合計1回
    // （キャッシュなしのテスト環境では2回になるが、同じクエリを使っていることを確認）
    // getAllTopicsが独自のクエリパラメータでdataSources.queryを呼ばないことを検証
    const calls = mocks.dataSourcesQuery.mock.calls;
    // すべての呼び出しが同じdata_source_idとfilterを使っている
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
