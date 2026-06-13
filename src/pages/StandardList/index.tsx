import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  BookOpen,
  CheckCircle,
  Clock,
  FileX,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { useStandardStore } from '@/store/useStandardStore';
import { businessTopics } from '@/data/topics';
import { StatCard } from '@/components/StatCard';
import { TopicTree } from '@/components/TopicTree';
import { StatusTag } from '@/components/StatusTag';
import { exportStandardsToCSV } from '@/utils/export';
import { formatDateTime } from '@/utils/export';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { StandardStatus } from '@/types';

export function StandardListPage() {
  const navigate = useNavigate();
  const {
    selectedTopicId,
    setSelectedTopicId,
    searchKeyword,
    setSearchKeyword,
    statusFilter,
    setStatusFilter,
    getFilteredStandards,
    getStatistics,
    deleteStandard,
  } = useStandardStore();

  const stats = getStatistics();
  const filteredStandards = getFilteredStandards();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const statusOptions: { value: StandardStatus | 'all'; label: string }[] = [
    { value: 'all', label: '全部状态' },
    { value: 'draft', label: '草稿' },
    { value: 'pending', label: '待审核' },
    { value: 'published', label: '已发布' },
    { value: 'deprecated', label: '已停用' },
  ];

  const handleExport = () => {
    const standards = getFilteredStandards();
    exportStandardsToCSV(standards);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该标准吗？')) {
      deleteStandard(id);
    }
    setActiveMenuId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">标准目录</h1>
              <p className="text-sm text-gray-500 mt-0.5">浏览和管理数据标准字典</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
              <button
                onClick={() => navigate('/standard/new')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                新建标准
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            title="标准总数"
            value={stats.total}
            icon={BookOpen}
            trend={12}
            color="cyan"
          />
          <StatCard
            title="已发布"
            value={stats.published}
            icon={CheckCircle}
            trend={8}
            color="emerald"
          />
          <StatCard
            title="待审核"
            value={stats.pending}
            icon={Clock}
            trend={-5}
            color="amber"
          />
          <StatCard
            title="已停用"
            value={stats.deprecated}
            icon={FileX}
            trend={2}
            color="red"
          />
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Left Sidebar - Topic Tree */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm sticky top-24">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">业务主题</h3>
              <TopicTree
                topics={businessTopics}
                selectedId={selectedTopicId}
                onSelect={setSelectedTopicId}
              />
            </div>
          </div>

          {/* Right Content - Standard List */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索标准名称、英文名或描述..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StandardStatus | 'all')}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        标准名称
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        英文名
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        数据类型
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        业务主题
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        更新时间
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStandards.length > 0 ? (
                      filteredStandards.map((standard) => (
                        <tr
                          key={standard.id}
                          className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                          onClick={() => navigate(`/standard/${standard.id}`)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-900 text-sm">
                              {standard.nameCn}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <code className="text-sm text-cyan-600 font-mono bg-cyan-50 px-2 py-0.5 rounded">
                              {standard.nameEn}
                            </code>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm text-gray-600">
                              {standard.dataType}
                              {standard.length > 0 && `(${standard.length}${standard.precision > 0 ? `,${standard.precision}` : ''})`}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm text-gray-600">{standard.businessTopic}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusTag status={standard.status} />
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm text-gray-500">{formatDateTime(standard.updatedAt)}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setActiveMenuId(activeMenuId === standard.id ? null : standard.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              {activeMenuId === standard.id && (
                                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-20">
                                  <button
                                    onClick={() => {
                                      navigate(`/standard/${standard.id}`);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    查看详情
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigate(`/standard/${standard.id}`);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    编辑
                                  </button>
                                  <button
                                    onClick={() => handleDelete(standard.id)}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    删除
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                              <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 text-sm">暂无匹配的标准</p>
                            <p className="text-gray-400 text-xs mt-1">尝试调整筛选条件或搜索关键词</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  共 <span className="font-medium text-gray-700">{filteredStandards.length}</span> 条记录
                </p>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    上一页
                  </button>
                  <button className="px-3 py-1.5 text-sm text-white bg-cyan-500 rounded-lg">
                    1
                  </button>
                  <button className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
