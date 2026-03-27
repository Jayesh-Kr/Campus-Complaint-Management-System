import { query } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createFeedback = asyncHandler(async (req, res) => {
  const { complaint_id, student_id, rating, message = null } = req.body;

  if (!complaint_id || !student_id || rating === undefined) {
    return res.status(400).json({ message: 'complaint_id, student_id, and rating are required' });
  }

  if (Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ message: 'rating must be between 1 and 5' });
  }

  const result = await query(
    'INSERT INTO feedback (message, rating, complaint_id, student_id) VALUES (?, ?, ?, ?)',
    [message, rating, complaint_id, student_id]
  );

  return res.status(201).json({
    message: 'Feedback submitted',
    feedback_id: result.insertId
  });
});

export const getFeedbackByComplaint = asyncHandler(async (req, res) => {
  const complaintId = Number(req.params.complaintId);

  const rows = await query(
    `SELECT feedback_id, message, rating, date, complaint_id, student_id
     FROM feedback
     WHERE complaint_id = ?`,
    [complaintId]
  );

  if (!rows.length) {
    return res.status(404).json({ message: 'Feedback not found for this complaint' });
  }

  return res.json(rows[0]);
});
