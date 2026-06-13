import { create } from 'zustand';
import { DataStandard, StandardStatus } from '@/types';
import { standards as initialStandards } from '@/data/standards';

interface StandardStore {
  standards: DataStandard[];
  selectedTopicId: string | null;
  searchKeyword: string;
  statusFilter: StandardStatus | 'all';

  setSelectedTopicId: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setStatusFilter: (status: StandardStatus | 'all') => void;
  addStandard: (standard: DataStandard) => void;
  updateStandard: (id: string, updates: Partial<DataStandard>) => void;
  deleteStandard: (id: string) => void;
  getFilteredStandards: () => DataStandard[];
  getStandardById: (id: string) => DataStandard | undefined;
  submitForAudit: (id: string) => void;
  approveStandard: (id: string) => void;
  rejectStandard: (id: string) => void;
  publishStandard: (id: string) => void;
  deprecateStandard: (id: string) => void;
  getStatistics: () => {
    total: number;
    published: number;
    pending: number;
    draft: number;
    deprecated: number;
  };
}

export const useStandardStore = create<StandardStore>((set, get) => ({
  standards: initialStandards,
  selectedTopicId: null,
  searchKeyword: '',
  statusFilter: 'all',

  setSelectedTopicId: (id) => set({ selectedTopicId: id }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  addStandard: (standard) =>
    set((state) => ({ standards: [standard, ...state.standards] })),

  updateStandard: (id, updates) =>
    set((state) => ({
      standards: state.standards.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    })),

  deleteStandard: (id) =>
    set((state) => ({
      standards: state.standards.filter((s) => s.id !== id),
    })),

  getFilteredStandards: () => {
    const { standards, selectedTopicId, searchKeyword, statusFilter } = get();
    return standards.filter((s) => {
      if (selectedTopicId && s.businessTopicId !== selectedTopicId) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        return (
          s.nameCn.toLowerCase().includes(keyword) ||
          s.nameEn.toLowerCase().includes(keyword) ||
          s.description.toLowerCase().includes(keyword)
        );
      }
      return true;
    });
  },

  getStandardById: (id) => {
    return get().standards.find((s) => s.id === id);
  },

  submitForAudit: (id) =>
    set((state) => ({
      standards: state.standards.map((s) =>
        s.id === id
          ? { ...s, status: 'pending' as StandardStatus, updatedAt: new Date().toISOString() }
          : s
      ),
    })),

  approveStandard: (id) =>
    set((state) => ({
      standards: state.standards.map((s) =>
        s.id === id
          ? { ...s, status: 'published' as StandardStatus, updatedAt: new Date().toISOString() }
          : s
      ),
    })),

  rejectStandard: (id) =>
    set((state) => ({
      standards: state.standards.map((s) =>
        s.id === id
          ? { ...s, status: 'draft' as StandardStatus, updatedAt: new Date().toISOString() }
          : s
      ),
    })),

  publishStandard: (id) =>
    set((state) => ({
      standards: state.standards.map((s) =>
        s.id === id
          ? { ...s, status: 'published' as StandardStatus, updatedAt: new Date().toISOString() }
          : s
      ),
    })),

  deprecateStandard: (id) =>
    set((state) => ({
      standards: state.standards.map((s) =>
        s.id === id
          ? { ...s, status: 'deprecated' as StandardStatus, updatedAt: new Date().toISOString() }
          : s
      ),
    })),

  getStatistics: () => {
    const { standards } = get();
    return {
      total: standards.length,
      published: standards.filter((s) => s.status === 'published').length,
      pending: standards.filter((s) => s.status === 'pending').length,
      draft: standards.filter((s) => s.status === 'draft').length,
      deprecated: standards.filter((s) => s.status === 'deprecated').length,
    };
  },
}));
