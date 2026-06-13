import { BusinessTopic } from '@/types';

export const businessTopics: BusinessTopic[] = [
  {
    id: 't1',
    name: '客户主题',
    parentId: null,
    standardCount: 18,
    children: [
      { id: 't1-1', name: '客户基本信息', parentId: 't1', standardCount: 8 },
      { id: 't1-2', name: '客户联系信息', parentId: 't1', standardCount: 5 },
      { id: 't1-3', name: '客户分类标签', parentId: 't1', standardCount: 5 },
    ],
  },
  {
    id: 't2',
    name: '产品主题',
    parentId: null,
    standardCount: 15,
    children: [
      { id: 't2-1', name: '产品基本信息', parentId: 't2', standardCount: 7 },
      { id: 't2-2', name: '产品分类', parentId: 't2', standardCount: 4 },
      { id: 't2-3', name: '产品规格', parentId: 't2', standardCount: 4 },
    ],
  },
  {
    id: 't3',
    name: '订单主题',
    parentId: null,
    standardCount: 22,
    children: [
      { id: 't3-1', name: '订单表头', parentId: 't3', standardCount: 10 },
      { id: 't3-2', name: '订单明细', parentId: 't3', standardCount: 8 },
      { id: 't3-3', name: '订单状态', parentId: 't3', standardCount: 4 },
    ],
  },
  {
    id: 't4',
    name: '财务主题',
    parentId: null,
    standardCount: 16,
    children: [
      { id: 't4-1', name: '会计科目', parentId: 't4', standardCount: 6 },
      { id: 't4-2', name: '收支项目', parentId: 't4', standardCount: 5 },
      { id: 't4-3', name: '币种汇率', parentId: 't4', standardCount: 5 },
    ],
  },
  {
    id: 't5',
    name: '人员组织主题',
    parentId: null,
    standardCount: 12,
    children: [
      { id: 't5-1', name: '员工信息', parentId: 't5', standardCount: 6 },
      { id: 't5-2', name: '部门组织', parentId: 't5', standardCount: 4 },
      { id: 't5-3', name: '岗位职级', parentId: 't5', standardCount: 2 },
    ],
  },
];

export function getAllTopicIds(): string[] {
  const ids: string[] = [];
  function traverse(topics: BusinessTopic[]) {
    topics.forEach((topic) => {
      ids.push(topic.id);
      if (topic.children) {
        traverse(topic.children);
      }
    });
  }
  traverse(businessTopics);
  return ids;
}

export function getTopicName(topicId: string): string {
  function find(topics: BusinessTopic[]): string | null {
    for (const topic of topics) {
      if (topic.id === topicId) return topic.name;
      if (topic.children) {
        const found = find(topic.children);
        if (found) return found;
      }
    }
    return null;
  }
  return find(businessTopics) || '未知主题';
}
