import { v4 as uuidv4 } from 'uuid';
import { sql } from '../middleware/db.js';

const mapRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    categoryId: row.category_id,
    plannedAmount: row.planned_amount
  };
};

const addBudgetItem = async ({ tripId, categoryId, plannedAmount }) => {
  const id = uuidv4();
  const rows = await sql`INSERT INTO trip_budget_items(id, trip_id, category_id, planned_amount) VALUES(${id}, ${tripId}, ${categoryId}, ${plannedAmount}) RETURNING *`;
  return mapRow(rows[0]);
};

const getBudgetForTrip = async (tripId) => {
  const rows = await sql`SELECT * FROM trip_budget_items WHERE trip_id = ${tripId}`;
  return rows.map(mapRow);
};

const deleteBudgetItem = async (id) => {
  await sql`DELETE FROM trip_budget_items WHERE id = ${id}`;
  return true;
};

export { addBudgetItem, getBudgetForTrip, deleteBudgetItem };
