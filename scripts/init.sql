-- ==============================================================================
-- 📊 Gold Volatility Analysis Database Schema (JSTベース)
-- ==============================================================================

-- 1. 指標（Economic Events）テーブル
--    経済指標の発表スケジュールとその重要度を記録する
CREATE TABLE IF NOT EXISTS economic_events (
    id SERIAL PRIMARY KEY,
    datetime_jst TIMESTAMP NOT NULL, -- 指標発表時刻 (JST)
    event_name VARCHAR(255) NOT NULL, -- 指標名
    importance VARCHAR(50),          -- LOW, MEDIUM, HIGH
    actual DECIMAL,                  -- 実績値 (あれば)
    forecast DECIMAL,                -- 予測値 (あれば)
    prev DECIMAL,                    -- 前回値 (あれば)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. セッション（Sessions）ボラティリティ結果テーブル
--    特定の日の特定の時間枠において、何ドル動いたか、何が起きたかを記録する
CREATE TABLE IF NOT EXISTS session_volatilities (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,               -- 営業日
    session_name VARCHAR(50) NOT NULL, -- Oceania, Tokyo, London, NY_Open 等
    start_time_jst TIME NOT NULL,      -- セッション開始 (JST)
    end_time_jst TIME NOT NULL,        -- セッション終了 (JST)
    high_price DECIMAL,               -- セッション最高値
    low_price DECIMAL,                -- セッション最安値
    volatility_points DECIMAL,        -- ボラティリティ (Points)
    has_event BOOLEAN DEFAULT FALSE,   -- その時間枠に指標があったか
    has_high_impact_event BOOLEAN DEFAULT FALSE, -- 重要指標(HIGH)があったか
    events_linked TEXT,               -- 指標名のカンマ区切り（簡易検索用）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (date, session_name)       -- 同じ日の同じセッションは重複させない
);

-- 3. インデックス（高速化用）
CREATE INDEX idx_events_time ON economic_events(datetime_jst);
CREATE INDEX idx_sessions_date ON session_volatilities(date);
CREATE INDEX idx_sessions_vola ON session_volatilities(volatility_points);
