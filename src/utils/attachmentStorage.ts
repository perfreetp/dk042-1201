import { Attachment } from '@/types';

const STORAGE_KEY = 'data_dict_attachments';

interface StoredAttachment extends Attachment {
  data: string; // base64 data URL
}

function getAllAttachments(): Record<string, StoredAttachment[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveAllAttachments(data: Record<string, StoredAttachment[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save attachments to localStorage:', e);
  }
}

export function getAttachments(standardId: string): Attachment[] {
  const all = getAllAttachments();
  const atts = all[standardId] || [];
  return atts.map(({ data, ...rest }) => rest);
}

export function getAttachmentData(standardId: string, attachmentId: string): string | null {
  const all = getAllAttachments();
  const atts = all[standardId] || [];
  const att = atts.find((a) => a.id === attachmentId);
  return att?.data || null;
}

export async function addAttachment(
  standardId: string,
  file: File
): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const all = getAllAttachments();
      const newAtt: StoredAttachment = {
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        mimeType: file.type,
        data: reader.result as string,
      };

      if (!all[standardId]) {
        all[standardId] = [];
      }
      all[standardId].push(newAtt);
      saveAllAttachments(all);

      const { data, ...rest } = newAtt;
      resolve(rest);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function addAttachments(
  standardId: string,
  files: FileList | File[]
): Promise<Attachment[]> {
  const results: Attachment[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const att = await addAttachment(standardId, file);
      results.push(att);
    } catch (err) {
      console.error('Failed to upload file:', file.name, err);
    }
  }
  return results;
}

export function getPreviewUrl(standardId: string, attachmentId: string): string | null {
  return getAttachmentData(standardId, attachmentId);
}

export function isPreviewSupported(attachment: Attachment): boolean {
  const previewTypes = [
    'image/',
    'application/pdf',
    'text/plain',
    'text/csv',
    'text/json',
    'application/json',
  ];
  return previewTypes.some((type) => attachment.mimeType.startsWith(type));
}

export function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '图片';
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.startsWith('text/')) return '文本';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Excel';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Word';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '压缩包';
  return '文件';
}

export function deleteAttachment(standardId: string, attachmentId: string): void {
  const all = getAllAttachments();
  if (all[standardId]) {
    all[standardId] = all[standardId].filter((a) => a.id !== attachmentId);
    saveAllAttachments(all);
  }
}

export function downloadAttachment(standardId: string, attachmentId: string): void {
  const all = getAllAttachments();
  const atts = all[standardId] || [];
  const att = atts.find((a) => a.id === attachmentId);
  if (att) {
    const link = document.createElement('a');
    link.href = att.data;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function syncAttachmentsFromStandard(
  fromStandardId: string,
  toStandardId: string
): void {
  const all = getAllAttachments();
  if (all[fromStandardId]) {
    all[toStandardId] = [...(all[toStandardId] || []), ...all[fromStandardId]];
    saveAllAttachments(all);
  }
}
