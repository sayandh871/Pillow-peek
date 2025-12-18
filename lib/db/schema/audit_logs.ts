import { pgTable, text, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { relations } from 'drizzle-orm';

export const auditActionEnum = pgEnum('audit_action', ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'BULK_UPDATE', 'BULK_DELETE']);
export const auditEntityEnum = pgEnum('audit_entity', [
  'PRODUCT', 
  'ORDER', 
  'USER', 
  'CATEGORY', 
  'VARIANT',
  'REVIEW',
  'ACCOUNT',
  'ADDRESS',
  'PRODUCT_IMAGE',
  'ORDER_ITEM',
  'VERIFICATION',
  'SIZE',
  'FIRMNESS',
  'MATERIAL'
]);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').references(() => users.id, { onDelete: 'set null' }),
  action: auditActionEnum('action').notNull(),
  entity: auditEntityEnum('entity').notNull(),
  entityId: text('entity_id'), // ID of the affected entity (string because composite or uuid)
  details: text('details'), // JSON string or description of changes
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [auditLogs.adminId],
    references: [users.id],
  }),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
