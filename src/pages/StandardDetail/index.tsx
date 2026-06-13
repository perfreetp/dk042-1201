import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Send,
  Trash2,
  Plus,
  X,
  Upload,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
} from 'lucide-react';
import { useStandardStore } from '@/store/useStandardStore';
import { StatusTag, AuditActionTag } from '@/components/StatusTag';
import { businessTopics, getAllTopicIds, getTopicName } from '@/data/topics';
import { getMappingsByStandard } from '@/data/mappings';
import { getAuditRecordsByStandard } from '@/data/audits';
import { getReferencesByStandard, getReferenceCountByStandard } from '@/data/references';
import { formatDateTime, formatFileSize } from '@/utils/export';
import { cn } from '@/lib/utils';
import { AllowedValue, DataType, DataStandard } from '@/types';

type TabType = 'basic' | 'values' | 'example' | 'mapping' | 'audit';

export function StandardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.pathname === '/standard/new';

  const { getStandardById, addStandard, updateStandard, deleteStandard, submitForAudit } =
    useStandardStore();

  const standard = isNew ? null : getStandardById(id || '');
  const [isEditing, setIsEditing] = useState(isNew);
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const [formData, setFormData] = useState<DataStandard>(() => {
    if (standard) return { ...standard };
    return {
      id: 's' + Date.now(),
      nameCn: '',
      nameEn: '',
      businessTopic: '',
      businessTopicId: '',
      dataType: 'string',
      length: 0,
      precision: 0,
      defaultValue: '',
      description: '',
      status: 'draft',
      allowedValues: [],
      example: '',
      attachments: [],
      createdBy: '当前用户',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const mappings = standard ? getMappingsByStandard(standard.id) : [];
  const auditRecords = standard ? getAuditRecordsByStandard(standard.id) : [];
  const references = standard ? getReferencesByStandard(standard.id) : [];
  const referenceCount = standard ? getReferenceCountByStandard(standard.id) : 0;

  const dataTypes: { value: DataType; label: string }[] = [
    { value: 'string', label: '字符串 (string)' },
    { value: 'number', label: '数字 (number)' },
    { value: 'date', label: '日期 (date)' },
    { value: 'boolean', label: '布尔 (boolean)' },
    { value: 'text', label: '长文本 (text)' },
  ];

  const tabs: { key: TabType; label: string; icon?: string }[] = [
    { key: 'basic', label: '基本信息' },
    { key: 'values', label: '取值规范' },
    { key: 'example', label: '示例说明' },
    { key: 'mapping', label: '映射关系' },
    { key: 'audit', label: '审核记录' },
  ];

  const handleSave = () => {
    if (isNew) {
      addStandard(formData);
      navigate(`/standard/${formData.id}`);
    } else {
      updateStandard(id!, formData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isNew) {
      navigate('/');
    } else {
      setFormData({ ...standard! });
      setIsEditing(false);
    }
  };

  const handleSubmit = () => {
    if (confirm('确定提交该标准进行审核吗？')) {
      submitForAudit(formData.id);
      updateStandard(id!, { status: 'pending' });
    }
  };

  const handleDelete = () => {
    if (confirm('确定要删除该标准吗？')) {
      deleteStandard(id!);
      navigate('/');
    }
  };

  const addAllowedValue = () => {
    const newValue: AllowedValue = {
      id: 'v' + Date.now(),
      value: '',
      label: '',
      description: '',
      sortOrder: formData.allowedValues.length + 1,
    };
    setFormData({
      ...formData,
      allowedValues: [...formData.allowedValues, newValue],
    });
  };

  const updateAllowedValue = (index: number, field: keyof AllowedValue, value: string) => {
    const newValues = [...formData.allowedValues];
    newValues[index] = { ...newValues[index], [field]: value };
    setFormData({ ...formData, allowedValues: newValues });
  };

  const removeAllowedValue = (index: number) => {
    const newValues = formData.allowedValues.filter((_, i) => i !== index);
    setFormData({ ...formData, allowedValues: newValues });
  };

  const allTopicIds = getAllTopicIds();

  const getSelectableTopics = () => {
    const topics: { id: string; name: string }[] = [];
    function traverse(topicList: typeof businessTopics) {
      topicList.forEach((t) => {
        topics.push({ id: t.id, name: t.name });
        if (t.children) traverse(t.children);
      });
    }
    traverse(businessTopics);
    return topics;
  };

  if (!isNew && !standard) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">标准不存在</h2>
          <p className="text-gray-500 mb-4">您访问的标准可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/')}
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            返回标准目录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900 truncate">
                  {isNew ? '新建标准' : formData.nameCn || '未命名标准'}
                </h1>
                {!isNew && <StatusTag status={standard!.status} />}
              </div>
              {!isNew && formData.nameEn && (
                <p className="text-sm text-gray-500 mt-0.5 font-mono">{formData.nameEn}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-sm"
                  >
                    保存
                  </button>
                </>
              ) : (
                <>
                  {(standard?.status === 'draft') && (
                    <button
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      提交审核
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>
                  {(standard?.status === 'draft') && (
                    <button
                      onClick={handleDelete}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-t border-gray-50">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                  activeTab === tab.key
                    ? 'text-cyan-600 border-cyan-500'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      中文名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameCn}
                      onChange={(e) => setFormData({ ...formData, nameCn: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="请输入中文名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      英文名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="请输入英文名（下划线命名）"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    业务主题 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.businessTopicId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessTopicId: e.target.value,
                        businessTopic: getTopicName(e.target.value),
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">请选择业务主题</option>
                    {getSelectableTopics().map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      数据类型 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.dataType}
                      onChange={(e) =>
                        setFormData({ ...formData, dataType: e.target.value as DataType })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      {dataTypes.map((dt) => (
                        <option key={dt.value} value={dt.value}>
                          {dt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">长度</label>
                    <input
                      type="number"
                      value={formData.length}
                      onChange={(e) =>
                        setFormData({ ...formData, length: parseInt(e.target.value) || 0 })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">精度</label>
                    <input
                      type="number"
                      value={formData.precision}
                      onChange={(e) =>
                        setFormData({ ...formData, precision: parseInt(e.target.value) || 0 })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">默认值</label>
                  <input
                    type="text"
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="请输入默认值"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                    placeholder="请输入标准描述"
                  />
                </div>

                {!isEditing && !isNew && (
                  <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">创建人</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{standard?.createdBy}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">创建时间</p>
                      <p className="text-sm text-gray-700">{formatDateTime(standard?.createdAt || '')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">更新时间</p>
                      <p className="text-sm text-gray-700">{formatDateTime(standard?.updatedAt || '')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Allowed Values Tab */}
          {activeTab === 'values' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">允许值列表</h3>
                  {isEditing && (
                    <button
                      onClick={addAllowedValue}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-cyan-600 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      添加取值
                    </button>
                  )}
                </div>

                {formData.allowedValues.length > 0 ? (
                  <div className="space-y-2">
                    {formData.allowedValues.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => updateAllowedValue(index, 'value', e.target.value)}
                            disabled={!isEditing}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="取值编码"
                          />
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateAllowedValue(index, 'label', e.target.value)}
                            disabled={!isEditing}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="取值标签"
                          />
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateAllowedValue(index, 'description', e.target.value)}
                            disabled={!isEditing}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="描述说明"
                          />
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeAllowedValue(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-sm mb-4">暂无允许值配置</p>
                    {isEditing && (
                      <button
                        onClick={addAllowedValue}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        添加第一个取值
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Example Tab */}
          {activeTab === 'example' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">示例值</label>
                  <input
                    type="text"
                    value={formData.example}
                    onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="请输入示例值"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">附件说明</label>
                  <div className="space-y-2">
                    {formData.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{att.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(att.size)} · {formatDateTime(att.uploadedAt)}
                          </p>
                        </div>
                        <button className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="mt-4">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/50 transition-all">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">点击上传或拖拽文件到此处</p>
                        <p className="text-xs text-gray-400 mt-1">支持 PDF、Word、Excel 格式，最大 10MB</p>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mapping Tab */}
          {activeTab === 'mapping' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">映射的系统字段</h3>
                  <span className="text-sm text-gray-500">
                    共 <span className="font-medium text-cyan-600">{mappings.length}</span> 个映射
                  </span>
                </div>

                {mappings.length > 0 ? (
                  <div className="space-y-3">
                    {mappings.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-cyan-600">
                              {mapping.tableName}.{mapping.fieldName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>系统：{mapping.systemName}</span>
                            <span>类型：{mapping.fieldType}</span>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-sm">暂无字段映射</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Tab */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">审核历史记录</h3>

                {auditRecords.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100" />
                    <div className="space-y-6">
                      {auditRecords.map((record, index) => (
                        <div key={record.id} className="relative flex gap-4">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                              record.action === 'approve' || record.action === 'publish'
                                ? 'bg-emerald-100 text-emerald-600'
                                : record.action === 'reject' || record.action === 'deprecate'
                                ? 'bg-red-100 text-red-600'
                                : record.action === 'submit'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {record.action === 'approve' || record.action === 'publish' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : record.action === 'reject' ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="flex items-center gap-2 mb-1">
                              <AuditActionTag action={record.action} />
                              <span className="text-xs text-gray-400">
                                {formatDateTime(record.operateTime)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{record.comment}</p>
                            <p className="text-xs text-gray-400">操作人：{record.operator}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-sm">暂无审核记录</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
