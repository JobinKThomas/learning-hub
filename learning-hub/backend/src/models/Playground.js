import mongoose from 'mongoose';

const playgroundSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Playground title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    initialCode: {
      type: String,
      required: [true, 'Initial starter code is required'],
      default: '// Write your code here\nconsole.log("Hello, Learning Hub Playground!");\n',
    },
    solutionCode: {
      type: String,
      trim: true,
      default: '',
    },
    expectedOutput: {
      type: String,
      trim: true,
      default: '',
    },
    hints: [
      {
        type: String,
        trim: true,
      },
    ],
    language: {
      type: String,
      enum: ['javascript', 'typescript', 'python', 'cpp'],
      default: 'javascript',
    },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
    },
    order: {
      type: Number,
      default: 0,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for ordered topic-specific playgrounds
playgroundSchema.index({ topic: 1, order: 1 });

export const Playground = mongoose.model('Playground', playgroundSchema);
