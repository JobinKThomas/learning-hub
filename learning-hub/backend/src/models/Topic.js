import mongoose from 'mongoose';

/**
 * Utility to convert string into a URL-friendly slug
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const codeExampleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: 'Code Example',
    },
    language: {
      type: String,
      trim: true,
      default: 'javascript',
    },
    code: {
      type: String,
      required: [true, 'Code snippet is required'],
    },
    explanation: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Parent section is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Topic slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [300, 'Summary cannot exceed 300 characters'],
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Topic description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    codeExamples: {
      type: [codeExampleSchema],
      default: [],
    },
    keyPoints: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      default: '15 mins',
      trim: true,
    },
    order: {
      type: Number,
      default: 1,
      index: true,
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

// Pre-validate hook to automatically generate slug if not provided
topicSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title);
  } else if (this.slug) {
    this.slug = slugify(this.slug);
  }
  next();
});

export const Topic = mongoose.model('Topic', topicSchema);
export default Topic;
