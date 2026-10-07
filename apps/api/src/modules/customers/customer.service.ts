import { db } from "../../prisma/db.js";
import type { CreateCustomerInput, UpdateCustomerInput } from "./customer.schemas.js";

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
  return customer;
}

export async function getCustomers(merchantId: number, filters: { status?: string; email?: string; segmentId?: number }) {
  const query: any = { merchantId };
  if (filters.status) query.status = filters.status;
  if (filters.email) query.email = filters.email;
  if (filters.segmentId !== undefined) query.segmentId = filters.segmentId;

  // Prisma Next uses `.all()`.
  const customers = await db.orm.public.Customer.where(query).all();
  return customers;
}

export async function getCustomerById(merchantId: number, id: number) {
  const customer = await db.orm.public.Customer.where({ merchantId, id }).first();
  return customer;
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
  
  // Fetch and return the updated customer
  return getCustomerById(merchantId, id);
}

export async function deleteCustomer(merchantId: number, id: number) {
  await db.orm.public.Customer.where({ merchantId, id }).delete();
}
