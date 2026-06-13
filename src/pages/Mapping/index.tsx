import { useState } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  ArrowRight,
  Sparkles,
  Upload,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { fieldMappings, systems } from '@/data/mappings';
import { MappingStatusTag } from '@/components/StatusTag';
import { cn } from '@/lib/utils';
import { MappingStatus } from '@/types';
import { useNavigate } from 'react-router-dom';

type FilterType = 'all' | MappingStatus;

export function MappingPage() {
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState('全部系统');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['conflict', 'unmapped', 'mapped']);

  const filteredMappings = fieldMappings.filter((m) => {
    if (selectedSystem !== '全部系统' && m.systemName !== selectedSystem) return false;
    if (filterType !== 'all' && m.mappingStatus !== filterType) return false;
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      return (
        m.fieldName.toLowerCase().includes(keyword) ||
        m.tableName.toLowerCase().includes(keyword) ||
        m.suggestedStandardName?.toLowerCase().includes(keyword)
      );
    }
    return true;
  });

  const conflictMappings = filteredMappings.filter((m) => m.mappingStatus === 'conflict');
  const unmappedMappings = filteredMappings.filter((m) => m.mappingStatus === 'unmapped');
  const mappedMappings = filteredMappings.filter((m) => m.mappingStatus === 'mapped');

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const conflictTypeLabels: Record<string, string> = {
    name: '命名冲突',
    type: '类型冲突',
    value: '取值冲突',
  };

  const stats = {
    total: fieldMappings.length,
    mapped: fieldMappings.filter((m) => m.mappingStatus === 'mapped').length,
    conflict: fieldMappings.filter((m) => m.mappingStatus === 'conflict').length,
    unmapped: fieldMappings.filter((m) => m.mappingStatus === 'unmapped').length,
  };

  const mappingRate = ((stats.mapped / stats.total) * 100).toFixed(1);

  const filters: { value: FilterType; label: string; icon: any; color: string }[] = [
    { value: 'all', label: '全部', icon: MinusCircle, color: 'text-gray-500' },
    { value: 'conflict', label: '冲突', icon: AlertTriangle, color: 'text-red-500' },
    { value: 'unmapped', label: '未映射', icon: MinusCircle, color: 'text-amber-500' },
    { value: 'mapped', label: '已映射', icon: CheckCircle, color: 'text-emerald-500' },
  ];

  const MappingCard = ({ mapping }: { mapping: typeof fieldMappings[0] }) => (
    <div className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-medium text-gray-800">{mapping.fieldName}</span>
            <MappingStatusTag status={mapping.mappingStatus} />
          </div>
          <p className="text-xs text-gray-500">
            {mapping.systemName} · {mapping.tableName} · {mapping.fieldType}
          </p>
        </div>
      </div>

      {mapping.mappingStatus !== 'mapped' && mapping.suggestedStandardName && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-gray-500">智能推荐</span>
            {mapping.similarity && (
              <span className="text-xs text-amber-600 font-medium">
                相似度 {(mapping.similarity * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cyan-700 truncate cursor-pointer hover:underline"
                onClick={() => navigate(`/standard/${mapping.suggestedStandardId}`)}
              >
                {mapping.suggestedStandardName}
              </p>
            </div>
            <button className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all">
              确认映射
            </button>
          </div>
          {mapping.conflictType && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded">
              <AlertTriangle className="w-3 h-3" />
              {conflictTypeLabels[mapping.conflictType]}
            </div>
          )}
        </div>
      )}

      {mapping.mappingStatus === 'mapped' && mapping.standardId && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2 text-xs text-emerald-600">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>已映射到标准</span>
          </div>
        </div>
      )}
    </div>
  );

  const SectionHeader = ({
    id,
    title,
    count,
    icon: Icon,
    color,
  }: {
    id: string;
    title: string;
    count: number;
    icon: any;
    color: string;
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('w-5 h-5', color)} />
        <span className="font-medium text-gray-800">{title}</span>
        <span className="text-sm text-gray-500">({count})</span>
      </div>
      {expandedSections.includes(id) ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">映射管理</h1>
              <p className="text-sm text-gray-500 mt-0.5">管理系统字段与标准的映射关系</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4" />
                导入字段
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors">
                <Zap className="w-4 h-4" />
                智能匹配
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">字段总数</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">来自 {systems.length} 个系统</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">已映射</p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.mapped}</p>
            <p className="text-xs text-emerald-500 mt-1">映射率 {mappingRate}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">冲突字段</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{stats.conflict}</p>
            <p className="text-xs text-red-400 mt-1">需要人工处理</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">待映射</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{stats.unmapped}</p>
            <p className="text-xs text-amber-500 mt-1">建议尽快处理</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">整体映射进度</span>
            <span className="text-sm font-semibold text-cyan-600">{mappingRate}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${mappingRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>已映射 {stats.mapped} 个</span>
            <span>剩余 {stats.unmapped + stats.conflict} 个待处理</span>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left - System List */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-32">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">业务系统</h3>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setSelectedSystem('全部系统')}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    selectedSystem === '全部系统'
                      ? 'bg-cyan-50 text-cyan-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  全部系统
                </button>
                {systems.map((sys) => (
                  <button
                    key={sys.id}
                    onClick={() => setSelectedSystem(sys.name)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      selectedSystem === sys.name
                        ? 'bg-cyan-50 text-cyan-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{sys.name}</span>
                      <span className="text-xs text-gray-400">{sys.tableCount}表</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Mapping List */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4">
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索字段名、表名..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-center gap-1">
                  {filters.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilterType(f.value)}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                        filterType === f.value
                          ? 'bg-gray-100 text-gray-700'
                          : 'text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mapping Lists */}
            <div className="space-y-4">
              {/* Conflict Section */}
              {(filterType === 'all' || filterType === 'conflict') && (
                <div>
                  <SectionHeader
                    id="conflict"
                    title="冲突字段"
                    count={conflictMappings.length}
                    icon={AlertTriangle}
                    color="text-red-500"
                  />
                  {expandedSections.includes('conflict') && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {conflictMappings.map((m) => (
                        <MappingCard key={m.id} mapping={m} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Unmapped Section */}
              {(filterType === 'all' || filterType === 'unmapped') && (
                <div>
                  <SectionHeader
                    id="unmapped"
                    title="未映射字段"
                    count={unmappedMappings.length}
                    icon={MinusCircle}
                    color="text-amber-500"
                  />
                  {expandedSections.includes('unmapped') && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {unmappedMappings.map((m) => (
                        <MappingCard key={m.id} mapping={m} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Mapped Section */}
              {(filterType === 'all' || filterType === 'mapped') && (
                <div>
                  <SectionHeader
                    id="mapped"
                    title="已映射字段"
                    count={mappedMappings.length}
                    icon={CheckCircle}
                    color="text-emerald-500"
                  />
                  {expandedSections.includes('mapped') && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {mappedMappings.map((m) => (
                        <MappingCard key={m.id} mapping={m} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
