import { Router } from 'express';
import {
  createStaff,
  deleteStaff,
  getAssignedComplaintsByStaff,
  getStaffById,
  listStaff,
  updateStaff
} from '../controllers/staff.controller.js';

const router = Router();

router.get('/', listStaff);
router.post('/', createStaff);
router.get('/:id', getStaffById);
router.patch('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.get('/:id/complaints', getAssignedComplaintsByStaff);

export default router;
