import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  custom_domain: text("custom_domain"),
  primary_color: text("primary_color").notNull(),
  logo_url: text("logo_url"),
  font_family: text("font_family"),
  border_radius: integer("border_radius").notNull().default(8),
});

export const shows = sqliteTable("shows", {
  id: text("id").primaryKey(),
  tenant_id: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  cover_image: text("cover_image"),
  author: text("author"),
  created_at: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const episodes = sqliteTable("episodes", {
  id: text("id").primaryKey(),
  show_id: text("show_id")
    .notNull()
    .references(() => shows.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  audio_url: text("audio_url").notNull(),
  duration_seconds: integer("duration_seconds").notNull(),
  published_at: integer("published_at", { mode: "timestamp" }),
  created_at: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  tenant_id: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  created_at: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const userProgress = sqliteTable("user_progress", {
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  episode_id: text("episode_id")
    .notNull()
    .references(() => episodes.id, { onDelete: "cascade" }),
  current_time: integer("current_time").notNull().default(0),
  is_completed: integer("is_completed", { mode: "boolean" }).notNull().default(false),
  updated_at: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.user_id, table.episode_id] }),
}));

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  shows: many(shows),
  users: many(users),
}));

export const showsRelations = relations(shows, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [shows.tenant_id],
    references: [tenants.id],
  }),
  episodes: many(episodes),
}));

export const episodesRelations = relations(episodes, ({ one, many }) => ({
  show: one(shows, {
    fields: [episodes.show_id],
    references: [shows.id],
  }),
  userProgress: many(userProgress),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenant_id],
    references: [tenants.id],
  }),
  progress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.user_id],
    references: [users.id],
  }),
  episode: one(episodes, {
    fields: [userProgress.episode_id],
    references: [episodes.id],
  }),
}));
