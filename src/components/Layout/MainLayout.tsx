import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '标准目录', subtitle: '浏览和管理数据标准字典' },
  '/mapping': { title: '映射管理', subtitle: '管理系统字段与标准的映射关系' },
  '/audit': { title: '审核发布', subtitle: '标准审核和发布管理' },
  '/reference': { title: '引用查询', subtitle: '查询标准引用范围和使用情况' },
};

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const pageInfo = pageTitles[location.pathname] || { title: '数据标准字典库', subtitle: '' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          collapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <main className="pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
