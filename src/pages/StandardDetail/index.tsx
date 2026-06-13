import { useState, useMemo } from 'react';
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
  Eye,
  Image,
  Search,
  Filter,
  ExternalLink,
  ClipboardList,
} from 'lucide-react';
import { useStandardStore } from '@/store/useStandardStore';
import { StatusTag, AuditActionTag } from '@/components/StatusTag';
import { AttachmentPreviewModal } from '@/components/AttachmentPreviewModal';
import { RectificationLedger } from '@/components/RectificationLedger';
import { businessTopics, getAllTopicIds, getTopicName } from '@/data/topics';
import { getMappingsByStandard } from '@/data/mappings';
import { getAuditRecordsByStandard } from '@/data/audits';
import { getReferencesByStandard, getReferenceCountByStandard } from '@/data/references';
import { formatDateTime, formatFileSize } from '@/utils/export';
import {
  getAttachments,
  addAttachments,
  deleteAttachment,
  downloadAttachment,
  getFileTypeLabel,
  isPreviewSupported,
} from '@/utils/attachmentStorage';
import { useMappingStore } from '@/store/useMappingStore';
import { cn } from '@/lib/utils';
import { AllowedValue, DataType, DataStandard, FieldMapping, MappingStatus, Attachment } from '@/types';

type TabType = 'basic' | 'values' | 'example' | 'mapping' | 'audit' | 'rectification';

export function StandardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.pathname === '/standard/new';
  const mappingFrom = location.state?.from === 'mapping';
  const entryContext = location.state?.entryContext as 'view-mapping' | 'view-materials' | undefined;

  const { getStandardById, addStandard, updateStandard, deleteStandard, submitForAudit } =
    useStandardStore();
  const { getMappingsByStandard, confirmMapping, addMapping, searchMappings, mappings: allMappings } =
    useMappingStore();

  const standard = isNew ? null : getStandardById(id || '');
  const [isEditing, setIsEditing] = useState(isNew);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (location.state?.activeTab === 'example' || entryContext === 'view-materials') return 'example';
    if (location.state?.activeTab === 'mapping' || entryContext === 'view-mapping' || mappingFrom) return 'mapping';
    if (location.state?.activeTab === 'rectification') return 'rectification';
    return 'basic';
  });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkSearchKeyword, setLinkSearchKeyword] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Mapping tab filters
  const [mappingFilterSystem, setMappingFilterSystem] = useState<string>(
    (location.state?.returnState?.mappingFilterSystem as string) ||
    (location.state?.mappingFilterSystem as string) || 'all'
  );
  const [mappingFilterTable, setMappingFilterTable] = useState<string>(
    (location.state?.returnState?.mappingFilterTable as string) ||
    (location.state?.mappingFilterTable as string) || 'all'
  );
  const [mappingFilterStatus, setMappingFilterStatus] = useState<MappingStatus | 'all'>(
    ((location.state?.returnState?.mappingFilterStatus as MappingStatus) ||
    (location.state?.mappingFilterStatus as MappingStatus)) || 'all'
  );
  const [mappingSearchKeyword, setMappingSearchKeyword] = useState(
    (location.state?.returnState?.mappingSearchKeyword as string) ||
    (location.state?.mappingSearchKeyword as string) || ''
  );

  // Attachment filters
  const [attFilterType, setAttFilterType] = useState<string>('all');
  const [attFilterTime, setAttFilterTime] = useState<string>('all');
  const [attSearchKeyword, setAttSearchKeyword] = useState('');

  const [formData, setFormData] = useState<DataStandard>(() => {
    if (standard) {
      const savedAttachments = getAttachments(standard.id);
      const attachmentsWithMimeType = savedAttachments.map((att) => ({
        ...att,
        mimeType: (att as any).mimeType || 'application/octet-stream',
      }));
      return { ...standard, attachments: attachmentsWithMimeType.length > 0 ? attachmentsWithMimeType : standard.attachments };
    }
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

  const mappings = getMappingsByStandard(formData.id);
  const auditRecords = standard ? getAuditRecordsByStandard(standard.id) : [];
  const references = standard ? getReferencesByStandard(standard.id) : [];
  const referenceCount = standard ? getReferenceCountByStandard(standard.id) : 0;

  // Filtered mappings
  const filteredMappings = useMemo(() => {
    let result = [...mappings];

    if (mappingFilterSystem !== 'all') {
      result = result.filter((m) => m.systemName === mappingFilterSystem);
    }

    if (mappingFilterTable !== 'all') {
      result = result.filter((m) => m.tableName === mappingFilterTable);
    }

    if (mappingFilterStatus !== 'all') {
      result = result.filter((m) => m.mappingStatus === mappingFilterStatus);
    }

    if (mappingSearchKeyword) {
      const kw = mappingSearchKeyword.toLowerCase();
      result = result.filter(
        (m) =>
          m.fieldName.toLowerCase().includes(kw) ||
          m.tableName.toLowerCase().includes(kw) ||
          m.systemName.toLowerCase().includes(kw)
      );
    }

    return result;
  }, [mappings, mappingFilterSystem, mappingFilterTable, mappingFilterStatus, mappingSearchKeyword]);

  const mappingSystems = useMemo(() => {
    const systems = new Set(mappings.map((m) => m.systemName));
    return Array.from(systems);
  }, [mappings]);

  const mappingTables = useMemo(() => {
    let filtered = [...mappings];
    if (mappingFilterSystem !== 'all') {
      filtered = filtered.filter((m) => m.systemName === mappingFilterSystem);
    }
    const tables = new Set(filtered.map((m) => m.tableName));
    return Array.from(tables);
  }, [mappings, mappingFilterSystem]);

  const attachmentTypeOptions = useMemo(() => {
    const types = new Set<string>();
    formData.attachments.forEach((a) => {
      types.add(getFileTypeLabel(a.mimeType));
    });
    return Array.from(types);
  }, [formData.attachments]);

  const filteredAttachments = useMemo(() => {
    let result = [...formData.attachments];
    if (attFilterType !== 'all') {
      result = result.filter((a) => getFileTypeLabel(a.mimeType) === attFilterType);
    }
    if (attFilterTime !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (attFilterTime === '7d') cutoff.setDate(now.getDate() - 7);
      else if (attFilterTime === '30d') cutoff.setDate(now.getDate() - 30);
      else if (attFilterTime === '90d') cutoff.setDate(now.getDate() - 90);
      result = result.filter((a) => new Date(a.uploadedAt) >= cutoff);
    }
    if (attSearchKeyword) {
      const kw = attSearchKeyword.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(kw) ||
          (a.description && a.description.toLowerCase().includes(kw))
      );
    }
    return result;
  }, [formData.attachments, attFilterType, attFilterTime, attSearchKeyword]);

  const dataTypes: { value: DataType; label: string }[] = [
    { value: 'string', label: '字符串 (string)' },
    { value: 'number', label: '数字 (number)' },
    { value: 'date', label: '日期 (date)' },
    { value: 'boolean', label: '布尔 (boolean)' },
    { value: 'text', label: '长文本 (text)' },
  ];

  const tabs: { key: TabType; label: string; icon?: any }[] = [
    { key: 'basic', label: '基本信息' },
    { key: 'values', label: '取值规范' },
    { key: 'example', label: '示例说明' },
    { key: 'mapping', label: '映射关系' },
    { key: 'audit', label: '审核记录' },
    { key: 'rectification', label: '整改台账' },
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const newAtts = await addAttachments(formData.id, files);
        setFormData({
          ...formData,
          attachments: [...formData.attachments, ...newAtts],
        });
      } catch (err) {
        console.error('Failed to upload files:', err);
        alert('部分文件上传失败');
      }
    }
    e.target.value = '';
  };

  const handlePreviewAttachment = (att: Attachment) => {
    setPreviewAttachment(att);
    setShowPreviewModal(true);
  };

  const handleSwitchAttachment = (att: Attachment) => {
    setPreviewAttachment(att);
  };

  const handleDeleteAttachment = (attId: string) => {
    if (confirm('确定删除该附件？')) {
      deleteAttachment(formData.id, attId);
      setFormData({
        ...formData,
        attachments: formData.attachments.filter((a) => a.id !== attId),
      });
    }
  };

  const handleDownloadAttachment = (attId: string) => {
    downloadAttachment(formData.id, attId);
  };

  const handleLinkField = (mapping: FieldMapping) => {
    confirmMapping(mapping.id, formData.id, formData.nameCn);
    setShowLinkModal(false);
    setLinkSearchKeyword('');
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
          {/* Context Navigation Panel - visible when entering from mapping */}
          {(entryContext || mappingFrom) && !isNew && (
            <div className="mb-6 bg-gradient-to-r from-cyan-50 to-violet-50 rounded-xl border border-cyan-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">从映射管理进入</p>
                    <p className="text-xs text-gray-500">当前标准关联了 {mappings.length} 个字段映射、{formData.attachments.length} 份资料</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('mapping')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                      activeTab === 'mapping'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'
                    )}
                  >
                    映射关系 ({mappings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('example')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                      activeTab === 'example'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'
                    )}
                  >
                    资料区 ({formData.attachments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('rectification')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                      activeTab === 'rectification'
                        ? 'bg-violet-600 text-white'
                        : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
                    )}
                  >
                    整改台账
                  </button>
                </div>
              </div>
            </div>
          )}
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
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">资料区</label>
                    <span className="text-xs text-gray-500">
                      共 {formData.attachments.length} 份资料
                      {filteredAttachments.length !== formData.attachments.length && (
                        <span className="ml-1">
                          (筛选后 {filteredAttachments.length} 份)
                        </span>
                      )}
                      {formData.attachments.some((a) => a.source === 'system') && (
                        <span className="ml-1">
                          (系统资料 {formData.attachments.filter((a) => a.source === 'system').length} 份)
                        </span>
                      )}
                    </span>
                  </div>

                  {formData.attachments.length > 3 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                      <Filter className="w-4 h-4 text-gray-400 mt-0.5" />
                      {attachmentTypeOptions.length > 1 && (
                        <select
                          value={attFilterType}
                          onChange={(e) => setAttFilterType(e.target.value)}
                          className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="all">全部类型</option>
                          {attachmentTypeOptions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      )}
                      <select
                        value={attFilterTime}
                        onChange={(e) => setAttFilterTime(e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="all">全部时间</option>
                        <option value="7d">近7天</option>
                        <option value="30d">近30天</option>
                        <option value="90d">近90天</option>
                      </select>
                      <div className="relative flex-1 min-w-[140px]">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="搜索文件名..."
                          value={attSearchKeyword}
                          onChange={(e) => setAttSearchKeyword(e.target.value)}
                          className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                      {(attFilterType !== 'all' || attFilterTime !== 'all' || attSearchKeyword) && (
                        <button
                          onClick={() => {
                            setAttFilterType('all');
                            setAttFilterTime('all');
                            setAttSearchKeyword('');
                          }}
                          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          重置
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    {filteredAttachments.length > 0
                      ? (() => {
                          const systemAtts = filteredAttachments.filter((a) => a.source === 'system');
                          const userAtts = filteredAttachments.filter(
                            (a) => a.source !== 'system'
                          );
                          const groups = [];
                          if (systemAtts.length > 0) {
                            groups.push({ label: '系统资料', items: systemAtts });
                          }
                          if (userAtts.length > 0) {
                            groups.push({ label: '上传资料', items: userAtts });
                          }
                          return groups.map((group) => (
                            <div key={group.label}>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-2">
                                {group.label}
                              </p>
                              <div className="space-y-2">
                                {group.items.map((att) => (
                                  <div
                                    key={att.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100/50 transition-colors group"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                      {att.mimeType?.startsWith('image/') ? (
                                        <Image className="w-5 h-5 text-cyan-600" />
                                      ) : (
                                        <FileText className="w-5 h-5 text-cyan-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                          {att.name}
                                        </p>
                                        <span className="text-xs px-1.5 py-0.5 bg-cyan-50 text-cyan-700 rounded">
                                          {getFileTypeLabel(att.mimeType)}
                                        </span>
                                        {att.source === 'system' && (
                                          <span className="text-xs px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded">
                                            系统资料
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-gray-500">
                                          {formatFileSize(att.size)} · {formatDateTime(att.uploadedAt)}
                                        </p>
                                        {att.description && (
                                          <>
                                            <span className="text-xs text-gray-300">·</span>
                                            <p className="text-xs text-gray-500 truncate">
                                              {att.description}
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {isPreviewSupported(att) && (
                                        <button
                                          onClick={() => handlePreviewAttachment(att)}
                                          className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                                          title="在线预览"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDownloadAttachment(att.id)}
                                        className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                                        title="下载"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                      {isEditing && att.source !== 'system' && (
                                        <button
                                          onClick={() => handleDeleteAttachment(att.id)}
                                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                          title="删除"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ));
                        })()
                      : (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-400">
                            {formData.attachments.length > 0 ? '没有符合筛选条件的资料' : '暂无资料'}
                          </p>
                        </div>
                      )}
                  </div>

                  {isEditing && (
                    <div className="mt-4">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/50 transition-all">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">点击上传或拖拽文件到此处</p>
                        <p className="text-xs text-gray-400 mt-1">
                          支持 PDF、图片、文本、Word、Excel 格式，可多选，单文件最大 10MB
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.json,.csv"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rectification Tab */}
          {activeTab === 'rectification' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">整改台账</h3>
                      <p className="text-xs text-gray-500">该标准相关的批量整改历史记录</p>
                    </div>
                  </div>
                </div>
                <RectificationLedger standardId={formData.id} />
              </div>
            </div>
          )}

          {/* Mapping Tab */}
          {activeTab === 'mapping' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">映射的系统字段</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      共 <span className="font-medium text-cyan-600">{filteredMappings.length}</span> / {mappings.length} 个映射
                    </span>
                    <button
                      onClick={() => setShowLinkModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      关联字段
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={mappingFilterSystem}
                      onChange={(e) => {
                        setMappingFilterSystem(e.target.value);
                        setMappingFilterTable('all');
                      }}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    >
                      <option value="all">全部系统</option>
                      {mappingSystems.map((sys) => (
                        <option key={sys} value={sys}>{sys}</option>
                      ))}
                    </select>
                  </div>

                  {mappingTables.length > 0 && (
                    <select
                      value={mappingFilterTable}
                      onChange={(e) => setMappingFilterTable(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    >
                      <option value="all">全部表</option>
                      {mappingTables.map((table) => (
                        <option key={table} value={table}>{table}</option>
                      ))}
                    </select>
                  )}

                  <select
                    value={mappingFilterStatus}
                    onChange={(e) => setMappingFilterStatus(e.target.value as MappingStatus | 'all')}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    <option value="all">全部状态</option>
                    <option value="mapped">已映射</option>
                    <option value="conflict">冲突</option>
                    <option value="unmapped">未映射</option>
                  </select>

                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索字段名、表名..."
                      value={mappingSearchKeyword}
                      onChange={(e) => setMappingSearchKeyword(e.target.value)}
                      className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setMappingFilterSystem('all');
                      setMappingFilterTable('all');
                      setMappingFilterStatus('all');
                      setMappingSearchKeyword('');
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    重置
                  </button>
                </div>

                {filteredMappings.length > 0 ? (
                  <div className="space-y-3">
                    {filteredMappings.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-sm text-cyan-600">
                              {mapping.tableName}.{mapping.fieldName}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {mapping.systemName}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {mapping.fieldType}
                            </span>
                            {mapping.mappingStatus === 'conflict' && (
                              <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                                冲突
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <button
                              onClick={() =>
                                navigate('/mapping', {
                                  state: {
                                    highlightMappingId: mapping.id,
                                    filterSystem: mapping.systemName,
                                    filterTable: mapping.tableName,
                                    filterStatus: mapping.mappingStatus,
                                    returnTo: `/standard/${formData.id}`,
                                    returnState: {
                                      activeTab: 'mapping',
                                      mappingFilterSystem,
                                      mappingFilterTable,
                                      mappingFilterStatus,
                                      mappingSearchKeyword,
                                    },
                                  },
                                })
                              }
                              className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700"
                            >
                              <ExternalLink className="w-3 h-3" />
                              在映射管理中查看
                            </button>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        {isEditing && (
                          <button
                            onClick={() => {
                              if (confirm('确定解除该字段的映射关系？')) {
                                useMappingStore.getState().unlinkMapping(mapping.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="解除映射"
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
                    <p className="text-gray-500 text-sm mb-4">
                      {mappings.length === 0 ? '暂无字段映射' : '没有符合筛选条件的映射'}
                    </p>
                    {mappings.length === 0 && (
                      <button
                        onClick={() => setShowLinkModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-cyan-600 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        关联系统字段
                      </button>
                    )}
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

      {/* Link Field Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">关联系统字段</h3>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkSearchKeyword('');
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索字段名、表名或系统名..."
                  value={linkSearchKeyword}
                  onChange={(e) => setLinkSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                const unlinkedMappings = allMappings.filter(
                  (m) => m.standardId !== formData.id
                );
                const filtered = linkSearchKeyword
                  ? unlinkedMappings.filter(
                      (m) =>
                        m.fieldName.toLowerCase().includes(linkSearchKeyword.toLowerCase()) ||
                        m.tableName.toLowerCase().includes(linkSearchKeyword.toLowerCase()) ||
                        m.systemName.toLowerCase().includes(linkSearchKeyword.toLowerCase())
                    )
                  : unlinkedMappings;

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 text-sm">
                        {linkSearchKeyword ? '没有找到匹配的字段' : '暂无可用的系统字段'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {filtered.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-sm font-medium text-gray-800">
                              {mapping.fieldName}
                            </span>
                            {mapping.standardId && (
                              <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                已映射到其他标准
                              </span>
                            )}
                            {mapping.mappingStatus === 'conflict' && (
                              <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                冲突
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{mapping.systemName}</span>
                            <span>·</span>
                            <span>{mapping.tableName}</span>
                            <span>·</span>
                            <span>{mapping.fieldType}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleLinkField(mapping)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all"
                        >
                          关联
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkSearchKeyword('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      <AttachmentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewAttachment(null);
        }}
        standardId={formData.id}
        attachment={previewAttachment}
        allAttachments={formData.attachments}
        onSwitchAttachment={handleSwitchAttachment}
      />
    </div>
  );
}
