import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';

const signStudentToken = (student) => {
  return jwt.sign(
    {
      studentId: student.student_id,
      email: student.email
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

export const registerStudent = asyncHandler(async (req, res) => {
  const { name, email, phone = null, department = null, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  const existing = await query('SELECT student_id FROM student WHERE email = ?', [email]);
  if (existing.length) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(
    'INSERT INTO student (name, email, phone, department, password_hash) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, department, passwordHash]
  );

  const student = {
    student_id: result.insertId,
    name,
    email,
    phone,
    department
  };

  return res.status(201).json({
    message: 'Student registered successfully',
    student,
    token: signStudentToken(student)
  });
});

export const loginStudent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const rows = await query(
    'SELECT student_id, name, email, phone, department, password_hash FROM student WHERE email = ?',
    [email]
  );

  if (!rows.length) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const student = rows[0];
  const isPasswordValid = await bcrypt.compare(password, student.password_hash);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    message: 'Login successful',
    student: {
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department
    },
    token: signStudentToken(student)
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  const rows = await query(
    'SELECT student_id, name, email, phone, department, created_at FROM student WHERE student_id = ?',
    [studentId]
  );

  if (!rows.length) {
    return res.status(404).json({ message: 'Student not found' });
  }

  return res.json(rows[0]);
});

export const getStudentComplaints = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);

  const rows = await query(
    `SELECT
        c.complaint_id,
        c.title,
        c.status,
        c.priority,
        c.date_filed,
        c.date_resolved,
        cat.name AS category,
        IFNULL(st.name, 'Unassigned') AS assigned_staff
      FROM complaint c
      JOIN category cat ON c.category_id = cat.category_id
      LEFT JOIN staff st ON c.staff_id = st.staff_id
      WHERE c.student_id = ?
      ORDER BY c.date_filed DESC`,
    [studentId]
  );

  return res.json(rows);
});

export const updateStudent = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  const { name, phone, department } = req.body;

  if (name === undefined && phone === undefined && department === undefined) {
    return res.status(400).json({ message: 'At least one field is required' });
  }

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (phone !== undefined) {
    fields.push('phone = ?');
    values.push(phone);
  }
  if (department !== undefined) {
    fields.push('department = ?');
    values.push(department);
  }

  values.push(studentId);

  const result = await query(
    `UPDATE student SET ${fields.join(', ')} WHERE student_id = ?`,
    values
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Student not found' });
  }

  return res.json({ message: 'Student updated' });
});
