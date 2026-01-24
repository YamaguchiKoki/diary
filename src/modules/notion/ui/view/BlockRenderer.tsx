import Image from "next/image";
import type { FC } from "react";
import type { Block } from "@/modules/notion/types";
import { RichText } from "@/modules/notion/ui/view/RichText";

type Props = {
  block: Block;
};

export const BlockRenderer: FC<Props> = ({ block }) => {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="my-4">
          <RichText texts={block.children} />
        </p>
      );
    case "heading": {
      const Tag = `h${block.level}` as "h1" | "h2" | "h3";
      const sizes = { 1: "text-3xl", 2: "text-2xl", 3: "text-xl" };
      return (
        <Tag className={`${sizes[block.level]} font-bold my-4`}>
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
        <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic">
          <RichText texts={block.children} />
        </blockquote>
      );
    case "bulleted_list_item":
      return (
        <li className="ml-6 list-disc">
          <RichText texts={block.children} />
        </li>
      );
    case "numbered_list_item":
      return (
        <li className="ml-6 list-decimal">
          <RichText texts={block.children} />
        </li>
      );
  }
};
