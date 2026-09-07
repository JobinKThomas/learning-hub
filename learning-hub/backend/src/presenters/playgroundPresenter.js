export const playgroundPresenter = {
  toResponse: (playground) => {
    if (!playground) return null;

    const res = {
      id: playground._id ? playground._id.toString() : playground.id,
      title: playground.title,
      slug: playground.slug,
      description: playground.description || '',
      instructions: playground.instructions || '',
      initialCode: playground.initialCode || '',
      solutionCode: playground.solutionCode || '',
      expectedOutput: playground.expectedOutput || '',
      hints: playground.hints || [],
      language: playground.language || 'javascript',
      difficulty: playground.difficulty || 'BEGINNER',
      order: playground.order ?? 0,
      published: playground.published ?? true,
      createdAt: playground.createdAt,
      updatedAt: playground.updatedAt,
    };

    // Formatted Populated 5-Tier Topic Lineage
    if (playground.topic) {
      if (typeof playground.topic === 'object' && playground.topic._id) {
        const top = playground.topic;
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
        res.topic = { id: playground.topic.toString() };
      }
    }

    if (playground.createdBy && typeof playground.createdBy === 'object') {
      res.createdBy = {
        id: playground.createdBy._id ? playground.createdBy._id.toString() : playground.createdBy.id,
        name: playground.createdBy.name,
        email: playground.createdBy.email,
        role: playground.createdBy.role,
      };
    }

    return res;
  },

  toResponseList: (playgrounds) => {
    if (!Array.isArray(playgrounds)) return [];
    return playgrounds.map((p) => playgroundPresenter.toResponse(p));
  },
};
