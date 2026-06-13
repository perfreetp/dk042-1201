import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  FileText,
  Database,
  TrendingUp,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { references, getAllSystems } from '@/data/references';
import { standards } from '@/data/standards';
import { exportStandardsToCSV } from '@/utils/export';
import { formatDateTime } from '@/utils/export';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function ReferencePage() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'list'>('chart');

  const allSystems = getAllSystems();

  // 按标准统计引用数量
  const standardRefStats = useMemo(() => {
    const stats: { standardId: string; standardName: string; count: number }[] = [];
    standards
      .filter((s) => s.status === 'published')
      .forEach((s) => {
        const count = references
          .filter((r) => r.standardId === s.id)
          .reduce((sum, r) => sum + r.usageCount, 0);
        if (count > 0) {
          stats.push({ standardId: s.id, standardName: s.nameCn, count });
        }
      });
    return stats.sort((a, b) => b.count - a.count).slice(0, 10);
  }, []);

  // 按系统统计引用数量
  const systemRefStats = useMemo(() => {
    return allSystems.map((sys) => {
      const count = references
        .filter((r) => r.systemName === sys)
        .reduce((sum, r) => sum + r.usageCount, 0);
      return { name: sys, value: count };
    });
  }, [allSystems]);

  // 过滤引用列表
  const filteredReferences = useMemo(() => {
    if (!searchKeyword) return references;
    const keyword = searchKeyword.toLowerCase();
    return references.filter(
      (r) =>
        r.tableName.toLowerCase().includes(keyword) ||
        r.fieldName.toLowerCase().includes(keyword) ||
        r.systemName.toLowerCase().includes(keyword)
    );
  }, [searchKeyword]);

  // 选中标准的引用详情
  const selectedRefs = useMemo(() => {
    if (!selectedStandard) return [];
    return references.filter((r) => r.standardId === selectedStandard);
  }, [selectedStandard]);

  const selectedStandardInfo = selectedStandard
    ? standards.find((s) => s.id === selectedStandard)
    : null;

  const totalReferences = references.reduce((sum, r) => sum + r.usageCount, 0);

  const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleExport = () => {
    const publishedStandards = standards.filter((s) => s.status === 'published');
    exportStandardsToCSV(publishedStandards);
  };

  const chartData = standardRefStats.map((s) => ({
    name: s.standardName,
    引用次数: s.count,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">引用查询</h1>
              <p className="text-sm text-gray-500 mt-0.5">查询标准引用范围和使用情况</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-sm hover:shadow"
              >
                <Download className="w-4 h-4" />
                导出标准字典
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">引用总次数</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalReferences.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-50">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 mt-3">较上月 +15.3%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">已发布标准</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {standards.filter((s) => s.status === 'published').length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">可被引用的标准总数</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">接入系统</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{allSystems.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50">
                <Database className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">已对接的业务系统</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">引用字段数</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{references.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">已建立引用的字段</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left - Standard List */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-32">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">标准引用排行</h3>
              </div>
              <div className="p-2 max-h-96 overflow-y-auto">
                {standardRefStats.map((item, index) => (
                  <button
                    key={item.standardId}
                    onClick={() => setSelectedStandard(item.standardId)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                      selectedStandard === item.standardId
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        index < 3
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.standardName}</p>
                    </div>
                    <span className="text-sm font-semibold text-cyan-600 flex-shrink-0">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Charts and Details */}
          <div className="flex-1 min-w-0">
            {/* Selected Standard Detail */}
            {selectedStandardInfo && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedStandardInfo.nameCn}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono mt-0.5">
                      {selectedStandardInfo.nameEn}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/standard/${selectedStandardInfo.id}`)}
                    className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1"
                  >
                    查看详情
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">引用次数</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedRefs.reduce((sum, r) => sum + r.usageCount, 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">涉及系统</p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Set(selectedRefs.map((r) => r.systemName)).size}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">数据表</p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Set(selectedRefs.map((r) => r.tableName)).size}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">引用统计图表</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('chart')}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                      activeTab === 'chart'
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    柱状图
                  </button>
                  <button
                    onClick={() => setActiveTab('list')}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                      activeTab === 'list'
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    列表
                  </button>
                </div>
              </div>

              {activeTab === 'chart' ? (
                <div className="grid grid-cols-3 gap-4 p-4">
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">标准引用 Top 10</h4>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="引用次数" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">系统分布</h4>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={systemRefStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {systemRefStats.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5">
                      {systemRefStats.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-gray-600">{item.name}</span>
                          </div>
                          <span className="font-medium text-gray-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索表名、字段名或系统..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                            系统
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                            数据表
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                            字段名
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                            引用次数
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                            最近使用
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredReferences.map((ref) => {
                          const standard = standards.find((s) => s.id === ref.standardId);
                          return (
                            <tr
                              key={ref.id}
                              className="hover:bg-gray-50/50 cursor-pointer"
                              onClick={() => setSelectedStandard(ref.standardId)}
                            >
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-600">{ref.systemName}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-800 font-mono">
                                  {ref.tableName}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <span className="text-sm text-gray-800 font-mono">
                                    {ref.fieldName}
                                  </span>
                                  {standard && (
                                    <p className="text-xs text-cyan-600 mt-0.5">
                                      → {standard.nameCn}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium text-cyan-600">
                                  {ref.usageCount}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-500">
                                  {formatDateTime(ref.lastUsed)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-4">
                    共 {filteredReferences.length} 条引用记录
                  </p>
                </div>
              )}
            </div>

            {/* Selected Standard References */}
            {selectedStandardInfo && selectedRefs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">
                    「{selectedStandardInfo.nameCn}」引用详情
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {selectedRefs.map((ref) => (
                      <div
                        key={ref.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                            <Database className="w-5 h-5 text-cyan-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-gray-800">
                                {ref.tableName}.{ref.fieldName}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{ref.systemName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-cyan-600">{ref.usageCount}</p>
                          <p className="text-xs text-gray-400">引用次数</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
