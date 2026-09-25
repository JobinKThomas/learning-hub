import mongoose from 'mongoose';

export const RESOURCE_TYPES = [
  'DOCUMENTATION',
  'VIDEO',
  'ARTICLE',
  'GITHUB',
  'COURSE',
  'TOOL',
  'OTHER',
];

const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

const resourceSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Parent topic is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return urlRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid HTTP or HTTPS URL!`,
      },
    },
    type: {
      type: String,
      enum: {
        values: RESOURCE_TYPES,
        message: '{VALUE} is not a valid resource type',
      },
      default: 'DOCUMENTATION',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    author: {
      type: String,
      trim: true,
      maxlength: [100, 'Author cannot exceed 100 characters'],
      default: '',
    },
    order: {
      type: Number,
      default: 1,
      index: true,
    },
    isFree: {
      type: Boolean,
      default: true,
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

export const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
