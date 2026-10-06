import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Download, FileText, Folder, Globe, ImageIcon, Lock, Loader2, AlertTriangle, ArrowLeft, ChevronRight, FolderOpen, Eye } from 'lucide-react';
import { DriveFile, DriveFolder, formatFileSize } from '@/data/mockData';
import { PublicShareInfo } from '@/data/shareData';
import { fetchPublicDriveRoot, fetchPublicFolderContents, getPublicFileDownloadUrl, getPublicFileViewUrl, getPublicShare } from '@/lib/api';

interface PublicShareFolderContents {
  folders: DriveFolder[];
  files: DriveFile[];
}

function getFileIcon(type: string) {
  const mime = type.toLowerCase();
  if (mime.includes('image')) return ImageIcon;
  if (mime.includes('pdf') || mime.includes('text')) return FileText;
  return Folder;
}

export default function PublicShare() {
  const { token } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [shareInfo, setShareInfo] = useState<PublicShareInfo | null>(null);
  const [folderMap, setFolderMap] = useState<PublicShareFolderContents>({ folders: [], files: [] });
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('This shared link is invalid or no longer available.');
      setLoading(false);
      return;
    }

    const initialFolder = searchParams.get('folder');
    const run = async () => {
      setLoading(true);
      try {
        const info = await getPublicShare(token);
        if (!info) {
          setError('This shared link is invalid or no longer available.');
          setLoading(false);
          return;
        }

        setShareInfo(info);

        if (info.status === 'revoked') {
          setError('This shared link has been revoked.');
          setLoading(false);
          return;
        }

        if (info.status === 'expired') {
          setError('This shared link has expired.');
          setLoading(false);
          return;
        }

        const rootFolderId = info.resourceType === 'folder' ? info.folderId ?? 'root' : 'root';
        const folderToLoad = initialFolder ?? rootFolderId;
        setCurrentFolderId(folderToLoad);

        if (info.resourceType === 'drive') {
          const result = await fetchPublicDriveRoot(token);
          setFolderMap({ folders: result.folders, files: result.files });
          setLoading(false);
          return;
        }

        const result = await fetchPublicFolderContents(token, folderToLoad);
        setFolderMap({ folders: result.folders, files: result.files });
        setLoading(false);
      } catch (requestError) {
        console.error('Failed to load public share', requestError);
        setError('This shared link is invalid or no longer available.');
        setLoading(false);
      }
    };

    void run();
  }, [searchParams, token]);

  const breadcrumbs = useMemo(() => {
    if (!shareInfo) return [{ id: 'root', name: 'Shared content' }];

    if (shareInfo.resourceType === 'drive') {
      return [{ id: 'root', name: 'Shared drive' }];
    }

    return [{ id: shareInfo.folderId ?? 'root', name: shareInfo.name }];
  }, [shareInfo]);

  const handleNavigate = async (folderId: string) => {
    if (!token || !shareInfo) return;
    const nextFolderId = folderId === 'root' ? 'root' : folderId;
    setCurrentFolderId(nextFolderId);
    setSearchParams({ folder: nextFolderId }, { replace: true });

    setLoading(true);
    try {
      const result = shareInfo.resourceType === 'drive'
        ? await fetchPublicDriveRoot(token)
        : await fetchPublicFolderContents(token, nextFolderId);
      setFolderMap({ folders: result.folders, files: result.files });
    } catch (navError) {
      setError('This shared link is no longer available.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (fileId: string) => {
    if (!token) return;
    window.open(getPublicFileViewUrl(token, fileId), '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (fileId: string) => {
    if (!token) return;
    const link = document.createElement('a');
    link.href = getPublicFileDownloadUrl(token, fileId);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-slate-600">Loading shared content...</span>
        </div>
      </div>
    );
  }

  if (error || !shareInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-800">Shared link unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{error || 'This shared link is invalid or no longer available.'}</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Globe size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">RDrive</p>
              <h1 className="text-lg font-bold text-slate-800">{shareInfo.resourceType === 'drive' ? 'Shared drive' : shareInfo.name}</h1>
            </div>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            {shareInfo.status === 'active' ? 'Active share' : shareInfo.status}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{shareInfo.resourceType === 'drive' ? 'Shared drive' : 'Shared folder'}</span>
                <ChevronRight size={14} />
                <span>{shareInfo.resourceType === 'drive' ? 'Root' : shareInfo.name}</span>
              </div>
              <p className="mt-2 text-xl font-bold text-slate-800">
                {shareInfo.resourceType === 'drive' ? 'My Entire Drive' : shareInfo.name}
              </p>
            </div>
            {shareInfo.expiresAt && (
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Expires: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(shareInfo.expiresAt))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <button type="button" onClick={() => navigate('/login')} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800">
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Contents</h2>
          </div>

          {folderMap.folders.length === 0 && folderMap.files.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <FolderOpen size={40} className="mx-auto text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-700">This folder is empty.</h3>
              <p className="mt-1 text-sm text-slate-500">There is currently nothing in this shared scope.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {folderMap.folders.map((folder) => (
                <button
                  key={folder._id}
                  type="button"
                  onClick={() => handleNavigate(folder._id)}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <Folder size={22} />
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold text-slate-700">{folder.name}</p>
                </button>
              ))}

              {folderMap.files.map((file) => {
                const Icon = getFileIcon(file.mimeType);
                const canPreview = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'mov', 'mp3', 'wav', 'txt'].some((extension) =>
                  file.mimeType.toLowerCase().includes(extension) || file.name.toLowerCase().endsWith(extension)
                );

                return (
                  <div key={file._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                        <Icon size={22} />
                      </div>
                    </div>
                    <p className="mt-3 truncate text-sm font-semibold text-slate-700" title={file.name}>{file.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    <div className="mt-3 flex gap-2">
                      {canPreview && (
                        <button
                          type="button"
                          onClick={() => handlePreview(file._id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700"
                        >
                          <Eye size={12} />
                          View
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDownload(file._id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
