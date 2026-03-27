import Image from "next/image";
import type { FC } from "react";
import type { NonListBlock } from "@/modules/notion/types";
import { RichText } from "@/modules/notion/ui/view/RichText";

/**
 * BlockRendererコンポーネントのプロパティ。
 */
export type BlockRendererProps = {
  /** レンダリングするブロック */
  block: NonListBlock;
};

/**
 * Notionブロックをレンダリングするコンポーネント。
 * 各ブロックタイプに応じた適切なHTML要素を生成します。
 *
 * @param props - コンポーネントのプロパティ
 * @returns レンダリングされたブロック要素
 */
export const BlockRenderer: FC<BlockRendererProps> = ({ block }) => {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="my-4">
          <RichText texts={block.children} />
        </p>
      );
    case "heading": {
      const Tag = `h${block.level}` as "h1" | "h2" | "h3";
      const styles = {
        1: "text-2xl font-bold mt-10 mb-4 tracking-wide",
        2: "text-xl font-bold mt-8 mb-3 tracking-wide",
        3: "text-lg font-semibold mt-6 mb-2 tracking-wide",
      } as const;
      return (
        <Tag className={styles[block.level]}>
          <RichText texts={block.children} />
        </Tag>
      );
    }
    case "code":
      return (
        <pre className="bg-gray-100 p-4 rounded my-4 overflow-x-auto">
          <code>{block.content}</code>
        </pre>
      );
    case "image":
      return (
        <figure className="my-4">
          <Image
            src={block.url}
            alt={block.caption ?? ""}
            width={800}
            height={600}
            className="max-w-full h-auto"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          {block.caption && (
            <figcaption className="text-sm text-gray-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-gray-400 pl-5 py-1 my-6 text-gray-700 italic">
          <RichText texts={block.children} />
        </blockquote>
      );
    case "divider":
      return <hr className="my-8 border-t border-gray-200" />;
    default:
      return null;
  }
};
