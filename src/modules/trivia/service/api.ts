import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { cacheLife, cacheTag } from "next/cache";
import { notion } from "@/modules/notion/client";
import { fetchPageBlocks } from "@/modules/notion/service/blocks";
import { extractTitle, mapPageToTrivia } from "@/modules/trivia/service/mapper";
import type { Trivia, TriviaForListView } from "@/modules/trivia/types";
import { env } from "../../../../env";

/**
 * 豆知識一覧を取得します（作成日降順）。
 * @returns 豆知識のリスト（blocksなし）
 */
export async function getTriviaList(): Promise<TriviaForListView[]> {
  "use cache";
  cacheTag("trivia", "trivia-all");
  cacheLife("cms");

  const response = await notion.dataSources.query({
    data_source_id: env.NOTION_TRIVIA_DATA_SOURCE_ID,
    sorts: [
      {
        timestamp: "created_time",
        direction: "descending",
      },
    ],
  });

  return response.results
    .filter((page): page is PageObjectResponse => page.object === "page")
    .map(mapPageToTrivia);
}

/**
 * 豆知識詳細を取得します。
 * @param id - 豆知識のID
 * @returns 豆知識詳細、見つからない場合はnull
 */
export async function getTrivia(id: string): Promise<Trivia | null> {
  "use cache";
  cacheTag("trivia", `trivia-${id}`);
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
      blocks,
    };
  } catch {
    return null;
  }
}
