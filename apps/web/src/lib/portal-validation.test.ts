import { test, expect } from "bun:test";
import { canAccessConversation, getOfferStatus, userInput, organizationInput, messageInput, subjectInput, planStatusInput, conversationStatusInput } from "./portal-validation";

test("conversation access is limited to the owner or an admin", () => {
  expect(canAccessConversation({ id: "customer-a", role: "user" }, "customer-a")).toBe(true);
  expect(canAccessConversation({ id: "customer-b", role: "user" }, "customer-a")).toBe(false);
  expect(canAccessConversation({ id: "admin", role: "admin" }, "customer-a")).toBe(true);
  expect(canAccessConversation({ id: "other", role: "ADMIN" }, "customer-a")).toBe(false);
});

test("pending offers expire at the deadline; signed offers remain signed", () => {
  const now = new Date("2026-09-07T12:00:00Z");
  expect(getOfferStatus({ status: "pending", expiresAt: now }, now)).toBe("expired");
  expect(getOfferStatus({ status: "pending", expiresAt: new Date(now.getTime() + 1) }, now)).toBe("pending");
  expect(getOfferStatus({ status: "signed", expiresAt: now }, now)).toBe("signed");
  expect(getOfferStatus({ status: "cancelled", expiresAt: now }, now)).toBe("cancelled");
});

test("forms reject empty messages, invalid roles and oversized input; nullable profile fields round-trip", () => {
  expect(messageInput.safeParse(" \n ").success).toBe(false);
  expect(messageInput.safeParse("x".repeat(10001)).success).toBe(false);
  expect(subjectInput.safeParse("x".repeat(161)).success).toBe(false);
  expect(messageInput.parse(" Hello \n")).toBe("Hello");
  expect(planStatusInput.safeParse("deleted").success).toBe(false);
  expect(conversationStatusInput.safeParse("waiting").success).toBe(false);
  const profile = userInput.parse({ name: " Alice ", email: "Alice@example.test", phone: "", company: null, organizationId: "", role: "user" });
  expect(profile.email).toBe("alice@example.test");
  expect(profile.phone).toBeNull();
  expect(userInput.parse(profile)).toEqual(profile);
  expect(userInput.safeParse({ ...profile, role: "owner" }).success).toBe(false);
  expect(userInput.safeParse({ ...profile, email: "not an email" }).success).toBe(false);
  expect(organizationInput.safeParse({ name: "", email: "", phone: "", address: "", notes: "" }).success).toBe(false);
  expect(organizationInput.safeParse({ name: "Acme", email: "bad", phone: "", address: "", notes: "" }).success).toBe(false);
});
