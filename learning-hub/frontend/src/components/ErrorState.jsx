import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  WifiOff,
  ShieldAlert,
  FileQuestion,
  AlertCircle,
  RefreshCw,
  Home,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { normalizeError } from '../utils/normalize';

/**
 * Reusable ErrorState Component
 * 
 * Handles:
 * - API errors (500, unhandled)
 * - 404 Not Found
 * - 403 Forbidden
 * - 401 Unauthorized
 * - 400 Validation errors
 * - Network errors / Offline
 * 
 * Standard format:
 *   [Icon]
 *   Unable to load modules.
 *   Please try again.
 *   [Retry]
 */
export default function ErrorState({
  title,
  message,
  error,
  statusCode,
  onRetry,
  retryLabel = 'Retry',
  actionText,
  actionLink,
  onAction,
  variant = 'card', // 'card' | 'full' | 'inline' | 'banner'
  className = '',
}) {
  const [retrying, setRetrying] = useState(false);

  // Normalize error if provided
  const errObj = error ? normalizeError(error) : null;
  const status = statusCode || errObj?.status || 0;
  const isNetwork = Boolean(errObj?.isNetworkError || status === 0);
  const is404 = status === 404 || errObj?.isNotFound;
  const is403 = status === 403 || errObj?.isForbidden;
  const is401 = status === 401 || errObj?.isUnauthorized;
  const is400 = status === 400 || errObj?.isValidationError;

  const displayTitle =
    title ||
    (isNetwork
      ? 'Network Connection Lost'
      : is404
      ? 'Resource Not Found'
      : is403
      ? 'Access Restricted'
      : is401
      ? 'Authentication Required'
      : is400
      ? 'Invalid Request'
      : errObj?.title || 'Something went wrong');

  const displayMessage =
    message ||
    errObj?.message ||
    (isNetwork
      ? 'Please check your connection and try again.'
      : is404
      ? 'The requested page or resource could not be found.'
      : is403
      ? "You don't have permission to access this resource."
      : 'Please try again.');

  const validationErrors = errObj?.errors || [];

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    try {
      setRetrying(true);
      await Promise.resolve(onRetry());
    } finally {
      setRetrying(false);
    }
  };

  // Select appropriate icon
  const renderIcon = () => {
    if (isNetwork) {
      return <WifiOff className="w-8 h-8 text-amber-500" />;
    }
    if (is403) {
      return <ShieldAlert className="w-8 h-8 text-red-500" />;
    }
    if (is401) {
      return <Lock className="w-8 h-8 text-indigo-500" />;
    }
    if (is404) {
      return <FileQuestion className="w-8 h-8 text-slate-500" />;
    }
    if (is400) {
      return <AlertCircle className="w-8 h-8 text-amber-500" />;
    }
    return <AlertTriangle className="w-8 h-8 text-red-500" />;
  };

  // Banner variant
  if (variant === 'banner') {
    return (
      <div
        className={`p-4 rounded-2xl border ${
          isNetwork
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
            : is403
            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-200'
            : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-200'
        } flex items-start justify-between gap-3 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">{renderIcon()}</div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold">{displayTitle}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">{displayMessage}</p>
            {validationErrors.length > 0 && (
              <ul className="list-disc list-inside text-xs text-red-700 dark:text-red-300 mt-2 space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {onRetry && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-2xs shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${retrying ? 'animate-spin' : ''}`}
            />
            {retrying ? 'Retrying...' : retryLabel}
          </button>
        )}
      </div>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div
        className={`py-6 px-4 text-center space-y-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${className}`}
      >
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto">
          {renderIcon()}
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{displayTitle}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">{displayMessage}</p>
        </div>
        {onRetry && (
          <div>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${retrying ? 'animate-spin' : ''}`}
              />
              {retrying ? 'Retrying...' : retryLabel}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Card / Full variant
  return (
    <div
      className={`${
        variant === 'full'
          ? 'min-h-[60vh] flex items-center justify-center px-4 py-12'
          : 'bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm text-center'
      } ${className}`}
    >
      <div className="max-w-md w-full mx-auto text-center space-y-6">
        {/* Icon Circle */}
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-inner ${
            isNetwork
              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
              : is403
              ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
              : is404
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
          }`}
        >
          {renderIcon()}
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {displayTitle}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {displayMessage}
          </p>

          {/* Validation Errors List if 400 */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-left text-xs text-red-800 dark:text-red-300 space-y-1">
              <span className="font-bold block text-red-900 dark:text-red-200 mb-1">
                Please resolve the following issues:
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons: Retry and Secondary navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-none transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`}
              />
              {retrying ? 'Retrying...' : retryLabel}
            </button>
          )}

          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition"
            >
              <Home className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
              {actionText || 'Return to Dashboard'}
            </Link>
          ) : onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
              {actionText || 'Go Back'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
