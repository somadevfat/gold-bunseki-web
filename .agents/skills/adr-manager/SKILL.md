---
name: adr-manager
description: Manage Architecture Decision Records (ADRs). Use this when making architectural decisions, starting PoCs, or changing tech stacks to record the "Why" behind the "What".
---

# adr-manager

Architecture Decision Record (ADR) を作成、管理、および参照するためのスキルです。

## 🎯 責務
- アーキテクチャ上の重要な決定（スタックの変更、ディレクトリ構成の刷新など）が発生した際に、その決定理由と背景を `docs/adr/` に記録する。
- `ADR-XXXX-name.md` 形式で連番を振り、一貫性のあるドキュメントを維持する。

## 🛠️ ワークフロー

### 1. ADR の新規作成
1. `docs/adr/` ディレクトリ内の最新の番号を確認する。
2. `references/template.md` を読み込み、内容を今回の決定事項に沿って埋める。
3. `docs/adr/NNNN-title.md` (NNNNは4桁の連番) として保存する。

### 2. PoC (Proof of Concept) の記録
PoC を開始する前に、以下の項目を ADR に含めること。
- 何を検証するための PoC か？
- 成功の定義は何か？
- 検証結果をいつ評価し、本採用を決定するか？

## 📜 基準
- **ステータス**: `Proposed` (提案), `Accepted` (承認), `Superseded` (置き換え), `Deprecated` (廃止)
- **場所**: すべての ADR は `docs/adr/` に格納される必要がある。
