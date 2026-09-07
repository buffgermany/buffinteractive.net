import { test, expect } from "bun:test";
import { safeNext } from "./safe-next";

test("keeps same-origin relative paths", () => {
  expect(safeNext("/dashboard")).toBe("/dashboard");
  expect(safeNext("/sales/order/sign/abc123")).toBe("/sales/order/sign/abc123");
  expect(safeNext("/a?b=c#d")).toBe("/a?b=c#d");
});

test("rejects off-origin targets", () => {
  for (const hostile of [
    "//evil.com",
    "https://evil.com",
    "http://evil.com",
    "\\\\evil.com",
    "/\\evil.com", // browsers normalise \ to /, making this protocol-relative
    "/path\\..\\evil.com",
    "javascript:alert(1)",
    "dashboard",
    "",
  ]) {
    expect(safeNext(hostile)).toBe("/dashboard");
  }
});

test("falls back when absent", () => {
  expect(safeNext(undefined)).toBe("/dashboard");
  expect(safeNext(null)).toBe("/dashboard");
});

test("honours a custom fallback", () => {
  expect(safeNext("//evil.com", "/auth")).toBe("/auth");
});
