import { describe, it, expect, mock } from "bun:test";
import { diMiddleware } from "./diMiddleware";
import { Context } from "hono";

describe("diMiddleware", () => {
  it("Context に各リポジトリが正しくセットされること", async () => {
    const next = mock(() => Promise.resolve());
    const set = mock();
    const c = {
      set: set,
      env: {},
    } as unknown as Context;

    const middleware = diMiddleware();
    await middleware(c, next);

    expect(set).toHaveBeenCalledTimes(5);
    expect(next).toHaveBeenCalled();

    // セットされたキーの確認
    const calledKeys = set.mock.calls.map((call) => call[0]);
    expect(calledKeys).toContain("priceRepo");
    expect(calledKeys).toContain("zigzagRepo");
    expect(calledKeys).toContain("sessionRepo");
    expect(calledKeys).toContain("syncRepo");
    expect(calledKeys).toContain("batchRepo");
  });
});
