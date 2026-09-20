import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Image,
  Video,
  Archive,
  Music,
  Code,
  FileSpreadsheet,
  Presentation,
  File as FileIcon,
  MoreVertical,
  Download,
  Lock,
  Globe,
  Trash2,
} from 'lucide-react';
import { DriveFile, formatFileSize } from '@/data/mockData';

interface FileCardProps {
  file: DriveFile;
  onToggleVisibility: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

function getFileIcon(type: string) {
  const iconMap: Record<string, typeof FileText> = {
    pdf: FileText,
    jpg: Image,
    jpeg: Image,
    png: Image,
    gif: Image,
    webp: Image,
    svg: Image,
    mp4: Video,
    mov: Video,
    avi: Video,
    mkv: Video,
    zip: Archive,
    rar: Archive,
    '7z': Archive,
    mp3: Music,
    wav: Music,
    flac: Music,
    js: Code,
    ts: Code,
    jsx: Code,
    tsx: Code,
    py: Code,
    html: Code,
    css: Code,
    json: Code,
    xlsx: FileSpreadsheet,
    xls: FileSpreadsheet,
    csv: FileSpreadsheet,
    pptx: Presentation,
    ppt: Presentation,
    docx: FileText,
    doc: FileText,
    txt: FileText,
    fig: FileIcon,
    default: FileIcon,
  };
  return iconMap[type.toLowerCase()] || iconMap.default;
}

function getIconColor(type: string): string {
  const colorMap: Record<string, string> = {
    pdf: 'text-red-500 bg-red-50',
    jpg: 'text-emerald-500 bg-emerald-50',
    jpeg: 'text-emerald-500 bg-emerald-50',
    png: 'text-emerald-500 bg-emerald-50',
    gif: 'text-emerald-500 bg-emerald-50',
    svg: 'text-emerald-500 bg-emerald-50',
    mp4: 'text-purple-500 bg-purple-50',
    mov: 'text-purple-500 bg-purple-50',
    avi: 'text-purple-500 bg-purple-50',
    mkv: 'text-purple-500 bg-purple-50',
    zip: 'text-amber-500 bg-amber-50',
    rar: 'text-amber-500 bg-amber-50',
    '7z': 'text-amber-500 bg-amber-50',
    mp3: 'text-pink-500 bg-pink-50',
    wav: 'text-pink-500 bg-pink-50',
    flac: 'text-pink-500 bg-pink-50',
    js: 'text-yellow-500 bg-yellow-50',
    ts: 'text-blue-500 bg-blue-50',
    jsx: 'text-yellow-500 bg-yellow-50',
    tsx: 'text-blue-500 bg-blue-50',
    py: 'text-green-500 bg-green-50',
    html: 'text-orange-500 bg-orange-50',
    css: 'text-blue-500 bg-blue-50',
    json: 'text-slate-500 bg-slate-50',
    xlsx: 'text-green-600 bg-green-50',
    xls: 'text-green-600 bg-green-50',
    csv: 'text-green-600 bg-green-50',
    pptx: 'text-orange-500 bg-orange-50',
    ppt: 'text-orange-500 bg-orange-50',
    docx: 'text-blue-600 bg-blue-50',
    doc: 'text-blue-600 bg-blue-50',
    txt: 'text-slate-500 bg-slate-50',
    fig: 'text-indigo-500 bg-indigo-50',
  };
  return colorMap[type.toLowerCase()] || 'text-slate-500 bg-slate-50';
}

export default function FileCard({ file, onToggleVisibility, onDownload, onDelete }: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const Icon = getFileIcon(file.mimeType);
  const iconColor = getIconColor(file.mimeType);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColor} transition-transform group-hover:scale-105`}>
          <Icon size={24} strokeWidth={1.75} />
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
              <button
                onClick={() => { onDownload(); setMenuOpen(false); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Download size={16} className="text-slate-400" />
                Download
              </button>
              <button
                onClick={() => { onToggleVisibility(); setMenuOpen(false); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                {file.visibility === 'private' ? (
                  <>
                    <Globe size={16} className="text-slate-400" />
                    Make public
                  </>
                ) : (
                  <>
                    <Lock size={16} className="text-slate-400" />
                    Make private
                  </>
                )}
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onDelete(); setMenuOpen(false); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex-1">
        <p className="truncate text-sm font-semibold text-slate-700" title={file.name}>{file.name}</p>
        <p className="text-xs text-slate-400 mt-1">{formatFileSize(file.size)}</p>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {file.visibility === 'private' ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            <Lock size={11} />
            Private
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
            <Globe size={11} />
            Public
          </span>
        )}
      </div>
    </div>
  );
}
