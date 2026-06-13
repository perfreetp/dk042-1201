import { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  MinusCircle,
  AlertTriangle,
  Calendar,
  User,
  Download,
} from 'lucide-react';
import {
  useRectificationStore,
  RectificationBatch,
  RectificationRecord,
} from '@/store/useRectificationStore';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/utils/export';
import { useNavigate } from 'react-router-dom';

interface RectificationLedgerProps {
  standardId?: string;
  systemName?: string;
  compact?: boolean;
}

export function RectificationLedger({
  standardId,
  systemName,
  compact = false,
}: RectificationLedgerProps) {
  const navigate = useNavigate();
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  const { getBatchesByStandard, getBatchesBySystem, getLatestBatches } = useRectificationStore();

  let batches: RectificationBatch[];
  if (standardId) {
    batches = getBatchesByStandard(standardId);
  } else if (systemName) {
    batches = getBatchesBySystem(systemName);
  } else {
    batches = getLatestBatches(20);
  }

  const toggleBatch = (batchId: string) => {
    setExpandedBatches((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  };

  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    success: {
      label: '已确认',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle,
    },
    failed: {
      label: '失败',
      className: 'bg-red-50 text-red-700 border-red-200',
      icon: X,
    },
    skipped: {
      label: '跳过',
      className: 'bg-gray-50 text-gray-600 border-gray-200',
      icon: MinusCircle,
    },
  };

  const exportBatchToCSV = (batch: RectificationBatch) => {
    const header = '字段名,系统,表,目标标准,状态,相似度,备注,处理时间';
    const rows = batch.records.map((r: RectificationRecord) =>
      [
        r.fieldName,
        r.systemName || '',
        r.tableName || '',
        r.standardName,
        statusConfig[r.status]?.label || r.status,
        r.similarity ? `${(r.similarity * 100).toFixed(0)}%` : '',
        r.remark || '',
        formatDateTime(r.processedAt),
      ]
        .map((s) => `"${s}"`)
        .join(',')
    );
    const csv = [header, ...rows].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `整改台账_${batch.name}_${batch.createdAt.slice(0, 10)}.csv`;
    link.click();
  };

  if (batches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">暂无整改记录</p>
        <p className="text-xs text-gray-400 mt-1">
          在映射管理中执行批量确认映射后会自动生成台账
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {batches.map((batch) => {
        const isExpanded = expandedBatches.has(batch.id);
        return (
          <div
            key={batch.id}
            className="bg-white border border-gray-100 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleBatch(batch.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 truncate">
                    {batch.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(batch.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {batch.createdBy}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                    成功 {batch.successCount}
                  </span>
                  {batch.skippedCount > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      跳过 {batch.skippedCount}
                    </span>
                  )}
                  {batch.failedCount > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full">
                      失败 {batch.failedCount}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    共 {batch.totalCount} 条
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportBatchToCSV(batch);
                  }}
                  className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                  title="导出CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                <div className="space-y-2">
                  {batch.records.map((record, idx) => {
                    const cfg = statusConfig[record.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100"
                      >
                        <StatusIcon
                          className={cn(
                            'w-4 h-4 flex-shrink-0',
                            cfg.className.includes('emerald') && 'text-emerald-500',
                            cfg.className.includes('red') && 'text-red-500',
                            cfg.className.includes('gray') && 'text-gray-400'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm text-gray-700">
                              {record.fieldName}
                            </span>
                            <span className="text-xs text-gray-400">→</span>
                            <button
                              onClick={() => navigate(`/standard/${record.standardId}`)}
                              className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
                            >
                              {record.standardName}
                            </button>
                            {record.similarity && (
                              <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                相似度 {(record.similarity * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            {record.systemName && <span>{record.systemName}</span>}
                            {record.tableName && (
                              <>
                                <span>·</span>
                                <span>{record.tableName}</span>
                              </>
                            )}
                            {record.remark && (
                              <>
                                <span className="flex items-center gap-1 ml-1 text-amber-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  {record.remark}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full border',
                            cfg.className
                          )}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
