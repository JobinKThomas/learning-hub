import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

/**
 * Accessible Theme Toggle Button supporting icon and drawer layout variants
 */
export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'drawer') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition ${
          isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
        } ${className}`}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
              isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Theme Mode</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {isDark ? 'Currently Dark Theme' : 'Currently Light Theme'}
            </div>
          </div>
        </div>

        {/* Visual Pill Switch */}
        <div
          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
            isDark ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center">
            {isDark ? (
              <Moon className="w-3 h-3 text-indigo-600" />
            ) : (
              <Sun className="w-3 h-3 text-amber-500" />
            )}
          </div>
        </div>
      </button>
    );
  }

  // Default 'icon' variant
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px] min-w-[38px] flex items-center justify-center ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750 hover:border-slate-600 shadow-sm'
          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
      } ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="transition-transform duration-200 hover:rotate-12">
        {isDark ? (
          <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 animate-in spin-in-180 duration-200" />
        ) : (
          <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-600 hover:text-indigo-600 animate-in spin-in-180 duration-200" />
        )}
      </div>
    </button>
  );
}
