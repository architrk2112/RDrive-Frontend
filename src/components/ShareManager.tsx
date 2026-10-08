import { useMemo, useState } from 'react';
import { Copy, ExternalLink, Trash2 } from 'lucide-react';
import { ShareLink } from '@/data/shareData';

interface ShareManagerProps {
  links: ShareLink[];
  onCreate: () => void;
  onCopy: (url: string) => Promise<void> | void;
  onOpen: (url: string) => void;
  onRevoke: (id: string) => Promise<void> | void;
}

type ShareStatusFilter = 'all' | 'active' | 'expired' | 'revoked';

const formatDate = (value: string | null) => {
  if (!value) return 'No expiry';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function ShareManager({ links, onCreate, onCopy, onOpen, onRevoke }: ShareManagerProps) {
  const [activeFilter, setActiveFilter] = useState<ShareStatusFilter>('active');

  const filteredLinks = useMemo(() => {
    if (activeFilter === 'all') {
      return links;
    }
    return links.filter((link) => link.status === activeFilter);
  }, [activeFilter, links]);

  const tabs: Array<{ key: ShareStatusFilter; label: string; count: number }> = [
    { key: 'all', label: 'All', count: links.length },
    { key: 'active', label: 'Active', count: links.filter((link) => link.status === 'active').length },
    { key: 'expired', label: 'Expired', count: links.filter((link) => link.status === 'expired').length },
    { key: 'revoked', label: 'Revoked', count: links.filter((link) => link.status === 'revoked').length },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Shared links</h2>
          <p className="text-sm text-slate-500">Manage shares by status.</p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New share
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Filter by section
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label} {tab.count > 0 ? `(${tab.count})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          {activeFilter === 'all'
            ? 'No shares created yet.'
            : `No ${activeFilter} shares found.`}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => {
            const active = link.status === 'active';
            return (
              <div
                key={link.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{link.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          active
                            ? 'bg-emerald-100 text-emerald-700'
                            : link.status === 'expired'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {link.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {link.resourceType === 'drive' ? 'Entire drive' : 'Folder'} · {link.folderPath || 'My Drive'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Created: {formatDate(link.createdAt)}</span>
                      <span>Expires: {formatDate(link.expiresAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onCopy(link.url)}
                      disabled={!active}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpen(link.url)}
                      disabled={!active}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ExternalLink size={14} />
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => onRevoke(link.id)}
                      disabled={!active}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
