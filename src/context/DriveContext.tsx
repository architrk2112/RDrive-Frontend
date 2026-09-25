import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  DriveFolder,
  DriveFile,
  FileVisibility,
} from '@/data/mockData';
import {
  createDriveFolder,
  deleteDriveFile,
  fetchDashboardData,
  fetchFolderContents,
  renameDriveFile,
  renameDriveFolder,
  updateFileVisibility,
  uploadDriveFiles,
} from '@/lib/api';

export interface BreadcrumbItem {
  id: string;
  name: string;
}

interface DriveContextValue {
  folders: DriveFolder[];
  files: DriveFile[];
  currentFolderId: string;
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
  navigateTo: (folderId: string, folderName?: string) => Promise<void>;
  navigateToBreadcrumb: (folderId: string, skipHistory?: boolean) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  addFiles: (newFiles: File[]) => Promise<void>;
  toggleFileVisibility: (fileId: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  renameFolder: (folderId: string, name: string) => Promise<void>;
  renameFile: (fileId: string, name: string) => Promise<void>;
}

const DriveContext = createContext<DriveContextValue | undefined>(undefined);

export function DriveProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'My Drive' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const { folders: initialFolders, files: initialFiles } = await fetchDashboardData();
        setFolders(initialFolders);
        setFiles(initialFiles);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const refreshCurrentFolder = async (folderId: string) => {
    setIsLoading(true);
    try {
      const { folders: nextFolders, files: nextFiles } = await fetchFolderContents(folderId);
      setFolders(nextFolders);
      setFiles(nextFiles);
    } finally {
      setIsLoading(false);
    }
  };

  const syncBrowserHistory = (folderId: string, nextBreadcrumbs: BreadcrumbItem[]) => {
    const params = new URLSearchParams(window.location.search);
    const hasFolderParam = params.get('folder');

    if (folderId === 'root') {
      const nextUrl = '/drive';
      window.history.pushState({ folderId: 'root', breadcrumbs: nextBreadcrumbs }, '', nextUrl);
      return;
    }

    const nextUrl = `/drive?folder=${encodeURIComponent(folderId)}`;
    const state = { folderId, breadcrumbs: nextBreadcrumbs };

    if (hasFolderParam === folderId) {
      window.history.replaceState(state, '', nextUrl);
      return;
    }

    window.history.pushState(state, '', nextUrl);
  };

  const navigateTo = async (folderId: string, folderName?: string) => {
    const name = folderName || 'Folder';
    const nextBreadcrumbs = (() => {
      const existingIndex = breadcrumbs.findIndex((item) => item.id === folderId);
      if (existingIndex >= 0) return breadcrumbs.slice(0, existingIndex + 1);
      return [...breadcrumbs, { id: folderId, name }];
    })();

    setCurrentFolderId(folderId);
    setBreadcrumbs(nextBreadcrumbs);
    syncBrowserHistory(folderId, nextBreadcrumbs);

    await refreshCurrentFolder(folderId);
  };

  const navigateToBreadcrumb = async (folderId: string, skipHistory = false) => {
    const idx = breadcrumbs.findIndex((b) => b.id === folderId);
    if (idx === -1) return;

    const nextBreadcrumbs = breadcrumbs.slice(0, idx + 1);
    setCurrentFolderId(folderId);
    setBreadcrumbs(nextBreadcrumbs);

    if (!skipHistory) {
      syncBrowserHistory(folderId, nextBreadcrumbs);
    }

    await refreshCurrentFolder(folderId);
  };

  const createFolder = async (name: string) => {
    const parentId = currentFolderId === 'root' ? null : currentFolderId;
    const newFolder = await createDriveFolder({ name, parentId });
    setFolders((prev) => [...prev, newFolder]);
    await refreshCurrentFolder(currentFolderId);
  };

  const addFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const uploadedFiles = await uploadDriveFiles(currentFolderId, newFiles);
    setFiles((prev) => [...prev, ...uploadedFiles]);
    await refreshCurrentFolder(currentFolderId);
  };

  const renameFolder = async (folderId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const renamed = await renameDriveFolder(folderId, trimmed);
    if (!renamed) {
      setFolders((prev) => prev.map((folder) => (folder._id === folderId ? { ...folder, name: trimmed } : folder)));
      return;
    }

    setFolders((prev) => prev.map((folder) => (folder._id === folderId ? { ...folder, name: renamed.name } : folder)));
  };

  const renameFile = async (fileId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const renamed = await renameDriveFile(fileId, trimmed);
    if (!renamed) {
      setFiles((prev) => prev.map((file) => (file._id === fileId ? { ...file, name: trimmed } : file)));
      return;
    }

    setFiles((prev) => prev.map((file) => (file._id === fileId ? { ...file, name: renamed.name } : file)));
  };

  const toggleFileVisibility = async (fileId: string) => {
    const targetFile = files.find((file) => file._id === fileId);
    if (!targetFile) return;

    const updatedFile = await updateFileVisibility(fileId, targetFile.visibility === 'private' ? 'public' : 'private');
    if (!updatedFile) {
      setFiles((prev) =>
        prev.map((file) =>
          file._id === fileId
            ? { ...file, visibility: file.visibility === 'private' ? 'public' : 'private' }
            : file
        )
      );
      return;
    }

    setFiles((prev) => prev.map((file) => (file._id === fileId ? updatedFile : file)));
  };

  const deleteFile = async (fileId: string) => {
    const deleted = await deleteDriveFile(fileId);
    if (deleted) {
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
      return;
    }

    setFiles((prev) => prev.filter((file) => file._id !== fileId));
  };

  return (
    <DriveContext.Provider
      value={{
        folders,
        files,
        currentFolderId,
        breadcrumbs,
        isLoading,
        navigateTo,
        navigateToBreadcrumb,
        createFolder,
        addFiles,
        toggleFileVisibility,
        deleteFile,
        renameFolder,
        renameFile,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  const ctx = useContext(DriveContext);
  if (!ctx) throw new Error('useDrive must be used within DriveProvider');
  return ctx;
}
