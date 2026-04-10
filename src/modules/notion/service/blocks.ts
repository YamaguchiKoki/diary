import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { notion } from "@/modules/notion/client";
import { parseBlock } from "@/modules/notion/service/parser";
import type { Block } from "@/modules/notion/types";

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
 * ページIDから子ブロック一覧を取得し、Block[] に変換します。
 * リスト系ブロックの子はネスト構造として含めます。
 */
export async function fetchPageBlocks(pageId: string): Promise<Block[]> {
  const blocksResponse = await notion.blocks.children.list({
    block_id: pageId,
  });

  return (
    await Promise.all(
      blocksResponse.results.filter(isFullBlock).map(parseBlockWithChildren),
    )
  ).filter((block): block is Block => block !== null);
}
