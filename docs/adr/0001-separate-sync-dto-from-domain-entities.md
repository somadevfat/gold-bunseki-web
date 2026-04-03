# ADR 0001: 外部データ同期(Push)におけるDTOとEntityの分離

## Context
バックエンド(Hono)の `/api/v1/sync/data` エンドポイントにて、分析エンジン(Python)からPUSHされるデータを受け取る際、Zodによるバリデーションエラーが発生していた。
原因は、APIの入力スキーマとして、データベース保存用に設計された厳密なDomain Entityスキーマ（`SessionVolatilitySchema` など）を直接使い回していたためである。
Entityスキーマは、DB上で自動採番される `id` やバックエンド側で計算されるべき `condition`（地合い判定）、厳密なISO8601フォーマットの `date` などを必須としていたが、Python側が送信する生データ（未完成の素材）はこれらを満たしていなかった。

## Decision
外部からのデータ入力（POST/PUSH）においては、**Domain Entityスキーマを直接使用せず、入力データの形式に合わせた専用のDTO (Data Transfer Object) スキーマを新設して使用する**ことを決定した。
具体的には、`openapi.ts` 内に `SyncSessionDtoSchema` などの専用Zodスキーマを定義し、ルーティングのバリデーションにはDTOを適用する。

## Consequences
- **メリット（利点）**:
  - Python側（送信元）のロジックやデータフォーマットを改修するコストを削減できた。
  - 「外部からの入力(DTO)」と「内部の完全なデータ(Entity)」が分離され、外部仕様の変更に強い柔軟なアーキテクチャとなった。
  - Repository層の `saveAll` メソッド（`SyncPayload` インターフェース）が元々生データを受け入れる作りになっていたため、バックエンド内部のロジック変更は不要（既存システムへの破壊的変更ゼロ）であった。
- **デメリット（欠点）**:
  - DTO用とEntity用のZodスキーマが並存するため、定義コードが少し増える。ただし、責務の分離という観点からは適正な増加である。

## Status
Accepted (適用済み)
