import type {
  BlockObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { Post } from "../types";
import { dataSourceId, notion } from "./client";
import { parseBlock } from "./parser";

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
    }));
}

export async function getPost(id: string): Promise<Post | null> {
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
      blocks,
    };
  } catch {
    return null;
  }
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

function extractPublishedAt(page: PageObjectResponse): string | null {
  const prop = page.properties.published_at;
  if (prop.type === "date") {
    return prop.date?.start ?? null;
  }
  return null;
}
