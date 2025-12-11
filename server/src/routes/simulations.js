import { Router } from 'express';
import {
  exportSimulation,
  getSimulationData,
  getSimulationStats,
  getSimulations,
} from '../controllers/simulationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All simulation routes require authentication
router.use(authenticateToken);

router.get('/', getSimulations);
router.get('/:id/data', getSimulationData);
router.get('/:id/export', exportSimulation);
router.get('/:id/stats', getSimulationStats);

export default router;

