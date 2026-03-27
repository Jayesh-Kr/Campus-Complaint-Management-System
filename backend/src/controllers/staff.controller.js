import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';

const VALID_STAFF_ROLES = ['admin', 'staff'];

const signStaffToken = (staff) => {
  return jwt.sign(
    {
      staffId: staff.staff_id,
      email: staff.email,
      role: staff.role
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const registerStaff = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone = null,
    department = null,
    password,
    role = 'staff'
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  if (!VALID_STAFF_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role value' });
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await query('SELECT staff_id FROM staff WHERE email = ?', [normalizedEmail]);
  if (existing.length) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO staff (name, email, phone, department, password_hash, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, normalizedEmail, phone, department, passwordHash, role]
  );

  const staff = {
    staff_id: result.insertId,
    name,
    email: normalizedEmail,
    phone,
    department,
    role
  };

  return res.status(201).json({
    message: 'Staff registered successfully',
    staff,
    token: signStaffToken(staff)
  });
});

export const loginStaff = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const normalizedEmail = normalizeEmail(email);

  const rows = await query(
    `SELECT staff_id, name, email, phone, department, role, password_hash
     FROM staff
     WHERE email = ?`,
    [normalizedEmail]
  );

  if (!rows.length) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const staff = rows[0];
  if (!staff.password_hash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isPasswordValid = await bcrypt.compare(password, staff.password_hash);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    message: 'Login successful',
    staff: {
      staff_id: staff.staff_id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      department: staff.department,
      role: staff.role
    },
    token: signStaffToken(staff)
  });
});

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
  const {
    name,
    email,
    phone = null,
    department = null,
    role = 'staff',
    password
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  if (!VALID_STAFF_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role value' });
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await query('SELECT staff_id FROM staff WHERE email = ?', [normalizedEmail]);
  if (existing.length) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO staff (name, email, phone, department, password_hash, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, normalizedEmail, phone, department, passwordHash, role]
  );

  return res.status(201).json({
    message: 'Staff created',
    staff_id: result.insertId
  });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const staffId = Number(req.params.id);
  const { name, email, phone, department, role, password } = req.body;

  if (
    name === undefined &&
    email === undefined &&
    phone === undefined &&
    department === undefined &&
    role === undefined &&
    password === undefined
  ) {
    return res.status(400).json({ message: 'At least one field is required' });
  }

  if (role !== undefined && !VALID_STAFF_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role value' });
  }

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (email !== undefined) {
    fields.push('email = ?');
    values.push(normalizeEmail(email));
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
  if (password !== undefined) {
    const passwordHash = await bcrypt.hash(password, 10);
    fields.push('password_hash = ?');
    values.push(passwordHash);
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
