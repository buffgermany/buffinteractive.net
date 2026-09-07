import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).nullable().transform(value => value || null);
export const userInput = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.email().trim().toLowerCase(),
  phone: optionalText(80),
  company: optionalText(200),
  organizationId: optionalText(100),
  role: z.enum(["user", "admin"]),
});
export const organizationInput = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.union([z.email(), z.literal("")]).transform(value => value || null),
  phone: optionalText(80),
  address: optionalText(1000),
  notes: optionalText(5000),
});
export const messageInput = z.string().trim().min(1, "Schreib zuerst eine Nachricht.").max(10000);
export const subjectInput = z.string().trim().min(1, "Gib einen Betreff an.").max(160);
export const planStatusInput = z.enum(["active", "paused", "ended"]);
export const conversationStatusInput = z.enum(["open", "closed"]);

export function canAccessConversation(user: { id: string; role: string }, customerUserId: string) {
  return user.role === "admin" || user.id === customerUserId;
}
export function getOfferStatus(offer: { status: string; expiresAt: Date }, now = new Date()) {
  if (offer.status === "pending" && offer.expiresAt <= now) return "expired";
  return offer.status;
}
