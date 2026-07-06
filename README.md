# OJT App

新卒 OJT（On-the-Job Training）向けアプリケーション。Google スプレッドシートの育成計画と連動し、クエスト管理・コンディション記録・トレーナーステータス管理などを行います。

React をメインとした npm workspaces モノレポ構成で、フロントエンド・バックエンド・共有型を 1 リポジトリで管理します。本番デプロイ先は **Google Cloud Run**（Git 連携 + Dockerfile）を想定しています。

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | React, Vite, TypeScript |
| バックエンド | Node.js, Express, TypeScript |
| テスト | Vitest（単体・結合）, Playwright（E2E 予定） |
| インフラ | Docker, Google Cloud Run |
| モノレポ | npm workspaces |

## ディレクトリ構成

```
OJT-app/
├── package.json              # workspaces + 共通スクリプト
├── package-lock.json
├── Dockerfile                # Cloud Run 用（フロント + API を 1 イメージに）
├── .dockerignore
├── apps/
│   ├── web/                  # React アプリ（メイン）
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── api/                  # Node.js API サーバー
│       ├── src/
│       │   ├── server.ts     # Express エントリポイント
│       │   ├── routes/       # HTTP ルート（予定）
│       │   ├── api/          # Facade 層
│       │   ├── services/     # ビジネスロジック
│       │   ├── domain/       # ドメインモデル
│       │   └── repositories/ # データアクセス層
│       └── package.json
├── packages/
│   └── shared/               # FE / BE 共通の型・定数
│       ├── src/
│       │   ├── types.ts      # Quest, UserRole など
│       │   └── index.ts
│       └── package.json
├── docs/
│   └── test-specs/           # テスト仕様書（TDD の正）
└── .cursor/rules/            # コーディング規約
```

### 各パッケージの役割

| パッケージ | npm 名 | 説明 |
|------------|--------|------|
| `apps/web` | `@ojt-app/web` | React フロントエンド。開発のメインエントリポイント |
| `apps/api` | `@ojt-app/api` | REST API + 静的ファイル配信（本番時） |
| `packages/shared` | `@ojt-app/shared` | フロント・バックで共有する TypeScript 型 |

## セットアップ

### 前提条件

- Node.js 22 以上
- npm 10 以上

### インストール

リポジトリルートで実行します。

```bash
npm install
```

## 開発コマンド

すべてリポジトリルートで実行します。

| コマンド | 説明 |
|----------|------|
| `npm run dev` | React 開発サーバーを起動（メイン） |
| `npm run dev:api` | API サーバーを起動（ポート 8080） |
| `npm run dev:all` | フロント・API を同時起動 |
| `npm run build` | shared → api → web の順でビルド |
| `npm test` | API の単体テスト（Vitest）を実行 |
| `npm start` | ビルド済み API サーバーを起動 |

### ローカル開発の流れ

1. ターミナル 1 で API を起動する。

```bash
npm run dev:api
```

2. ターミナル 2 でフロントを起動する。

```bash
npm run dev
```

`apps/web` の Vite は `/api` と `/health` を `localhost:8080` にプロキシします。

## 共有型の使い方

`packages/shared` に定義した型を、フロント・バックの両方から利用します。

```typescript
import type { Quest, UserRole } from '@ojt-app/shared';
```

API 側では `apps/api/src/domain/types.ts` が `@ojt-app/shared` を re-export しているため、既存コードとの互換も保たれています。

## Docker（ローカル確認）

```bash
docker build -t ojt-app:local .
docker run -p 8080:8080 ojt-app:local
```

ブラウザで http://localhost:8080 を開きます。

- `/` … React アプリ
- `/health` … ヘルスチェック
- `/api/health` … API ヘルスチェック

## Cloud Run へのデプロイ

ルートの `Dockerfile` から、フロント（静的ファイル）と API を **1 つのコンテナ** にまとめてデプロイします。

### Git 連携（継続的デプロイ）

1. コードを GitHub 等に push する
2. [Cloud Run コンソール](https://console.cloud.google.com/run) で **リポジトリから継続的にデプロイ** を選択
3. リポジトリ・ブランチ（例: `main`）を指定
4. ビルドタイプ: **Dockerfile**
5. Dockerfile のパス: `/Dockerfile`
6. リージョン: `asia-northeast1`（東京）など
7. 環境変数・シークレットを設定して作成

`main` への push ごとに自動ビルド・デプロイされます。

### gcloud CLI からデプロイする場合

```bash
gcloud run deploy ojt-app \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

## テスト

テスト仕様書は `docs/test-specs/` を正とします（TDD ワークフロー）。

```bash
npm test
```

| 種別 | 仕様書 | 実行コマンド |
|------|--------|--------------|
| 単体・結合 | `docs/test-specs/*.md` | `npm test` |
| E2E | `docs/E2Eテスト仕様書.md`（予定） | 未設定 |

## 今後の拡張予定

- クエスト・コンディション・ステータスの REST API ルート実装
- Google Sheets API 連携（`SheetRepository`）
- 永続化（Firestore 等）
- 認証（Identity Platform / Firebase Auth 等）
