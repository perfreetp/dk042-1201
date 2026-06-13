import { DataStandard } from '@/types';

export function exportStandardsToCSV(standards: DataStandard[]): void {
  const headers = [
    '标准ID',
    '中文名',
    '英文名',
    '业务主题',
    '数据类型',
    '长度',
    '精度',
    '默认值',
    '状态',
    '描述',
    '允许值',
    '创建人',
    '创建时间',
  ];

  const rows = standards.map((s) => [
    s.id,
    s.nameCn,
    s.nameEn,
    s.businessTopic,
    s.dataType,
    s.length,
    s.precision,
    s.defaultValue,
    getStatusLabel(s.status),
    s.description.replace(/\n/g, ' '),
    s.allowedValues.map((v) => `${v.value}:${v.label}`).join('; '),
    s.createdBy,
    s.createdAt,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `数据标准字典_${formatDate(new Date())}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    published: '已发布',
    deprecated: '已停用',
  };
  return map[status] || status;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
