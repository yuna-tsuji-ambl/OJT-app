# API 仕様（契約の正本補足）

詳細なエンドポイント一覧の正は [`docs/detailed-design.md`](./detailed-design.md) §8。  
本書は横断ルールとエラー契約を定義する。

## 共通

- Base: `/api`
- 認証: `docs/detailed-design.md` §5.4 / §8.1 に従う
  - 本番（`AUTH_MODE=firebase`）: `Authorization: Bearer <Firebase ID トークン>`
  - モック（`AUTH_MODE=mock`）: `X-User-Id` / `X-User-Role`
  - 詳細・テスト: [`docs/test-specs/auth-feature.md`](./test-specs/auth-feature.md)
- 日付: 特記なき限り ISO 8601（`YYYY-MM-DD` / タイムスタンプは ISO 文字列）

## HTTP ステータス

| 状況               | コード                          |
| ------------------ | ------------------------------- |
| 成功               | 200 / 201 / 204                 |
| バリデーション     | 400                             |
| 未認証             | 401                             |
| 権限なし           | 403                             |
| 不存在             | 404                             |
| 競合（一意制約等） | 409（使う場合は機能仕様で明示） |
| サーバエラー       | 500                             |

## エラーボディ（方針）

既存 API に合わせ `{ "error": string }` を基本とする。  
フィールドエラーを返す場合は機能仕様で拡張し、全体で揃える。

## 破壊的変更

パス削除・レスポンス必須化は詳細設計更新＋互換期間の検討を必須とする。

## 機能別詳細

各機能のパス・クエリ・ボディは §8 および `docs/test-specs/[機能].md` を正とする。
