# OJT App

新卒 OJT（On-the-Job Training）向けアプリケーション。Google スプレッドシートの育成計画と連動し、クエスト管理・コンディション記録・トレーナーステータス管理などを行います。

React をメインとした npm workspaces モノレポ構成で、フロントエンド・バックエンド・共有型を 1 リポジトリで管理します。本番デプロイ先は **Google Cloud Run**（Git 連携 + Dockerfile）を想定しています。

## 技術スタック

| 領域           | 技術                                              |
| -------------- | ------------------------------------------------- |
| フロントエンド | React, Vite, TypeScript                           |
| バックエンド   | Node.js, Express, TypeScript                      |
| テスト         | Vitest（単体・結合）, Playwright（E2E 予定）      |
| データベース   | Firestore（本番）/ Firestore Emulator（ローカル） |
| インフラ       | Docker, Google Cloud Run                          |
| モノレポ       | npm workspaces                                    |

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

| パッケージ        | npm 名            | 説明                                               |
| ----------------- | ----------------- | -------------------------------------------------- |
| `apps/web`        | `@ojt-app/web`    | React フロントエンド。開発のメインエントリポイント |
| `apps/api`        | `@ojt-app/api`    | REST API + 静的ファイル配信（本番時）              |
| `packages/shared` | `@ojt-app/shared` | フロント・バックで共有する TypeScript 型           |

## ローカルで動かす

### 前提条件

| ツール  | バージョン |
| ------- | ---------- |
| Node.js | 22 以上    |
| npm     | 10 以上    |

Firestore Emulator を使う場合は `npm install` 時に `firebase-tools` が入ります（`npx firebase` で実行可）。

### 1. インストール

リポジトリルートで実行します。

```bash
npm install
```

### 2. 起動方法

用途に応じて **A（手軽）** か **B（Firestore Emulator）** を選びます。

#### A. 手軽に動かす（インメモリ・おすすめ）

DB 設定不要。データは **プロセス終了で消えます** が、画面や API の開発には十分です。

**ターミナル 1 — API（ポート 8080）**

```bash
npm run dev:api
```

**ターミナル 2 — フロント（ポート 5173）**

```bash
npm run dev
```

または 1 コマンドで両方起動:

```bash
npm run dev:all
```

**ブラウザで開く:** http://localhost:5173

ログイン画面で「新卒としてログイン」または「トレーナーとしてログイン」を選びます。

| URL                              | 内容                               |
| -------------------------------- | ---------------------------------- |
| http://localhost:5173            | React アプリ（開発用）             |
| http://localhost:8080/health     | API ヘルスチェック                 |
| http://localhost:8080/api/health | API 詳細（`dbProvider: "memory"`） |

Vite が `/api` と `/health` を `localhost:8080` にプロキシします。

#### B. Firestore Emulator で動かす（本番に近い）

ローカルで Firestore の読み書きを試すときに使います。本番の GCP Firestore には接続しません。

**方法 1 — まとめて起動（1 コマンド）**

```bash
npm run dev:all:firestore
```

Emulator・API・フロントが同時に起動します。初回は Emulator の起動完了まで数秒待ってからブラウザを開いてください。

**方法 2 — ターミナルを分ける**

ターミナル 1:

```bash
npm run emulators:firestore
```

ターミナル 2:

```bash
npm run dev:api:firestore
```

ターミナル 3:

```bash
npm run dev
```

| URL                              | 内容                                |
| -------------------------------- | ----------------------------------- |
| http://localhost:5173            | React アプリ                        |
| http://localhost:4000            | Firestore Emulator UI（データ確認） |
| http://localhost:8080/api/health | `dbProvider: "firestore"`           |

Emulator ではデータベース ID は `(default)` です。`FIRESTORE_DATABASE_ID` の設定は不要です。

#### C. 本番の GCP Firestore に直接つなぐ（任意）

通常は不要です。本番データをローカルから触りたい場合のみ。

```bash
# 一度だけ: GCP へのログイン
gcloud auth application-default login

# API 起動（別ターミナルで npm run dev）
DB_PROVIDER=firestore \
GCP_PROJECT_ID=ojt-app \
FIRESTORE_DATABASE_ID=ojt-app \
npm run dev:api
```

**注意:** `FIRESTORE_EMULATOR_HOST` は **設定しない** でください。

### 3. ローカル用環境変数

| 変数                      | A インメモリ | B Emulator                             | C 本番 Firestore                |
| ------------------------- | ------------ | -------------------------------------- | ------------------------------- |
| `DB_PROVIDER`             | 不要         | `firestore`（スクリプト内で設定）      | `firestore`                     |
| `GCP_PROJECT_ID`          | 不要         | `ojt-app`（スクリプト内で設定）        | `ojt-app`                       |
| `FIRESTORE_EMULATOR_HOST` | 不要         | `127.0.0.1:8081`（スクリプト内で設定） | **設定しない**                  |
| `FIRESTORE_DATABASE_ID`   | 不要         | 不要（`(default)`）                    | `ojt-app`（名前付き DB の場合） |

### 4. 開発コマンド一覧

すべてリポジトリルートで実行します。

| コマンド                      | 説明                              |
| ----------------------------- | --------------------------------- |
| `npm run dev`                 | フロントのみ（:5173）             |
| `npm run dev:api`             | API のみ・インメモリ（:8080）     |
| `npm run dev:all`             | フロント + API（インメモリ）      |
| `npm run dev:api:firestore`   | API のみ・Firestore Emulator 接続 |
| `npm run emulators:firestore` | Firestore Emulator のみ           |
| `npm run dev:all:firestore`   | Emulator + API + フロント         |
| `npm run build`               | shared → api → web をビルド       |
| `npm test`                    | API 単体テスト（Vitest）          |
| `npm run lint`                | ESLint で静的解析                 |
| `npm run lint:fix`            | ESLint の自動修正                 |
| `npm run format`              | Prettier でフォーマット適用       |
| `npm run format:check`        | Prettier の整形チェック（CI 用）  |
| `npm start`                   | ビルド済み API を起動             |

### 5. ローカルで困ったとき

| 症状                       | 確認すること                                               |
| -------------------------- | ---------------------------------------------------------- |
| 画面が真っ白 / API エラー  | API が起動しているか（`npm run dev:api` または `dev:all`） |
| `dev:api:firestore` で失敗 | 先に `npm run emulators:firestore` が動いているか          |
| ポート競合                 | 8080 / 5173 / 8081 / 4000 が他プロセスに使われていないか   |
| データが残らない（A）      | インメモリモードは再起動で消える（正常）                   |

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

**Cloud Run の環境変数（Firestore 利用時）**:

| 変数                    | 値の例                                                  | 必須                        |
| ----------------------- | ------------------------------------------------------- | --------------------------- |
| `DB_PROVIDER`           | `firestore`                                             | Firestore を使う場合        |
| `GCP_PROJECT_ID`        | `ojt-app`（あなたのプロジェクト ID）                    | 推奨                        |
| `FIRESTORE_DATABASE_ID` | `ojt-app`（GCP で作った DB ID。`(default)` 以外のとき） | 名前付き DB の場合 **必須** |
| `NODE_ENV`              | `production`                                            | 推奨                        |

**Cloud Run に設定してはいけない変数**:

| 変数                      | 理由                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `FIRESTORE_EMULATOR_HOST` | ローカル Emulator 用。本番で設定すると存在しない localhost に接続し、起動が失敗する |

**Cloud Run のサービスアカウント**に `Cloud Datastore User` ロールを付与してください（Firestore 読み書きに必要）。

**Firestore データベースの作成（初回必須）**:

Google Cloud コンソールまたは Firebase コンソールの **どちらでも同じ Firestore** です（同一 GCP プロジェクト内）。Firebase 側で改めて作る必要はありません。

GCP で既に作成済みの例:

| 項目            | 値                |
| --------------- | ----------------- |
| データベース ID | `ojt-app`         |
| 場所            | `asia-northeast1` |

この場合、Cloud Run に **`FIRESTORE_DATABASE_ID=ojt-app`** を追加してください。アプリのデフォルト接続先は `(default)` なので、ID が `ojt-app` だと `5 NOT_FOUND` になります。

まだ DB がない場合のみ:

1. [Google Cloud Console](https://console.cloud.google.com/firestore) または [Firebase コンソール](https://console.firebase.google.com/) でプロジェクトを開く
2. Firestore データベースを作成（Native / Standard、リージョン `asia-northeast1` 推奨）

`main` への push ごとに自動ビルド・デプロイされます。

### 起動失敗時の確認（`container failed to start and listen on the port`）

1. **Cloud Logging** でリビジョンのログを開き、`Failed to initialize application` や `FIRESTORE_EMULATOR_HOST` のエラーを確認する
2. Cloud Run の環境変数から `FIRESTORE_EMULATOR_HOST` が入っていないか確認する
3. `GCP_PROJECT_ID` が Firebase / GCP のプロジェクト ID と一致しているか確認する
4. Firestore が有効化され、データベースが作成済みか確認する（Firebase コンソール）
5. 切り分け: 一時的に `DB_PROVIDER` を外す（インメモリ）と起動するか試す
6. ログが `5 NOT_FOUND` の場合: Firestore データベースが未作成。上記「Firestore データベースの作成」を実施

### gcloud CLI からデプロイする場合

```bash
gcloud run deploy ojt-app \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

## Lint / Format

ESLint（静的解析）と Prettier（コード整形）をルートで一元管理しています。

```bash
npm run lint          # 解析のみ
npm run lint:fix      # 自動修正
npm run format        # 整形を適用
npm run format:check  # 整形差分があると exit 1（CI で使用）
```

| ツール   | 設定ファイル         |
| -------- | -------------------- |
| ESLint   | `eslint.config.js`   |
| Prettier | `prettier.config.js` |

### pre-commit フック（Husky）

`npm install` 時に Husky が有効化されます。コミット前に **ステージ済みファイル** に対して ESLint（`--fix`）と Prettier が自動実行されます。

| 対象                  | 処理                                |
| --------------------- | ----------------------------------- |
| `*.{ts,tsx,js,...}`   | `eslint --fix` → `prettier --write` |
| `*.{json,md,css,...}` | `prettier --write`                  |

設定: `package.json` の `lint-staged`、フックスクリプト: `.husky/pre-commit`

初回クローン後にフックが動かない場合:

```bash
npm install   # prepare スクリプトで Husky をセットアップ
```

## テスト

テスト仕様書は `docs/test-specs/` を正とします（TDD ワークフロー）。

```bash
npm test
```

| 種別       | 仕様書                 | 実行コマンド       | 配置                      |
| ---------- | ---------------------- | ------------------ | ------------------------- |
| 単体・結合 | `docs/test-specs/*.md` | `npm test`         | `apps/api/src/__tests__/` |
| E2E        | `docs/test-specs/*.md` | `npm run test:e2e` | `tests/`                  |

### CI（GitHub Actions）

`main` への push および Pull Request 作成時に [`.github/workflows/ci.yml`](.github/workflows/ci.yml) が自動実行されます。

| ジョブ                      | 内容                            |
| --------------------------- | ------------------------------- |
| Lint & Format               | ESLint + Prettier チェック      |
| Unit & Integration (Vitest) | API の単体・結合テスト          |
| E2E (Playwright)            | ブラウザ E2E テスト（Chromium） |

E2E 失敗時は Playwright レポートが Artifacts としてダウンロードできます。

## 今後の拡張予定

- 課題管理（トレーナー入力・スプシ代替）
- 日次・週次報告書
- 目標・ガントチャート管理
- 学び共有（デイリーログ + リンク）
- 認証（Identity Platform / Firebase Auth 等）

詳細は [docs/detailed-design.md](docs/detailed-design.md) を参照。
