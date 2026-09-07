import { noteService } from '../services/noteService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class NoteController {
  constructor(service = noteService) {
    this.service = service;
  }

  /**
   * @desc    Get all notes (optionally filtered by topic, tag, or search)
   * @route   GET /api/notes?topic=:topicId
   * @access  Private (Authenticated users)
   */
  getAll = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const topicId = req.query.topic || req.query.topicId;
      const { search, tag } = req.query;

      const notes = await this.service.getAllNotes({
        topicId,
        search,
        tag,
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Notes retrieved successfully', { notes, count: notes.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get notes for a specific topic
   * @route   GET /api/topics/:topicId/notes
   * @access  Private (Authenticated users)
   */
  getByTopic = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const { topicId } = req.params;

      const notes = await this.service.getNotesByTopic(topicId, {
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Topic notes retrieved successfully', { notes, count: notes.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get note details by slug
   * @route   GET /api/notes/:slug
   * @access  Private (Authenticated users)
   */
  getBySlug = async (req, res, next) => {
    try {
      const note = await this.service.getNoteBySlug(req.params.slug);
      return sendSuccess(res, 'Note details retrieved successfully', note, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get note by ID
   * @route   GET /api/notes/id/:id
   * @access  Private (Authenticated users)
   */
  getById = async (req, res, next) => {
    try {
      const note = await this.service.getNoteById(req.params.id);
      return sendSuccess(res, 'Note retrieved successfully', note, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Create new note
   * @route   POST /api/notes
   * @access  Private (Admin only)
   */
  create = async (req, res, next) => {
    try {
      const created = await this.service.createNote(req.body, req.user);
      return sendSuccess(res, 'Note created successfully', created, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Update note
   * @route   PUT /api/notes/:id
   * @access  Private (Admin only)
   */
  update = async (req, res, next) => {
    try {
      const updated = await this.service.updateNote(req.params.id, req.body);
      return sendSuccess(res, 'Note updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Delete note
   * @route   DELETE /api/notes/:id
   * @access  Private (Admin only)
   */
  delete = async (req, res, next) => {
    try {
      const result = await this.service.deleteNote(req.params.id);
      return sendSuccess(res, 'Note deleted successfully', result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const noteController = new NoteController();
export default noteController;
