import axios from 'axios';
import { DriveFile, DriveFolder, mockFiles, mockFolders } from '@/data/mockData';
import { CreateSharePayload, PublicShareInfo, ShareLink, mockPublicShareInfo, mockShareLinks } from '@/data/shareData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const normalizeFolder = (folder: Partial<DriveFolder> & Record<string, unknown>): DriveFolder => ({
  _id: String(folder._id ?? folder.id ?? `folder-${Date.now()}`),
  name: String(folder.name ?? 'Untitled folder'),
  parentFolderId: (folder.parentFolderId ?? folder.parentId ?? folder.parent_id ?? null) as string | null,
  createdAt: String(folder.createdAt ?? folder.created_at ?? new Date().toISOString().slice(0, 10)),
});

const normalizeFile = (file: Partial<DriveFile> & Record<string, unknown>): DriveFile => ({
  _id: String(file._id ?? file.id ?? `file-${Date.now()}`),
  name: String(file.name ?? 'Untitled file'),
  size: Number(file.size ?? 0),
  mimeType: String(
    file.mimeType ?? file.type ?? file.extension ?? file.name?.toString().split('.').pop()?.toLowerCase() ?? 'file'
  ),
  folderId: file.folderId === null || file.folderId === undefined ? null : String(file.folderId ?? file.folder_id ?? null),
  uploadedAt: String(file.uploadedAt ?? file.uploaded_at ?? new Date().toISOString().slice(0, 10)),
});

const fallbackDriveData = {
  folders: mockFolders,
  files: mockFiles,
};

const normalizeShareLink = (share: Partial<ShareLink> & Record<string, unknown>): ShareLink => ({
  id: String(share.id ?? share._id ?? `share-${Date.now()}`),
  token: String(share.token ?? share.shareToken ?? `token-${Date.now()}`),
  url: String(share.url ?? share.publicUrl ?? `https://rdrive.local/share/${share.token ?? 'demo'}`),
  resourceType: share.resourceType === 'drive' ? 'drive' : 'folder',
  folderId: share.folderId === null || share.folderId === undefined ? null : String(share.folderId),
  folderName: String(share.folderName ?? share.name ?? 'Shared resource'),
  folderPath: share.folderPath ? String(share.folderPath) : undefined,
  label: String(share.label ?? share.folderName ?? share.name ?? 'Shared resource'),
  createdAt: String(share.createdAt ?? new Date().toISOString()),
  expiresAt: share.expiresAt ? String(share.expiresAt) : null,
  status: share.status === 'expired'
    ? 'expired'
    : share.status === 'revoked'
      ? 'revoked'
      : 'active',
});

const normalizePublicShareInfo = (share: Partial<PublicShareInfo> & Record<string, unknown>): PublicShareInfo => ({
  id: String(share.id ?? share._id ?? `share-${Date.now()}`),
  token: String(share.token ?? share.shareToken ?? 'unknown-token'),
  resourceType: share.resourceType === 'drive' ? 'drive' : 'folder',
  name: String(share.name ?? share.folderName ?? 'Shared resource'),
  folderId: share.folderId === null || share.folderId === undefined ? null : String(share.folderId),
  rootFolderId: share.rootFolderId === null || share.rootFolderId === undefined ? null : String(share.rootFolderId),
  ownerName: share.ownerName ? String(share.ownerName) : undefined,
  createdAt: String(share.createdAt ?? new Date().toISOString()),
  expiresAt: share.expiresAt ? String(share.expiresAt) : null,
  status: share.status === 'expired'
    ? 'expired'
    : share.status === 'revoked'
      ? 'revoked'
      : 'active',
  url: String(share.url ?? share.publicUrl ?? `https://rdrive.local/share/${share.token ?? 'unknown-token'}`),
});

export async function fetchShareLinks() {
  try {
    const response = await api.get('/share-links');
    const payload = response.data ?? {};
    const links = Array.isArray(payload.links)
      ? payload.links
      : Array.isArray(payload.data?.links)
        ? payload.data.links
        : Array.isArray(payload)
          ? payload
          : [];

    return links.map((link: Record<string, unknown>) => normalizeShareLink(link));
  } catch (error) {
    console.warn('Share links API unavailable, using demo data.', error);
    return mockShareLinks;
  }
}

export async function createShareLink(payload: CreateSharePayload) {
  try {
    const response = await api.post('/share-links', payload);
    const share = response.data?.share ?? response.data ?? {};
    return normalizeShareLink(share);
  } catch (error) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: { message?: string };
      };
      message?: string;
    };

    const message = axiosError.response?.data?.message || axiosError.message || 'Unable to create share link.';
    throw new Error(message);
  }
}

export async function revokeShareLink(id: string) {
  try {
    await api.patch(`/share-links/${encodeURIComponent(id)}/revoke`);
    return true;
  } catch (error) {
    console.warn('Revoke share link API unavailable.', error);
    return false;
  }
}

export async function deleteShareLink(id: string) {
  try {
    await api.delete(`/share-links/${encodeURIComponent(id)}`);
    return true;
  } catch (error) {
    console.warn('Delete share link API unavailable.', error);
    return false;
  }
}

export async function getPublicShare(token: string): Promise<PublicShareInfo | null> {
  try {
    const response = await api.get(`/public/shares/${encodeURIComponent(token)}`);
    const share = response.data?.share ?? response.data ?? {};
    return normalizePublicShareInfo(share);
  } catch (error) {
    console.warn('Public share lookup API unavailable.', error);
    if (token === mockPublicShareInfo.token) {
      return mockPublicShareInfo;
    }
    return null;
  }
}

export async function fetchPublicFolderContents(token: string, folderId: string = 'root') {
  try {
    const response = await api.get(`/public/shares/${encodeURIComponent(token)}/folders/${encodeURIComponent(folderId)}`);
    const payload = response.data ?? {};
    const folders = Array.isArray(payload.folders) ? payload.folders : [];
    const files = Array.isArray(payload.files) ? payload.files : [];
    return { folders, files };
  } catch (error) {
    console.warn('Public folder listing API unavailable.', error);
    return { folders: [], files: [] };
  }
}

export async function fetchPublicDriveRoot(token: string) {
  try {
    const response = await api.get(`/public/shares/${encodeURIComponent(token)}/drive`);
    const payload = response.data ?? {};
    const folders = Array.isArray(payload.folders) ? payload.folders : [];
    const files = Array.isArray(payload.files) ? payload.files : [];
    return { folders, files };
  } catch (error) {
    console.warn('Public drive root API unavailable.', error);
    return { folders: [], files: [] };
  }
}

export function getPublicFileDownloadUrl(token: string, fileId: string) {
  return `${API_BASE_URL}/public/shares/${encodeURIComponent(token)}/files/${encodeURIComponent(fileId)}/download`;
}

export function getPublicFileViewUrl(token: string, fileId: string) {
  return `${API_BASE_URL}/public/shares/${encodeURIComponent(token)}/files/${encodeURIComponent(fileId)}/view`;
}

export async function fetchDashboardData() {
  try {
    const response = await api.get('/drive');
    const payload = response.data ?? {};
    const folders = Array.isArray(payload.folders)
      ? payload.folders.map(normalizeFolder)
      : Array.isArray(payload.data?.folders)
        ? payload.data.folders.map(normalizeFolder)
        : fallbackDriveData.folders;
    const files = Array.isArray(payload.files)
      ? payload.files.map(normalizeFile)
      : Array.isArray(payload.data?.files)
        ? payload.data.files.map(normalizeFile)
        : fallbackDriveData.files;

    return { folders, files };
  } catch (error) {
    console.warn('Dashboard API unavailable, using mock drive data.', error);
    return fallbackDriveData;
  }
}

export async function fetchFolderContents(folderId: string = 'root') {
  try {
    const response = await api.get(`/folders/${folderId}/contents`);
    const payload = response.data ?? {};
    const folders = Array.isArray(payload.folders)
      ? payload.folders.map(normalizeFolder)
      : Array.isArray(payload.data?.folders)
        ? payload.data.folders.map(normalizeFolder)
        : fallbackDriveData.folders.filter((folder) => {
            if (folderId === 'root') return folder.parentFolderId === null;
            return folder.parentFolderId === folderId;
          });
    const files = Array.isArray(payload.files)
      ? payload.files.map(normalizeFile)
      : Array.isArray(payload.data?.files)
        ? payload.data.files.map(normalizeFile)
        : fallbackDriveData.files.filter((file) => file.folderId === folderId);

    return { folders, files };
  } catch (error) {
    console.warn(`Folder contents API unavailable for ${folderId}, using mock data.`, error);
    return {
      folders: fallbackDriveData.folders.filter((folder) => {
        if (folderId === 'root') return folder.parentFolderId === null;
        return folder.parentFolderId === folderId;
      }),
      files: fallbackDriveData.files.filter((file) => file.folderId === folderId || (folderId === 'root' && file.folderId === null)),
    };
  }
}

export async function createDriveFolder({ name, parentId }: { name: string; parentId: string | null }) {
  try {
    const response = await api.post('/folders', { name, parentId });
    return normalizeFolder(response.data?.folder ?? response.data ?? {});
  } catch (error) {
    console.warn('Create folder API unavailable, using local mock fallback.', error);
    return {
      _id: `f${Date.now()}`,
      name,
      parentFolderId: parentId,
      createdAt: new Date().toISOString().slice(0, 10),
    } satisfies DriveFolder;
  }
}

export async function deleteDriveFolder(folderId: string) {
  try {
    await api.delete(`/folders/${folderId}`);
    return true;
  } catch (error) {
    console.warn('Delete folder API unavailable.', error);
    return false;
  }
}

export async function uploadDriveFiles(
  parentId: string,
  files: File[],
  relativePaths: string[],
  onProgress?: (percent: number) => void,
) {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('parentId', parentId);
    formData.append('relativePaths', JSON.stringify(relativePaths));

    const response = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress?.(percent);
      },
    });

    const payload = response.data?.files ?? response.data ?? [];
    onProgress?.(100);
    return (Array.isArray(payload) ? payload : [payload]).map(normalizeFile);
  } catch (error) {
    console.warn('Upload API unavailable, using local mock fallback.', error);
    return files.map((file, index) => ({
      _id: `file${Date.now()}${index}`,
      name: file.name,
      size: file.size,
      mimeType: file.name.split('.').pop()?.toLowerCase() || 'file',
      folderId: parentId,
      uploadedAt: new Date().toISOString().slice(0, 10),
    }));
  }
}

export function getDriveFileDownloadUrl(fileId: string) {
  return api.getUri({ url: `/files/${encodeURIComponent(fileId)}/download` });
}

export function getDriveFileViewUrl(fileId: string) {
  return api.getUri({ url: `/files/${encodeURIComponent(fileId)}/view` });
}

export async function renameDriveFolder(folderId: string, name: string) {
  try {
    const response = await api.patch(`/folders/${folderId}/rename`, { name });
    return normalizeFolder(response.data?.folder ?? response.data ?? {});
  } catch (error) {
    console.warn('Rename folder API unavailable.', error);
    return null;
  }
}

export async function renameDriveFile(fileId: string, name: string) {
  try {
    const response = await api.patch(`/files/${fileId}/rename`, { name });
    return normalizeFile(response.data?.file ?? response.data ?? {});
  } catch (error) {
    console.warn('Rename file API unavailable.', error);
    return null;
  }
}

export async function deleteDriveFile(fileId: string) {
  try {
    await api.delete(`/files/${fileId}`);
    return true;
  } catch (error) {
    console.warn('Delete file API unavailable, using local mock fallback.', error);
    return false;
  }
}