import { Router } from 'express';
import {
  assignComplaint,
  createComplaint,
  deleteComplaint,
  getComplaintById,
  listComplaints,
  updateComplaint
} from '../controllers/complaints.controller.js';

const router = Router();

router.get('/', listComplaints);
router.post('/', createComplaint);
router.get('/:id', getComplaintById);
router.patch('/:id', updateComplaint);
router.delete('/:id', deleteComplaint);
router.patch('/:id/assign', assignComplaint);

export default router;
