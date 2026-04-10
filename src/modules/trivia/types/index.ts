import type { Block } from "@/modules/notion/types";

/**
 * 豆知識を表す型
 */
export type Trivia = {
  id: string;
  title: string;
  blocks: Block[];
};

export type TriviaForListView = Omit<Trivia, "blocks">;
