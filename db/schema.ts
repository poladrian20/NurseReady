import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const study = sqliteTable('study', { user: text('user').primaryKey(), data: text('data').notNull() });
export const files = sqliteTable('files', { id: text('id').primaryKey(), user: text('user').notNull(), name: text('name').notNull(), mime: text('mime').notNull() });

export const spaces = sqliteTable('spaces', { hash: text('hash').primaryKey(), user: text('user').notNull() });
