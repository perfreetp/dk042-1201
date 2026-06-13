import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FieldMapping, MappingStatus } from '@/types';
import { fieldMappings as initialMappings } from '@/data/mappings';

interface MappingStore {
  mappings: FieldMapping[];

  getMappingsByStandard: (standardId: string) => FieldMapping[];
  getMappingsBySystem: (systemName: string) => FieldMapping[];
  getMappingsByStatus: (status: MappingStatus) => FieldMapping[];
  confirmMapping: (mappingId: string, standardId: string, standardName: string) => void;
  unlinkMapping: (mappingId: string) => void;
  addMapping: (mapping: FieldMapping) => void;
  removeMapping: (mappingId: string) => void;
  searchMappings: (keyword: string) => FieldMapping[];
  getStatistics: () => {
    total: number;
    mapped: number;
    conflict: number;
    unmapped: number;
  };
  getUnmappedAndConflictMappings: () => FieldMapping[];
}

export const useMappingStore = create<MappingStore>()(
  persist(
    (set, get) => ({
      mappings: initialMappings,

      getMappingsByStandard: (standardId) => {
        return get().mappings.filter((m) => m.standardId === standardId);
      },

      getMappingsBySystem: (systemName) => {
        return get().mappings.filter((m) => m.systemName === systemName);
      },

      getMappingsByStatus: (status) => {
        return get().mappings.filter((m) => m.mappingStatus === status);
      },

      confirmMapping: (mappingId, standardId, standardName) => {
        set((state) => ({
          mappings: state.mappings.map((m) =>
            m.id === mappingId
              ? {
                  ...m,
                  standardId,
                  suggestedStandardId: undefined,
                  suggestedStandardName: undefined,
                  similarity: undefined,
                  conflictType: null,
                  mappingStatus: 'mapped' as MappingStatus,
                }
              : m
          ),
        }));
      },

      unlinkMapping: (mappingId) => {
        set((state) => ({
          mappings: state.mappings.map((m) =>
            m.id === mappingId
              ? {
                  ...m,
                  standardId: null,
                  mappingStatus: 'unmapped' as MappingStatus,
                  conflictType: null,
                }
              : m
          ),
        }));
      },

      addMapping: (mapping) => {
        set((state) => ({
          mappings: [mapping, ...state.mappings],
        }));
      },

      removeMapping: (mappingId) => {
        set((state) => ({
          mappings: state.mappings.filter((m) => m.id !== mappingId),
        }));
      },

      searchMappings: (keyword) => {
        const kw = keyword.toLowerCase();
        return get().mappings.filter(
          (m) =>
            m.fieldName.toLowerCase().includes(kw) ||
            m.tableName.toLowerCase().includes(kw) ||
            m.systemName.toLowerCase().includes(kw) ||
            m.suggestedStandardName?.toLowerCase().includes(kw)
        );
      },

      getStatistics: () => {
        const { mappings } = get();
        return {
          total: mappings.length,
          mapped: mappings.filter((m) => m.mappingStatus === 'mapped').length,
          conflict: mappings.filter((m) => m.mappingStatus === 'conflict').length,
          unmapped: mappings.filter((m) => m.mappingStatus === 'unmapped').length,
        };
      },

      getUnmappedAndConflictMappings: () => {
        return get().mappings.filter((m) => m.mappingStatus !== 'mapped');
      },
    }),
    {
      name: 'data-dict-mappings-storage',
    }
  )
);
