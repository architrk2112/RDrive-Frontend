export type FileVisibility = 'private' | 'public';

export interface DriveFile {
  _id: string;
  name: string;
  size: number;
  mimeType: string;
  visibility: FileVisibility;
  folderId: string | null;
  uploadedAt?: string;
  userId?: string;
}

export interface DriveFolder {
  _id: string;
  name: string;
  parentFolderId: string | null;
  userId?: string;
  createdAt?: string;
}

export const mockFolders: DriveFolder[] = [
  { _id: 'f1', name: 'Documents', parentFolderId: null, createdAt: '2025-08-12' },
  { _id: 'f2', name: 'Photos', parentFolderId: null, createdAt: '2025-09-01' },
  { _id: 'f3', name: 'Projects', parentFolderId: null, createdAt: '2025-09-10' },
  { _id: 'f4', name: 'Work', parentFolderId: 'f1', createdAt: '2025-08-15' },
  { _id: 'f5', name: 'Personal', parentFolderId: 'f1', createdAt: '2025-08-20' },
  { _id: 'f6', name: 'Vacation', parentFolderId: 'f2', createdAt: '2025-09-03' },
];

export const mockFiles: DriveFile[] = [
  { _id: 'file1', name: 'Resume.pdf', size: 245000, mimeType: 'pdf', visibility: 'private', folderId: null, uploadedAt: '2025-09-14' },
  { _id: 'file2', name: 'Portfolio.zip', size: 52400000, mimeType: 'zip', visibility: 'public', folderId: null, uploadedAt: '2025-09-15' },
  { _id: 'file3', name: 'budget-2025.xlsx', size: 88000, mimeType: 'xlsx', visibility: 'private', folderId: null, uploadedAt: '2025-09-10' },
  { _id: 'file4', name: 'presentation.pptx', size: 12400000, mimeType: 'pptx', visibility: 'public', folderId: null, uploadedAt: '2025-09-12' },
  { _id: 'file5', name: 'Contract.docx', size: 156000, mimeType: 'docx', visibility: 'private', folderId: 'f1', uploadedAt: '2025-08-14' },
  { _id: 'file6', name: 'Meeting-Notes.txt', size: 12000, mimeType: 'txt', visibility: 'public', folderId: 'f4', uploadedAt: '2025-08-16' },
  { _id: 'file7', name: 'sunset.jpg', size: 3200000, mimeType: 'jpg', visibility: 'public', folderId: 'f2', uploadedAt: '2025-09-02' },
  { _id: 'file8', name: 'mountain.png', size: 5100000, mimeType: 'png', visibility: 'private', folderId: 'f6', uploadedAt: '2025-09-04' },
  { _id: 'file9', name: 'beach-clip.mp4', size: 88000000, mimeType: 'mp4', visibility: 'public', folderId: 'f6', uploadedAt: '2025-09-05' },
  { _id: 'file10', name: 'app-mockup.fig', size: 2100000, mimeType: 'fig', visibility: 'private', folderId: 'f3', uploadedAt: '2025-09-11' },
  { _id: 'file11', name: 'source-code.js', size: 45000, mimeType: 'js', visibility: 'public', folderId: 'f3', uploadedAt: '2025-09-13' },
  { _id: 'file12', name: 'design-system.pdf', size: 980000, mimeType: 'pdf', visibility: 'public', folderId: 'f3', uploadedAt: '2025-09-13' },
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
