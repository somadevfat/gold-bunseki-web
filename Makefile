.PHONY: dev backend frontend db-migrate db-generate setup clean lint test dev-mock

# ==============================================================================
# 開発用コマンド (Development Commands)
# ==============================================================================

# @responsibility: バックエンドとフロントエンドを並列で起動し、開発環境を立ち上げる。
dev:
	@echo "🚀 Microservices (Backend, Frontend) を起動中..."
	@echo "⚠️  注意: Python Analytics Engine は別途 Windows ホスト側での起動を想定しています。"
	make -j 2 backend frontend

# @responsibility: Hono / Bun.serve のバックエンドを起動する。
backend:
	@echo "🟢 Backend (Port 3000) を起動しています..."
	cd apps/backend && bun run dev

# @responsibility: モックサーバーモードでバックエンド(MSW)を起動する（外部APIへの依存なし）。
dev-mock:
	@echo "🧪 Mock Backend を起動しています..."
	cd apps/frontend && bun run dev:mock

# @responsibility: vinext (Vite) のフロントエンドを起動する。
frontend:
	@echo "🌐 Frontend (Port 3001) を起動しています..."
	cd apps/frontend && bun run dev:vinext

# ==============================================================================
# データベース管理コマンド (Database Management)
# ==============================================================================

# @responsibility: PostgreSQL に対するマイグレーションを生成する。
db-generate:
	@echo "🏗️  Drizzle Migration を生成中..."
	cd apps/backend && bun run db:generate

# @responsibility: PostgreSQL に対するマイグレーションを実行する。
db-migrate:
	@echo "🗄️  PostgreSQL Database をマイグレーション中..."
	cd apps/backend && bun run db:migrate

# @responsibility: 初回のプロジェクトセットアップ（DBマイグレーションを含む）を実行する。
setup: db-migrate
	@echo "📦 セットアップ完了！ 'make dev' で開発を開始できます。"

# ==============================================================================
# 品質管理コマンド (Quality Control)
# ==============================================================================

# @responsibility: プロジェクト全体のコード規約（Lint）をチェックする。
lint:
	@echo "🔍 Lint チェックを実行中..."
	cd apps/backend && bun run lint
	cd apps/frontend && bun run lint

# @responsibility: バックエンドの単体テストを実行する。
test:
	@echo "🧪 バックエンドのテストを実行中..."
	cd apps/backend && bun run test

# ==============================================================================
# お掃除コマンド (Utility)
# ==============================================================================

# @responsibility: 使用済みのポートを解放し、ゾンビプロセスを一掃する。
clean:
	@echo "🧹 ゾンビプロセスの掃除を開始します..."
	-fuser -k 3000/tcp 2>/dev/null || true
	-fuser -k 3001/tcp 2>/dev/null || true
	-fuser -k 8000/tcp 2>/dev/null || true
	-fuser -k 8080/tcp 2>/dev/null || true
	@echo "✨ クリーンアップが完了しました。"
