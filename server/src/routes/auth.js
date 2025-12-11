import { Router } from 'express';
import { login, signup, verifyOtp, getUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/me', authenticateToken, getUser);

export default router;

