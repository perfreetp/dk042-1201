import { Reference } from '@/types';

export const references: Reference[] = [
  { id: 'r1', standardId: 's001', systemName: 'CRM系统', tableName: 'crm_customer', fieldName: 'cust_id', usageCount: 156, lastUsed: '2024-06-12 10:30:00' },
  { id: 'r2', standardId: 's001', systemName: '电商平台', tableName: 'ord_order', fieldName: 'buyer_id', usageCount: 89, lastUsed: '2024-06-13 14:20:00' },
  { id: 'r3', standardId: 's001', systemName: 'ERP系统', tableName: 'inv_customer', fieldName: 'cust_code', usageCount: 45, lastUsed: '2024-06-10 09:15:00' },
  { id: 'r4', standardId: 's002', systemName: 'CRM系统', tableName: 'crm_customer', fieldName: 'cust_name', usageCount: 210, lastUsed: '2024-06-13 16:00:00' },
  { id: 'r5', standardId: 's002', systemName: '电商平台', tableName: 'user_address', fieldName: 'consignee', usageCount: 78, lastUsed: '2024-06-12 11:30:00' },
  { id: 'r6', standardId: 's003', systemName: 'CRM系统', tableName: 'crm_customer', fieldName: 'gender', usageCount: 134, lastUsed: '2024-06-11 08:45:00' },
  { id: 'r7', standardId: 's004', systemName: 'CRM系统', tableName: 'crm_customer', fieldName: 'cust_type', usageCount: 98, lastUsed: '2024-06-12 15:00:00' },
  { id: 'r8', standardId: 's005', systemName: 'CRM系统', tableName: 'crm_customer', fieldName: 'mobile', usageCount: 167, lastUsed: '2024-06-13 10:00:00' },
  { id: 'r9', standardId: 's005', systemName: '电商平台', tableName: 'user_info', fieldName: 'phone', usageCount: 203, lastUsed: '2024-06-13 17:30:00' },
  { id: 'r10', standardId: 's006', systemName: '电商平台', tableName: 'ord_order', fieldName: 'order_no', usageCount: 345, lastUsed: '2024-06-13 18:00:00' },
  { id: 'r11', standardId: 's006', systemName: 'ERP系统', tableName: 'sale_order', fieldName: 'order_code', usageCount: 156, lastUsed: '2024-06-12 14:00:00' },
  { id: 'r12', standardId: 's007', systemName: '电商平台', tableName: 'ord_order', fieldName: 'order_status', usageCount: 289, lastUsed: '2024-06-13 16:45:00' },
  { id: 'r13', standardId: 's008', systemName: '电商平台', tableName: 'ord_order', fieldName: 'pay_amount', usageCount: 312, lastUsed: '2024-06-13 17:00:00' },
  { id: 'r14', standardId: 's008', systemName: '财务系统', tableName: 'fin_receivable', fieldName: 'amount', usageCount: 87, lastUsed: '2024-06-11 11:30:00' },
  { id: 'r15', standardId: 's013', systemName: '财务系统', tableName: 'fin_transaction', fieldName: 'currency_code', usageCount: 234, lastUsed: '2024-06-13 12:00:00' },
  { id: 'r16', standardId: 's013', systemName: '电商平台', tableName: 'ord_order', fieldName: 'currency', usageCount: 178, lastUsed: '2024-06-12 09:30:00' },
  { id: 'r17', standardId: 's015', systemName: '电商平台', tableName: 'ord_order', fieldName: 'deleted', usageCount: 156, lastUsed: '2024-06-10 16:00:00' },
  { id: 'r18', standardId: 's015', systemName: 'CRM系统', tableName: 'crm_customer', fieldName: 'is_del', usageCount: 89, lastUsed: '2024-06-11 10:15:00' },
];

export function getReferencesByStandard(standardId: string): Reference[] {
  return references.filter((r) => r.standardId === standardId);
}

export function getReferenceCountByStandard(standardId: string): number {
  return references
    .filter((r) => r.standardId === standardId)
    .reduce((sum, r) => sum + r.usageCount, 0);
}

export function getReferenceCountBySystem(systemName: string): number {
  return references
    .filter((r) => r.systemName === systemName)
    .reduce((sum, r) => sum + r.usageCount, 0);
}

export function getAllSystems(): string[] {
  return [...new Set(references.map((r) => r.systemName))];
}
