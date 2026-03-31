import { v4 as uuidv4 } from 'uuid';
import { sql } from '../middleware/db.js';

const mapRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    changedBy: row.changed_by_user_id,
    changedAt: row.changed_at
  };
};

const addStatusChange = async ({ tripId, oldStatus, newStatus, changedBy }) => {
  const id = uuidv4();
  const rows = await sql`INSERT INTO trip_status_history(id, trip_id, old_status, new_status, changed_by_user_id) VALUES(${id}, ${tripId}, ${oldStatus}, ${newStatus}, ${changedBy}) RETURNING *`;
  return mapRow(rows[0]);
};

const getHistoryForTrip = async (tripId) => {
  const rows = await sql`SELECT * FROM trip_status_history WHERE trip_id = ${tripId} ORDER BY changed_at DESC`;
  return rows.map(mapRow);
};

export { addStatusChange, getHistoryForTrip };
