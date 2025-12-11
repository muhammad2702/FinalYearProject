import { Router } from 'express';
import runRouter from './run.js';
import simulationsRouter from './simulations.js';
import templatesRouter from './templates.js';
import authRouter from './auth.js';

const router = Router();

router.use('/simulations', simulationsRouter);
router.use('/templates', templatesRouter);
router.use('/auth', authRouter);
router.use('/', runRouter);

export default router;

