import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { cacheLife, cacheTag } from "next/cache";
import { dataSourceId, notion } from "@/modules/notion/client";
import { fetchPageBlocks } from "@/modules/notion/service/blocks";
import {
  extractPublished,
  extractPublishedAt,
  extractThumbnail,
  extractTitle,
  mapPageToPost,
} from "@/modules/posts/service/mapper";
import type { Post } from "@/modules/posts/types";

/**
 * 全投稿を取得します（公開済みのみ）。
 * @returns 全投稿のリスト（blocksなし）
 */
export async function getPosts(): Promise<Omit<Post, "blocks">[]> {
  "use cache";
  cacheTag("posts", "posts-all");
  cacheLife("cms");

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
  cacheLife("cms");

  try {
    const [page, blocks] = await Promise.all([
      notion.pages.retrieve({ page_id: id }),
      fetchPageBlocks(id),
    ]);

    if (!("properties" in page)) {
      return null;
    }

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
  cacheLife("cms");

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
