# API契約: 読書メモ表示機能

**作成日**: 2026-01-24
**フェーズ**: Phase 1 - Design & Contracts

## 概要

この機能は内部APIのみを使用し、外部公開REST/GraphQL APIは提供しません。
すべてのデータ取得はServer Component内で実行され、Notion APIから直接取得します。

## 内部API関数

### 1. getReadingNotes

**目的**: 公開されている読書メモの一覧を取得

**シグネチャ**:
```typescript
function getReadingNotes(options?: {
  topic?: string;
}): Promise<ReadingNoteForListView[]>
```

**パラメータ**:
| 名前 | 型 | 必須 | 説明 |
|------|----|----|------|
| `options.topic` | string | ❌ | フィルタリングするトピック名 |

**戻り値**:
```typescript
Promise<ReadingNoteForListView[]>
```

**実装詳細**:
- Notion Database Query APIを使用
- フィルター: `{ property: "is_public", checkbox: { equals: true } }`
- ソート: `created_at`降順
- キャッシュ: `cacheTag("reading-notes-all")`, `cacheLife("hours")`

**エラーハンドリング**:
| エラーケース | 処理 |
|------------|------|
| Notion API エラー | エラーをスローし、ErrorBoundaryでキャッチ |
| 読書メモが0件 | 空配列`[]`を返す |
| トピックが存在しない | 空配列`[]`を返す |

**使用例**:
```typescript
// 全読書メモを取得
const allNotes = await getReadingNotes();

// トピックでフィルタリング
const programmingNotes = await getReadingNotes({ topic: "プログラミング" });
```

---

### 2. getReadingNote

**目的**: 特定の読書メモの詳細情報を取得

**シグネチャ**:
```typescript
function getReadingNote(id: string): Promise<ReadingNote>
```

**パラメータ**:
| 名前 | 型 | 必須 | 説明 |
|------|----|----|------|
| `id` | string | ✅ | Notion page ID（UUID） |

**戻り値**:
```typescript
Promise<ReadingNote>
```

**実装詳細**:
- Notion Pages Retrieve APIとBlocks List APIを使用
- `is_public`チェック: `false`の場合はエラースロー
- キャッシュ: `cacheTag(`reading-note-${id}`)`, `cacheLife("days")`

**エラーハンドリング**:
| エラーケース | 処理 | HTTPステータス相当 |
|------------|------|------------------|
| ページが存在しない | `notFound()`を呼び出し | 404 |
| `is_public === false` | `notFound()`を呼び出し | 404 |
| Notion API エラー | エラーをスローし、ErrorBoundaryでキャッチ | 500 |

**使用例**:
```typescript
const note = await getReadingNote("abc123-def456-ghi789");
```

---

### 3. getAllTopics

**目的**: 全トピックの一覧を取得

**シグネチャ**:
```typescript
function getAllTopics(): Promise<string[]>
```

**パラメータ**: なし

**戻り値**:
```typescript
Promise<string[]> // 五十音順またはアルファベット順でソート済み
```

**実装詳細**:
- Notion Database Query APIで全公開読書メモを取得
- 各ページの`topic.multi_select`からトピック名を抽出
- `Set`でユニーク化
- `localeCompare('ja')`でソート
- キャッシュ: `cacheTag("reading-notes-topics")`, `cacheLife("hours")`

**エラーハンドリング**:
| エラーケース | 処理 |
|------------|------|
| Notion API エラー | エラーをスローし、ErrorBoundaryでキャッチ |
| トピックが0件 | 空配列`[]`を返す |

**使用例**:
```typescript
const topics = await getAllTopics();
// => ["ビジネス", "プログラミング", "歴史"]
```

---

## ルーティング契約

### ページルート

| ルート | 説明 | パラメータ | クエリパラメータ |
|--------|------|----------|----------------|
| `/books` | 読書メモ一覧 | - | `topic?: string` |
| `/books/[id]` | 読書メモ詳細 | `id: string` | - |

### Next.js App Router定義

```typescript
// app/books/page.tsx
export default function BooksPage({
  searchParams
}: {
  searchParams: { topic?: string }
}) {
  // ...
}

// app/books/[id]/page.tsx
export default function BookDetailPage({
  params
}: {
  params: { id: string }
}) {
  // ...
}
```

---

## 型安全なルート生成（routes.ts）

```typescript
// src/lib/routes.ts

export const routes = {
  // 既存のルート...

  books: {
    /** 読書メモ一覧ページ
     * @param topic - オプション: フィルタリングするトピック名
     * @returns /books または /books?topic=xxx
     */
    index: (topic?: string) => {
      const base = "/books";
      return topic ? `${base}?topic=${encodeURIComponent(topic)}` : base;
    },

    /** 読書メモ詳細ページ
     * @param id - Notion page ID
     * @returns /books/[id]
     */
    detail: (id: string) => `/books/${id}`
  }
} as const;
```

**使用例**:
```typescript
// 一覧ページ
routes.books.index(); // "/books"
routes.books.index("プログラミング"); // "/books?topic=プログラミング"

// 詳細ページ
routes.books.detail("abc123"); // "/books/abc123"
```

---

## キャッシュ戦略

| 関数 | キャッシュタグ | 有効期限 | 無効化トリガー |
|------|-------------|---------|--------------|
| `getReadingNotes()` | `reading-notes-all` | 時間単位 | Notionで読書メモを追加・更新・削除 |
| `getReadingNote(id)` | `reading-note-${id}` | 日単位 | Notionで該当読書メモを更新 |
| `getAllTopics()` | `reading-notes-topics` | 時間単位 | Notionで読書メモのトピックを変更 |

**キャッシュ無効化方法** (将来的な拡張):
```typescript
import { revalidateTag } from "next/cache";

// 全読書メモのキャッシュをクリア
revalidateTag("reading-notes-all");

// 特定の読書メモのキャッシュをクリア
revalidateTag(`reading-note-${id}`);

// トピック一覧のキャッシュをクリア
revalidateTag("reading-notes-topics");
```

---

## コンポーネント契約

### ReadingNoteListView

**Props**:
```typescript
interface ReadingNoteListViewProps {
  /** 読書メモの一覧 */
  notes: ReadingNoteForListView[];
  /** 現在のトピックフィルター（オプション） */
  currentTopic?: string;
  /** モバイル表示かどうか */
  isMobile?: boolean;
}
```

**責務**:
- 読書メモ一覧の表示
- 各読書メモへのリンク
- 空状態の処理

---

### ReadingNoteDetailView

**Props**:
```typescript
interface ReadingNoteDetailViewProps {
  /** 読書メモの詳細情報 */
  note: ReadingNote;
}
```

**責務**:
- タイトル、トピック、作成日の表示
- 本文ブロックのレンダリング（BlockRendererを使用）
- トピックタグのクリックでフィルタリング

---

### TopicFilter

**Props**:
```typescript
interface TopicFilterProps {
  /** トピック一覧 */
  topics: string[];
  /** 現在選択中のトピック */
  currentTopic?: string;
}
```

**責務**:
- "All"と全トピックのリスト表示
- アクティブ状態の表示（NavigationLinkを使用）
- トピック選択時のナビゲーション

---

## 環境変数契約

```typescript
// src/lib/env.ts

export const env = createEnv({
  server: {
    // 既存の環境変数...

    /** Notion reading notes database ID (32文字) */
    NOTION_READING_NOTES_DATABASE_ID: z.string().length(32).describe("Notion reading notes database ID")
  },
  runtimeEnv: {
    // 既存のマッピング...

    NOTION_READING_NOTES_DATABASE_ID: process.env.NOTION_READING_NOTES_DATABASE_ID
  }
});
```

**.env.local**:
```
NOTION_READING_NOTES_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## エラー処理契約

### ErrorBoundary

すべてのServer ComponentはErrorBoundaryでラップ:

```typescript
<ErrorBoundary fallback={<div>エラーが発生しました</div>}>
  <Suspense fallback={<LoadingSkeleton />}>
    <ReadingNoteListSection />
  </Suspense>
</ErrorBoundary>
```

### Suspense

非同期データ取得はSuspenseでラップ:

```typescript
<Suspense fallback={<div>読み込み中...</div>}>
  <ReadingNoteDetailSection id={params.id} />
</Suspense>
```

---

## サマリー

| 項目 | 契約内容 |
|------|---------|
| **内部API** | `getReadingNotes()`, `getReadingNote(id)`, `getAllTopics()` |
| **ルーティング** | `/books`, `/books/[id]` |
| **キャッシュ** | 時間単位（一覧・トピック）、日単位（詳細） |
| **エラー処理** | ErrorBoundary + Suspense |
| **環境変数** | `NOTION_READING_NOTES_DATABASE_ID` |

すべてのAPI関数は型安全で、既存のpost機能のパターンを踏襲しています。
