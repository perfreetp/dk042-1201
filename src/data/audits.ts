import { AuditRecord, Reference } from '@/types';

export const auditRecords: AuditRecord[] = [
  {
    id: 'ar1',
    standardId: 's001',
    action: 'submit',
    comment: '首次提交客户编号标准，请审核。',
    operator: '张三',
    operateTime: '2024-01-10 10:00:00',
  },
  {
    id: 'ar2',
    standardId: 's001',
    action: 'approve',
    comment: '审核通过，命名规范，格式正确。',
    operator: '审核员王',
    operateTime: '2024-01-11 14:00:00',
  },
  {
    id: 'ar3',
    standardId: 's001',
    action: 'publish',
    comment: '标准已正式发布。',
    operator: '审核员王',
    operateTime: '2024-01-11 14:30:00',
  },
  {
    id: 'ar4',
    standardId: 's003',
    action: 'submit',
    comment: '新增客户性别枚举标准。',
    operator: '李四',
    operateTime: '2024-01-12 11:30:00',
  },
  {
    id: 'ar5',
    standardId: 's003',
    action: 'reject',
    comment: '缺少"其他"选项，建议补充。',
    operator: '审核员李',
    operateTime: '2024-02-15 10:00:00',
  },
  {
    id: 'ar6',
    standardId: 's003',
    action: 'submit',
    comment: '已补充"其他"选项，重新提交审核。',
    operator: '李四',
    operateTime: '2024-02-28 16:00:00',
  },
  {
    id: 'ar7',
    standardId: 's003',
    action: 'approve',
    comment: '审核通过。',
    operator: '审核员李',
    operateTime: '2024-03-01 09:30:00',
  },
  {
    id: 'ar8',
    standardId: 's003',
    action: 'publish',
    comment: '发布标准。',
    operator: '审核员李',
    operateTime: '2024-03-01 10:00:00',
  },
  {
    id: 'ar9',
    standardId: 's009',
    action: 'submit',
    comment: '新增产品编号标准，包含SKU编码规则说明。',
    operator: '赵六',
    operateTime: '2024-06-10 14:30:00',
  },
  {
    id: 'ar10',
    standardId: 's010',
    action: 'submit',
    comment: '新增产品名称标准。',
    operator: '赵六',
    operateTime: '2024-06-10 15:00:00',
  },
  {
    id: 'ar11',
    standardId: 's014',
    action: 'publish',
    comment: '初始发布。',
    operator: '王五',
    operateTime: '2024-01-22 10:00:00',
  },
  {
    id: 'ar12',
    standardId: 's014',
    action: 'deprecate',
    comment: '标准已停用，建议使用 gmt_create 替代。',
    operator: '审核员王',
    operateTime: '2024-05-10 09:00:00',
  },
];

export function getAuditRecordsByStandard(standardId: string): AuditRecord[] {
  return auditRecords
    .filter((r) => r.standardId === standardId)
    .sort((a, b) => new Date(b.operateTime).getTime() - new Date(a.operateTime).getTime());
}

export function getPendingAuditStandards(): string[] {
  return ['s009', 's010'];
}
