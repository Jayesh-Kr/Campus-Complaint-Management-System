import { Router } from 'express';
import {
  averageResolutionTime,
  complaintsByCategory,
  complaintsByDepartment,
  complaintsByStatus,
  openComplaintsDashboard,
  staffPerformance
} from '../controllers/reports.controller.js';

const router = Router();

router.get('/complaints-by-status', complaintsByStatus);
router.get('/complaints-by-category', complaintsByCategory);
router.get('/complaints-by-department', complaintsByDepartment);
router.get('/staff-performance', staffPerformance);
router.get('/average-resolution-time', averageResolutionTime);
router.get('/open-complaints-dashboard', openComplaintsDashboard);

export default router;
