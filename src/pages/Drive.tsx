import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Upload,
  ChevronDown,
  LogOut,
  User as UserIcon,
  HardDrive,
} from 'lucide-react';
import Logo from '@/components/Logo';
import Breadcrumbs from '@/components/Breadcrumbs';
import FolderCard from '@/components/FolderCard';
import FileCard from '@/components/FileCard';
import UploadZone from '@/components/UploadZone';
import CreateFolderModal from '@/components/CreateFolderModal';
import { useAuth } from '@/context/AuthContext';
import { useDrive } from '@/context/DriveContext';
import { downloadDriveFile } from '@/lib/api';

export default function Drive() {
  const { user, logout } = useAuth();
  const {
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
  } = useDrive();
  const navigate = useNavigate();

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const folderId = new URLSearchParams(window.location.search).get('folder') ?? 'root';
      if (folderId === 'root') {
        void navigateToBreadcrumb('root', true);
        return;
      }

      void navigateToBreadcrumb(folderId, true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateToBreadcrumb]);

  const visibleFolders = folders.filter((f) => {
    if (currentFolderId === 'root') return f.parentFolderId === null;
    return f.parentFolderId === currentFolderId;
  });

  const visibleFiles = files.filter((f) => f.folderId === currentFolderId || (currentFolderId === 'root' && f.folderId === null));

  const getFolderItemCount = (folderId: string): number => {
    const nestedFolders = folders.filter((folder) => folder.parentFolderId === folderId);
    const nestedFiles = files.filter((file) => file.folderId === folderId);

    return nestedFolders.reduce((total, folder) => total + 1 + getFolderItemCount(folder._id), 0) + nestedFiles.length;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    const url = await downloadDriveFile(fileId);

    if (!url) {
      const blob = new Blob([`This is a placeholder download for ${fileName}`], { type: 'text/plain' });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
          <p className="text-sm font-medium">Loading folder contents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-2.5 transition-all hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-sm font-semibold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden text-sm font-medium text-slate-700 sm:block">
                  {user?.name || 'User'}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                    <UserIcon size={16} className="text-slate-400" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-5">
          <Breadcrumbs items={breadcrumbs} onNavigate={navigateToBreadcrumb} />
        </div>

        {/* Action bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {breadcrumbs[breadcrumbs.length - 1]?.name || 'My Drive'}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {visibleFolders.length} {visibleFolders.length === 1 ? 'folder' : 'folders'} · {visibleFiles.length} {visibleFiles.length === 1 ? 'file' : 'files'}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCreateFolder(true)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FolderPlus size={18} className="text-slate-400" />
              New folder
            </button>
            <button
              onClick={() => setShowUpload((p) => !p)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={18} />
              Upload
            </button>
          </div>
        </div>

        {/* Upload zone */}
        {showUpload && (
          <div className="mb-6">
            <UploadZone onUpload={addFiles} />
          </div>
        )}

        {/* Folders */}
        {visibleFolders.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Folders</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {visibleFolders.map((folder) => {
                const count = getFolderItemCount(folder._id);
                return (
                  <FolderCard
                    key={folder._id}
                    folder={folder}
                    fileCount={count}
                    onOpen={() => navigateTo(folder._id, folder.name)}
                    onRename={(nextName) => renameFolder(folder._id, nextName)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Files */}
        {visibleFiles.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Files</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {visibleFiles.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  onToggleVisibility={() => toggleFileVisibility(file._id)}
                  onDownload={() => handleDownload(file._id, file.name)}
                  onDelete={() => deleteFile(file._id)}
                  onRename={(nextName) => renameFile(file._id, nextName)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {visibleFolders.length === 0 && visibleFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
              <HardDrive size={36} className="text-slate-300" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-600">This folder is empty</h3>
            <p className="mt-1 text-sm text-slate-400">Upload files or create a folder to get started.</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowCreateFolder(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
              >
                <FolderPlus size={18} className="text-slate-400" />
                New folder
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-600"
              >
                <Upload size={18} />
                Upload
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onCreate={createFolder}
        />
      )}
    </div>
  );
}
