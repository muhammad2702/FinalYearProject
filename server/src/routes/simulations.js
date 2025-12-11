import { Router } from 'express';
import {
  exportSimulation,
  getSimulationData,
  getSimulationStats,
  getSimulations,
} from '../controllers/simulationController.js';

const router = Router();

router.get('/', getSimulations);
router.get('/:id/data', getSimulationData);
router.get('/:id/export', exportSimulation);
router.get('/:id/stats', getSimulationStats);

export default router;

