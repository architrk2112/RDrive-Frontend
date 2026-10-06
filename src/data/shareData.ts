export type ShareResourceType = 'folder' | 'drive';
export type ShareStatus = 'active' | 'expired' | 'revoked';

export interface CreateSharePayload {
  resourceType: ShareResourceType;
  folderId?: string | null;
  folderName?: string;
  folderPath?: string;
  expiresAt: string;
}

export interface ShareLink {
  id: string;
  token: string;
  url: string;
  resourceType: ShareResourceType;
  folderId?: string | null;
  folderName?: string;
  folderPath?: string;
  label: string;
  createdAt: string;
  expiresAt: string | null;
  status: ShareStatus;
}

export interface PublicShareInfo {
  id: string;
  token: string;
  resourceType: ShareResourceType;
  name: string;
  folderId?: string | null;
  rootFolderId?: string | null;
  ownerName?: string;
  createdAt: string;
  expiresAt?: string | null;
  status: ShareStatus;
  url: string;
}

export const mockShareLinks: ShareLink[] = [
  {
    id: 'share-1',
    token: 'demo-a1b2c3',
    url: 'https://rdrive.local/share/demo-a1b2c3',
    resourceType: 'folder',
    folderId: 'f1',
    folderName: 'College',
    folderPath: 'My Drive / College',
    label: 'College',
    createdAt: '2026-10-01T12:00:00.000Z',
    expiresAt: '2026-10-08T12:00:00.000Z',
    status: 'active',
  },
  {
    id: 'share-2',
    token: 'demo-drive-9x8y',
    url: 'https://rdrive.local/share/demo-drive-9x8y',
    resourceType: 'drive',
    folderId: null,
    folderName: 'My Entire Drive',
    folderPath: 'My Drive',
    label: 'My Entire Drive',
    createdAt: '2026-09-20T09:15:00.000Z',
    expiresAt: '2026-09-27T09:15:00.000Z',
    status: 'expired',
  },
];

export const mockPublicShareInfo: PublicShareInfo = {
  id: 'share-1',
  token: 'demo-a1b2c3',
  resourceType: 'folder',
  name: 'College',
  folderId: 'f1',
  rootFolderId: 'f1',
  ownerName: 'RDrive User',
  createdAt: '2026-10-01T12:00:00.000Z',
  expiresAt: '2026-10-08T12:00:00.000Z',
  status: 'active',
  url: 'https://rdrive.local/share/demo-a1b2c3',
};
