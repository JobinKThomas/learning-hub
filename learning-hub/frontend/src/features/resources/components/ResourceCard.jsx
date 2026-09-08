import React from 'react';
import {
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Github,
  GraduationCap,
  Wrench,
  Globe,
  User,
} from 'lucide-react';

export const getResourceTypeMeta = (type) => {
  switch (type?.toUpperCase()) {
    case 'DOCUMENTATION':
      return {
        label: 'Documentation',
        emoji: '📚',
        badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        Icon: BookOpen,
      };
    case 'VIDEO':
      return {
        label: 'Video Lesson',
        emoji: '🎥',
        badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        Icon: Video,
      };
    case 'ARTICLE':
      return {
        label: 'Article / Guide',
        emoji: '🔗',
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        Icon: FileText,
      };
    case 'GITHUB':
      return {
        label: 'GitHub Repo',
        emoji: '💻',
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
        Icon: Github,
      };
    case 'COURSE':
      return {
        label: 'Interactive Course',
        emoji: '🎓',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        Icon: GraduationCap,
      };
    case 'TOOL':
      return {
        label: 'Interactive Tool',
        emoji: '🛠️',
        badgeClass: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        Icon: Wrench,
      };
    default:
      return {
        label: 'Resource',
        emoji: '🌐',
        badgeClass: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        Icon: Globe,
      };
  }
};

export default function ResourceCard({ resource }) {
  if (!resource) return null;

  const typeMeta = getResourceTypeMeta(resource.type);
  const TypeIcon = typeMeta.Icon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Type Badge & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeMeta.badgeClass}`}
          >
            <span>{typeMeta.emoji}</span>
            <span>{typeMeta.label}</span>
          </span>

          <div className="flex items-center gap-2">
            {resource.isFree && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Free
              </span>
            )}
          </div>
        </div>

        {/* Title & External Link */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition font-sans">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            <span>{resource.title}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
          </a>
        </h3>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {resource.description}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        {resource.author ? (
          <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
            <User className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">{resource.author}</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">External Reference</span>
        )}

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
        >
          <span>Visit</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
