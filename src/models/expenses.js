import { v4 as uuidv4 } from 'uuid';
import { sql } from '../middleware/db.js';

const mapRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    categoryId: row.category_id,
    createdBy: row.created_by_user_id,
    amount: row.amount,
    description: row.description,
    expenseDate: row.expense_date,
    createdAt: row.created_at
  };
};

const addExpense = async ({ tripId, categoryId, createdBy, amount, description, expenseDate }) => {
  if (!tripId || !amount || Number(amount) <= 0) throw new Error('Invalid expense data');
  const id = uuidv4();
  const rows = await sql`INSERT INTO expenses(id, trip_id, category_id, created_by_user_id, amount, description, expense_date) VALUES(${id}, ${tripId}, ${categoryId}, ${createdBy}, ${amount}, ${description}, ${expenseDate}) RETURNING *`;
  return mapRow(rows[0]);
};

const getExpensesForTrip = async (tripId) => {
  const rows = await sql`SELECT * FROM expenses WHERE trip_id = ${tripId} ORDER BY expense_date DESC`;
  return rows.map(mapRow);
};

const getTotalExpensesForTrip = async (tripId) => {
  const rows = await sql`SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE trip_id = ${tripId}`;
  return Number(rows[0].total || 0);
};

const deleteExpense = async (id) => {
  await sql`DELETE FROM expenses WHERE id = ${id}`;
  return true;
};

export { addExpense, getExpensesForTrip, getTotalExpensesForTrip, deleteExpense };
