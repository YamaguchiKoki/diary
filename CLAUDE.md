# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、Notionをデータソースとした日本語の散文投稿・読書メモサイトです。Next.js 16とReact 19を使用し、App Routerで構築されています。

## 重要な原則

- **常に日本語で会話してください**。こちらが英語で指示しても、生成物は日本語で書くことを徹底してください。
- **過剰な機能追加を避ける**: 明示的に要求された変更のみを実装し、不必要なリファクタリングや「改善」は行わないでください。
- ライブラリの使用方法について確証が持てなかった場合は、推測でコーディングを行うのではなく、context7 MCPサーバーを使用して最新情報を取得してから実装に移行して下さい。
- TDDで開発を行って下さい。タスクの実行前に指示から受け入れ条件を抽出し、まずそれを満たすテストを書いてか実装に移行してください。テスト設計時は「frontend-testing」「test-design」を適宜読み込んだ上で行って下さい。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# 型チェック
npm run typecheck

# Lintチェック（Biome使用）
npm run lint

# フォーマット（自動修正含む）
npm run format

# 未使用コード検出
npm run knip

# テスト実行
npm run test

# テストUI起動
npm run test:ui

# カバレッジレポート生成
npm run test:coverage
```

## 環境変数

以下の環境変数が必要です（`env.ts`で定義）:

- `NOTION_SECRET`: Notion APIのシークレットキー
- `NOTION_DATABASE_ID`: 投稿用NotionデータベースID（32文字）
- `NOTION_DATA_SOURCE_ID`: 投稿用NotionデータソースID（UUID形式）
- `NOTION_READING_NOTES_DATABASE_ID`: 読書メモ用NotionデータソースID（UUID形式）

環境変数は`@t3-oss/env-nextjs`と`zod`でバリデーションされています。

## アーキテクチャ

### ディレクトリ構造

```
src/
├── app/                    # Next.js App Router（ページ定義のみ）
│   ├── layout.tsx         # ルートレイアウト（日本語フォント設定）
│   ├── page.tsx           # ホームページ
│   ├── books/             # 読書メモページ
│   │   ├── page.tsx       # 読書メモ一覧
│   │   └── [id]/          # 読書メモ詳細
│   └── posts/             # 投稿ページ
│       └── [year]/        # 年別投稿
│           └── [id]/      # 個別投稿詳細
├── components/            # 共通UIコンポーネント
│   ├── layouts/          # レイアウトコンポーネント
│   └── ui/               # 基本UIコンポーネント（Biome lint対象外）
├── modules/              # ドメイン別モジュール
│   ├── notion/           # Notion統合機能
│   │   ├── client.ts     # Notionクライアント初期化
│   │   ├── service/      # データ取得・パース処理
│   │   ├── types/        # Notion関連の型定義
│   │   └── ui/           # Notion Block表示用コンポーネント
│   ├── posts/            # 投稿機能
│   │   ├── types/        # 投稿の型定義
│   │   └── ui/           # 投稿表示用コンポーネント
│   └── books/            # 読書メモ機能
│       ├── types/        # 読書メモの型定義
│       ├── service/      # パース処理
│       └── ui/           # 読書メモ表示用コンポーネント
└── lib/
    ├── routes.ts         # ルート定義（型安全なURL生成）
    ├── constants.tsx     # 定数定義
    └── utils.ts          # ユーティリティ関数
```

### モジュール分割の設計思想

このプロジェクトは**機能ベースのモジュール分割**を採用しています:

- **modules/**: ドメインごとに独立したモジュールとして管理
  - `notion/`: Notion APIとの統合、ブロックのパース、表示ロジック
  - `posts/`: 投稿の一覧・詳細表示ロジック
  - `books/`: 読書メモの一覧・詳細表示ロジック
  - 各モジュールは `service/`, `types/`, `ui/` のサブディレクトリで構成
  - ui/section でデータフェッチを行うようにして下さい
  - ui/view のコンポーネントは原則表示の責務だけおわせて下さい
- **components/**: ドメインに依存しない汎用UIコンポーネント
- **app/**: Next.jsのページ定義のみ（ビジネスロジックはmodulesに配置）

### Notionデータフロー

1. **データ取得**: `modules/notion/service/api.ts`
   - 投稿関連:
     - `getPosts()`: 全投稿を公開日降順で取得
     - `getPostsByYear(year)`: 特定年の投稿を取得（時間単位キャッシュ）
     - `getPost(id)`: 個別投稿とブロックを取得（日単位キャッシュ）
   - 読書メモ関連:
     - `getReadingNotes(options?)`: 読書メモ一覧を取得（オプショナルでトピックフィルタリング）
     - `getReadingNote(id)`: 読書メモ詳細を取得
     - `getAllTopics()`: 全トピックを取得

2. **データ変換**: `modules/notion/service/parser.ts` と `modules/books/service/parser.ts`
   - Notion APIのレスポンスを内部型に変換
   - `parseBlock()`: Notionブロックを統一された型に変換
   - `parseRichText()`: リッチテキストの注釈を処理
   - `parseReadingNotePage()`: 読書メモページのプロパティをパース

3. **レンダリング**: `modules/notion/ui/view/BlockRenderer.tsx`
   - パースされたブロックをReactコンポーネントとしてレンダリング
   - 段落、見出し、コード、画像、引用、リスト、コールアウトに対応

### キャッシュ戦略

Next.js 16の"use cache"ディレクティブを使用:

- `getPost()`: 日単位キャッシュ、タグ: `posts-${id}`
- `getPostsByYear()`: 時間単位キャッシュ、タグ: `posts-${year}`
- `getReadingNotes()`: 時間単位キャッシュ、タグ: `reading-notes-all`
- `getReadingNote()`: 日単位キャッシュ、タグ: `reading-note-${id}`
- `getAllTopics()`: 時間単位キャッシュ、タグ: `reading-notes-topics`

Notion APIの呼び出し回数を最小化しています。

### ルーティング

`src/lib/routes.ts`で型安全なルート定義を管理:

```typescript
routes.home()                        // "/"
routes.books.index()                 // "/books"
routes.books.index("React")          // "/books?topic=React"
routes.books.detail("id")            // "/books/id"
routes.posts.year(2024)              // "/posts/2024"
routes.posts.detail(2024, "id")      // "/posts/2024/id"
```

ハードコードされたパスではなく、この関数を使用してください。

## テスト

### テストフレームワーク

- **Vitest**: テストランナー
- **React Testing Library**: コンポーネントテスト
- **jsdom**: ブラウザ環境のシミュレーション

### テストファイルの配置

テストファイルは`__tests__`ディレクトリ内に配置されています:
- `src/modules/books/service/__tests__/parser.test.ts`
- `src/modules/books/ui/view/__tests__/`

### テスト実行

```bash
# すべてのテストを実行
npm run test

# ウォッチモード
npm run test:ui

# カバレッジレポート生成
npm run test:coverage
```

## コーディング規約

### Linting & Formatting

- **Biome**を使用（ESLintとPrettierの代替）
- `src/components/ui`ディレクトリはlint対象外
- 推奨ルールを有効化し、Next.js・Reactドメイン最適化あり
- インポートの自動整理が有効化されています

### Git Hooks（Lefthook使用）

**pre-commit:**
- Biomeによる自動フォーマット（ステージングファイルのみ）
- 型チェック（tsc）

**pre-push:**
- Biome Lint実行
- 型チェック

### TypeScript設定

- strictモード有効
- パスエイリアス: `@/*` → `./src/*`
- React 19の新しいJSX transformを使用（`jsx: "react-jsx"`）

## 注意事項

- `src/components/ui`の既存コンポーネントは編集時に慎重に（lint対象外）
- Notionブロックを新規サポートする場合は、`parser.ts`と`BlockRenderer.tsx`の両方を更新
- ルート追加時は必ず`src/lib/routes.ts`を更新し型安全性を維持
- Next.js 16のキャッシュ機能（"use cache"ディレクティブ）を活用
- 読書メモ機能と投稿機能は別々のNotionデータベースを使用しています
