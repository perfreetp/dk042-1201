import { useState } from 'react';
import {
  Search,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  FileX,
  Send,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { useStandardStore } from '@/store/useStandardStore';
import { StatusTag } from '@/components/StatusTag';
import { formatDateTime } from '@/utils/export';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { getAuditRecordsByStandard } from '@/data/audits';

type TabType = 'pending' | 'published' | 'deprecated';

export function AuditPage() {
  const navigate = useNavigate();
  const { standards, approveStandard, rejectStandard, publishStandard, deprecateStandard } =
    useStandardStore();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingStandards = standards.filter((s) => s.status === 'pending');
  const publishedStandards = standards.filter((s) => s.status === 'published');
  const deprecatedStandards = standards.filter((s) => s.status === 'deprecated');

  const getFilteredList = () => {
    let list;
    switch (activeTab) {
      case 'pending':
        list = pendingStandards;
        break;
      case 'published':
        list = publishedStandards;
        break;
      case 'deprecated':
        list = deprecatedStandards;
        break;
    }
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      list = list.filter(
        (s) =>
          s.nameCn.toLowerCase().includes(keyword) ||
          s.nameEn.toLowerCase().includes(keyword)
      );
    }
    return list;
  };

  const filteredList = getFilteredList();

  const tabs = [
    { key: 'pending' as TabType, label: '待审核', count: pendingStandards.length, icon: Clock },
    { key: 'published' as TabType, label: '已发布', count: publishedStandards.length, icon: CheckCircle },
    { key: 'deprecated' as TabType, label: '已停用', count: deprecatedStandards.length, icon: FileX },
  ];

  const handleApprove = (id: string) => {
    if (confirm('确定通过审核并发布该标准？')) {
      approveStandard(id);
    }
  };

  const handleReject = (id: string) => {
    setRejectModalId(id);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (rejectModalId && rejectReason) {
      rejectStandard(rejectModalId);
      setRejectModalId(null);
      setRejectReason('');
    }
  };

  const handleDeprecate = (id: string) => {
    if (confirm('确定停用该标准吗？停用后将不再推荐使用。')) {
      deprecateStandard(id);
    }
  };

  const handleRePublish = (id: string) => {
    if (confirm('确定重新发布该标准？')) {
      publishStandard(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">审核发布</h1>
              <p className="text-sm text-gray-500 mt-0.5">标准审核和发布管理</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-t border-gray-50">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                    activeTab === tab.key
                      ? 'text-cyan-600 border-cyan-500'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs rounded-full',
                      activeTab === tab.key ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4">
          <div className="p-4 flex items-center justify-between">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索标准名称..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
            {activeTab === 'pending' && pendingStandards.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('确定批量通过所有待审核标准？')) {
                    pendingStandards.forEach((s) => approveStandard(s.id));
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                <Check className="w-4 h-4" />
                批量通过
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {filteredList.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {filteredList.map((standard) => {
                const auditRecords = getAuditRecordsByStandard(standard.id);
                const lastRecord = auditRecords[0];
                return (
                  <div
                    key={standard.id}
                    className="p-5 hover:bg-gray-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold text-gray-900">{standard.nameCn}</h3>
                          <StatusTag status={standard.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <code className="text-cyan-600 font-mono bg-cyan-50 px-2 py-0.5 rounded">
                            {standard.nameEn}
                          </code>
                          <span>{standard.businessTopic}</span>
                          <span>{standard.dataType}</span>
                        </div>
                        {lastRecord && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>
                              {lastRecord.operator} 于 {formatDateTime(lastRecord.operateTime)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => navigate(`/standard/${standard.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {activeTab === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(standard.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              通过
                            </button>
                            <button
                              onClick={() => handleReject(standard.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              驳回
                            </button>
                          </>
                        )}

                        {activeTab === 'published' && (
                          <button
                            onClick={() => handleDeprecate(standard.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            停用
                          </button>
                        )}

                        {activeTab === 'deprecated' && (
                          <button
                            onClick={() => handleRePublish(standard.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            重新发布
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                {activeTab === 'pending' && <Clock className="w-8 h-8 text-gray-300" />}
                {activeTab === 'published' && <CheckCircle className="w-8 h-8 text-gray-300" />}
                {activeTab === 'deprecated' && <FileX className="w-8 h-8 text-gray-300" />}
              </div>
              <p className="text-gray-500 mb-2">
                {activeTab === 'pending' && '暂无待审核的标准'}
                {activeTab === 'published' && '暂无已发布的标准'}
                {activeTab === 'deprecated' && '暂无已停用的标准'}
              </p>
              <p className="text-gray-400 text-sm">
                {activeTab === 'pending' && '所有标准都已完成审核'}
                {activeTab === 'published' && '发布标准后可在此处查看'}
                {activeTab === 'deprecated' && '停用的标准会显示在此处'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredList.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              共 <span className="font-medium text-gray-700">{filteredList.length}</span> 条记录
            </p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                上一页
              </button>
              <button className="px-3 py-1.5 text-white bg-cyan-500 rounded-lg">1</button>
              <button className="px-3 py-1.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">驳回审核</h3>
              <p className="text-sm text-gray-500 mb-4">请填写驳回原因，以便标准创建者进行修改。</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="请输入驳回原因..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setRejectModalId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
