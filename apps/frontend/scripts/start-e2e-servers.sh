#!/usr/bin/env bash
# E2E テスト用サーバー起動スクリプト
# @responsibility モックサーバー → Vite の順番起動と、終了時の確実なクリーンアップを管理する。

set -e

# モックサーバーをバックグラウンドで起動し PID を記録
echo "[E2E] Starting mock server on port 8788..."
bun run tests/mocks/http-server.ts &
MOCK_PID=$!

# モックの起動完了を HTTP で確認（最大 15 秒）
echo "[E2E] Waiting for mock server /health..."
for i in $(seq 1 15); do
  if curl -sf http://127.0.0.1:8788/health > /dev/null 2>&1; then
    echo "[E2E] Mock server ready!"
    break
  fi
  if [ $i -eq 15 ]; then
    echo "[E2E] ERROR: Mock server did not start in time."
    kill $MOCK_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# プロセス終了時にモックサーバーも確実にクリーンアップ
cleanup() {
  echo "[E2E] Shutting down servers..."
  kill $MOCK_PID 2>/dev/null || true
  wait $MOCK_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Vite をフォアグラウンドで起動（NEXT_PUBLIC_API_URL を明示的に渡す）
# フォアグラウンドで動かすことで、Playwrightが終了した際に
# シェルスクリプトごと終了してモックもクリーンアップされる
echo "[E2E] Starting Vite dev server on port 3001..."
NEXT_PUBLIC_API_URL=http://127.0.0.1:8788 bunx vite dev --host 127.0.0.1 --port 3001
