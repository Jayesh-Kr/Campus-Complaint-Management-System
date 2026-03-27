import { query } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const addResponse = asyncHandler(async (req, res) => {
  const { complaint_id, staff_id, message } = req.body;

  if (!complaint_id || !staff_id || !message) {
    return res.status(400).json({ message: 'complaint_id, staff_id, and message are required' });
  }

  const result = await query(
    'INSERT INTO response (message, complaint_id, staff_id) VALUES (?, ?, ?)',
    [message, complaint_id, staff_id]
  );

  return res.status(201).json({
    message: 'Response added',
    response_id: result.insertId
  });
});

export const getResponsesByComplaint = asyncHandler(async (req, res) => {
  const complaintId = Number(req.params.complaintId);

  const rows = await query(
    `SELECT
      r.response_id,
      r.message,
      r.date_responded,
      r.staff_id,
      st.name AS staff_name
    FROM response r
    JOIN staff st ON r.staff_id = st.staff_id
    WHERE r.complaint_id = ?
    ORDER BY r.date_responded DESC`,
    [complaintId]
  );

  return res.json(rows);
});
