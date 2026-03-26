package repository

import (
	"context"
	"database/sql"
	"gold-vola-bunseki/backend/internal/application/port"
	"gold-vola-bunseki/backend/internal/domain"

	_ "github.com/lib/pq"
)

type SessionRepositoryImpl struct {
	db *sql.DB
}

/*
 * NewSessionRepositoryImpl はDBコネクションを受け取り、リポジトリの実装を返します。
 * @responsibility: PostgreSQLとの通信を行うリポジトリ。
 */
func NewSessionRepositoryImpl(db *sql.DB) port.SessionRepository {
	return &SessionRepositoryImpl{db: db}
}

/*
 * FindRecent は session_volatilities テーブルから新しい順に指定件数を取得します。
 * @return: セッションリストとエラー
 */
func (r *SessionRepositoryImpl) FindRecent(ctx context.Context, limit int) ([]*domain.SessionVolatility, error) {
	query := `
		SELECT id, date, session_name, 
		       TO_CHAR(start_time_jst, 'HH24:MI'), 
		       TO_CHAR(end_time_jst, 'HH24:MI'),
		       volatility_points, has_event, has_high_impact_event, events_linked
		FROM session_volatilities
		ORDER BY date DESC, start_time_jst DESC
		LIMIT $1
	`
	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*domain.SessionVolatility
	for rows.Next() {
		var s domain.SessionVolatility
		var eventsLinked sql.NullString

		err := rows.Scan(
			&s.ID, &s.Date, &s.SessionName, &s.StartTimeJST, &s.EndTimeJST,
			&s.VolatilityPoints, &s.HasEvent, &s.HasHighImpactEvent, &eventsLinked,
		)
		if err != nil {
			return nil, err
		}

		if eventsLinked.Valid {
			s.EventsLinked = eventsLinked.String
		}

		sessions = append(sessions, &s)
	}

	return sessions, nil
}

/*
 * GetThresholds は session_thresholds テーブルから全ての地合い閾値を取得します。
 * @return: セッション名ごとの閾値マップとエラー
 */
func (r *SessionRepositoryImpl) GetThresholds(ctx context.Context) (map[string]*domain.SessionThreshold, error) {
	query := `
		SELECT session_name, small_threshold, large_threshold
		FROM session_thresholds
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	thresholds := make(map[string]*domain.SessionThreshold)
	for rows.Next() {
		var t domain.SessionThreshold
		err := rows.Scan(&t.SessionName, &t.SmallThreshold, &t.LargeThreshold)
		if err != nil {
			return nil, err
		}
		thresholds[t.SessionName] = &t
	}

	return thresholds, nil
}

/*
 * FindPreviousEvent は指定した指標（EventName）が「前回」含まれていたセッションを検索します。
 * 現在（今日）のイベントを除外するため、最新の2件を取得し、2番目を返します。
 */
func (r *SessionRepositoryImpl) FindPreviousEvent(ctx context.Context, eventName string) (*domain.SessionVolatility, error) {
	query := `
		SELECT id, date, session_name, 
		       TO_CHAR(start_time_jst, 'HH24:MI'), 
		       TO_CHAR(end_time_jst, 'HH24:MI'),
		       volatility_points, has_event, has_high_impact_event, events_linked
		FROM session_volatilities
		WHERE events_linked LIKE $1
		ORDER BY date DESC, start_time_jst DESC
		LIMIT 2
	`
	rows, err := r.db.QueryContext(ctx, query, "%"+eventName+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*domain.SessionVolatility
	for rows.Next() {
		var s domain.SessionVolatility
		var eventsLinked sql.NullString
		err := rows.Scan(
			&s.ID, &s.Date, &s.SessionName, &s.StartTimeJST, &s.EndTimeJST,
			&s.VolatilityPoints, &s.HasEvent, &s.HasHighImpactEvent, &eventsLinked,
		)
		if err != nil {
			return nil, err
		}
		if eventsLinked.Valid {
			s.EventsLinked = eventsLinked.String
		}
		sessions = append(sessions, &s)
	}

	if len(sessions) < 2 {
		if len(sessions) == 1 {
			// 1件しかない場合はそれが「前回」かもしれない（今日がまだ起きていない場合）
			return sessions[0], nil
		}
		return nil, nil // 見つからない
	}

	// 最新から2番目が「前回」
	return sessions[1], nil
}

/*
 * GetCandles は指定された日・セッションの1分足を取得します。
 */
func (r *SessionRepositoryImpl) GetCandles(ctx context.Context, date string, sessionName string) ([]*domain.Candle, error) {
	query := `
		SELECT datetime_jst, open_price, high_price, low_price, close_price
		FROM price_candles
		WHERE date(datetime_jst) = $1 AND session_name = $2
		ORDER BY datetime_jst ASC
	`
	rows, err := r.db.QueryContext(ctx, query, date, sessionName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var candles []*domain.Candle
	for rows.Next() {
		var c domain.Candle
		err := rows.Scan(&c.DatetimeJST, &c.Open, &c.High, &c.Low, &c.Close)
		if err != nil {
			return nil, err
		}
		candles = append(candles, &c)
	}

	return candles, nil
}

/*
 * GetEventStats は指標 × 地合い(大中小) 別の過去平均ボラティリティを計算します。
 */
func (r *SessionRepositoryImpl) GetEventStats(ctx context.Context, eventName string, thresholds map[string]*domain.SessionThreshold) ([]*domain.HistoricalAverage, error) {
	query := `
		SELECT session_name, volatility_points
		FROM session_volatilities
		WHERE events_linked LIKE $1
	`
	rows, err := r.db.QueryContext(ctx, query, "%"+eventName+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// 地合い別の集計用
	type record struct {
		sum   float64
		count int
	}
	stats := make(map[string]*record) // "Large", "Mid", "Small"
	stats["Large"] = &record{}
	stats["Mid"] = &record{}
	stats["Small"] = &record{}

	for rows.Next() {
		var sName string
		var vola float64
		if err := rows.Scan(&sName, &vola); err != nil {
			return nil, err
		}

		// 地合いを判定
		cond := "Unknown"
		if t, ok := thresholds[sName]; ok {
			if vola <= t.SmallThreshold {
				cond = "Small"
			} else if vola <= t.LargeThreshold {
				cond = "Mid"
			} else {
				cond = "Large"
			}
		}

		if cond != "Unknown" {
			stats[cond].sum += vola
			stats[cond].count++
		}
	}

	var results []*domain.HistoricalAverage
	order := []string{"Large", "Mid", "Small"}
	for _, cond := range order {
		rec := stats[cond]
		avg := 0.0
		if rec.count > 0 {
			avg = rec.sum / float64(rec.count)
		}
		results = append(results, &domain.HistoricalAverage{
			EventName:   eventName,
			Condition:   cond,
			AverageVola: avg,
			Count:       rec.count,
		})
	}

	return results, nil
}
