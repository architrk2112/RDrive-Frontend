import { useState, useRef, useCallback, useEffect, type InputHTMLAttributes } from 'react';
import { FolderUp, UploadCloud, X } from 'lucide-react';
import { UploadProgress } from '@/components/UploadProgress';
import ConfirmDialog from '@/components/ConfirmDialog';
import { DriveFile, formatFileSize } from '@/data/mockData';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 * 1024;
const folderPickerAttributes = { webkitdirectory: '' } as InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory: string;
};

interface UploadQueueItem {
  id: number;
  file: File;
  relativePath: string;
  errorMessage?: string;
}

interface UploadSelection {
  file: File;
  relativePath: string;
}

interface DirectoryPickerEntry {
  name: string;
  kind: 'file' | 'directory';
  getFile?: () => Promise<File>;
  values?: () => AsyncIterable<DirectoryPickerEntry>;
}

interface DirectoryPickerWindow extends Window {
  showDirectoryPicker?: () => Promise<DirectoryPickerEntry>;
}

interface UploadZoneProps {
  existingFiles: DriveFile[];
  onQueueCountChange: (count: number) => void;
  onUploadingChange: (uploading: boolean) => void;
  onUpload: (files: File[], relativePaths: string[], onProgress?: (percent: number) => void) => Promise<void> | void;
}

export default function UploadZone({ existingFiles, onQueueCountChange, onUploadingChange, onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadQueueItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sizeLimitMessage, setSizeLimitMessage] = useState('');
  const [folderPickerError, setFolderPickerError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const nextItemId = useRef(0);

  useEffect(() => {
    onQueueCountChange(selectedFiles.length);
  }, [onQueueCountChange, selectedFiles.length]);

  const queueFiles = useCallback((selections: UploadSelection[]) => {
    if (uploading || selections.length === 0) return;
    const folderSizes = new Map<string, number>();
    const addedFiles = selections.map(({ file, relativePath }) => {
      const pathSegments = relativePath.replace(/\\/g, '/').split('/');
      const folderName = pathSegments.length > 1 ? pathSegments[0] : null;

      if (folderName) {
        folderSizes.set(folderName, (folderSizes.get(folderName) ?? 0) + file.size);
      }

      return {
        id: nextItemId.current++,
        file,
        relativePath,
        folderName,
      };
    });

    const oversizedFolders = Array.from(folderSizes, ([folderName, totalSize]) => ({ folderName, totalSize }))
      .filter(({ totalSize }) => totalSize > MAX_UPLOAD_BYTES);
    const oversizedFolderNames = new Set(oversizedFolders.map(({ folderName }) => folderName));
    const oversizedFiles: typeof addedFiles = [];
    const filesWithinLimit: typeof addedFiles = [];

    for (const item of addedFiles) {
      const fileIsOversized = item.file.size > MAX_UPLOAD_BYTES;
      const folderIsOversized = item.folderName !== null && oversizedFolderNames.has(item.folderName);

      if (fileIsOversized && !item.folderName) {
        oversizedFiles.push(item);
      }
      if (!fileIsOversized && !folderIsOversized) {
        filesWithinLimit.push(item);
      }
    }

    if (oversizedFolders.length > 0 || oversizedFiles.length > 0) {
      const messages = [
        ...oversizedFolders.map(({ folderName, totalSize }) =>
          `Folder "${folderName}" is ${formatFileSize(totalSize)}. Its files were not added.`,
        ),
        ...oversizedFiles.slice(0, 5).map(({ file, relativePath }) =>
          `File "${relativePath}" is ${formatFileSize(file.size)} and was not added.`,
        ),
      ];
      const remainingFiles = oversizedFiles.length - 5;
      if (remainingFiles > 0) {
        messages.push(`And ${remainingFiles} more oversized ${remainingFiles === 1 ? 'file' : 'files'}.`);
      }
      messages.push('The maximum allowed size is 10 GB.');
      setSizeLimitMessage(messages.join('\n'));
    }

    if (filesWithinLimit.length === 0) return;

    const existingFileKeys = new Set(
      existingFiles.map((file) => `${file.name.trim().toLocaleLowerCase()}\u0000${file.size}`),
    );

    setSelectedFiles((previousFiles) => {
      const queuedFileKeys = new Set(
        previousFiles
          .filter((item) => !item.errorMessage)
          .map((item) => `${item.relativePath.trim().toLocaleLowerCase()}\u0000${item.file.size}`),
      );

      return [
        ...previousFiles,
        ...filesWithinLimit.map((item) => {
          const fileKey = `${item.relativePath.trim().toLocaleLowerCase()}\u0000${item.file.size}`;
          let errorMessage: string | undefined;

          if (item.relativePath === item.file.name && existingFileKeys.has(`${item.file.name.trim().toLocaleLowerCase()}\u0000${item.file.size}`)) {
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

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (uploading || !fileList || fileList.length === 0) return;
    queueFiles(Array.from(fileList, (file) => ({
      file,
      relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
    })));
  }, [queueFiles, uploading]);

  const selectFolder = async () => {
    if (uploading) return;

    const pickerWindow = window as DirectoryPickerWindow;
    if (!pickerWindow.showDirectoryPicker) {
      folderInputRef.current?.click();
      return;
    }

    try {
      const selectedDirectory = await pickerWindow.showDirectoryPicker();
      const selections: UploadSelection[] = [];

      const collectFiles = async (directory: DirectoryPickerEntry, relativeDirectory: string): Promise<void> => {
        if (!directory.values) {
          throw new Error('The selected directory cannot be read.');
        }

        for await (const entry of directory.values()) {
          const relativePath = `${relativeDirectory}/${entry.name}`;
          if (entry.kind === 'directory') {
            await collectFiles(entry, relativePath);
          } else if (entry.getFile) {
            selections.push({
              file: await entry.getFile(),
              relativePath,
            });
          }
        }
      };

      await collectFiles(selectedDirectory, selectedDirectory.name);
      queueFiles(selections);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Folder selection error:', error);
      setFolderPickerError('The selected folder could not be read. Check folder permissions and try again.');
    }
  };

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
      await onUpload(
        filesToUpload.map((item) => item.file),
        filesToUpload.map((item) => item.relativePath),
        (percent) => {
        setUploadProgress(percent);
        },
      );
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
        <input
          ref={folderInputRef}
          type="file"
          {...folderPickerAttributes}
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.currentTarget.value = '';
          }}
        />
      </div>

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => void selectFolder()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FolderUp size={16} />
          Upload folder
        </button>
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
                fileName={item.relativePath}
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

      {sizeLimitMessage && (
        <ConfirmDialog
          title="Upload size limit exceeded"
          description={sizeLimitMessage}
          confirmLabel="Understood"
          onCancel={() => setSizeLimitMessage('')}
          onConfirm={() => setSizeLimitMessage('')}
        />
      )}
      {folderPickerError && (
        <ConfirmDialog
          title="Could not open folder"
          description={folderPickerError}
          confirmLabel="Understood"
          onCancel={() => setFolderPickerError('')}
          onConfirm={() => setFolderPickerError('')}
        />
      )}
    </div>
  );
}
