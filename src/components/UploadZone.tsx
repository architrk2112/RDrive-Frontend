import { useState, useRef, useCallback, useEffect } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { UploadProgress } from '@/components/UploadProgress';
import { DriveFile } from '@/data/mockData';

interface UploadQueueItem {
  id: number;
  file: File;
  errorMessage?: string;
}

interface UploadZoneProps {
  existingFiles: DriveFile[];
  onQueueCountChange: (count: number) => void;
  onUploadingChange: (uploading: boolean) => void;
  onUpload: (files: File[], onProgress?: (percent: number) => void) => Promise<void> | void;
}

export default function UploadZone({ existingFiles, onQueueCountChange, onUploadingChange, onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadQueueItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextItemId = useRef(0);

  useEffect(() => {
    onQueueCountChange(selectedFiles.length);
  }, [onQueueCountChange, selectedFiles.length]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (uploading || !fileList || fileList.length === 0) return;
    const existingFileKeys = new Set(
      existingFiles.map((file) => `${file.name.trim().toLocaleLowerCase()}\u0000${file.size}`),
    );
    const addedFiles = Array.from(fileList).map((file) => ({
      id: nextItemId.current++,
      file,
    }));

    setSelectedFiles((previousFiles) => {
      const queuedFileKeys = new Set(
        previousFiles
          .filter((item) => !item.errorMessage)
          .map((item) => `${item.file.name.trim().toLocaleLowerCase()}\u0000${item.file.size}`),
      );

      return [
        ...previousFiles,
        ...addedFiles.map((item) => {
          const fileKey = `${item.file.name.trim().toLocaleLowerCase()}\u0000${item.file.size}`;
          let errorMessage: string | undefined;

          if (existingFileKeys.has(fileKey)) {
            errorMessage = 'A file with the same name and size already exists in this folder.';
          } else if (queuedFileKeys.has(fileKey)) {
            errorMessage = 'This file is already in the upload queue.';
          } else {
            queuedFileKeys.add(fileKey);
          }

          return { ...item, errorMessage };
        }),
      ];
    });
  }, [existingFiles, uploading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploading) return;
    handleFiles(e.dataTransfer.files);
  };

  const startUpload = async () => {
    const filesToUpload = selectedFiles.filter((item) => !item.errorMessage);
    if (filesToUpload.length === 0) return;

    setUploading(true);
    onUploadingChange(true);
    setUploadProgress(0);
    let uploadSucceeded = false;

    try {
      await onUpload(filesToUpload.map((item) => item.file), (percent) => {
        setUploadProgress(percent);
      });
      uploadSucceeded = true;
      setUploadProgress(100);
    } finally {
      if (uploadSucceeded) {
        setSelectedFiles((previousFiles) => previousFiles.filter((item) => item.errorMessage));
      }
      setUploading(false);
      onUploadingChange(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== idx));
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-6 transition-all ${
          uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${
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
          disabled={uploading}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.currentTarget.value = '';
          }}
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
                disabled={uploading || selectedFiles.every((item) => item.errorMessage)}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.filter((item) => !item.errorMessage).length}`}
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
            {selectedFiles.map((item) => (
              <UploadProgress
                key={item.id}
                fileName={item.file.name}
                fileSize={item.file.size}
                uploading={uploading && !item.errorMessage}
                progress={uploadProgress}
                errorMessage={item.errorMessage}
                onRemove={() => removeFile(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
