import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    duration: {
      type: String,
      default: '2 hours',
    },
    topics: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  { _id: true }
);

const learningPathSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Learning path title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: true,
      default: 'Web Development',
      trim: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    estimatedHours: {
      type: Number,
      required: true,
      min: [1, 'Estimated hours must be at least 1'],
      default: 20,
    },
    icon: {
      type: String,
      default: 'Code',
    },
    color: {
      type: String,
      default: 'indigo',
    },
    modules: {
      type: [moduleSchema],
      default: [],
    },
    published: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Slugify helper
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Ensure slug is populated before validation if not explicitly given
learningPathSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  next();
});

export const LearningPath = mongoose.model('LearningPath', learningPathSchema);
