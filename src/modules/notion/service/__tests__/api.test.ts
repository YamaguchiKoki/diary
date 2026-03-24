import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  childrenList: vi.fn(),
  pagesRetrieve: vi.fn(),
}));

vi.mock("@/modules/notion/client", () => ({
  notion: {
    blocks: { children: { list: mocks.childrenList } },
    pages: { retrieve: mocks.pagesRetrieve },
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

import { getPost } from "../api";

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
