import type { FC } from "react";
import type { Block, NonListBlock } from "@/modules/notion/types";
import { BlockRenderer } from "@/modules/notion/ui/view/BlockRenderer";
import { RichText } from "@/modules/notion/ui/view/RichText";

type Props = {
  blocks: Block[];
};

type BulletedListItem = Extract<Block, { type: "bulleted_list_item" }>;
type NumberedListItem = Extract<Block, { type: "numbered_list_item" }>;

type Group =
  | { kind: "bulleted"; items: BulletedListItem[] }
  | { kind: "numbered"; items: NumberedListItem[] }
  | { kind: "single"; block: NonListBlock };

function getBlockKey(block: Block, index: number): string {
  if (block.type === "divider") return `divider-${index}`;
  if (block.type === "image") return `image-${block.url.slice(-12)}`;
  if (block.type === "code") return `code-${block.content.slice(0, 20)}`;
  const text = block.children
    .map((c) => c.text)
    .join("")
    .slice(0, 30);
  return `${block.type}-${text || index}`;
}

function getGroupKey(group: Group, index: number): string {
  if (group.kind === "single") return getBlockKey(group.block, index);
  const firstText =
    group.items[0]?.children
      .map((c) => c.text)
      .join("")
      .slice(0, 20) ?? "";
  return `${group.kind}-${firstText || index}`;
}

function groupBlocks(blocks: Block[]): Group[] {
  const groups: Group[] = [];

  for (const block of blocks) {
    if (block.type === "bulleted_list_item") {
      const last = groups[groups.length - 1];
      if (last?.kind === "bulleted") {
        last.items.push(block);
      } else {
        groups.push({ kind: "bulleted", items: [block] });
      }
    } else if (block.type === "numbered_list_item") {
      const last = groups[groups.length - 1];
      if (last?.kind === "numbered") {
        last.items.push(block);
      } else {
        groups.push({ kind: "numbered", items: [block] });
      }
    } else {
      groups.push({ kind: "single", block });
    }
  }

  return groups;
}

export const BlocksRenderer: FC<Props> = ({ blocks }) => {
  if (blocks.length === 0) {
    return null;
  }

  const groups = groupBlocks(blocks);

  return (
    <>
      {groups.map((group, groupIndex) => {
        const groupKey = getGroupKey(group, groupIndex);

        if (group.kind === "bulleted") {
          return (
            <ul key={groupKey} className="my-4 ml-6 list-disc space-y-1">
              {group.items.map((item, itemIndex) => (
                <li key={getBlockKey(item, itemIndex)}>
                  <RichText texts={item.children} />
                  {item.nestedBlocks.length > 0 && (
                    <BlocksRenderer blocks={item.nestedBlocks} />
                  )}
                </li>
              ))}
            </ul>
          );
        }

        if (group.kind === "numbered") {
          return (
            <ol key={groupKey} className="my-4 ml-6 list-decimal space-y-1">
              {group.items.map((item, itemIndex) => (
                <li key={getBlockKey(item, itemIndex)}>
                  <RichText texts={item.children} />
                  {item.nestedBlocks.length > 0 && (
                    <BlocksRenderer blocks={item.nestedBlocks} />
                  )}
                </li>
              ))}
            </ol>
          );
        }

        return <BlockRenderer key={groupKey} block={group.block} />;
      })}
    </>
  );
};
