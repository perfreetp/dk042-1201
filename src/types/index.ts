export type StandardStatus = 'draft' | 'pending' | 'published' | 'deprecated';

export type DataType = 'string' | 'number' | 'date' | 'boolean' | 'text';

export type MappingStatus = 'mapped' | 'unmapped' | 'conflict';

export type ConflictType = 'name' | 'type' | 'value' | null;

export type AuditAction = 'submit' | 'approve' | 'reject' | 'publish' | 'deprecate';

export interface AllowedValue {
  id: string;
  value: string;
  label: string;
  description: string;
  sortOrder: number;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  mimeType: string;
}

export interface DataStandard {
  id: string;
  nameCn: string;
  nameEn: string;
  businessTopic: string;
  businessTopicId: string;
  dataType: DataType;
  length: number;
  precision: number;
  defaultValue: string;
  description: string;
  status: StandardStatus;
  allowedValues: AllowedValue[];
  example: string;
  attachments: Attachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessTopic {
  id: string;
  name: string;
  parentId: string | null;
  children?: BusinessTopic[];
  standardCount: number;
}

export interface FieldMapping {
  id: string;
  standardId: string | null;
  systemName: string;
  tableName: string;
  fieldName: string;
  fieldType: string;
  mappingStatus: MappingStatus;
  conflictType?: ConflictType;
  suggestedStandardId?: string;
  suggestedStandardName?: string;
  similarity?: number;
}

export interface AuditRecord {
  id: string;
  standardId: string;
  action: AuditAction;
  comment: string;
  operator: string;
  operateTime: string;
}

export interface Reference {
  id: string;
  standardId: string;
  systemName: string;
  tableName: string;
  fieldName: string;
  usageCount: number;
  lastUsed: string;
}

export interface SystemInfo {
  id: string;
  name: string;
  tableCount: number;
  fieldCount: number;
}
