import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import ApiDocsPage, { metadata } from "./page";

describe("ApiDocsPage", () => {
  it("API仕様への導線と主要APIの用途を表示すること", () => {
    render(<ApiDocsPage />);

    expect(screen.getByRole("heading", { name: "API Documentation" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Swagger UI" }).getAttribute("href"))
      .toBe("http://localhost:3000/swagger");
    expect(screen.getByRole("link", { name: "OpenAPI JSON" }).getAttribute("href"))
      .toBe("http://localhost:3000/doc");
    expect(screen.getByText("Market API")).toBeDefined();
    expect(screen.getByText("Sync API")).toBeDefined();
    expect(screen.getByText("Community API")).toBeDefined();
    expect(screen.getByText(/APIドキュメントが開けない場合/)).toBeDefined();
  });

  it("SEO metadata が設定されていること", () => {
    expect(metadata.title).toBe("API Documentation");
    expect(metadata.description).toContain("Swagger");
    expect(metadata.alternates).toEqual({ canonical: "/api-docs" });
  });
});
