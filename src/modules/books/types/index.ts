import type { Block } from "@/modules/notion/types";

/** 読書メモの完全な情報（詳細ページ用） */
export interface ReadingNote {
  /** Notion page ID (UUID) */
  id: string;
  /** 読書メモのタイトル（書籍名や概要） */
  title: string;
  /** トピック（カテゴリ）の配列 */
  topics: string[];
  /** 公開フラグ（trueの場合のみ一般ユーザーに表示） */
  isPublic: boolean;
  /** 作成日時（ISO 8601形式） */
  createdAt: string | null;
  /** 本文ブロックの配列（Notion blocks） */
  blocks: Block[];
}

/** 読書メモの一覧表示用（本文ブロックを除外） */
export type ReadingNoteForListView = Omit<ReadingNote, "blocks">;
