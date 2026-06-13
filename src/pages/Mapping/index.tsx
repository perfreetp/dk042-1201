import { useState } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  Sparkles,
  Upload,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  X,
  ArrowRight,
} from 'lucide-react';
import { systems } from '@/data/mappings';
import { MappingStatusTag } from '@/components/StatusTag';
import { useMappingStore } from '@/store/useMappingStore';
import { useStandardStore } from '@/store/useStandardStore';
import { batchFindReplacements, MatchResult } from '@/utils/matching';
import { cn } from '@/lib/utils';
import { MappingStatus, FieldMapping } from '@/types';
import { useNavigate } from 'react-router-dom';

type FilterType = 'all' | MappingStatus;

export function MappingPage() {
  const navigate = useNavigate();
  const { mappings, confirmMapping, getStatistics, getMappingsBySystem, searchMappings } =
    useMappingStore();
  const { standards } = useStandardStore();
  const [selectedSystem, setSelectedSystem] = useState('全部系统');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'conflict',
    'unmapped',
    'mapped',
  ]);
  const [showBatchSuggest, setShowBatchSuggest] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState<MatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const stats = getStatistics();
  const mappingRate = stats.total > 0 ? ((stats.mapped / stats.total) * 100).toFixed(1) : '0';

  const getFilteredMappings = (): FieldMapping[] => {
    let result = [...mappings];

    if (selectedSystem !== '全部系统') {
      result = result.filter((m) => m.systemName === selectedSystem);
    }

    if (filterType !== 'all') {
      result = result.filter((m) => m.mappingStatus === filterType);
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (m) =>
          m.fieldName.toLowerCase().includes(keyword) ||
          m.tableName.toLowerCase().includes(keyword) ||
          m.suggestedStandardName?.toLowerCase().includes(keyword)
      );
    }

    return result;
  };

  const filteredMappings = getFilteredMappings();

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

  const filters: { value: FilterType; label: string; icon: any; color: string }[] = [
    { value: 'all', label: '全部', icon: MinusCircle, color: 'text-gray-500' },
    { value: 'conflict', label: '冲突', icon: AlertTriangle, color: 'text-red-500' },
    { value: 'unmapped', label: '未映射', icon: MinusCircle, color: 'text-amber-500' },
    { value: 'mapped', label: '已映射', icon: CheckCircle, color: 'text-emerald-500' },
  ];

  const handleConfirmMapping = (mapping: FieldMapping) => {
    if (mapping.suggestedStandardId && mapping.suggestedStandardName) {
      confirmMapping(mapping.id, mapping.suggestedStandardId, mapping.suggestedStandardName);
    }
  };

  const handleUnlinkMapping = (mappingId: string) => {
    if (confirm('确定解除该字段的映射关系？')) {
      useMappingStore.getState().unlinkMapping(mappingId);
    }
  };

  const handleBatchSearch = () => {
    if (!batchInput.trim()) return;

    const fieldNames = batchInput
      .split(/[\n,，、\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const publishedStandards = standards.filter((s) => s.status === 'published');
    const results = batchFindReplacements(fieldNames, publishedStandards);
    setBatchResults(results);
    setHasSearched(true);
  };

  const handleConfirmBatchMapping = (result: MatchResult) => {
    const mapping = mappings.find(
      (m) => m.fieldName.toLowerCase() === result.fieldName.toLowerCase() && !m.standardId
    );
    if (mapping) {
      confirmMapping(mapping.id, result.standard.id, result.standard.nameCn);
    }
  };

  const confidenceConfig = {
    high: { label: '高', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    medium: { label: '中', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    low: { label: '低', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  };

  const MappingCard = ({ mapping }: { mapping: FieldMapping }) => (
    <div className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-sm font-medium text-gray-800">
              {mapping.fieldName}
            </span>
            <MappingStatusTag status={mapping.mappingStatus} />
          </div>
          <p className="text-xs text-gray-500">
            {mapping.systemName} · {mapping.tableName} · {mapping.fieldType}
          </p>
        </div>
        {mapping.mappingStatus === 'mapped' && (
          <button
            onClick={() => handleUnlinkMapping(mapping.id)}
            className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="解除映射"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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
              <p
                className="text-sm font-medium text-cyan-700 truncate cursor-pointer hover:underline"
                onClick={() => navigate(`/standard/${mapping.suggestedStandardId}`)}
              >
                {mapping.suggestedStandardName}
              </p>
              {mapping.conflictType && (
                <p className="text-xs text-gray-400 mt-0.5">
                  冲突类型：{conflictTypeLabels[mapping.conflictType] || mapping.conflictType}
                </p>
              )}
            </div>
            <button
              onClick={() => handleConfirmMapping(mapping)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all whitespace-nowrap"
            >
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-emerald-600">已映射到标准</span>
            </div>
            <button
              onClick={() => navigate(`/standard/${mapping.standardId}`)}
              className="text-xs text-cyan-600 hover:text-cyan-700"
            >
              查看标准 →
            </button>
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

        {/* Batch Suggest Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <button
            onClick={() => setShowBatchSuggest(!showBatchSuggest)}
            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-800">批量搜索替换建议</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  输入字段名或关键词，智能推荐对应的标准
                </p>
              </div>
            </div>
            {showBatchSuggest ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showBatchSuggest && (
            <div className="border-t border-gray-100 p-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    字段名或关键词
                    <span className="text-gray-400 font-normal ml-2">
                      （支持换行、逗号、空格分隔多个）
                    </span>
                  </label>
                  <textarea
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder={`customer_id\norder_amt\nuser_name\nmobile_no`}
                    className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none font-mono"
                  />
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={handleBatchSearch}
                      className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      智能匹配
                    </button>
                    <button
                      onClick={() => {
                        setBatchInput('');
                        setBatchResults([]);
                        setHasSearched(false);
                      }}
                      className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      清空
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    匹配结果
                  </label>
                  <div className="h-32 border border-gray-200 rounded-lg overflow-y-auto bg-gray-50">
                    {!hasSearched && (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-gray-400">输入字段名后点击智能匹配</p>
                      </div>
                    )}
                    {hasSearched && batchResults.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-gray-400">未找到匹配的标准</p>
                      </div>
                    )}
                  </div>
                  {hasSearched && batchResults.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      共找到 {batchResults.length} 个推荐替换
                    </p>
                  )}
                </div>
              </div>

              {/* Results List */}
              {hasSearched && batchResults.length > 0 && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">推荐替换列表</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {batchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-violet-200 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-3 py-1">
                            <span className="text-sm font-mono text-gray-700 font-medium">
                              {result.fieldName}
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-violet-700">
                              {result.standard.nameCn}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              ({result.standard.nameEn})
                            </span>
                          </div>
                          <div className="flex-1" />
                          <span
                            className={cn(
                              'text-xs px-2 py-1 rounded-full border',
                              confidenceConfig[result.confidence].className
                            )}
                          >
                            置信度 {confidenceConfig[result.confidence].label} (
                            {(result.similarity * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {result.matchReasons.map((reason, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-white rounded border border-gray-200 text-gray-600"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>数据类型：{result.standard.dataType}</span>
                            <span>长度：{result.standard.dataLength || '-'}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                navigate(`/standards/${result.standard.id}`)
                              }
                              className="text-xs text-cyan-600 hover:text-cyan-700"
                            >
                              查看标准
                            </button>
                            {mappings.some(
                              (m) =>
                                m.fieldName.toLowerCase() ===
                                  result.fieldName.toLowerCase() &&
                                !m.standardId
                            ) && (
                              <button
                                onClick={() => handleConfirmBatchMapping(result)}
                                className="text-xs px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                              >
                                确认映射
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
                <button
                  onClick={() => {
                    setSearchKeyword('');
                    setFilterType('all');
                    setSelectedSystem('全部系统');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="重置筛选"
                >
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
                      {conflictMappings.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                          暂无冲突字段
                        </div>
                      )}
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
                      {unmappedMappings.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                          暂无不映射字段
                        </div>
                      )}
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
                      {mappedMappings.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                          暂无已映射字段
                        </div>
                      )}
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
