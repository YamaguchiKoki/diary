# データモデル: 読書メモ表示機能

**作成日**: 2026-01-24
**フェーズ**: Phase 1 - Design & Contracts

## エンティティ定義

### ReadingNote（読書メモ）

読書メモの完全な情報を表すエンティティ。詳細ページで使用。

**TypeScript型定義**:
```typescript
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
```

**フィールド詳細**:

| フィールド | 型 | 必須 | バリデーション | 説明 |
|-----------|----|----|--------------|------|
| `id` | string | ✅ | UUID形式 | NotionのページID |
| `title` | string | ✅ | 最小1文字 | 読書メモのタイトル。Notionのtitleプロパティから取得 |
| `topics` | string[] | ✅ | - | トピック名の配列。空配列も許容 |
| `isPublic` | boolean | ✅ | - | 公開フラグ。falseの場合は非公開 |
| `createdAt` | string \| null | ✅ | ISO 8601 | 作成日時。Notionで設定されていない場合はnull |
| `blocks` | Block[] | ✅ | - | 本文のNotionブロック配列。既存の`Block`型を使用 |

**制約**:
- `isPublic === false`の場合、一般ユーザーは直接URLアクセスしてもアクセス不可
- `topics`が空配列の場合でも表示可能（トピック未設定として扱う）
- `blocks`が空配列の場合は本文なしとして扱う

---

### ReadingNoteForListView（一覧表示用読書メモ）

一覧ページで使用する、軽量版の読書メモエンティティ。本文ブロックを除外。

**TypeScript型定義**:
```typescript
export type ReadingNoteForListView = Omit<ReadingNote, "blocks">;

// 展開すると以下の構造:
export interface ReadingNoteForListView {
  id: string;
  title: string;
  topics: string[];
  isPublic: boolean;
  createdAt: string | null;
}
```

**使用目的**:
- 一覧ページのパフォーマンス最適化
- 不要な`blocks`データを取得・転送しない
- 既存の`Post`/`PostForListView`パターンを踏襲

---

### Topic（トピック）

トピックの情報を表すエンティティ。サイドメニューでのフィルタリングに使用。

**TypeScript型定義**:
```typescript
export interface Topic {
  /** トピック名（例: "プログラミング", "歴史", "ビジネス"） */
  name: string;
}

// または単純にstring[]として扱う
export type TopicList = string[];
```

**フィールド詳細**:

| フィールド | 型 | 必須 | バリデーション | 説明 |
|-----------|----|----|--------------|------|
| `name` | string | ✅ | 最小1文字 | トピック名。日本語・英語両対応 |

**制約**:
- トピック名は重複なし（Setで管理）
- 五十音順またはアルファベット順でソート
- 空文字列のトピックは除外

**補足**:
実装上は`string[]`で扱うことも可能。オブジェクト形式にする必要性は低い。

---

## エンティティ間の関係

```
ReadingNote (1)
  ├── id: string (PK)
  ├── title: string
  ├── topics: string[] (0..n) ← Topic.name
  ├── isPublic: boolean
  ├── createdAt: string | null
  └── blocks: Block[] (0..n) ← 既存のBlock型

ReadingNoteForListView
  └── ReadingNote - blocks を除外

Topic
  └── name: string (複数のReadingNoteから参照される)
```

**関係性の説明**:
- 1つの`ReadingNote`は0個以上の`Topic`を持つ（多対多関係）
- `Topic`は読書メモのマルチセレクトプロパティから抽出される
- `Block`は既存の`modules/notion/types/`で定義された型を使用

---

## データ変換フロー

### Notion API → ReadingNote

```
NotionデータベースQuery
  ↓
PageObjectResponse[]
  ↓
parseReadingNotePage(page) ← modules/books/service/parser.ts
  ↓
ReadingNoteForListView[]

NotionページRetrieve + ブロック取得
  ↓
PageObjectResponse + BlockObjectResponse[]
  ↓
parseReadingNotePage(page) + parseBlock(block)[] ← modules/notion/service/parser.ts
  ↓
ReadingNote
```

### トピック抽出フロー

```
NotionデータベースQuery（全公開読書メモ）
  ↓
PageObjectResponse[]
  ↓
各ページの topic.multi_select[] を抽出
  ↓
Set<string> でユニーク化
  ↓
Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'))
  ↓
string[]（トピック一覧）
```

---

## バリデーション規則

### ReadingNote

| フィールド | 検証ルール | エラー処理 |
|-----------|-----------|-----------|
| `id` | UUID形式であること | パース時にエラースロー |
| `title` | 1文字以上であること | 空の場合は"無題"をデフォルト値とする |
| `topics` | 配列であること | undefinedの場合は空配列`[]`をデフォルト値とする |
| `isPublic` | boolean型であること | undefinedの場合は`false`をデフォルト値とする |
| `createdAt` | ISO 8601形式 or null | 不正な形式の場合は`null` |
| `blocks` | Block[]型であること | パース失敗時はエラースロー |

### Topic

| フィールド | 検証ルール | エラー処理 |
|-----------|-----------|-----------|
| `name` | 1文字以上の文字列であること | 空文字列は除外 |

---

## 状態遷移

読書メモは静的なコンテンツのため、システム内での状態遷移はありません。Notion側でのステータス管理のみ。

**Notion側での管理**:
```
[下書き] is_public = false
  ↓ 公開操作
[公開] is_public = true
  ↓ 非公開操作
[非公開] is_public = false
```

**システム側の振る舞い**:
- `is_public === true`: 一覧・詳細ページで表示
- `is_public === false`: 一覧に表示されず、直接URLアクセスも拒否（404または403）

---

## データアクセスパターン

### 読書メモ一覧の取得

**関数**: `getReadingNotes(topic?: string): Promise<ReadingNoteForListView[]>`

**処理フロー**:
1. Notion DatabaseをQueryでフィルタリング（`is_public === true`）
2. オプション: トピックが指定されている場合、クライアント側でフィルタリング
3. 作成日降順でソート
4. `ReadingNoteForListView`型にパース
5. キャッシュ: `reading-notes-all`タグ、時間単位

**パフォーマンス考慮**:
- トピックフィルタリングはクライアント側（Notion APIのフィルターでマルチセレクトの部分一致が困難なため）
- 全読書メモをキャッシュし、フィルタリングはメモリ内で実施

### 読書メモ詳細の取得

**関数**: `getReadingNote(id: string): Promise<ReadingNote>`

**処理フロー**:
1. Notion PageをRetrieveで取得
2. `is_public`チェック → falseの場合はエラースロー
3. Blocksを取得
4. `ReadingNote`型にパース
5. キャッシュ: `reading-note-${id}`タグ、日単位

### トピック一覧の取得

**関数**: `getAllTopics(): Promise<string[]>`

**処理フロー**:
1. Notion Databaseを全取得（`is_public === true`）
2. 各ページの`topic.multi_select`を抽出
3. Setでユニーク化
4. 日本語ロケールでソート
5. キャッシュ: `reading-notes-topics`タグ、時間単位

---

## 型定義ファイルの配置

```
modules/books/types/
└── index.ts
    ├── export interface ReadingNote
    ├── export type ReadingNoteForListView
    └── export type TopicList (または string[])
```

既存の`modules/notion/types/`の`Block`型を再利用:
```typescript
import type { Block } from "@/modules/notion/types";
```

---

## サマリー

| エンティティ | 用途 | 主要フィールド |
|-------------|------|--------------|
| `ReadingNote` | 詳細ページ表示 | id, title, topics, isPublic, createdAt, blocks |
| `ReadingNoteForListView` | 一覧ページ表示 | id, title, topics, isPublic, createdAt |
| `Topic` (or `string[]`) | サイドメニューフィルタリング | name |

**設計原則**:
- 既存の`Post`/`PostForListView`パターンを踏襲
- 型安全性を最優先（厳密な型定義とバリデーション）
- パフォーマンス最適化（一覧用と詳細用で型を分離）
