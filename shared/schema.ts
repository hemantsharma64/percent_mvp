import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal entries
export const journals = pgTable("journals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  content: text("content").notNull(),
  wordCount: integer("word_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Goals
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  duration: varchar("duration").notNull(), // "1month", "3months", "6months", "1year"
  category: varchar("category").notNull(),
  progress: integer("progress").default(0), // percentage
  status: varchar("status").default("active"), // "active", "completed", "paused"
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  relatedGoalId: varchar("related_goal_id").references(() => goals.id),
  completed: boolean("completed").default(false),
  timeEstimate: varchar("time_estimate"),
  priority: varchar("priority").default("medium"), // "high", "medium", "low"
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Dashboard content (daily quotes, focus areas)
export const dashboardContent = pgTable("dashboard_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  dailyQuote: text("daily_quote"),
  focusArea: varchar("focus_area"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  journals: many(journals),
  goals: many(goals),
  tasks: many(tasks),
  dashboardContent: many(dashboardContent),
}));

export const journalsRelations = relations(journals, ({ one }) => ({
  user: one(users, { fields: [journals.userId], references: [users.id] }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
  goal: one(goals, { fields: [tasks.relatedGoalId], references: [goals.id] }),
}));

export const dashboardContentRelations = relations(dashboardContent, ({ one }) => ({
  user: one(users, { fields: [dashboardContent.userId], references: [users.id] }),
}));

// Schemas and types
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJournalSchema = createInsertSchema(journals).omit({ id: true, createdAt: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, generatedAt: true });
export const insertDashboardContentSchema = createInsertSchema(dashboardContent).omit({ id: true, createdAt: true });

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertJournal = z.infer<typeof insertJournalSchema>;
export type Journal = typeof journals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertDashboardContent = z.infer<typeof insertDashboardContentSchema>;
export type DashboardContent = typeof dashboardContent.$inferSelect;
