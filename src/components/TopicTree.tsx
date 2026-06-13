import { useState } from 'react';
import { ChevronRight, Folder, FolderOpen, Hash } from 'lucide-react';
import { BusinessTopic } from '@/types';
import { cn } from '@/lib/utils';

interface TopicTreeProps {
  topics: BusinessTopic[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

interface TopicItemProps {
  topic: BusinessTopic;
  level: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function TopicItem({ topic, level, selectedId, onSelect }: TopicItemProps) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = topic.children && topic.children.length > 0;
  const isSelected = selectedId === topic.id;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200',
          isSelected
            ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-200'
            : 'hover:bg-gray-50 text-gray-700'
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(topic.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 -ml-1 hover:bg-gray-200/50 rounded"
          >
            <ChevronRight
              className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', expanded && 'rotate-90')}
            />
          </button>
        ) : (
          <span className="w-4" />
        )}

        {hasChildren ? (
          expanded ? (
            <FolderOpen className={cn('w-4 h-4', isSelected ? 'text-cyan-500' : 'text-amber-500')} />
          ) : (
            <Folder className={cn('w-4 h-4', isSelected ? 'text-cyan-500' : 'text-amber-500')} />
          )
        ) : (
          <Hash className={cn('w-4 h-4', isSelected ? 'text-cyan-500' : 'text-gray-400')} />
        )}

        <span className="flex-1 text-sm font-medium truncate">{topic.name}</span>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            isSelected ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-500'
          )}
        >
          {topic.standardCount}
        </span>
      </div>

      {hasChildren && expanded && (
        <div className="mt-0.5">
          {topic.children!.map((child) => (
            <TopicItem
              key={child.id}
              topic={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TopicTree({ topics, selectedId, onSelect }: TopicTreeProps) {
  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200',
          selectedId === null
            ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-200'
            : 'hover:bg-gray-50 text-gray-700'
        )}
        onClick={() => onSelect(null)}
      >
        <FolderOpen className={cn('w-4 h-4', selectedId === null ? 'text-cyan-500' : 'text-slate-500')} />
        <span className="flex-1 text-sm font-medium">全部标准</span>
      </div>

      <div className="mt-2 space-y-1">
        {topics.map((topic) => (
          <TopicItem
            key={topic.id}
            topic={topic}
            level={0}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
