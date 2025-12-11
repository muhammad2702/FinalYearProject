import { Router } from 'express';
import { runSimulation } from '../controllers/simulationController.js';

const router = Router();

router.post('/run-sim', runSimulation);

export default router;

