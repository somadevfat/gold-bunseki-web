# 自社開発転職用ポートフォリオ完成ロードマップ

## 目的

このドキュメントは、Gold Volatility Analyzer を「自社開発企業への転職で説明できるポートフォリオ」に仕上げるための作業一覧です。

現状は AI 主導の実装が多く、アプリ理解が追いついていない前提で、以下を目的にします。

- アプリを実際に使える状態まで完成させる
- 自分の言葉で設計・実装・運用判断を説明できる状態にする
- 面接で「なぜ作ったか」「どこを工夫したか」「何を改善したか」を語れる状態にする
- AI を使ったとしても、成果物の責任を自分で持てる状態にする

## 最優先の完成条件

まずは以下を満たせば、ポートフォリオとして最低限見せられる状態です。

- [ ] 本番URLでトップページ、分析ページ、掲示板、ログインUIが正常に表示される
- [ ] MT5/Python から本番APIへデータ同期できる
- [ ] PostgreSQL に本番データが入り、フロントで可視化できる
- [ ] Googleログインが本番で成功する
- [ ] 掲示板一覧APIが本番で取得できる
- [ ] デプロイ手順が GitHub Actions で再現できる
- [ ] README だけで第三者がアプリ概要を理解できる
- [ ] 面接でアーキテクチャ図を見ながら5分で説明できる
- [ ] AIに作らせた箇所も、自分でコードを追って説明できる

## 1. 機能完成

### 1.1 必須機能

- [ ] XAUUSD の価格データを継続的に同期できる
- [ ] 経済指標データを取り込み、セッション別ボラティリティと紐づけられる
- [ ] フロントで直近セッションのボラティリティを表示できる
- [ ] 指標ごとの過去再現チャートを表示できる
- [ ] 現在の地合い判定（Small/Mid/Large）を表示できる
- [ ] Googleログインができる
- [ ] ログイン状態をUIで確認できる
- [ ] 掲示板スレッド一覧を本番APIから取得できる

### 1.2 あると強い機能

- [ ] 掲示板の投稿作成
- [ ] ログインユーザーだけ投稿できる権限制御
- [ ] 投稿者名・作成日時の表示
- [ ] データ同期ステータス画面
- [ ] 最終同期時刻、同期件数、同期失敗時のメッセージ表示
- [ ] 管理者向けの簡易ヘルスチェック画面
- [ ] エラー時のユーザー向けメッセージ改善

### 1.3 やりすぎなくてよい機能

以下は面接での評価に直結しにくいので、優先度は低いです。

- [ ] 高度なSNS機能
- [ ] リアルタイムチャット
- [ ] 決済
- [ ] 複雑な管理画面
- [ ] 過度なアニメーション

## 2. データ同期・運用

### 2.1 同期方式の整理

現在の構成は以下です。

```text
MT5
  -> Python analytics
  -> Backend sync API
  -> PostgreSQL
  -> Frontend
```

やるべきこと:

- [ ] MT5 から何を取得しているか説明できる
- [ ] Python がどの単位でデータを集計しているか説明できる
- [ ] `POST /api/v1/sync/data` と `POST /api/v1/sync/seed` の違いを説明できる
- [ ] `API_TOKEN` による同期API保護を説明できる
- [ ] 同期失敗時にどこを見るべきか説明できる
- [ ] 小型PC/VPS/自宅PCのどれで同期するか決める
- [ ] 同期マシンの再起動後も自動復旧する仕組みを作る

### 2.2 同期環境の候補

| 候補 | メリット | デメリット | 推奨度 |
|---|---|---|---|
| 自宅小型PC + Windows | MT5が安定、安い、操作しやすい | 停電・回線断に弱い | 高 |
| Windows VPS | MT5が安定、外部で完結 | 月額が高め | 高 |
| Linux VPS + Wine + MT5 | 安め、クラウド完結 | MT5/Wine/GUIが面倒 | 中 |
| 無料クラウド | 費用ゼロ | 常時稼働・GUI・x86制約が厳しい | 低 |

現実的には、まず **小型PC + Windows + タスクスケジューラ** が一番説明しやすいです。

## 3. 本番環境・デプロイ

### 3.1 理解すべき構成

- [ ] Frontend は Cloudflare Workers / Vinext で配信している
- [ ] Backend は GCE + Docker Compose + Bun/Hono で動いている
- [ ] DB は GCE 上の PostgreSQL コンテナで動いている
- [ ] Nginx が `api.fanda-dev.com` から backend へ reverse proxy している
- [ ] GitHub Actions で frontend/backend を別々にCDしている
- [ ] backend CD は GCR image を build/push/pull している
- [ ] Drizzle migration をデプロイ時に適用している

### 3.2 完成させるべき運用

- [ ] CD Backend が安定して成功する
- [ ] CD Frontend が安定して成功する
- [ ] `.env` に必要な本番環境変数が揃っている
- [ ] 本番 `BETTER_AUTH_SECRET` を安全に管理している
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` を安全に管理している
- [ ] `ALLOWED_ORIGINS` が本番ドメインに一致している
- [ ] `BETTER_AUTH_URL=https://api.fanda-dev.com` になっている
- [ ] Google OAuth redirect URI に `https://api.fanda-dev.com/api/auth/callback/google` を登録している

## 4. セキュリティ

### 4.1 説明できるべき項目

- [ ] なぜ同期APIに Bearer token が必要か
- [ ] `API_TOKEN` が漏れると何が危険か
- [ ] CORS と `ALLOWED_ORIGINS` の役割
- [ ] Better Auth のセッションCookie方式
- [ ] Google OAuth のログインフロー
- [ ] `BETTER_AUTH_SECRET` の役割
- [ ] 本番 `.env` をGitに入れてはいけない理由
- [ ] DBを `127.0.0.1:5432` に閉じている理由

### 4.2 改善すると強い項目

- [ ] セキュリティヘッダーの説明
- [ ] APIのエラーレスポンス標準化
- [ ] ログに機密情報を出さない設計
- [ ] Google OAuth の redirect URI / origin 制限
- [ ] 本番シークレットのローテーション手順

## 5. テスト・品質保証

### 5.1 現状を説明できること

- [ ] `bun test` を使っている理由
- [ ] frontend の MSW によるAPIモック
- [ ] happy-dom によるブラウザ環境テスト
- [ ] backend の Controller / UseCase / Repository テスト
- [ ] 異常系テストをどこまで書いているか
- [ ] CI で lint/test を回している流れ

### 5.2 追加すると強い品質項目

- [ ] CD workflow の失敗時ログ改善
- [ ] 本番ヘルスチェックの説明
- [ ] migration の適用確認手順
- [ ] E2E を入れるか、入れない理由を説明できる
- [ ] 重要APIだけでも統合テストを増やす

## 6. UI/UX

### 6.1 完成させるべきUI

- [ ] トップページで何のアプリか一目で分かる
- [ ] XAUUSD分析の価値が伝わる
- [ ] データが無い時の空状態が分かりやすい
- [ ] API失敗時のエラーメッセージが自然
- [ ] ログイン中/未ログインが分かる
- [ ] 掲示板が未完成に見えない
- [ ] スマホ表示が崩れない

### 6.2 面接で説明する観点

- [ ] なぜこの情報設計にしたか
- [ ] ユーザーは誰か
- [ ] ユーザーがどの画面で何を判断するか
- [ ] チャートを見ることで何が分かるか
- [ ] エラー時にユーザーを迷わせない工夫

## 7. ドキュメント整備

### 7.1 必須ドキュメント

- [ ] `README.md`: アプリ概要、デモURL、技術スタック、構成図
- [ ] `docs/portfolio-roadmap.md`: このロードマップ
- [ ] `docs/deployment-steps.md`: 本番デプロイ手順
- [ ] `docs/SYNC_AND_SEED.md`: データ同期と初期投入手順
- [ ] `docs/adr/`: 主要な技術選定理由
- [ ] `.env.example`: 必須環境変数一覧

### 7.2 README に追加したい内容

- [ ] 本番URL
- [ ] スクリーンショット
- [ ] 主要機能
- [ ] 技術スタック
- [ ] システム構成図
- [ ] ER図
- [ ] データ同期フロー
- [ ] 認証フロー
- [ ] テスト実行方法
- [ ] デプロイ構成
- [ ] 苦労した点と改善した点

## 8. 面接対策

### 8.1 1分説明

準備する説明:

> MT5から取得したXAUUSDの価格データと経済指標を組み合わせ、セッション別のボラティリティや過去指標時の値動きを分析・可視化するフルスタックアプリです。BackendはHono/Bun/PostgreSQL、FrontendはReact/Next/Vinext、デプロイはGCEとCloudflare Workersで構成しています。データ同期、認証、CI/CD、migration、本番運用まで含めて実装しています。

### 8.2 5分説明

話す順番:

1. 作った背景
2. 解決したい課題
3. 全体アーキテクチャ
4. データ同期の流れ
5. フロントでの見せ方
6. 認証・セキュリティ
7. CI/CDと本番運用
8. 苦労した点
9. 今後の改善

### 8.3 想定質問

- [ ] なぜこのアプリを作ったのですか？
- [ ] 誰のどんな課題を解決しますか？
- [ ] なぜ Hono を選びましたか？
- [ ] なぜ Bun を使っていますか？
- [ ] なぜ PostgreSQL にしましたか？
- [ ] Clean Architecture にした理由は？
- [ ] Frontend の feature-based 構成を説明してください
- [ ] MT5 からのデータ同期はどう動きますか？
- [ ] 同期APIのセキュリティは？
- [ ] Googleログインはどう動きますか？
- [ ] Better Auth は何をしていますか？
- [ ] セッション管理は JWT ですか？
- [ ] CORS の設定で何に気をつけましたか？
- [ ] migration はどう運用していますか？
- [ ] CD で起きた問題をどう切り分けましたか？
- [ ] テストはどの粒度で書いていますか？
- [ ] AIはどのように使いましたか？
- [ ] AIが書いたコードをどうレビューしましたか？
- [ ] 今後改善するなら何をしますか？

## 9. アプリ理解チェックリスト

ここが最重要です。各項目を「コードを見ずに説明できる」状態にします。

### 9.1 全体構成

- [ ] `apps/frontend` / `apps/backend` / `apps/analytics` の責務
- [ ] MT5 から画面表示までのデータフロー
- [ ] 本番インフラの構成
- [ ] Cloudflare と GCE の役割分担
- [ ] Docker Compose の役割
- [ ] Nginx の役割

### 9.2 Backend

- [ ] `src/index.ts` で何を組み立てているか
- [ ] Hono のルーティング
- [ ] OpenAPI route 定義
- [ ] Controller の責務
- [ ] UseCase の責務
- [ ] Repository Port の責務
- [ ] Drizzle Repository の責務
- [ ] `schema.ts` のテーブル定義
- [ ] migration の作成・適用方法
- [ ] `syncBearerAuth` の役割
- [ ] `diMiddleware` の役割
- [ ] `structuredLogger` の役割
- [ ] `handleAppError` / `handleNotFound` の役割

### 9.3 Frontend

- [ ] `src/app` の役割
- [ ] `src/features` の役割
- [ ] `src/lib/api/client.ts` の役割
- [ ] Hono RPC client の仕組み
- [ ] `src/lib/auth.ts` の役割
- [ ] `useAuth` の役割
- [ ] Server Component と Client Component の使い分け
- [ ] MSW のテスト構成
- [ ] `NEXT_PUBLIC_API_URL` がどこで埋め込まれるか
- [ ] Vinext / Cloudflare Worker の役割

### 9.4 Auth

- [ ] `better-auth/react` は何をするか
- [ ] `createAuthClient` の `baseURL` の意味
- [ ] `signIn.social` がどのAPIへ飛ぶか
- [ ] Google OAuth の callback URL
- [ ] backend の `/api/auth/**` が何を処理するか
- [ ] セッションCookie方式の流れ
- [ ] `get-session` の役割
- [ ] `BETTER_AUTH_SECRET` の役割
- [ ] `BETTER_AUTH_URL` の役割
- [ ] `trustedOrigins` の役割

### 9.5 Analytics / Sync

- [ ] MT5 から何を取得するか
- [ ] Python が何を計算するか
- [ ] セッション分割のルール
- [ ] volatilityPoints の意味
- [ ] economic_events と session_volatilities の関係
- [ ] seed と incremental sync の違い
- [ ] 失敗時にどこを確認するか

### 9.6 CI/CD

- [ ] CI で何を検証しているか
- [ ] CD Frontend の流れ
- [ ] CD Backend の流れ
- [ ] GCR image build/push/pull の流れ
- [ ] GCE で `git reset --hard github.sha` する理由
- [ ] `BACKEND_IMAGE` の役割
- [ ] `docker-compose up --no-deps --force-recreate backend` の意味
- [ ] post-deploy health check の意味
- [ ] CD失敗時のログの読み方

## 10. AI利用を面接でどう説明するか

AI利用を隠す必要はありません。ただし、以下を説明できる必要があります。

- [ ] AIに任せた作業範囲
- [ ] 自分がレビューした観点
- [ ] 生成コードをどう検証したか
- [ ] テストでどう担保したか
- [ ] 本番障害時にどうログを読み、どう修正したか
- [ ] AIの提案をそのまま採用しなかった例
- [ ] AIを使ったことで速くなった部分
- [ ] 自分で理解して責任を持っている部分

面接での言い方:

> 実装速度を上げるためにAIを使いました。ただし、設計判断、差分レビュー、テスト、デプロイ失敗時の切り分けは自分で確認し、最終的に自分の言葉で説明できる状態にしています。

避けるべき言い方:

> AIが全部作りました。

## 11. 1週間の優先順位

### Day 1: 本番安定化

- [ ] backend CD を成功させる
- [ ] Googleログインを本番で通す
- [ ] 掲示板一覧を本番で表示する
- [ ] `.env` と Google OAuth 設定を整理する

### Day 2: データ同期

- [ ] 同期マシンを決める
- [ ] seed / sync の手順を再確認する
- [ ] 本番DBに最新データを投入する
- [ ] sync status を確認する

### Day 3: UI完成

- [ ] トップページの訴求を改善する
- [ ] 分析画面の空状態/エラー状態を改善する
- [ ] 掲示板の見た目を完成させる
- [ ] スマホ表示を確認する

### Day 4: README整備

- [ ] デモURLを追加する
- [ ] スクリーンショットを追加する
- [ ] アーキテクチャ図を追加する
- [ ] 技術選定理由を書く

### Day 5: 理解チェック

- [ ] Backend の主要ファイルを説明する
- [ ] Frontend の主要ファイルを説明する
- [ ] Auth flow を説明する
- [ ] Sync flow を説明する
- [ ] CD flow を説明する

### Day 6: 面接練習

- [ ] 1分説明を暗記する
- [ ] 5分説明を練習する
- [ ] 想定質問に回答を書く
- [ ] 苦労した点を3つ整理する

### Day 7: 仕上げ

- [ ] 不要な未完成導線を隠す/完成させる
- [ ] 本番動作を録画する
- [ ] GitHub pinned repository にする
- [ ] 職務経歴書用の説明文を作る

## 12. 職務経歴書・ポートフォリオ記載例

```text
Gold Volatility Analyzer

MT5から取得したXAUUSD価格データと経済指標を組み合わせ、セッション別ボラティリティと過去指標時の値動きを分析・可視化するフルスタックアプリを開発。

Frontend は React / Next.js / Vinext を Cloudflare Workers へデプロイし、Backend は Hono / Bun / PostgreSQL を GCE + Docker Compose 上で運用。MT5/Python からのデータ同期API、Google OAuth認証、Drizzle migration、GitHub ActionsによるCI/CD、本番運用時のログ調査と復旧まで実装。

担当: 要件定義、設計、Frontend/Backend実装、DB設計、認証、CI/CD、デプロイ、運用改善
技術: TypeScript, React, Next.js, Vinext, Hono, Bun, PostgreSQL, Drizzle ORM, Docker, GCE, Cloudflare Workers, GitHub Actions, Python, MT5
```

## 13. 最終ゴール

このアプリで目指す状態は、「完成したアプリを見せる」だけではありません。

面接で以下を言える状態を目指します。

- [ ] 自分の課題意識から作った
- [ ] 技術選定に理由がある
- [ ] データ設計を説明できる
- [ ] 本番運用まで経験した
- [ ] 障害をログから切り分けて直した
- [ ] テストとCI/CDで品質を担保した
- [ ] AIを使いつつ、自分で理解し責任を持っている

これができれば、単なる学習アプリではなく、実務に近いポートフォリオとして説明できます。
