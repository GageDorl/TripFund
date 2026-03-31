import { v4 as uuidv4 } from 'uuid';
import { sql } from '../middleware/db.js';

const mapRow = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    tripId: r.trip_id,
    userId: r.user_id,
    parentId: r.parent_id,
    body: r.body,
    createdAt: r.created_at
  };
};

const addComment = async ({ tripId, userId, body, parentId = null }) => {
  if (!tripId || !body) throw new Error('tripId and body required');
  const id = uuidv4();
  const rows = await sql`INSERT INTO comments (id, trip_id, user_id, body, parent_id) VALUES (${id}, ${tripId}, ${userId}, ${body}, ${parentId}) RETURNING *`;
  return mapRow(rows[0]);
};

const getCommentsForTrip = async (tripId) => {
  const rows = await sql`SELECT * FROM comments WHERE trip_id = ${tripId} ORDER BY created_at DESC`;
  return rows.map(mapRow);
};

const findCommentById = async (id) => {
  const rows = await sql`SELECT * FROM comments WHERE id = ${id} LIMIT 1`;
  return mapRow(rows[0]);
};

const deleteComment = async (id) => {
  await sql`DELETE FROM comments WHERE id = ${id}`;
  return true;
};

export { addComment, getCommentsForTrip, findCommentById, deleteComment };
