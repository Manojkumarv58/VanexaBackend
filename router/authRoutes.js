import express from 'express';
import { registerUser, loginUser,logoutUser,getUserProfile, updateProfile, forgotPassword, resetPassword,updatePassword} from '../controllers/authController.js'; 
import { isAuthenticated } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', isAuthenticated, logoutUser);
router.get('/profile', isAuthenticated, getUserProfile);
router.put('/profile', isAuthenticated, updateProfile);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.put("/password/update", isAuthenticated, updatePassword);
export default router;