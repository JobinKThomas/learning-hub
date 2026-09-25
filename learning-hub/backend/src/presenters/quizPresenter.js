export const quizPresenter = {
  toResponse: (quiz, { includeAnswers = false } = {}) => {
    if (!quiz) return null;

    const res = {
      id: quiz._id ? quiz._id.toString() : quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description || '',
      passingScore: quiz.passingScore ?? 70,
      timeLimitMinutes: quiz.timeLimitMinutes ?? 10,
      order: quiz.order ?? 0,
      published: quiz.published ?? true,
      totalQuestions: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };

    // Format questions
    if (Array.isArray(quiz.questions)) {
      res.questions = quiz.questions.map((q) => {
        const questionObj = {
          id: q._id ? q._id.toString() : q.id,
          question: q.question,
          options: q.options || [],
          codeSnippet: q.codeSnippet || '',
        };

        if (includeAnswers) {
          questionObj.correctAnswer = q.correctAnswer;
          questionObj.explanation = q.explanation || '';
        }

        return questionObj;
      });
    } else {
      res.questions = [];
    }

    // 5-Tier Topic Lineage
    if (quiz.topic) {
      if (typeof quiz.topic === 'object' && quiz.topic._id) {
        const top = quiz.topic;
        res.topic = {
          id: top._id.toString(),
          title: top.title,
          slug: top.slug,
          summary: top.summary,
          description: top.description,
          duration: top.duration,
          order: top.order,
        };

        if (top.section && typeof top.section === 'object' && top.section._id) {
          const sec = top.section;
          res.topic.section = {
            id: sec._id.toString(),
            title: sec.title,
            slug: sec.slug,
            description: sec.description,
            order: sec.order,
          };

          if (sec.module && typeof sec.module === 'object' && sec.module._id) {
            const mod = sec.module;
            res.topic.section.module = {
              id: mod._id.toString(),
              title: mod.title,
              slug: mod.slug,
              description: mod.description,
              order: mod.order,
            };

            if (mod.learningPath && typeof mod.learningPath === 'object' && mod.learningPath._id) {
              const lp = mod.learningPath;
              res.topic.section.module.learningPath = {
                id: lp._id.toString(),
                title: lp.title,
                slug: lp.slug,
                description: lp.description,
                icon: lp.icon,
                level: lp.level,
              };
            }
          }
        }
      } else {
        res.topic = { id: quiz.topic.toString() };
      }
    }

    if (quiz.createdBy && typeof quiz.createdBy === 'object') {
      res.createdBy = {
        id: quiz.createdBy._id ? quiz.createdBy._id.toString() : quiz.createdBy.id,
        name: quiz.createdBy.name,
        email: quiz.createdBy.email,
        role: quiz.createdBy.role,
      };
    }

    return res;
  },

  toResponseList: (quizzes, options = {}) => {
    if (!Array.isArray(quizzes)) return [];
    return quizzes.map((q) => quizPresenter.toResponse(q, options));
  },
};
