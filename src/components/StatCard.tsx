import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  color: 'cyan' | 'emerald' | 'amber' | 'purple' | 'red';
}

const colorClasses = {
  cyan: 'from-cyan-500 to-blue-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  purple: 'from-purple-500 to-pink-500',
  red: 'from-red-500 to-rose-500',
};

const bgColorClasses = {
  cyan: 'bg-cyan-50',
  emerald: 'bg-emerald-50',
  amber: 'bg-amber-50',
  purple: 'bg-purple-50',
  red: 'bg-red-50',
};

const iconColorClasses = {
  cyan: 'text-cyan-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
};

export function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={cn('w-4 h-4', trend >= 0 ? 'text-emerald-500' : 'text-red-500')} />
              <span className={cn('text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-xs text-gray-400">较上月</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', bgColorClasses[color])}>
          <Icon className={cn('w-6 h-6', iconColorClasses[color])} />
        </div>
      </div>
      <div className={cn('h-1 mt-4 rounded-full bg-gradient-to-r', colorClasses[color], 'opacity-60')} />
    </div>
  );
}
