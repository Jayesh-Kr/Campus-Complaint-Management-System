import { Router } from 'express';
import {
  addResponse,
  getResponsesByComplaint
} from '../controllers/responses.controller.js';

const router = Router();

router.post('/', addResponse);
router.get('/complaint/:complaintId', getResponsesByComplaint);

export default router;
