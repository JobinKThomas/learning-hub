import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export default function CompleteButton({
  isCompleted = false,
  onToggle,
  loading = false,
  labelActive = 'Completed',
  labelInactive = 'Mark as Completed',
  size = 'md',
  disabled = false,
  className = '',
}) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2',
    lg: 'px-4 py-2 text-sm sm:text-base gap-2.5',
  }[size] || 'px-3.5 py-1.5 text-xs gap-2';

  const iconSizeClass = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size] || 'w-4 h-4';

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled || loading}
      className={`inline-flex items-center rounded-xl font-bold transition-all duration-200 ${sizeClasses} ${
        isCompleted
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 shadow-xs'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 shadow-xs'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'} ${className}`}
      title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
    >
      {loading ? (
        <Loader2 className={`${iconSizeClass} animate-spin text-slate-500`} />
      ) : isCompleted ? (
        <CheckCircle2 className={`${iconSizeClass} text-emerald-600 fill-emerald-100 shrink-0`} />
      ) : (
        <Circle className={`${iconSizeClass} text-slate-400 shrink-0`} />
      )}

      <span>{isCompleted ? labelActive : labelInactive}</span>
    </button>
  );
}
