import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  customerUserId: text("customer_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  subject: text("subject").notNull(),
  status: text("status", { enum: ["open", "closed"] }).notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [index("conversations_customer_idx").on(table.customerUserId), index("conversations_updated_idx").on(table.updatedAt)]);

export const conversationMessages = pgTable("conversation_messages", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("conversation_messages_thread_idx").on(table.conversationId)]);
