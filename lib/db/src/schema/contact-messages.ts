import { createInsertSchema } from "drizzle-zod";
import { timestamp, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const contactMessagesTable = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  projectType: varchar("project_type", { length: 64 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(
  contactMessagesTable,
).omit({ id: true, createdAt: true });

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessagesTable.$inferSelect;
