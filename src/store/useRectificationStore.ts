import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RectificationStatus = 'success' | 'failed' | 'skipped';

export interface RectificationRecord {
  id: string;
  batchId: string;
  fieldName: string;
  tableName?: string;
  systemName?: string;
  standardId: string;
  standardName: string;
  status: RectificationStatus;
  remark?: string;
  similarity?: number;
  processedAt: string;
  processedBy: string;
}

export interface RectificationBatch {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  records: RectificationRecord[];
}

interface RectificationStore {
  batches: RectificationBatch[];

  addBatch: (batch: Omit<RectificationBatch, 'id' | 'createdAt' | 'createdBy'>) => string;
  getBatchesByStandard: (standardId: string) => RectificationBatch[];
  getBatchesBySystem: (systemName: string) => RectificationBatch[];
  getRecordsByStandard: (standardId: string) => RectificationRecord[];
  getRecordsBySystem: (systemName: string) => RectificationRecord[];
  getAllRecords: () => RectificationRecord[];
  getLatestBatches: (limit?: number) => RectificationBatch[];
  getStatistics: () => {
    totalBatches: number;
    totalRecords: number;
    successCount: number;
    failedCount: number;
    skippedCount: number;
  };
}

export const useRectificationStore = create<RectificationStore>()(
  persist(
    (set, get) => ({
      batches: [],

      addBatch: (batchData) => {
        const batchId = 'batch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        const now = new Date().toISOString();

        const newBatch: RectificationBatch = {
          id: batchId,
          createdAt: now,
          createdBy: '当前用户',
          ...batchData,
        };

        set((state) => ({
          batches: [newBatch, ...state.batches],
        }));

        return batchId;
      },

      getBatchesByStandard: (standardId) => {
        return get().batches.filter((b) =>
          b.records.some((r) => r.standardId === standardId)
        );
      },

      getBatchesBySystem: (systemName) => {
        return get().batches.filter((b) =>
          b.records.some((r) => r.systemName === systemName)
        );
      },

      getRecordsByStandard: (standardId) => {
        const records: RectificationRecord[] = [];
        get().batches.forEach((b) => {
          b.records.forEach((r) => {
            if (r.standardId === standardId) {
              records.push(r);
            }
          });
        });
        return records.sort(
          (a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
        );
      },

      getRecordsBySystem: (systemName) => {
        const records: RectificationRecord[] = [];
        get().batches.forEach((b) => {
          b.records.forEach((r) => {
            if (r.systemName === systemName) {
              records.push(r);
            }
          });
        });
        return records.sort(
          (a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
        );
      },

      getAllRecords: () => {
        const records: RectificationRecord[] = [];
        get().batches.forEach((b) => {
          records.push(...b.records);
        });
        return records.sort(
          (a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
        );
      },

      getLatestBatches: (limit = 10) => {
        return [...get().batches]
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, limit);
      },

      getStatistics: () => {
        const allRecords = get().getAllRecords();
        return {
          totalBatches: get().batches.length,
          totalRecords: allRecords.length,
          successCount: allRecords.filter((r) => r.status === 'success').length,
          failedCount: allRecords.filter((r) => r.status === 'failed').length,
          skippedCount: allRecords.filter((r) => r.status === 'skipped').length,
        };
      },
    }),
    {
      name: 'data-dict-rectification-storage',
    }
  )
);
