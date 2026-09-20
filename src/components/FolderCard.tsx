import { Folder } from 'lucide-react';
import { DriveFolder } from '@/data/mockData';

interface FolderCardProps {
  folder: DriveFolder;
  onOpen: () => void;
  fileCount: number;
}

export default function FolderCard({ folder, onOpen, fileCount }: FolderCardProps) {
  return (
    <button
      onDoubleClick={onOpen}
      onClick={onOpen}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
    >
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 transition-all group-hover:scale-105 group-hover:from-blue-200 group-hover:to-blue-100">
          <Folder size={32} className="text-blue-500" strokeWidth={2} fill="currentColor" fillOpacity={0.15} />
        </div>
      </div>
      <div className="w-full text-center">
        <p className="truncate text-sm font-semibold text-slate-700">{folder.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{fileCount} {fileCount === 1 ? 'item' : 'items'}</p>
      </div>
    </button>
  );
}
