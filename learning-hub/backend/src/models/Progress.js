import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic reference is required'],
      index: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      index: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      index: true,
    },
    learningPath: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningPath',
      index: true,
    },
    completedNotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    completedQuizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
      },
    ],
    completedPlaygrounds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playground',
      },
    ],
    completedKeyPoints: {
      type: [Number],
      default: [],
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index ensuring one progress document per (user, topic)
progressSchema.index({ user: 1, topic: 1 }, { unique: true });
// Compound index for querying user progress by learning path
progressSchema.index({ user: 1, learningPath: 1 });
// Compound index for querying user progress by module
progressSchema.index({ user: 1, module: 1 });
// Compound index for querying user progress by section
progressSchema.index({ user: 1, section: 1 });

export const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
