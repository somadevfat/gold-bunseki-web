import { afterEach, describe, expect, it } from "bun:test";
import { readRequiredEnv } from "./env";

describe("readRequiredEnv", () => {
  const envName = "TEST_REQUIRED_ENV";
  const originalValue = process.env[envName];

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[envName];
    } else {
      process.env[envName] = originalValue;
    }
  });

  it("設定済みの環境変数を返すこと", () => {
    process.env[envName] = " configured-value ";

    expect(readRequiredEnv(envName)).toBe("configured-value");
  });

  it("未設定または空文字の場合に例外を投げること", () => {
    process.env[envName] = " ";

    expect(() => readRequiredEnv(envName)).toThrow(`Missing required environment variable: ${envName}`);
  });
});
