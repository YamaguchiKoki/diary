import type { Post } from "@/lib/content/types";

export type PostForListView = Omit<Post, "blocks">;
