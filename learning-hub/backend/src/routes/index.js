import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import learningPathRoutes from './learningPathRoutes.js';
import moduleRoutes from './moduleRoutes.js';
import sectionRoutes from './sectionRoutes.js';
import topicRoutes from './topicRoutes.js';
import noteRoutes from './noteRoutes.js';
import resourceRoutes from './resourceRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/learning-paths', learningPathRoutes);
router.use('/modules', moduleRoutes);
router.use('/sections', sectionRoutes);
router.use('/topics', topicRoutes);
router.use('/notes', noteRoutes);
router.use('/resources', resourceRoutes);

export default router;
