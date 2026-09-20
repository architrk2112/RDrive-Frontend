import { X } from 'lucide-react';
import { useState } from 'react';

interface CreateFolderModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateFolderModal({ onClose, onCreate }: CreateFolderModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">Create new folder</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
