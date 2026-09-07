import { Playground } from '../models/Playground.js';

const POPULATE_PARENT_CHAIN = {
  path: 'topic',
  select: 'title slug summary description duration order section',
  populate: {
    path: 'section',
    select: 'title slug description order module',
    populate: {
      path: 'module',
      select: 'title slug description order learningPath',
      populate: {
        path: 'learningPath',
        select: 'title slug description icon level',
      },
    },
  },
};

const POPULATE_CREATED_BY = {
  path: 'createdBy',
  select: 'name email role',
};

export const playgroundRepository = {
  findAll: async (filter = {}, options = { sort: { order: 1, createdAt: 1 } }) => {
    return Playground.find(filter)
      .populate(POPULATE_PARENT_CHAIN)
      .populate(POPULATE_CREATED_BY)
      .sort(options.sort || { order: 1, createdAt: 1 })
      .exec();
  },

  findByTopic: async (topicId, publishedOnly = true) => {
    const filter = { topic: topicId };
    if (publishedOnly) {
      filter.published = true;
    }
    return Playground.find(filter)
      .populate(POPULATE_PARENT_CHAIN)
      .populate(POPULATE_CREATED_BY)
      .sort({ order: 1, createdAt: 1 })
      .exec();
  },

  findBySlug: async (slug) => {
    return Playground.findOne({ slug: slug.toLowerCase() })
      .populate(POPULATE_PARENT_CHAIN)
      .populate(POPULATE_CREATED_BY)
      .exec();
  },

  findById: async (id) => {
    return Playground.findById(id)
      .populate(POPULATE_PARENT_CHAIN)
      .populate(POPULATE_CREATED_BY)
      .exec();
  },

  create: async (playgroundData) => {
    const playground = new Playground(playgroundData);
    await playground.save();
    return playground.populate([POPULATE_PARENT_CHAIN, POPULATE_CREATED_BY]);
  },

  update: async (id, updateData) => {
    return Playground.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate(POPULATE_PARENT_CHAIN)
      .populate(POPULATE_CREATED_BY)
      .exec();
  },

  delete: async (id) => {
    return Playground.findByIdAndDelete(id).exec();
  },

  count: async (filter = {}) => {
    return Playground.countDocuments(filter).exec();
  },
};
