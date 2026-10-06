import { useMemo, useState } from 'react';
import { CalendarRange, Link2, ShieldCheck, X } from 'lucide-react';
import { CreateSharePayload } from '@/data/shareData';

interface ShareDialogProps {
  mode: 'folder' | 'drive';
  folderId?: string | null;
  folderName?: string;
  folderPath?: string;
  onClose: () => void;
  onCreate: (payload: CreateSharePayload) => Promise<void> | void;
}

const expiryPresets = [
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '1 day', value: 24 * 60 * 60 * 1000 },
  { label: '7 days', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 days', value: 30 * 24 * 60 * 60 * 1000 },
  { label: 'Custom', value: 'custom' as const },
];

const formatShareTime = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function ShareDialog({
  mode,
  folderId,
  folderName,
  folderPath,
  onClose,
  onCreate,
}: ShareDialogProps) {
  const [preset, setPreset] = useState<string>('1 day');
  const [customDateTime, setCustomDateTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedExpiry = useMemo(() => {
    if (preset === 'Custom') {
      return customDateTime ? new Date(customDateTime).toISOString() : null;
    }

    const matchingPreset = expiryPresets.find((item) => item.label === preset);
    if (!matchingPreset || matchingPreset.value === 'custom') {
      return null;
    }

    return new Date(Date.now() + Number(matchingPreset.value)).toISOString();
  }, [customDateTime, preset]);

  const displayExpiry = selectedExpiry ? formatShareTime(selectedExpiry) : 'Choose a time';

  const handleSubmit = async () => {
    if (!selectedExpiry) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        resourceType: mode,
        folderId: mode === 'folder' ? folderId ?? null : null,
        folderName: mode === 'folder' ? folderName : 'My Entire Drive',
        folderPath: mode === 'folder' ? folderPath ?? 'My Drive' : 'My Drive',
        expiresAt: selectedExpiry,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Create share</p>
            <h2 className="mt-1 text-xl font-bold text-slate-800">
              {mode === 'folder' ? 'Share folder' : 'Share entire drive'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Link2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {mode === 'folder' ? folderName || 'Shared folder' : 'My Entire Drive'}
                </p>
                <p className="text-xs text-slate-500">
                  {mode === 'folder' ? folderPath || 'My Drive' : 'Everything in your drive'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">Anyone with this link can access the shared content until it expires or is revoked.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {expiryPresets.map((option) => {
                const active = preset === option.label;
                const key = option.label;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPreset(option.label)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                      active
                        ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {preset === 'Custom' && (
              <label className="mt-3 block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Custom expiry</span>
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(event) => setCustomDateTime(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white"
                />
              </label>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CalendarRange size={16} className="text-blue-600" />
              <span className="font-medium">Selected expiration:</span>
              <span className="text-slate-800">{displayExpiry}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <ShieldCheck size={16} className="mt-0.5 text-emerald-500" />
              <p>
                {mode === 'folder'
                  ? 'This link exposes only the selected folder and its nested contents. It will not reveal anything outside the folder scope.'
                  : 'This link exposes the complete drive, including all folders and files currently visible to your account.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedExpiry}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating share...' : 'Create link'}
          </button>
        </div>
      </div>
    </div>
  );
}
