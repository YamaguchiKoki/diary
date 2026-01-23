# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、Notionをデータソースとした日本語の散文投稿サイトです。Next.js 16とReact 19を使用し、App Routerで構築されています。

## 重要
常に日本語で会話してください。こちらが英語で指示しても生成ブルは日本語で書くことを徹底してください。

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
```

## 環境変数

以下の環境変数が必要です（`env.ts`で定義）:

- `NOTION_SECRET`: Notion APIのシークレットキー
- `NOTION_DATABASE_ID`: NotionのデータベースID（32文字）
- `NOTION_DATA_SOURCE_ID`: NotionのデータソースID（UUID形式）

環境変数は`@t3-oss/env-nextjs`と`zod`でバリデーションされています。

## アーキテクチャ

### ディレクトリ構造

```
src/
├── app/                    # Next.js App Router（ページ定義）
│   ├── layout.tsx         # ルートレイアウト（日本語フォント設定）
│   ├── page.tsx           # ホームページ
│   ├── books/             # 書籍ページ
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
│   └── home/             # ホーム機能
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
  - 各モジュールは `service/`, `types/`, `ui/` のサブディレクトリで構成
- **components/**: ドメインに依存しない汎用UIコンポーネント
- **app/**: Next.jsのページ定義のみ（ビジネスロジックはmodulesに配置）

### Notionデータフロー

1. **データ取得**: `modules/notion/service/api.ts`
   - `getPosts()`: 全投稿を公開日降順で取得
   - `getPostsByYear(year)`: 特定年の投稿を取得（キャッシュあり）
   - `getPost(id)`: 個別投稿とブロックを取得（Next.jsキャッシュ使用）

2. **データ変換**: `modules/notion/service/parser.ts`
   - Notion APIのレスポンスを内部型に変換
   - `parseBlock()`: Notionブロックを統一された型に変換
   - `parseRichText()`: リッチテキストの注釈を処理

3. **レンダリング**: `modules/notion/ui/view/BlockRenderer.tsx`
   - パースされたブロックをReactコンポーネントとしてレンダリング
   - 段落、見出し、コード、画像、引用、リストに対応

### キャッシュ戦略

- `getPost()`: "use cache"ディレクティブで日単位キャッシュ、タグ: `posts-${id}`
- `getPostsByYear()`: 時間単位キャッシュ、タグ: `posts-${year}`
- Notion APIの呼び出し回数を最小化

### ルーティング

`src/lib/routes.ts`で型安全なルート定義を管理:

```typescript
routes.home()                    // "/"
routes.books()                   // "/books"
routes.posts.year(2024)          // "/posts/2024"
routes.posts.detail(2024, "id")  // "/posts/2024/id"
```

ハードコードされたパスではなく、この関数を使用してください。

## コーディング規約

### Linting & Formatting

- **Biome**を使用（ESLintとPrettierの代替）
- `src/components/ui`ディレクトリはlint対象外
- 推奨ルールを有効化し、Next.js・Reactドメイン最適化あり

### Git Hooks（Lefthook使用）

**pre-commit:**
- Biomeによる自動フォーマット（ステージングファイルのみ）
- 型チェック（tsc）

**pre-push:**
- BiomeLint実行
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
