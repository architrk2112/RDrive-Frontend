import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/context/DriveContext';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (folderId: string) => void;
}

export default function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 flex-wrap">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={item.id} className="flex items-center gap-1">
            {idx === 0 ? (
              <button
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-all ${
                  isLast
                    ? 'text-slate-700 cursor-default'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <Home size={15} />
                {item.name}
              </button>
            ) : (
              <button
                onClick={() => !isLast && onNavigate(item.id)}
                disabled={isLast}
                className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all ${
                  isLast
                    ? 'text-slate-700 cursor-default'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {item.name}
              </button>
            )}
            {!isLast && <ChevronRight size={15} className="text-slate-300" />}
          </div>
        );
      })}
    </nav>
  );
}
