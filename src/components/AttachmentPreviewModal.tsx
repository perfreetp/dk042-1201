import { useState, useEffect } from 'react';
import { X, FileText, Image, File, Loader2, Download, ExternalLink } from 'lucide-react';
import { Attachment } from '@/types';
import {
  getPreviewUrl,
  isPreviewSupported,
  downloadAttachment,
  getFileTypeLabel,
} from '@/utils/attachmentStorage';
import { formatFileSize, formatDateTime } from '@/utils/export';
import { useNavigate } from 'react-router-dom';

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  standardId: string;
  attachment: Attachment | null;
  allAttachments?: Attachment[];
  onSwitchAttachment?: (attachment: Attachment) => void;
  showStandardLink?: boolean;
  standardName?: string;
}

export function AttachmentPreviewModal({
  isOpen,
  onClose,
  standardId,
  attachment,
  allAttachments = [],
  onSwitchAttachment,
  showStandardLink = false,
  standardName,
}: AttachmentPreviewModalProps) {
  const navigate = useNavigate();
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !attachment) {
      setPreviewContent(null);
      setTextContent(null);
      setError(null);
      return;
    }

    const loadPreview = async () => {
      setLoading(true);
      setError(null);
      setPreviewContent(null);
      setTextContent(null);

      try {
        const dataUrl = getPreviewUrl(standardId, attachment.id);
        if (!dataUrl) {
          setError('无法获取文件内容');
          return;
        }

        if (attachment.mimeType.startsWith('text/') || attachment.mimeType === 'application/json') {
          const response = await fetch(dataUrl);
          const text = await response.text();
          setTextContent(text);
        } else {
          setPreviewContent(dataUrl);
        }
      } catch (e) {
        console.error('Failed to load preview:', e);
        setError('预览加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [isOpen, attachment, standardId]);

  if (!isOpen || !attachment) return null;

  const canPreview = isPreviewSupported(attachment);
  const fileTypeLabel = getFileTypeLabel(attachment.mimeType);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">正在加载预览...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-3">{error}</p>
            <button
              onClick={() => downloadAttachment(standardId, attachment.id)}
              className="text-sm text-cyan-600 hover:text-cyan-700"
            >
              下载文件查看
            </button>
          </div>
        </div>
      );
    }

    if (!canPreview) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-1">{attachment.name}</p>
            <p className="text-sm text-gray-500 mb-4">该文件类型暂不支持在线预览</p>
            <button
              onClick={() => downloadAttachment(standardId, attachment.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              <Download className="w-4 h-4" />
              下载文件
            </button>
          </div>
        </div>
      );
    }

    if (textContent !== null) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
              {textContent}
            </pre>
          </div>
        </div>
      );
    }

    if (attachment.mimeType.startsWith('image/') && previewContent) {
      return (
        <div className="h-full flex items-center justify-center p-4 bg-gray-900 overflow-auto">
          <img
            src={previewContent}
            alt={attachment.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    if (attachment.mimeType === 'application/pdf' && previewContent) {
      return (
        <div className="h-full">
          <iframe
            src={previewContent}
            title={attachment.name}
            className="w-full h-full border-0"
          />
        </div>
      );
    }

    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500">无法预览此文件</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
              {attachment.mimeType.startsWith('image/') ? (
                <Image className="w-5 h-5 text-cyan-600" />
              ) : (
                <FileText className="w-5 h-5 text-cyan-600" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {attachment.name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span>{fileTypeLabel}</span>
                <span>·</span>
                <span>{formatFileSize(attachment.size)}</span>
                <span>·</span>
                <span>{formatDateTime(attachment.uploadedAt)}</span>
              </div>
              {showStandardLink && standardName && (
                <button
                  onClick={() => {
                    navigate(`/standard/${standardId}`);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  查看所属标准：{standardName}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadAttachment(standardId, attachment.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thumbnail sidebar if multiple attachments */}
        <div className="flex flex-1 overflow-hidden">
          {allAttachments.length > 1 && (
            <div className="w-40 border-r border-gray-100 bg-gray-50 overflow-y-auto p-2 flex-shrink-0">
              <p className="text-xs font-medium text-gray-500 mb-2 px-2">附件列表</p>
              <div className="space-y-1">
                {allAttachments.map((att) => (
                  <button
                    key={att.id}
                    onClick={() => onSwitchAttachment?.(att)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                      att.id === attachment.id
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {att.mimeType.startsWith('image/') ? (
                        <Image className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      <span className="truncate">{att.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview Content */}
          <div className="flex-1 overflow-hidden">{renderPreview()}</div>
        </div>
      </div>
    </div>
  );
}
