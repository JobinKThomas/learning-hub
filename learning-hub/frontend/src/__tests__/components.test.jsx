import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store';

import LearningPathCard from '../features/learningPaths/components/LearningPathCard';
import ProgressBar from '../features/progress/components/ProgressBar';
import TopicProgressBadge from '../features/progress/components/TopicProgressBadge';
import CompleteButton from '../features/progress/components/CompleteButton';
import NoteCard from '../features/notes/components/NoteCard';
import QuizCard from '../features/quizzes/components/QuizCard';
import InterviewQuestionCard from '../features/interviewQuestions/components/InterviewQuestionCard';
import Pagination from '../components/Pagination';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';

describe('Tier 3 Frontend Tests: UI Components', () => {

  describe('1. LearningPathCard', () => {
    it('renders path details, level, category, and modules count', () => {
      const mockPath = {
        id: 'lp-js',
        title: 'Mastering JavaScript',
        slug: 'mastering-javascript',
        description: 'Complete guide to modern JS syntax and paradigms.',
        level: 'Intermediate',
        category: 'Frontend',
        icon: 'Code',
        color: 'indigo',
        modules: [{ id: 'm1' }, { id: 'm2' }],
      };

      render(
        <MemoryRouter>
          <LearningPathCard path={mockPath} progress={65} />
        </MemoryRouter>
      );

      expect(screen.getByText('Mastering JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Complete guide to modern JS syntax and paradigms.')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('returns null safely when path is not provided', () => {
      const { container } = render(
        <MemoryRouter>
          <LearningPathCard path={null} />
        </MemoryRouter>
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('2. ProgressBar', () => {
    it('renders percentage and clamps to 0-100 bounds', () => {
      const { rerender } = render(<ProgressBar percentage={75} showLabel={true} />);
      expect(screen.getByText('75%')).toBeInTheDocument();

      // Test negative clamping
      rerender(<ProgressBar percentage={-20} showLabel={true} />);
      expect(screen.getByText('0%')).toBeInTheDocument();

      // Test over 100 clamping
      rerender(<ProgressBar percentage={150} showLabel={true} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('3. TopicProgressBadge', () => {
    it('renders Done when isCompleted is true', () => {
      render(<TopicProgressBadge isCompleted={true} />);
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('renders percentage when in-progress', () => {
      render(<TopicProgressBadge isCompleted={false} percentage={45} />);
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('renders Todo when not started (0%)', () => {
      render(<TopicProgressBadge isCompleted={false} percentage={0} />);
      expect(screen.getByText('Todo')).toBeInTheDocument();
    });
  });

  describe('4. CompleteButton', () => {
    it('renders Mark as Completed when false, and triggers onToggle on click', () => {
      const handleToggle = vi.fn();
      render(<CompleteButton isCompleted={false} onToggle={handleToggle} />);

      const btn = screen.getByRole('button', { name: /mark as completed/i });
      expect(btn).toBeInTheDocument();

      fireEvent.click(btn);
      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('renders Completed when true', () => {
      render(<CompleteButton isCompleted={true} onToggle={() => {}} />);
      expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
    });

    it('is disabled when loading or disabled prop is passed', () => {
      const handleToggle = vi.fn();
      render(<CompleteButton isCompleted={false} onToggle={handleToggle} disabled={true} />);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleToggle).not.toHaveBeenCalled();
    });
  });

  describe('5. NoteCard', () => {
    it('renders note title, summary, reading time, and tags', () => {
      const mockNote = {
        title: 'Deep Dive: Closures',
        slug: 'deep-dive-closures',
        summary: 'Understand lexical environment and closures in JS.',
        readingTime: '7 mins',
        tags: ['javascript', 'scope'],
      };

      render(
        <MemoryRouter>
          <NoteCard note={mockNote} />
        </MemoryRouter>
      );

      expect(screen.getByText('Deep Dive: Closures')).toBeInTheDocument();
      expect(screen.getByText('Understand lexical environment and closures in JS.')).toBeInTheDocument();
      expect(screen.getByText('7 mins')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });
  });

  describe('6. QuizCard', () => {
    it('renders quiz title, question count, and pass percentage', () => {
      const mockQuiz = {
        id: 'quiz-1',
        title: 'Async JS Quiz',
        description: 'Test your knowledge on promises and async/await.',
        totalQuestions: 5,
        passingScore: 80,
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <QuizCard quiz={mockQuiz} />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Async JS Quiz')).toBeInTheDocument();
      expect(screen.getByText(/5 questions/i)).toBeInTheDocument();
      expect(screen.getByText(/pass: 80%/i)).toBeInTheDocument();
    });
  });

  describe('7. InterviewQuestionCard', () => {
    it('hides answer initially and reveals answer on click', () => {
      const mockQuestion = {
        id: 'iq-1',
        question: 'What is the Temporal Dead Zone (TDZ)?',
        answer: 'TDZ is the period between entering scope and variable declaration where let and const cannot be accessed.',
        difficulty: 'INTERMEDIATE',
        frequency: 'FREQUENT',
        tags: ['javascript', 'variables'],
      };

      render(<InterviewQuestionCard question={mockQuestion} index={1} />);

      expect(screen.getByText('What is the Temporal Dead Zone (TDZ)?')).toBeInTheDocument();
      // Answer should not be visible before clicking reveal
      expect(screen.queryByText(/TDZ is the period/i)).not.toBeInTheDocument();

      const revealBtn = screen.getByRole('button', { name: /reveal answer/i });
      fireEvent.click(revealBtn);

      // Now answer should be revealed
      expect(screen.getByText(/TDZ is the period/i)).toBeInTheDocument();

      // Click again to hide
      const hideBtn = screen.getByRole('button', { name: /hide answer/i });
      fireEvent.click(hideBtn);
      expect(screen.queryByText(/TDZ is the period/i)).not.toBeInTheDocument();
    });
  });

  describe('8. Pagination', () => {
    it('renders page numbers, disabled previous on page 1, and triggers onPageChange', () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={1}
          totalPages={3}
          totalItems={15}
          itemsPerPage={5}
          hasPrevPage={false}
          hasNextPage={true}
          onPageChange={handlePageChange}
        />
      );

      // Previous button should be disabled
      const prevBtn = screen.getByRole('button', { name: /prev/i });
      expect(prevBtn).toBeDisabled();

      // Next button should be enabled
      const nextBtn = screen.getByRole('button', { name: /next/i });
      expect(nextBtn).not.toBeDisabled();

      fireEvent.click(nextBtn);
      expect(handlePageChange).toHaveBeenCalledWith(2);

      // Page 3 button
      const page3Btn = screen.getByText('3');
      fireEvent.click(page3Btn);
      expect(handlePageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('9. ErrorState', () => {
    it('renders friendly error message and triggers retry on click', () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          title="Unable to load modules"
          message="Please check your connection and try again."
          onRetry={handleRetry}
        />
      );

      expect(screen.getByText('Unable to load modules')).toBeInTheDocument();
      expect(screen.getByText('Please check your connection and try again.')).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('10. EmptyState', () => {
    it('renders title, description, and calls onAction when clicked', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="No Quizzes Available"
          description="Check back later for newly added quizzes."
          actionText="Explore Topics"
          onAction={handleAction}
        />
      );

      expect(screen.getByText('No Quizzes Available')).toBeInTheDocument();
      expect(screen.getByText('Check back later for newly added quizzes.')).toBeInTheDocument();

      const actionBtn = screen.getByRole('button', { name: /explore topics/i });
      fireEvent.click(actionBtn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('11. ErrorBoundary', () => {
    it('catches unhandled render exceptions and displays Application Error fallback UI', () => {
      // Prevent console.error from polluting test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const BombComponent = () => {
        throw new Error('Simulated UI explosion');
      };

      render(
        <ErrorBoundary>
          <BombComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(screen.getByText(/Something unexpected happened/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

});
