/**
 * RichTextのアノテーション（書式設定）を表す型
 */
export type RichTextAnnotations = {
  bold: boolean;
  italic: boolean;
  code: boolean;
  strikethrough: boolean;
  underline: boolean;
};

/**
 * リッチテキストを表す型
 */
export type RichText = {
  text: string;
  annotations: RichTextAnnotations;
  link?: string;
};

/**
 * 段落ブロックを表す型
 */
export type ParagraphBlock = {
  type: "paragraph";
  children: RichText[];
};

/**
 * 見出しブロックを表す型
 */
export type HeadingBlock = {
  type: "heading";
  level: 1 | 2 | 3;
  children: RichText[];
};

/**
 * コードブロックを表す型
 */
export type CodeBlock = {
  type: "code";
  language: string;
  content: string;
};

/**
 * 画像ブロックを表す型
 */
export type ImageBlock = {
  type: "image";
  url: string;
  caption?: string;
};

/**
 * 引用ブロックを表す型
 */
export type QuoteBlock = {
  type: "quote";
  children: RichText[];
};

/**
 * 箇条書きリストアイテムブロックを表す型
 */
export type BulletedListItemBlock = {
  type: "bulleted_list_item";
  children: RichText[];
};

/**
 * 番号付きリストアイテムブロックを表す型
 */
export type NumberedListItemBlock = {
  type: "numbered_list_item";
  children: RichText[];
};

/**
 * 全てのブロックタイプの判別ユニオン型
 */
export type Block =
  | ParagraphBlock
  | HeadingBlock
  | CodeBlock
  | ImageBlock
  | QuoteBlock
  | BulletedListItemBlock
  | NumberedListItemBlock;

/**
 * 投稿を表す型
 */
export type Post = {
  id: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
  thumbnail: string | null;
  blocks: Block[];
};
