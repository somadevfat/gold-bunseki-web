import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./SiteFooter";

describe("SiteFooter", () => {
  it("Privacy, Status, API ドキュメントへの導線を表示すること", () => {
    render(<SiteFooter />);

    expect(
      screen.getByRole("link", { name: "Privacy & Security" }).getAttribute("href"),
    ).toBe("/privacy");
    expect(screen.getByRole("link", { name: "Status" }).getAttribute("href")).toBe(
      "/status",
    );
    expect(screen.getByRole("link", { name: "API" }).getAttribute("href")).toBe(
      "/api-docs",
    );
  });
});
