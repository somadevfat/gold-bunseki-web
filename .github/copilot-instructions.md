# Copilot Instructions

開発ルール・アーキテクチャ・テスト方針はすべて `.agents/rules/rules.md` を正として参照すること。

以下はそのサマリー（詳細は rules.md 優先）:

### テスト駆動開発 (TDD)

- **必ずテストファースト**: 新機能・バグ修正は実装前にテストを書く（Red → Green → Refactor）
- テストファイルは `*.test.ts` / `*.test.tsx` として実装ファイルと同ディレクトリの `test/` サブディレクトリに配置する
- 正常系・異常系・境界値を必ずカバーする

### カバレッジ 100%

- バックエンド: `bun run test:coverage` で **Funcs 100% / Lines 100%** を維持すること
- フロントエンド: `bun run test:coverage` で **100%** を維持すること
- カバレッジが下がるコードは追加しない

### モック

- テスト時に外部リソース（DB・HTTP）へ実際に接続しない
- Bun の `mock.module` を使ってモジュールレベルでモックする
- `testHelpers.ts` の `createMockDrizzle` / `createMockContext` を再利用する

### コミット

- Conventional Commits に従う（`feat:`, `fix:`, `test:`, `refactor:` など）
