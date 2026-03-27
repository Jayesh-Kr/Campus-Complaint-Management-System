import { query } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listCategories = asyncHandler(async (req, res) => {
  const rows = await query('SELECT category_id, name, description FROM category ORDER BY name');
  res.json(rows);
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);
  const rows = await query(
    'SELECT category_id, name, description FROM category WHERE category_id = ?',
    [categoryId]
  );

  if (!rows.length) {
    return res.status(404).json({ message: 'Category not found' });
  }

  return res.json(rows[0]);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description = null } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  const result = await query(
    'INSERT INTO category (name, description) VALUES (?, ?)',
    [name, description]
  );

  return res.status(201).json({
    message: 'Category created',
    category_id: result.insertId
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);
  const { name, description } = req.body;

  if (name === undefined && description === undefined) {
    return res.status(400).json({ message: 'At least one field is required' });
  }

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }

  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description);
  }

  values.push(categoryId);

  const result = await query(
    `UPDATE category SET ${fields.join(', ')} WHERE category_id = ?`,
    values
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Category not found' });
  }

  return res.json({ message: 'Category updated' });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);
  const result = await query('DELETE FROM category WHERE category_id = ?', [categoryId]);

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Category not found' });
  }

  return res.json({ message: 'Category deleted' });
});
