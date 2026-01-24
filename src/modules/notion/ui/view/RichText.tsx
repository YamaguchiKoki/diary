import type { FC, ReactNode } from "react";
import type { RichText as RichTextType } from "@/modules/notion/types";

/**
 * RichTextコンポーネントのプロパティ。
 */
export type RichTextProps = {
  /** レンダリングするリッチテキストの配列 */
  texts: RichTextType[];
};

/**
 * リッチテキストをレンダリングするコンポーネント。
 * 太字、イタリック、コード、取り消し線、下線、リンクをサポートします。
 *
 * @param props - コンポーネントのプロパティ
 * @returns レンダリングされたリッチテキスト
 */
export const RichText: FC<RichTextProps> = ({ texts }) => {
  return (
    <>
      {texts.map((t, i) => {
        let node: ReactNode = t.text;
        const { annotations } = t;

        if (annotations.code)
          node = <code className="bg-gray-100 px-1 rounded">{node}</code>;
        if (annotations.bold) node = <strong>{node}</strong>;
        if (annotations.italic) node = <em>{node}</em>;
        if (annotations.strikethrough) node = <s>{node}</s>;
        if (annotations.underline) node = <u>{node}</u>;
        if (t.link)
          node = (
            <a href={t.link} className="text-blue-600 underline">
              {node}
            </a>
          );

        return <span key={`${t.text}-${i}`}>{node}</span>;
      })}
    </>
  );
};
