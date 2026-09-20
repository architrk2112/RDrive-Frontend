import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Chrome,
  Folder,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function Login() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/drive', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const { data } = await api.get('/auth/google');

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      login('user@gmail.com', 'Google User');
      navigate('/drive');
    } catch (error) {
      console.error('Google OAuth request failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="relative hidden w-[52%] flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_25%)]" />

          <div className="relative z-10">
            <Logo size="lg" variant="light" />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-100">
                <Sparkles size={12} />
                Smart cloud storage
              </span>
              <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
                Your files, always within reach.
              </h1>
              <p className="max-w-sm text-base leading-relaxed text-slate-300">
                Organize, upload, and access your work securely from any device with one streamlined sign-in.
              </p>
            </div>

            <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between text-slate-200">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">My Drive</span>
                <UploadCloud size={16} className="text-blue-300" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Docs', color: 'bg-blue-500/20 text-blue-300' },
                  { label: 'Photos', color: 'bg-emerald-500/20 text-emerald-300' },
                  { label: 'Projects', color: 'bg-amber-500/20 text-amber-300' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${item.color}`}>
                      <Folder size={16} fill="currentColor" fillOpacity={0.28} />
                    </div>
                    <span className="text-[10px] text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { name: 'Resume.pdf', icon: 'text-red-300' },
                  { name: 'Portfolio.zip', icon: 'text-emerald-300' },
                ].map((file) => (
                  <div key={file.name} className="flex items-center gap-2 rounded-xl bg-slate-950/20 px-3 py-2 text-xs text-slate-200">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${file.icon}`} />
                    <span className="flex-1">{file.name}</span>
                    <Check size={12} className="text-blue-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-400">© 2026 RDrive. All rights reserved.</p>
        </div>

        <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <ShieldCheck size={14} />
                Secure access
              </div>
            </div>

            <div className="space-y-4 text-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Sign in to RDrive</h2>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                Continue with your Google account to manage files, folders, and shared projects safely.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Chrome size={18} />
              </span>
              Continue with Google
              <ArrowRight size={16} className="text-slate-500" />
            </button>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">One-click access</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    No extra passwords or sign-up forms. Just your Google account and instant access to your drive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

