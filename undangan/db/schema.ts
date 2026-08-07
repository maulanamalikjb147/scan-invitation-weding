import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rsvps = sqliteTable("rsvps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  guests: integer("guests").notNull().default(1),
  attendance: text("attendance", { enum: ["hadir", "tidak"] }).notNull(),
  message: text("message").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
