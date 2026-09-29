import { CheckCircle2, Loader2, X } from 'lucide-react';
import { formatFileSize } from '@/data/mockData';

interface UploadProgressProps {
  fileName: string;
  fileSize: number;
  uploading: boolean;
  progress: number;
  onRemove: () => void;
}

export function UploadProgress({ fileName, fileSize, uploading, progress, onRemove }: UploadProgressProps) {
  const progressWidth = Math.max(0, Math.min(100, progress));

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-slate-700">{fileName}</p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">{formatFileSize(fileSize)}</span>
            {uploading && (
              <span className="text-[11px] font-medium text-blue-600">{progressWidth}%</span>
            )}
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              uploading ? 'bg-blue-500' : 'bg-slate-200'
            }`}
            style={{ width: `${uploading ? progressWidth : 0}%` }}
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
