import type { Block } from "@/modules/notion/types";

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

export type PostForListView = Omit<Post, "blocks">;
