import { db } from "../db";
import { auditLogs, type NewAuditLog } from "../db/schema/audit_logs";
import { requireAdmin } from "../auth/session";
import { headers } from "next/headers";

export async function logAdminAction(
  action: NewAuditLog["action"],
  entity: NewAuditLog["entity"],
  entityId: string,
  details?: string
) {
  try {
    const session = await requireAdmin();

    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for") || "unknown";
    const userAgent = headerList.get("user-agent") || "unknown";

    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action,
      entity,
      entityId,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
