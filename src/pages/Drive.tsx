import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Upload,
  X,
  ChevronDown,
  LogOut,
  User as UserIcon,
  HardDrive,
} from 'lucide-react';
import Logo from '@/components/Logo';
import Breadcrumbs from '@/components/Breadcrumbs';
import FolderCard from '@/components/FolderCard';
import FileCard from '@/components/FileCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import UploadZone from '@/components/UploadZone';
import CreateFolderModal from '@/components/CreateFolderModal';
import { useAuth } from '@/context/AuthContext';
import { useDrive } from '@/context/DriveContext';
import { getDriveFileDownloadUrl, getDriveFileViewUrl } from '@/lib/api';

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
    deleteFolder,
    deleteFile,
    renameFolder,
    renameFile,
  } = useDrive();
  const navigate = useNavigate();

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadQueueCount, setUploadQueueCount] = useState(0);
  const [isUploadInProgress, setIsUploadInProgress] = useState(false);
  const [confirmQueueClear, setConfirmQueueClear] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const updateUploadQueueCount = useCallback((count: number) => {
    setUploadQueueCount(count);
  }, []);

  const updateUploadInProgress = useCallback((uploading: boolean) => {
    setIsUploadInProgress(uploading);
  }, []);

  const toggleUploadPanel = () => {
    if (showUpload && uploadQueueCount > 0) {
      setConfirmQueueClear(true);
      return;
    }

    setShowUpload((open) => !open);
    setUploadQueueCount(0);
  };

  const closeUploaderAndClearQueue = () => {
    setShowUpload(false);
    setUploadQueueCount(0);
    setConfirmQueueClear(false);
  };

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDownload = (fileId: string) => {
    const link = document.createElement('a');
    link.href = getDriveFileDownloadUrl(fileId);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleView = (fileId: string) => {
    window.open(getDriveFileViewUrl(fileId), '_blank', 'noopener,noreferrer');
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
                    onClick={() => {
                      setUserMenuOpen(false);
                      setConfirmSignOut(true);
                    }}
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
              onClick={toggleUploadPanel}
              disabled={isLoading || isUploadInProgress}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                showUpload
                  ? 'bg-slate-600 hover:bg-slate-700'
                  : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30'
              }`}
              title={showUpload ? 'Close the uploader and clear queued files' : 'Open the file and folder uploader'}
            >
              {showUpload ? <X size={18} /> : <Upload size={18} />}
              {showUpload ? 'Close & clear queue' : 'Upload files & folders'}
            </button>
          </div>
        </div>

        {/* Upload zone */}
        {showUpload && (
          <div className="mb-6">
            <UploadZone
              existingFiles={files}
              onQueueCountChange={updateUploadQueueCount}
              onUploadingChange={updateUploadInProgress}
              onUpload={addFiles}
            />
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
                    onDelete={() => deleteFolder(folder._id)}
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
                  onView={() => handleView(file._id)}
                  onDownload={() => handleDownload(file._id)}
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
      {confirmQueueClear && (
        <ConfirmDialog
          title="Clear upload queue?"
          description={`Closing the uploader will remove ${uploadQueueCount} queued ${uploadQueueCount === 1 ? 'file' : 'files'}. They will not be uploaded.`}
          confirmLabel="Clear queue"
          variant="danger"
          onCancel={() => setConfirmQueueClear(false)}
          onConfirm={closeUploaderAndClearQueue}
        />
      )}
      {confirmSignOut && (
        <ConfirmDialog
          title="Sign out of RDrive?"
          description="You will need to sign in again to access your files."
          confirmLabel="Sign out"
          variant="danger"
          onCancel={() => setConfirmSignOut(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}
