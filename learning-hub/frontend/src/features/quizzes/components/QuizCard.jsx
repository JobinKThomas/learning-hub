import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Clock, CheckCircle, Edit, ArrowRight, Award } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export default function QuizCard({ quiz, showTopic = true }) {
  const { isAdmin } = useAuth();
  const questionCount = quiz.totalQuestions || quiz.questions?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Badges Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
              <Award className="w-3 h-3 text-indigo-500" />
              Quiz
            </span>

            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
            </span>

            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Pass: {quiz.passingScore || 70}%
            </span>
          </div>

          {isAdmin && (
            <Link
              to={`/admin/quizzes/${quiz.id}/edit`}
              className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-purple-600 p-1 rounded-md hover:bg-slate-50"
              title="Edit Quiz (Admin)"
            >
              <Edit className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <Link to={`/quizzes/${quiz.slug || quiz.id}`}>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-base line-clamp-1">
              {quiz.title}
            </h3>
          </Link>
          {quiz.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {quiz.description}
            </p>
          )}
        </div>

        {/* Topic Reference if enabled */}
        {showTopic && quiz.topic && (
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <span>Topic:</span>
            <span className="text-slate-700 font-semibold font-mono">
              {quiz.topic.title}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center text-[11px] text-slate-400 gap-1.5">
          <Clock className="w-3 h-3 text-amber-500" />
          <span>{quiz.timeLimitMinutes || 5} mins</span>
        </div>

        <Link
          to={`/quizzes/${quiz.slug || quiz.id}`}
          className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition gap-1.5"
        >
          <span>Take Quiz</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
