import { v4 as uuidv4 } from 'uuid';
import { sql } from '../middleware/db.js';

const mapRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    title: row.title,
    body: row.body,
    totalCost: row.total_cost,
    lessonsLearned: row.lessons_learned,
    recommendation: row.recommendation,
    featured: row.featured,
    postedAt: row.posted_at
  };
};

const createRecap = async ({ tripId, title, body, totalCost, lessonsLearned, recommendation }) => {
  // ensure trip has status 'completed' before creating recap
  const tripRows = await sql`SELECT status FROM trips WHERE id = ${tripId} LIMIT 1`;
  const trip = tripRows[0];
  if (!trip) throw new Error('Trip not found');
  if (trip.status !== 'completed') throw new Error('Recap allowed only for completed trips');

  // prevent duplicate recap (unique constraint will also protect)
  const existing = await sql`SELECT * FROM recaps WHERE trip_id = ${tripId} LIMIT 1`;
  if (existing[0]) throw new Error('Recap already exists for this trip');

  const id = uuidv4();
  const rows = await sql`INSERT INTO recaps(id, trip_id, title, body, total_cost, lessons_learned, recommendation) VALUES(${id}, ${tripId}, ${title}, ${body}, ${totalCost}, ${lessonsLearned}, ${recommendation}) RETURNING *`;
  return mapRow(rows[0]);
};

const getRecapByTripId = async (tripId) => {
  const rows = await sql`SELECT * FROM recaps WHERE trip_id = ${tripId} LIMIT 1`;
  return mapRow(rows[0]);
};

const getRecapById = async (id) => {
  const rows = await sql`SELECT * FROM recaps WHERE id = ${id} LIMIT 1`;
  return mapRow(rows[0]);
};

export { createRecap, getRecapByTripId, getRecapById };
