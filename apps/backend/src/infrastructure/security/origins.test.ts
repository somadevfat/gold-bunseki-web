import { describe, expect, it } from "bun:test";
import { defaultAllowedOrigins, getAllowedOrigins } from "./origins";

describe("getAllowedOrigins", () => {
  it("環境変数未指定時にデフォルトの許可 Origin を返すこと", () => {
    expect(getAllowedOrigins(undefined)).toEqual(defaultAllowedOrigins);
  });

  it("カンマ区切りの環境変数をトリムして返すこと", () => {
    expect(getAllowedOrigins(" https://example.com,https://app.example.com , ")).toEqual([
      "https://example.com",
      "https://app.example.com",
    ]);
  });

  it("未使用の Vite 5173 Origin をデフォルトで許可しないこと", () => {
    expect(defaultAllowedOrigins).not.toContain("http://localhost:5173");
  });
});
