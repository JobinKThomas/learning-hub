import { playgroundService } from '../services/playgroundService.js';
import { playgroundPresenter } from '../presenters/playgroundPresenter.js';

export const playgroundController = {
  getAll: async (req, res, next) => {
    try {
      const playgrounds = await playgroundService.getAllPlaygrounds(req.query, req.user);
      return res.status(200).json({
        success: true,
        data: {
          playgrounds: playgroundPresenter.toResponseList(playgrounds),
          count: playgrounds.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getByTopic: async (req, res, next) => {
    try {
      const { topicId } = req.params;
      const playgrounds = await playgroundService.getPlaygroundsByTopic(topicId, req.user);
      return res.status(200).json({
        success: true,
        data: {
          playgrounds: playgroundPresenter.toResponseList(playgrounds),
          count: playgrounds.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const playground = await playgroundService.getPlaygroundBySlug(slug, req.user);
      return res.status(200).json({
        success: true,
        data: playgroundPresenter.toResponse(playground),
      });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const playground = await playgroundService.getPlaygroundById(id, req.user);
      return res.status(200).json({
        success: true,
        data: playgroundPresenter.toResponse(playground),
      });
    } catch (err) {
      next(err);
    }
  },

  runCode: async (req, res, next) => {
    try {
      const { code, language } = req.body;
      const playgroundId = req.body.playgroundId || req.params.id || null;

      const result = await playgroundService.runCode({
        code,
        language: language || 'javascript',
        playgroundId,
      });

      return res.status(200).json({
        success: true,
        message: 'Code execution completed',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const playground = await playgroundService.createPlayground(req.body, req.user.id);
      return res.status(201).json({
        success: true,
        message: 'Playground created successfully',
        data: playgroundPresenter.toResponse(playground),
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const playground = await playgroundService.updatePlayground(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Playground updated successfully',
        data: playgroundPresenter.toResponse(playground),
      });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await playgroundService.deletePlayground(id);
      return res.status(200).json({
        success: true,
        message: 'Playground deleted successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
