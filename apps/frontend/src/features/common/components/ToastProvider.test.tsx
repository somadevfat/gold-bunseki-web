import { describe, expect, it } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "./ToastProvider";

function ToastTrigger() {
  const { showToast } = useToast();

  return (
    <button
      type="button"
      onClick={() =>
        showToast({
          title: "保存しました",
          description: "トースト通知のテストです。",
          variant: "success",
        })
      }
    >
      通知を表示
    </button>
  );
}

describe("ToastProvider", () => {
  it("useToast から通知を表示できること", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "通知を表示" }));

    expect(screen.getByText("保存しました")).toBeDefined();
    expect(screen.getByText("トースト通知のテストです。")).toBeDefined();
  });

  it("閉じるボタンで通知を破棄できること", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "通知を表示" }));
    fireEvent.click(screen.getByRole("button", { name: "通知を閉じる" }));

    expect(screen.queryByText("保存しました")).toBeNull();
  });

  it("アンマウント時に保留中の自動クローズタイマーを解放すること", () => {
    const originalClearTimeout = window.clearTimeout;
    const clearedTimeouts: unknown[] = [];
    window.clearTimeout = ((timeoutId?: unknown) => {
      if (timeoutId) {
        clearedTimeouts.push(timeoutId);
      }
    }) as typeof window.clearTimeout;
    const { unmount } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "通知を表示" }));
    unmount();
    window.clearTimeout = originalClearTimeout;

    expect(clearedTimeouts.length).toBeGreaterThan(0);
  });

  it("Provider 外で useToast を使った場合にエラーを投げること", () => {
    function InvalidToastConsumer() {
      useToast();
      return null;
    }

    expect(() => render(<InvalidToastConsumer />)).toThrow("useToast must be used within ToastProvider");
  });
});
