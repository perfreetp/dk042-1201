import { StandardStatus, MappingStatus, AuditAction } from '@/types';
import { cn } from '@/lib/utils';

interface StatusTagProps {
  status: StandardStatus;
}

const statusConfig: Record<StandardStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  pending: { label: '待审核', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  published: { label: '已发布', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  deprecated: { label: '已停用', className: 'bg-red-50 text-red-600 border-red-200' },
};

export function StatusTag({ status }: StatusTagProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border',
        config.className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', {
        'bg-gray-400': status === 'draft',
        'bg-amber-500': status === 'pending',
        'bg-emerald-500': status === 'published',
        'bg-red-500': status === 'deprecated',
      })} />
      {config.label}
    </span>
  );
}

interface MappingStatusTagProps {
  status: MappingStatus;
}

const mappingStatusConfig: Record<MappingStatus, { label: string; className: string }> = {
  mapped: { label: '已映射', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  unmapped: { label: '未映射', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  conflict: { label: '冲突', className: 'bg-red-50 text-red-600 border-red-200' },
};

export function MappingStatusTag({ status }: MappingStatusTagProps) {
  const config = mappingStatusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

interface AuditActionTagProps {
  action: AuditAction;
}

const auditActionConfig: Record<AuditAction, { label: string; className: string }> = {
  submit: { label: '提交审核', className: 'text-blue-600' },
  approve: { label: '审核通过', className: 'text-emerald-600' },
  reject: { label: '审核驳回', className: 'text-red-600' },
  publish: { label: '发布', className: 'text-emerald-600' },
  deprecate: { label: '停用', className: 'text-gray-600' },
};

export function AuditActionTag({ action }: AuditActionTagProps) {
  const config = auditActionConfig[action];
  return (
    <span className={cn('font-medium', config.className)}>
      {config.label}
    </span>
  );
}
