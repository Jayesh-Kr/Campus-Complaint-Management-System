import { query } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const complaintsByStatus = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT status, COUNT(*) AS total_complaints
     FROM complaint
     GROUP BY status
     ORDER BY total_complaints DESC`
  );

  res.json(rows);
});

export const complaintsByCategory = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT cat.name AS category, COUNT(c.complaint_id) AS total
     FROM category cat
     LEFT JOIN complaint c ON cat.category_id = c.category_id
     GROUP BY cat.category_id, cat.name
     ORDER BY total DESC`
  );

  res.json(rows);
});

export const complaintsByDepartment = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT s.department, COUNT(c.complaint_id) AS complaints_raised
     FROM student s
     JOIN complaint c ON s.student_id = c.student_id
     GROUP BY s.department
     ORDER BY complaints_raised DESC`
  );

  res.json(rows);
});

export const staffPerformance = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT st.name AS staff_name, st.department, COUNT(c.complaint_id) AS resolved_count
     FROM staff st
     JOIN complaint c ON st.staff_id = c.staff_id
     WHERE c.status = 'resolved'
     GROUP BY st.staff_id, st.name, st.department
     ORDER BY resolved_count DESC`
  );

  res.json(rows);
});

export const averageResolutionTime = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT ROUND(AVG(DATEDIFF(date_resolved, date_filed)), 1) AS avg_days_to_resolve
     FROM complaint
     WHERE status = 'resolved' AND date_resolved IS NOT NULL`
  );

  res.json(rows[0]);
});

export const openComplaintsDashboard = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT *
     FROM vw_open_complaints
     ORDER BY FIELD(priority, 'critical', 'high', 'medium', 'low'), date_filed ASC`
  );

  res.json(rows);
});
