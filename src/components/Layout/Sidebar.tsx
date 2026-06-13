import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  GitBranch,
  ClipboardCheck,
  Search,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { path: '/', label: '标准目录', icon: BookOpen },
  { path: '/mapping', label: '映射管理', icon: GitBranch },
  { path: '/audit', label: '审核发布', icon: ClipboardCheck },
  { path: '/reference', label: '引用查询', icon: Search },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-20',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-semibold whitespace-nowrap">数据标准字典库</h1>
              <p className="text-xs text-slate-400 whitespace-nowrap">Data Standard Dictionary</p>
            </div>
          )}
        </div>
      </div>

      <nav className="py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-cyan-400' : '')} />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-700/50">
          {!collapsed && (
            <p className="px-3 text-xs text-slate-500 uppercase tracking-wider mb-2">管理</p>
          )}
          <button
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors',
              'text-slate-400 hover:text-white hover:bg-slate-700/50'
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">系统设置</span>}
          </button>
        </div>
      </nav>

      <button
        onClick={onToggle}
        className={cn(
          'absolute bottom-4 -right-3 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center',
          'text-slate-300 hover:text-white hover:bg-slate-600 transition-colors shadow-lg'
        )}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={cn('absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50', collapsed ? 'px-2' : '')}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-sm font-medium">
            治
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">数据治理专员</p>
              <p className="text-xs text-slate-400 truncate">zhangsan@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
