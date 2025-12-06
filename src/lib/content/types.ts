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
  | { type: "heading"; level: 1 | 2 | 3; children: RichText[] }
  | { type: "code"; language: string; content: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "quote"; children: RichText[] }
  | { type: "bulleted_list_item"; children: RichText[] }
  | { type: "numbered_list_item"; children: RichText[] };

export type Post = {
  id: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
  blocks: Block[];
};
