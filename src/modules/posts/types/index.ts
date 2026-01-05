import type { Post } from "@/modules/notion/types";

export type PostForListView = Omit<Post, "blocks">;
