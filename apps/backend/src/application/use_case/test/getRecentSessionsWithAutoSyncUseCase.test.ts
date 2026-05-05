import { describe, expect, it, mock } from "bun:test";
import type { SessionVolatility } from "../../../domain/entities/session";
import type { SyncPayload } from "../../../domain/entities/syncPayload";
import { GetRecentSessionsUseCase } from "../getRecentSessionsUseCase";
import { GetRecentSessionsWithAutoSyncUseCase } from "../getRecentSessionsWithAutoSyncUseCase";

function sampleSession(): SessionVolatility {
  return {
    id: 1,
    date: "2026-03-27T00:00:00Z",
    sessionName: "NY",
    startTimeJst: "09:00",
    endTimeJst: "15:00",
    volatilityPoints: 150,
    hasEvent: false,
    hasHighImpactEvent: false,
    eventsLinked: "",
    condition: "Large",
  };
}

describe("GetRecentSessionsWithAutoSyncUseCase", () => {
  it("セッションが既にある場合は Analytics 取得と batch 保存を行わない", async () => {
    const inner = {
      execute: mock(() => Promise.resolve([sampleSession()])),
    } as unknown as GetRecentSessionsUseCase;
    const batch = { saveAll: mock(() => Promise.resolve(true)) };
    const pull = { fetchSyncPayload: mock(() => Promise.resolve(null)) };
    const uc = new GetRecentSessionsWithAutoSyncUseCase(inner, batch, pull);

    const r = await uc.execute(5, "http://localhost:8000");

    expect(r).toHaveLength(1);
    expect(pull.fetchSyncPayload).not.toHaveBeenCalled();
    expect(batch.saveAll).not.toHaveBeenCalled();
  });

  it("一覧が空で pull が null のとき save せず空配列を返す", async () => {
    const inner = {
      execute: mock(() => Promise.resolve([])),
    } as unknown as GetRecentSessionsUseCase;
    const batch = { saveAll: mock(() => Promise.resolve(true)) };
    const pull = { fetchSyncPayload: mock(() => Promise.resolve(null)) };
    const uc = new GetRecentSessionsWithAutoSyncUseCase(inner, batch, pull);

    const r = await uc.execute(5, "http://localhost:8000");

    expect(r).toEqual([]);
    expect(batch.saveAll).not.toHaveBeenCalled();
    expect(pull.fetchSyncPayload).toHaveBeenCalledWith("http://localhost:8000");
  });

  it("一覧が空で pull が payload のとき save して再取得する", async () => {
    const payload: SyncPayload = { sessions: [] };
    const s2 = sampleSession();
    const inner = {
      execute: mock()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([s2]),
    } as unknown as GetRecentSessionsUseCase;
    const batch = { saveAll: mock(() => Promise.resolve(true)) };
    const pull = { fetchSyncPayload: mock(() => Promise.resolve(payload)) };
    const uc = new GetRecentSessionsWithAutoSyncUseCase(inner, batch, pull);

    const r = await uc.execute(3, "http://localhost:8000");

    expect(batch.saveAll).toHaveBeenCalledWith(payload);
    expect(inner.execute).toHaveBeenCalledTimes(2);
    expect(r).toEqual([s2]);
  });

  it("pull が例外のとき空配列を返し save しない", async () => {
    const inner = {
      execute: mock(() => Promise.resolve([])),
    } as unknown as GetRecentSessionsUseCase;
    const batch = { saveAll: mock(() => Promise.resolve(true)) };
    const pull = {
      fetchSyncPayload: mock(() => Promise.reject(new Error("boom"))),
    };
    const uc = new GetRecentSessionsWithAutoSyncUseCase(inner, batch, pull);

    const r = await uc.execute(5, "http://localhost:8000");

    expect(r).toEqual([]);
    expect(batch.saveAll).not.toHaveBeenCalled();
  });
});
