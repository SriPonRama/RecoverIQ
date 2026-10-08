import { db } from "../../prisma/db.js";

export interface LogActivityParams {
  merchantId: number;
  actorType: "USER" | "SYSTEM" | "MERCHANT_API" | "WEBHOOK";
  actorId?: number;
  eventType: string;
  entityType: string;
  entityId?: number;
  description?: string;
  metadata?: any;
}

export async function logActivity(params: LogActivityParams) {
  try {
    return await db.orm.public.AuditLog.create({
      merchantId: params.merchantId,
      actorType: params.actorType,
      actorId: params.actorId || null,
      eventType: params.eventType,
      entityType: params.entityType,
      entityId: params.entityId || null,
      description: params.description || null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - audit logging should not break the main business flow
  }
}

export async function getActivityLogs(
  merchantId: number,
  filters: { eventType?: string; entityType?: string; actorType?: string },
  pagination: { page: number; limit: number }
) {
  const dbQuery: any = { merchantId };
  if (filters.eventType) dbQuery.eventType = filters.eventType;
  if (filters.entityType) dbQuery.entityType = filters.entityType;
  if (filters.actorType) dbQuery.actorType = filters.actorType;

  let query: any = db.orm.public.AuditLog.where(dbQuery);

  if (typeof query.orderBy === "function") {
    try {
      query = query.orderBy((r: any) => r.createdAt.desc());
    } catch(e) {}
  }

  const offset = (pagination.page - 1) * pagination.limit;
  let rawLogs: any[] = [];
  
  if (typeof query.limit === "function" && typeof query.offset === "function") {
    rawLogs = await query.limit(pagination.limit).offset(offset).all() || [];
  } else {
    // Ultimate fallback if contract API changes or lacks support
    const allLogs = await query.all() || [];
    allLogs.sort((a: any, b: any) => {
      const timeA = a.createdAt?.epochMilliseconds || 0;
      const timeB = b.createdAt?.epochMilliseconds || 0;
      return timeB - timeA;
    });
    rawLogs = allLogs.slice(offset, offset + pagination.limit);
  }

  // We should also attach actor info (User) if actorType is USER
  const enrichedData = await Promise.all(rawLogs.map(async (log) => {
    let actorEmail = null;
    let actorName = null;
    
    if (log.actorType === "USER" && log.actorId) {
      const user = await db.orm.public.User.where({ id: log.actorId }).first();
      if (user) {
        actorEmail = user.email;
        actorName = user.name;
      }
    }
    
    let parsedMetadata = null;
    try {
      if (log.metadata) {
        parsedMetadata = JSON.parse(log.metadata as string);
      }
    } catch(e) {}
    
    return {
      id: log.id,
      merchantId: log.merchantId,
      actorType: log.actorType,
      actorId: log.actorId,
      actorName,
      actorEmail,
      eventType: log.eventType,
      entityType: log.entityType,
      entityId: log.entityId,
      description: log.description,
      metadata: parsedMetadata,
      createdAt: (log as any).createdAt?.epochMilliseconds ? new Date((log as any).createdAt.epochMilliseconds).toISOString() : new Date().toISOString(),
    };
  }));

  // NOTE: Prisma 8 Contract API does not support bounded count() outside of include callbacks.
  // Instead of an unbounded .all() load just to count, we use "has next page" heuristics
  const hasMore = rawLogs.length === pagination.limit;
  
  return {
    data: enrichedData,
    total: offset + rawLogs.length + (hasMore ? 1 : 0), // simulated
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.page + (hasMore ? 1 : 0),
  };
}
