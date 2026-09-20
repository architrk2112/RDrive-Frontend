import { Cloud } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 'md', showText = true, variant = 'dark' }: LogoProps) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 40 : 28;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-800';

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30" style={{ width: iconSize + 12, height: iconSize + 12 }}>
        <Cloud size={iconSize} className="text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={`font-bold ${textSize} ${textColor} tracking-tight`}>
          R<span className="text-blue-500">Drive</span>
        </span>
      )}
    </div>
  );
}
