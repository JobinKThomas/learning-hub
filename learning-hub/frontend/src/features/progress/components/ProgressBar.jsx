import React from 'react';

export default function ProgressBar({
  percentage = 0,
  label = '',
  subText = '',
  showLabel = true,
  size = 'md',
  color = 'auto',
  className = '',
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  // Height configurations
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size] || 'h-2.5';

  // Dynamic bar colors based on progress or explicit color prop
  let barColorClass = 'bg-indigo-600';
  if (color === 'auto') {
    if (clamped === 100) {
      barColorClass = 'bg-emerald-500';
    } else if (clamped >= 50) {
      barColorClass = 'bg-indigo-600';
    } else if (clamped > 0) {
      barColorClass = 'bg-amber-500';
    } else {
      barColorClass = 'bg-slate-300';
    }
  } else if (color === 'emerald') {
    barColorClass = 'bg-emerald-500';
  } else if (color === 'amber') {
    barColorClass = 'bg-amber-500';
  } else if (color === 'purple') {
    barColorClass = 'bg-purple-600';
  } else if (color === 'indigo') {
    barColorClass = 'bg-indigo-600';
  }

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(showLabel || subText) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          {label ? (
            <span className="text-slate-700 font-medium truncate">{label}</span>
          ) : (
            <span className="text-slate-500">{subText}</span>
          )}
          <span className="text-slate-900 font-bold ml-2 shrink-0">
            {clamped}%
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div className={`w-full ${heightClasses} rounded-full bg-slate-100 overflow-hidden`}>
        <div
          className={`${heightClasses} ${barColorClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {showLabel && subText && label && (
        <div className="text-[11px] text-slate-500">
          {subText}
        </div>
      )}
    </div>
  );
}
