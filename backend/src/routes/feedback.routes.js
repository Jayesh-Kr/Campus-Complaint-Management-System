import { Router } from 'express';
import {
  createFeedback,
  getFeedbackByComplaint
} from '../controllers/feedback.controller.js';

const router = Router();

router.post('/', createFeedback);
router.get('/complaint/:complaintId', getFeedbackByComplaint);

export default router;
