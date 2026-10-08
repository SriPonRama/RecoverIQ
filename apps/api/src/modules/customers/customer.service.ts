import { db } from "../../prisma/db.js";
import type { CreateCustomerInput, UpdateCustomerInput } from "./customer.schemas.js";
import { logActivity } from "../audit/audit.service.js";

export async function createCustomer(merchantId: number, data: CreateCustomerInput) {
  const customer = await db.orm.public.Customer.create({
    merchantId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    externalCustomerId: data.externalCustomerId || null,
    status: data.status || "ACTIVE",
    segmentId: data.segmentId || null,
  });

  await logActivity({
    merchantId,
    actorType: "MERCHANT_API",
    eventType: "CUSTOMER_CREATED",
    entityType: "CUSTOMER",
    entityId: customer.id,
    description: `Customer ${customer.name} created`,
  });

  return customer;
}

export async function getCustomers(merchantId: number, filters: { status?: string; email?: string; segmentId?: number }) {
  const query: any = { merchantId };
  if (filters.status) query.status = filters.status;
  if (filters.email) query.email = filters.email;
  if (filters.segmentId !== undefined) query.segmentId = filters.segmentId;

  const customers = await db.orm.public.Customer.where(query).all();
  if (!customers || customers.length === 0) return [];

  // Batch fetch related data to avoid N+1 queries
  const allOrders = await db.orm.public.Order.where({ merchantId }).all() || [];
  const allPayments = await db.orm.public.Payment.where({ merchantId }).all() || [];
  const allRiskCases = await db.orm.public.RiskCase.where({ merchantId }).all() || [];
  const allRecoveryActions = await db.orm.public.RecoveryAction.where({}).all() || [];
  const allOutcomes = await db.orm.public.RecoveryOutcome.where({}).all() || [];
  const allSegments = await db.orm.public.CustomerSegment.where({ merchantId }).all() || [];

  const riskCaseIds = allRiskCases.map(rc => rc.id);
  const merchantRecoveryActions = allRecoveryActions.filter(a => riskCaseIds.includes(a.riskCaseId));
  const actionIds = merchantRecoveryActions.map(a => a.id);
  const merchantOutcomes = allOutcomes.filter(o => actionIds.includes(o.recoveryActionId));

  return customers.map(customer => {
    const orders = allOrders.filter(o => o.customerId === customer.id);
    const payments = allPayments.filter(p => p.customerId === customer.id);
    
    const failedPaymentsCount = payments.filter(p => p.status === "FAILED").length;
    
    const riskCases = allRiskCases.filter(rc => payments.find(p => p.id === rc.paymentId));
    
    let recoveredAmount = 0;
    for (const rc of riskCases) {
      const actions = merchantRecoveryActions.filter(a => a.riskCaseId === rc.id);
      for (const action of actions) {
        const outcomes = merchantOutcomes.filter(o => o.recoveryActionId === action.id && o.outcomeType === "RECOVERED");
        recoveredAmount += outcomes.reduce((sum, o) => sum + o.recoveredAmount, 0);
      }
    }
    
    const amountAtRisk = riskCases.reduce((sum, rc) => sum + rc.amountAtRisk, 0);
    const recoveryRate = amountAtRisk > 0 ? (recoveredAmount / amountAtRisk) * 100 : 0;
    
    const dates = [
      (customer as any).createdAt?.epochMilliseconds,
      ...orders.map(o => (o as any).createdAt?.epochMilliseconds),
      ...payments.map(p => (p as any).createdAt?.epochMilliseconds),
    ].filter(Boolean) as number[];
    
    let lastActivityDate = null;
    if (dates.length > 0) {
       lastActivityDate = new Date(Math.max(...dates)).toISOString();
    }
    
    let segmentName = "Unsegmented";
    if (customer.segmentId) {
      const seg = allSegments.find(s => s.id === customer.segmentId);
      if (seg) segmentName = seg.name;
    }
    
    return {
      ...customer,
      ordersCount: orders.length,
      paymentsCount: payments.length,
      failedPayments: failedPaymentsCount,
      recoveredAmount,
      recoveryRate,
      lastActivityDate,
      segmentName
    };
  });
}

export async function getCustomerById(merchantId: number, id: number) {
  const customer = await db.orm.public.Customer.where({ merchantId, id }).first();
  return customer;
}

export async function getCustomerIntelligence(merchantId: number, id: number) {
  const customer = await getCustomerById(merchantId, id);
  if (!customer) return null;

  const orders = await db.orm.public.Order.where({ merchantId, customerId: id }).all() || [];
  const payments = await db.orm.public.Payment.where({ merchantId, customerId: id }).all() || [];
  
  const paymentIds = payments.map(p => p.id);
  const allRiskCases = await db.orm.public.RiskCase.where({ merchantId }).all() || [];
  const riskCases = allRiskCases.filter(rc => paymentIds.includes(rc.paymentId));
  
  const allRecoveryActions = await db.orm.public.RecoveryAction.where({}).all() || [];
  const allOutcomes = await db.orm.public.RecoveryOutcome.where({}).all() || [];
  
  const riskCaseIds = riskCases.map(rc => rc.id);
  const recoveryActions = allRecoveryActions.filter(a => riskCaseIds.includes(a.riskCaseId));
  const actionIds = recoveryActions.map(a => a.id);
  const recoveryOutcomes = allOutcomes.filter(o => actionIds.includes(o.recoveryActionId));

  const failedPayments = payments.filter(p => p.status === "FAILED");
  const successfulPayments = payments.filter(p => p.status === "CAPTURED" || p.status === "SUCCESSFUL");
  
  let recoveredAmount = 0;
  const recoveryActivity = [];

  for (const rc of riskCases) {
    const actions = recoveryActions.filter(a => a.riskCaseId === rc.id);
    for (const action of actions) {
      const outcomes = recoveryOutcomes.filter(o => o.recoveryActionId === action.id);
      for (const outcome of outcomes) {
        if (outcome.outcomeType === "RECOVERED") {
          recoveredAmount += outcome.recoveredAmount;
        }
        
        recoveryActivity.push({
          id: String(outcome.id),
          type: action.actionType,
          date: outcome.occurredAt?.toString() || new Date().toISOString(),
          description: `Action resulted in ${outcome.outcomeType}`,
          status: outcome.status,
          amount: outcome.recoveredAmount
        });
      }
    }
  }

  const amountAtRisk = riskCases.reduce((sum, rc) => sum + rc.amountAtRisk, 0);
  const recoveryRate = amountAtRisk > 0 ? (recoveredAmount / amountAtRisk) * 100 : 0;

  let segmentName = "Unsegmented";
  if (customer.segmentId) {
    const seg = await db.orm.public.CustomerSegment.where({ merchantId, id: customer.segmentId }).first();
    if (seg) segmentName = seg.name;
  }

  return {
    ...customer,
    segmentName,
    ordersCount: orders.length,
    paymentsCount: payments.length,
    failedPayments: failedPayments.length,
    successfulPayments: successfulPayments.length,
    totalSpent: successfulPayments.reduce((sum, p) => sum + p.amount, 0),
    recoveredAmount,
    amountAtRisk,
    recoveryRate,
    recentPayments: payments.sort((a, b) => ((b as any).createdAt?.epochMilliseconds || 0) - ((a as any).createdAt?.epochMilliseconds || 0)).slice(0, 10).map(p => ({
      id: String(p.id),
      date: (p as any).createdAt?.toString() || new Date().toISOString(),
      amount: p.amount,
      method: p.method || "Unknown",
      status: p.status
    })),
    recoveryActivity: recoveryActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };
}

export async function updateCustomer(merchantId: number, id: number, data: UpdateCustomerInput) {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.externalCustomerId !== undefined) updateData.externalCustomerId = data.externalCustomerId || null;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.segmentId !== undefined) updateData.segmentId = data.segmentId || null;

  await db.orm.public.Customer.where({ merchantId, id }).update(updateData);
  
  return getCustomerById(merchantId, id);
}

export async function deleteCustomer(merchantId: number, id: number) {
  await db.orm.public.Customer.where({ merchantId, id }).delete();
}
