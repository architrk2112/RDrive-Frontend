import { useState } from 'react';
import { Folder, Pencil, Trash2 } from 'lucide-react';
import RenameModal from '@/components/RenameModal';
import { DriveFolder } from '@/data/mockData';

interface FolderCardProps {
  folder: DriveFolder;
  onOpen: () => void;
  onRename: (newName: string) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  fileCount: number;
}

export default function FolderCard({ folder, onOpen, onRename, onDelete, fileCount }: FolderCardProps) {
  const [renameOpen, setRenameOpen] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md">
        <button
          type="button"
          onDoubleClick={onOpen}
          onClick={onOpen}
          className="w-full text-center"
        >
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 transition-all group-hover:scale-105 group-hover:from-blue-200 group-hover:to-blue-100">
              <Folder size={32} className="text-blue-500" strokeWidth={2} fill="currentColor" fillOpacity={0.15} />
            </div>
          </div>
          <div className="mt-3 w-full text-center">
            <p className="truncate text-sm font-semibold text-slate-700">{folder.name}</p>
            <p className="mt-0.5 text-xs text-slate-400">{fileCount} {fileCount === 1 ? 'item' : 'items'}</p>
          </div>
        </button>

        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setRenameOpen(true)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label={`Rename ${folder.name}`}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete "${folder.name}" and all its contents? This cannot be undone.`)) {
                void onDelete();
              }
            }}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${folder.name} and its contents`}
            title="Delete folder and all contents"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {renameOpen && (
        <RenameModal
          title="Rename folder"
          currentName={folder.name}
          onClose={() => setRenameOpen(false)}
          onRename={onRename}
        />
      )}
    </>
  );
}
