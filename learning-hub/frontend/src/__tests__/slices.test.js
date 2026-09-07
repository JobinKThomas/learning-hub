import { describe, it, expect } from 'vitest';
import { store } from '../store';
import authReducer, { setCredentials, logout, clearError } from '../store/slices/authSlice';
import learningPathReducer, { setFilters, setPage, resetFilters, clearCurrentPath } from '../features/learningPaths/learningPathSlice';
import moduleReducer, { clearCurrentModule } from '../features/modules/moduleSlice';
import sectionReducer, { clearCurrentSection } from '../features/sections/sectionSlice';
import topicReducer, { clearCurrentTopic } from '../features/topics/topicSlice';
import noteReducer, { clearCurrentNote } from '../features/notes/noteSlice';
import resourceReducer, { clearCurrentResource } from '../features/resources/resourceSlice';
import playgroundReducer, { clearExecutionResult, clearCurrentPlayground } from '../features/playgrounds/playgroundSlice';
import quizReducer, { clearSubmissionResult, clearCurrentQuiz } from '../features/quizzes/quizSlice';
import quizAttemptReducer, { clearCurrentAttempt } from '../features/quizAttempts/quizAttemptSlice';
import interviewQuestionReducer, { clearCurrentQuestion } from '../features/interviewQuestions/interviewQuestionSlice';
import progressReducer, { clearTopicProgress, clearLearningPathProgress, clearModuleProgress } from '../features/progress/progressSlice';
import dashboardReducer, { clearDashboardData } from '../features/dashboard/dashboardSlice';

describe('Tier 3 Frontend Tests: Redux Store & Slices', () => {

  it('1. Root Store should combine all 13 feature slices properly', () => {
    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('learningPaths');
    expect(state).toHaveProperty('modules');
    expect(state).toHaveProperty('sections');
    expect(state).toHaveProperty('topics');
    expect(state).toHaveProperty('notes');
    expect(state).toHaveProperty('resources');
    expect(state).toHaveProperty('playgrounds');
    expect(state).toHaveProperty('quizzes');
    expect(state).toHaveProperty('quizAttempts');
    expect(state).toHaveProperty('interviewQuestions');
    expect(state).toHaveProperty('progress');
    expect(state).toHaveProperty('dashboard');
  });

  describe('2. authSlice', () => {
    it('should set credentials and authenticate user', () => {
      const user = { id: 'u1', name: 'John Doe', role: 'USER' };
      const nextState = authReducer(
        undefined,
        setCredentials({ user, accessToken: 'mock-token', refreshToken: 'mock-refresh' })
      );
      expect(nextState.isAuthenticated).toBe(true);
      expect(nextState.user).toEqual(user);
      expect(nextState.accessToken).toBe('mock-token');
    });

    it('should handle logout correctly', () => {
      const loggedInState = {
        user: { id: 'u1', name: 'John' },
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
        loading: false,
        error: null,
      };
      const nextState = authReducer(loggedInState, logout());
      expect(nextState.isAuthenticated).toBe(false);
      expect(nextState.user).toBeNull();
      expect(nextState.accessToken).toBeNull();
    });

    it('should clear errors', () => {
      const errorState = { error: 'Invalid credentials', isAuthenticated: false, user: null };
      const nextState = authReducer(errorState, clearError());
      expect(nextState.error).toBeNull();
    });
  });

  describe('3. learningPathSlice', () => {
    it('should update filters and reset page to 1 on filter update', () => {
      const nextState = learningPathReducer(
        undefined,
        setFilters({ search: 'React', level: 'Beginner' })
      );
      expect(nextState.filters.search).toBe('React');
      expect(nextState.filters.level).toBe('Beginner');
      expect(nextState.filters.page).toBe(1);
    });

    it('should update page number with setPage', () => {
      const nextState = learningPathReducer(undefined, setPage(3));
      expect(nextState.filters.page).toBe(3);
    });

    it('should reset filters to default with resetFilters', () => {
      const modifiedState = {
        ...learningPathReducer(undefined, { type: 'unknown' }),
        filters: { search: 'Testing', category: 'Backend', page: 4 },
      };
      const nextState = learningPathReducer(modifiedState, resetFilters());
      expect(nextState.filters.search).toBe('');
      expect(nextState.filters.category).toBe('All');
      expect(nextState.filters.page).toBe(1);
    });

    it('should clear current path with clearCurrentPath', () => {
      const stateWithPath = { currentPath: { id: 'lp-1', title: 'JS' }, error: 'some error' };
      const nextState = learningPathReducer(stateWithPath, clearCurrentPath());
      expect(nextState.currentPath).toBeNull();
      expect(nextState.error).toBeNull();
    });
  });

  describe('4. moduleSlice', () => {
    it('should clear current module with clearCurrentModule', () => {
      const state = { currentModule: { id: 'mod-1', title: 'Intro' }, error: 'Err' };
      const nextState = moduleReducer(state, clearCurrentModule());
      expect(nextState.currentModule).toBeNull();
      expect(nextState.error).toBeNull();
    });
  });

  describe('5. sectionSlice', () => {
    it('should clear current section with clearCurrentSection', () => {
      const state = { currentSection: { id: 'sec-1', title: 'Variables' }, error: 'Err' };
      const nextState = sectionReducer(state, clearCurrentSection());
      expect(nextState.currentSection).toBeNull();
      expect(nextState.error).toBeNull();
    });
  });

  describe('6. topicSlice', () => {
    it('should clear current topic with clearCurrentTopic', () => {
      const state = { currentTopic: { id: 'top-1', title: 'let' }, error: 'Err' };
      const nextState = topicReducer(state, clearCurrentTopic());
      expect(nextState.currentTopic).toBeNull();
      expect(nextState.error).toBeNull();
    });
  });

  describe('7. noteSlice', () => {
    it('should clear current note with clearCurrentNote', () => {
      const state = { currentNote: { id: 'note-1', title: 'Closures' }, error: 'Err' };
      const nextState = noteReducer(state, clearCurrentNote());
      expect(nextState.currentNote).toBeNull();
      expect(nextState.error).toBeNull();
    });
  });

  describe('8. resourceSlice', () => {
    it('should clear current resource with clearCurrentResource', () => {
      const state = { currentResource: { id: 'res-1', title: 'Docs' }, error: 'Err' };
      const nextState = resourceReducer(state, clearCurrentResource());
      expect(nextState.currentResource).toBeNull();
      expect(nextState.error).toBeNull();
    });
  });

  describe('9. playgroundSlice', () => {
    it('should clear execution result and current playground', () => {
      const state = {
        currentPlayground: { id: 'pg-1' },
        executionResult: { success: true, logs: ['done'] },
      };
      const nextState1 = playgroundReducer(state, clearExecutionResult());
      expect(nextState1.executionResult).toBeNull();
      expect(nextState1.currentPlayground).toBeDefined();

      const nextState2 = playgroundReducer(state, clearCurrentPlayground());
      expect(nextState2.currentPlayground).toBeNull();
      expect(nextState2.executionResult).toBeNull();
    });
  });

  describe('10. quizSlice', () => {
    it('should clear submission result and current quiz', () => {
      const state = {
        currentQuiz: { id: 'q-1', title: 'JS Quiz' },
        submissionResult: { score: 10, passed: true },
        error: null,
      };
      const nextState1 = quizReducer(state, clearSubmissionResult());
      expect(nextState1.submissionResult).toBeNull();
      expect(nextState1.currentQuiz).toBeDefined();

      const nextState2 = quizReducer(state, clearCurrentQuiz());
      expect(nextState2.currentQuiz).toBeNull();
      expect(nextState2.submissionResult).toBeNull();
    });
  });

  describe('11. quizAttemptSlice', () => {
    it('should clear current attempt', () => {
      const state = { currentAttempt: { id: 'qa-1', score: 9 }, error: null };
      const nextState = quizAttemptReducer(state, clearCurrentAttempt());
      expect(nextState.currentAttempt).toBeNull();
    });
  });

  describe('12. interviewQuestionSlice', () => {
    it('should clear current question', () => {
      const state = { currentQuestion: { id: 'iq-1', question: 'What is TDZ?' }, error: null };
      const nextState = interviewQuestionReducer(state, clearCurrentQuestion());
      expect(nextState.currentQuestion).toBeNull();
    });
  });

  describe('13. progressSlice', () => {
    it('should clear progress sub-states', () => {
      const state = {
        currentTopicProgress: { completed: true },
        currentLearningPathProgress: { percentage: 80 },
        currentModuleProgress: { percentage: 50 },
      };
      const state1 = progressReducer(state, clearTopicProgress());
      expect(state1.currentTopicProgress).toBeNull();

      const state2 = progressReducer(state, clearLearningPathProgress());
      expect(state2.currentLearningPathProgress).toBeNull();

      const state3 = progressReducer(state, clearModuleProgress());
      expect(state3.currentModuleProgress).toBeNull();
    });
  });

  describe('14. dashboardSlice', () => {
    it('should clear dashboard data with clearDashboardData', () => {
      const state = { data: { overallProgress: 67 }, loading: false, error: null };
      const nextState = dashboardReducer(state, clearDashboardData());
      expect(nextState.data).toBeNull();
    });
  });

});
