import { v4 as uuidv4 } from 'uuid';
import { sql } from '../middleware/db.js';

const mapRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description
  };
};

const createCategory = async ({ name, slug, description }) => {
  const id = uuidv4();
  const rows = await sql`INSERT INTO budget_categories(id, name, slug, description) VALUES(${id}, ${name}, ${slug}, ${description}) RETURNING *`;
  return mapRow(rows[0]);
};

const getAllCategories = async () => {
  const rows = await sql`SELECT * FROM budget_categories ORDER BY name`;
  return rows.map(mapRow);
};

const findCategoryById = async (id) => {
  const rows = await sql`SELECT * FROM budget_categories WHERE id = ${id} LIMIT 1`;
  return mapRow(rows[0]);
};

const updateCategory = async (id, { name, slug, description }) => {
  const rows = await sql`UPDATE budget_categories SET name = ${name}, slug = ${slug}, description = ${description} WHERE id = ${id} RETURNING *`;
  return mapRow(rows[0]);
};

export { createCategory, getAllCategories, findCategoryById, updateCategory };
