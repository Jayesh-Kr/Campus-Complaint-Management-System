import { Router } from 'express';
import {
  createStaff,
  deleteStaff,
  getAssignedComplaintsByStaff,
  getStaffById,
  loginStaff,
  listStaff,
  registerStaff,
  updateStaff
} from '../controllers/staff.controller.js';

const router = Router();

router.get('/', listStaff);
router.post('/register', registerStaff);
router.post('/login', loginStaff);
router.post('/', createStaff);
router.get('/:id', getStaffById);
router.patch('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.get('/:id/complaints', getAssignedComplaintsByStaff);

export default router;
