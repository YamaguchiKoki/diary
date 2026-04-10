import type { Block } from "@/modules/notion/types";

/**
 * 読書メモを表す型
 */
export type ReadingNote = {
  id: string;
  title: string;
  topics: string[];
  isPublic: boolean;
  createdAt: string | null;
  blocks: Block[];
};

export type ReadingNoteForListView = Omit<ReadingNote, "blocks">;
