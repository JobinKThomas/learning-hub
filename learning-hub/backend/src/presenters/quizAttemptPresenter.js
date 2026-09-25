export const quizAttemptPresenter = {
  toResponse: (attempt) => {
    if (!attempt) return null;

    const quizData = attempt.quiz && typeof attempt.quiz === 'object'
      ? {
          id: attempt.quiz._id ? attempt.quiz._id.toString() : attempt.quiz.id,
          title: attempt.quiz.title,
          slug: attempt.quiz.slug,
          passingScore: attempt.quiz.passingScore,
          timeLimitMinutes: attempt.quiz.timeLimitMinutes,
          topic: attempt.quiz.topic,
        }
      : attempt.quiz;

    const userData = attempt.user && typeof attempt.user === 'object'
      ? {
          id: attempt.user._id ? attempt.user._id.toString() : attempt.user.id,
          name: attempt.user.name,
          email: attempt.user.email,
        }
      : attempt.user;

    return {
      id: attempt._id ? attempt._id.toString() : attempt.id,
      attemptNumber: attempt.attemptNumber,
      quiz: quizData,
      user: userData,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      passingScore: attempt.passingScore,
      passed: attempt.passed,
      timeSpentSeconds: attempt.timeSpentSeconds || 0,
      answers: (attempt.answers || []).map((ans, idx) => ({
        questionIndex: idx + 1,
        questionId: ans.questionId ? ans.questionId.toString() : undefined,
        question: ans.question,
        options: ans.options,
        codeSnippet: ans.codeSnippet || '',
        selectedOption: ans.selectedOption,
        selectedOptionText: ans.selectedOptionText,
        correctAnswer: ans.correctAnswer,
        correctAnswerText: ans.correctAnswerText,
        isCorrect: ans.isCorrect,
        explanation: ans.explanation || '',
      })),
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
    };
  },

  toSummary: (attempt) => {
    if (!attempt) return null;

    const quizData = attempt.quiz && typeof attempt.quiz === 'object'
      ? {
          id: attempt.quiz._id ? attempt.quiz._id.toString() : attempt.quiz.id,
          title: attempt.quiz.title,
          slug: attempt.quiz.slug,
          passingScore: attempt.quiz.passingScore,
          topic: attempt.quiz.topic,
        }
      : attempt.quiz;

    return {
      id: attempt._id ? attempt._id.toString() : attempt.id,
      attemptNumber: attempt.attemptNumber,
      quiz: quizData,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      passingScore: attempt.passingScore,
      passed: attempt.passed,
      timeSpentSeconds: attempt.timeSpentSeconds || 0,
      createdAt: attempt.createdAt,
      completedAt: attempt.completedAt,
    };
  },

  toResponseList: (attempts) => {
    if (!Array.isArray(attempts)) return [];
    return attempts.map((a) => quizAttemptPresenter.toSummary(a));
  },

  toStatsResponse: (stats) => {
    return {
      totalAttempts: stats.totalAttempts || 0,
      bestScore: stats.bestScore || 0,
      bestPercentage: stats.bestPercentage || 0,
      hasPassed: !!stats.hasPassed,
      latestAttempt: stats.latestAttempt || null,
    };
  },
};
