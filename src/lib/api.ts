import axios from 'axios';
import { DriveFile, DriveFolder, mockFiles, mockFolders } from '@/data/mockData';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
  visibility: file.visibility === 'public' ? 'public' : 'private',
  folderId: file.folderId === null || file.folderId === undefined ? null : String(file.folderId ?? file.folder_id ?? null),
  uploadedAt: String(file.uploadedAt ?? file.uploaded_at ?? new Date().toISOString().slice(0, 10)),
});

const fallbackDriveData = {
  folders: mockFolders,
  files: mockFiles,
};

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

export async function uploadDriveFiles(parentId: string, files: File[]) {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('parentId', parentId);

    const response = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const payload = response.data?.files ?? response.data ?? [];
    return (Array.isArray(payload) ? payload : [payload]).map(normalizeFile);
  } catch (error) {
    console.warn('Upload API unavailable, using local mock fallback.', error);
    return files.map((file, index) => ({
      _id: `file${Date.now()}${index}`,
      name: file.name,
      size: file.size,
      mimeType: file.name.split('.').pop()?.toLowerCase() || 'file',
      visibility: 'private' as const,
      folderId: parentId,
      uploadedAt: new Date().toISOString().slice(0, 10),
    }));
  }
}

export async function downloadDriveFile(fileId: string) {
  try {
    const response = await api.get(`/files/${fileId}/download`);
    const url = response.data?.url ?? response.data?.downloadUrl ?? null;
    if (!url) return null;

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    return url;
  } catch (error) {
    console.warn('Download API unavailable.', error);
    return null;
  }
}

export async function updateFileVisibility(fileId: string, visibility: 'public' | 'private') {
  try {
    const response = await api.patch(`/files/${fileId}/visibility`, { visibility });
    return normalizeFile(response.data?.file ?? response.data ?? {});
  } catch (error) {
    console.warn('Visibility API unavailable, using local mock fallback.', error);
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