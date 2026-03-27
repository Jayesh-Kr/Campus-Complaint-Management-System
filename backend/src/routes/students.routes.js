import { Router } from 'express';
import {
  getStudentById,
  getStudentComplaints,
  loginStudent,
  registerStudent,
  updateStudent
} from '../controllers/students.controller.js';
import { requireStudentAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/:id', requireStudentAuth, getStudentById);
router.patch('/:id', requireStudentAuth, updateStudent);
router.get('/:id/complaints', requireStudentAuth, getStudentComplaints);

export default router;
