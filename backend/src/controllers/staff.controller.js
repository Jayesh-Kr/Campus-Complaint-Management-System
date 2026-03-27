import { query } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listStaff = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT staff_id, name, email, phone, department, role, created_at
     FROM staff
     ORDER BY name`
  );

  res.json(rows);
});

export const getStaffById = asyncHandler(async (req, res) => {
  const staffId = Number(req.params.id);
  const rows = await query(
    `SELECT staff_id, name, email, phone, department, role, created_at
     FROM staff
     WHERE staff_id = ?`,
    [staffId]
  );

  if (!rows.length) {
    return res.status(404).json({ message: 'Staff not found' });
  }

  return res.json(rows[0]);
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, phone = null, department = null, role = 'staff' } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required' });
  }

  const result = await query(
    'INSERT INTO staff (name, email, phone, department, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, department, role]
  );

  return res.status(201).json({
    message: 'Staff created',
    staff_id: result.insertId
  });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const staffId = Number(req.params.id);
  const { name, email, phone, department, role } = req.body;

  if (name === undefined && email === undefined && phone === undefined && department === undefined && role === undefined) {
    return res.status(400).json({ message: 'At least one field is required' });
  }

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (email !== undefined) {
    fields.push('email = ?');
    values.push(email);
  }
  if (phone !== undefined) {
    fields.push('phone = ?');
    values.push(phone);
  }
  if (department !== undefined) {
    fields.push('department = ?');
    values.push(department);
  }
  if (role !== undefined) {
    fields.push('role = ?');
    values.push(role);
  }

  values.push(staffId);

  const result = await query(
    `UPDATE staff SET ${fields.join(', ')} WHERE staff_id = ?`,
    values
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Staff not found' });
  }

  return res.json({ message: 'Staff updated' });
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const staffId = Number(req.params.id);
  const result = await query('DELETE FROM staff WHERE staff_id = ?', [staffId]);

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Staff not found' });
  }

  return res.json({ message: 'Staff deleted' });
});

export const getAssignedComplaintsByStaff = asyncHandler(async (req, res) => {
  const staffId = Number(req.params.id);
  const rows = await query(
    `SELECT
      c.complaint_id,
      c.title,
      c.status,
      c.priority,
      c.date_filed,
      s.name AS student_name,
      cat.name AS category
    FROM complaint c
    JOIN student s ON c.student_id = s.student_id
    JOIN category cat ON c.category_id = cat.category_id
    WHERE c.staff_id = ?
    ORDER BY c.date_filed DESC`,
    [staffId]
  );

  return res.json(rows);
});
