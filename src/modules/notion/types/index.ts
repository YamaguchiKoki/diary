export type RichText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  link?: string;
};

export type Block =
  | { type: "paragraph"; children: RichText[] }
  | {
      type: "heading";
      level: 1 | 2 | 3;
      is_toggleable: boolean;
      children: RichText[];
    }
  | { type: "code"; language: string; content: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "quote"; children: RichText[] }
  | { type: "divider" }
  | { type: "bulleted_list_item"; children: RichText[]; nestedBlocks: Block[] }
  | { type: "numbered_list_item"; children: RichText[]; nestedBlocks: Block[] };

export type NonListBlock = Exclude<
  Block,
  { type: "bulleted_list_item" | "numbered_list_item" }
>;

export type Post = {
  id: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
  thumbnail: string | null;
  blocks: Block[];
};
