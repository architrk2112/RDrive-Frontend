import { CheckCircle2, Loader2, X } from 'lucide-react';
import { formatFileSize } from '@/data/mockData';

interface UploadProgressProps {
  fileName: string;
  fileSize: number;
  uploading: boolean;
  onRemove: () => void;
}

export function UploadProgress({ fileName, fileSize, uploading, onRemove }: UploadProgressProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-slate-700">{fileName}</p>
          <span className="text-xs text-slate-400 shrink-0">{formatFileSize(fileSize)}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              uploading ? 'bg-blue-500 w-3/4' : 'bg-slate-200 w-0'
            }`}
          />
        </div>
      </div>
      <div className="shrink-0">
        {uploading ? (
          <Loader2 size={18} className="animate-spin text-blue-500" />
        ) : (
          <button onClick={onRemove} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
