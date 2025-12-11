import { Router } from 'express';
import { runSimulation } from '../controllers/simulationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/run-sim', authenticateToken, runSimulation);

export default router;

