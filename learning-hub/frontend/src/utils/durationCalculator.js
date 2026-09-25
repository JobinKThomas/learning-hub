/**
 * Utility for calculating estimated time from content and rolling up
 * durations across the curriculum hierarchy on the frontend.
 */

/**
 * Parses duration string (e.g. "15 mins", "2 hours", "1 hr 30 mins", 45) into total minutes
 * @param {string|number} duration
 * @returns {number} total minutes
 */
export const parseDurationToMinutes = (duration) => {
  if (typeof duration === 'number') {
    return isNaN(duration) ? 0 : Math.max(0, duration);
  }
  if (!duration || typeof duration !== 'string') return 0;

  const text = duration.trim().toLowerCase();
  let totalMinutes = 0;

  // Match hours: e.g. "2 hours", "1.5 hrs", "2h", "1 hr"
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr|h\b)/);
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60;
  }

  // Match minutes: e.g. "30 mins", "45 min", "15m"
  const minMatch = text.match(/(\d+)\s*(?:minutes|minute|mins|min|m\b)/);
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1], 10);
  }

  // If plain number in string, e.g. "45"
  if (!hourMatch && !minMatch) {
    const rawNum = parseFloat(text);
    if (!isNaN(rawNum)) {
      totalMinutes = rawNum > 24 ? rawNum : rawNum * 60;
    }
  }

  return Math.round(totalMinutes);
};

/**
 * Formats minutes into human-readable duration string
 * @param {number} minutes
 * @param {'topic'|'section'|'module'|'path'} [level='topic']
 * @returns {string} formatted duration
 */
export const formatMinutesToDuration = (minutes, level = 'topic') => {
  const mins = Math.max(1, Math.round(minutes || 0));

  if (mins < 60) {
    return `${mins} mins`;
  }

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (remainingMins === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }

  if (level === 'path') {
    return `${Math.round(mins / 60)} hours`;
  }

  return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMins} min${remainingMins > 1 ? 's' : ''}`;
};

/**
 * Calculates estimated reading & study time for a Topic based on its contents
 * @param {Object} topicData - { content, description, summary, codeExamples, keyPoints, ... }
 * @returns {{ minutes: number, formatted: string, details: Object }}
 */
export const calculateTopicDurationFromContent = ({
  content = '',
  description = '',
  summary = '',
  codeExamples = [],
  keyPoints = [],
  notesCount = 0,
  playgroundsCount = 0,
  quizzesCount = 0,
} = {}) => {
  // 1. Text reading time (Prose & Markdown)
  const allText = `${content || ''} ${description || ''} ${summary || ''}`.replace(/<[^>]*>/g, ' ');
  const words = allText.trim().split(/\s+/).filter(Boolean).length;
  // Technical reading speed: ~180 words per minute
  const readingMinutes = words > 0 ? words / 180 : 0;

  // 2. Code examples: 2 minutes base inspection + 1 min per 10 lines
  let codeMinutes = 0;
  if (Array.isArray(codeExamples)) {
    for (const ex of codeExamples) {
      const code = typeof ex === 'string' ? ex : (ex?.code || '');
      const lines = code.split('\n').filter((l) => l.trim()).length;
      codeMinutes += 2 + Math.max(0, Math.floor(lines / 10));
    }
  }

  // 3. Key points: 0.5 minutes per point
  const keyPointCount = Array.isArray(keyPoints) ? keyPoints.length : 0;
  const keyPointMinutes = keyPointCount * 0.5;

  // 4. Interactive items
  const interactiveMinutes = (notesCount * 3) + (playgroundsCount * 5) + (quizzesCount * 2);

  const totalCalculated = readingMinutes + codeMinutes + keyPointMinutes + interactiveMinutes;

  // Minimum of 5 mins, round up
  const finalMinutes = Math.max(5, Math.ceil(totalCalculated));

  return {
    minutes: finalMinutes,
    formatted: formatMinutesToDuration(finalMinutes, 'topic'),
    details: {
      words,
      readingMinutes: Math.round(readingMinutes * 10) / 10,
      codeMinutes,
      keyPointMinutes,
      interactiveMinutes,
    },
  };
};

/**
 * Calculates Section duration from child Topics or fallback content
 */
export const calculateSectionDuration = (topics = [], sectionData = {}) => {
  if (Array.isArray(topics) && topics.length > 0) {
    const totalMinutes = topics.reduce((acc, t) => {
      const tMins = parseDurationToMinutes(t.duration) || calculateTopicDurationFromContent(t).minutes;
      return acc + tMins;
    }, 0);
    return {
      minutes: totalMinutes,
      formatted: formatMinutesToDuration(totalMinutes, 'section'),
    };
  }

  const itemsCount = Array.isArray(sectionData.items) ? sectionData.items.length : 0;
  const words = (sectionData.description || '').trim().split(/\s+/).filter(Boolean).length;
  const fallbackMins = Math.max(15, (itemsCount * 10) + Math.ceil(words / 180));

  return {
    minutes: fallbackMins,
    formatted: formatMinutesToDuration(fallbackMins, 'section'),
  };
};

/**
 * Calculates Module duration from child Sections
 */
export const calculateModuleDuration = (sections = [], moduleData = {}) => {
  if (Array.isArray(sections) && sections.length > 0) {
    const totalMinutes = sections.reduce((acc, s) => {
      const sMins = parseDurationToMinutes(s.duration) || 30;
      return acc + sMins;
    }, 0);
    return {
      minutes: totalMinutes,
      formatted: formatMinutesToDuration(totalMinutes, 'module'),
    };
  }

  const topicsCount = Array.isArray(moduleData.topics) ? moduleData.topics.length : 0;
  const fallbackMins = Math.max(30, topicsCount * 15);

  return {
    minutes: fallbackMins,
    formatted: formatMinutesToDuration(fallbackMins, 'module'),
  };
};

/**
 * Calculates Learning Path estimated hours from child Modules
 */
export const calculatePathEstimatedHours = (modules = [], pathData = {}) => {
  if (Array.isArray(modules) && modules.length > 0) {
    const totalMinutes = modules.reduce((acc, m) => {
      const mMins = parseDurationToMinutes(m.duration) || 60;
      return acc + mMins;
    }, 0);
    return Math.max(1, Math.round(totalMinutes / 60));
  }

  return pathData.estimatedHours || 20;
};
