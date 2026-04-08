# ============================
# ビルドステージ（依存解決）
# ============================
FROM oven/bun:1.2-alpine AS deps

WORKDIR /app

# ロックファイルを先にコピーしてキャッシュを最大活用
COPY package.json bun.lock ./

# 本番依存のみをインストール（再現性を担保するため --frozen-lockfile を指定）
RUN bun install --frozen-lockfile --production

# ============================
# 実行ステージ
# ============================
FROM oven/bun:1.2-alpine AS runner

WORKDIR /app

# セキュリティのため非rootユーザーで実行
USER bun

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules

# ソースコードをコピー
COPY . .

# ポートの公開
EXPOSE 3000

# Bun で TypeScript を直接実行（トランスパイル不要）
CMD ["bun", "run", "src/index.ts"]
