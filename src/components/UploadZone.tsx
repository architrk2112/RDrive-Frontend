import { useState, useRef, useCallback } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { UploadProgress } from '@/components/UploadProgress';

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
}

export default function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setSelectedFiles(Array.from(fileList));
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const startUpload = () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setTimeout(() => {
      onUpload(selectedFiles);
      setSelectedFiles([]);
      setUploading(false);
    }, 1800);
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-400 bg-blue-50 scale-[1.01]'
            : 'border-slate-300 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
        }`}
      >
        <div className={`flex h-14 w-14 items-center justify-center rounded-full transition-all ${
          isDragging ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'
        }`}>
          <UploadCloud size={28} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">
            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            or <span className="text-blue-500 font-medium">browse</span> from your computer
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={startUpload}
                disabled={uploading}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => setSelectedFiles([])}
                disabled={uploading}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <UploadProgress
                key={idx}
                fileName={file.name}
                fileSize={file.size}
                uploading={uploading}
                onRemove={() => removeFile(idx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
