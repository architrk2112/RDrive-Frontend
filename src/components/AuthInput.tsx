import { InputHTMLAttributes, ReactNode } from 'react';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: 'email' | 'password' | 'name';
}

const iconMap = {
  email: Mail,
  password: Lock,
  name: User,
};

export default function AuthInput({ label, icon, type = 'text', ...props }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const Icon = iconMap[icon];
  const isPassword = icon === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={18} />
        </div>
        <input
          type={inputType}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthInputWithIcon({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        {children}
      </div>
    </div>
  );
}
