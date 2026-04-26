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
});
