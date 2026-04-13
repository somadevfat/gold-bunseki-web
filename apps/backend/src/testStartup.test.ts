import { expect, describe, it, mock, afterEach } from "bun:test";
import { validateStartupEnv } from "./index";

describe("validateStartupEnv", () => {
  const originalExit = process.exit;
  const exitMock = mock();

  afterEach(() => {
    process.exit = originalExit;
  });

  it("API_TOKEN未設定時にprocess.exitを呼ぶこと", () => {
    process.exit = exitMock as never;
    const originalToken = process.env.API_TOKEN;
    delete process.env.API_TOKEN;

    validateStartupEnv();

    expect(exitMock).toHaveBeenCalledWith(1);
    process.env.API_TOKEN = originalToken;
  });
});
