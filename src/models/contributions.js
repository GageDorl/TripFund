import { v4 as uuidv4 } from 'uuid';
import { sql } from '../middleware/db.js';

const mapRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    contributor: row.contributor_user_id,
    amount: row.amount,
    type: row.type,
    message: row.message,
    createdAt: row.created_at
  };
};

const addContribution = async ({ tripId, contributorUserId, amount, type, message }) => {
  const numericAmount = Number(amount);
  if (!tripId || !numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) throw new Error('Invalid contribution');

  // If donation, ensure trip allows donations
  const tripRows = await sql`SELECT allow_donations FROM trips WHERE id = ${tripId} LIMIT 1`;
  const trip = tripRows[0];
  if (!trip) throw new Error('Trip not found');
  if (type === 'donation' && !trip.allow_donations) throw new Error('Donations not allowed for this trip');

  const id = uuidv4();
  // Normalize optional fields to avoid passing `undefined` into SQL bindings
  const normalizedContributor = contributorUserId ?? null;
  const normalizedMessage = message ?? null;

  // Create contribution and update funds_raised using numeric value
  const rows = await sql.begin(async (tx) => {
    const r1 = await tx`INSERT INTO contributions(id, trip_id, contributor_user_id, amount, type, message) VALUES(${id}, ${tripId}, ${normalizedContributor}, ${numericAmount}, ${type}, ${normalizedMessage}) RETURNING *`;
    await tx`UPDATE trips SET funds_raised = COALESCE(funds_raised,0) + ${numericAmount} WHERE id = ${tripId}`;
    return r1;
  });

  return mapRow(rows[0]);
};

const getContributionsForTrip = async (tripId) => {
  const rows = await sql`SELECT * FROM contributions WHERE trip_id = ${tripId} ORDER BY created_at DESC`;
  return rows.map(mapRow);
};

const getTotalContributionsForTrip = async (tripId) => {
  const rows = await sql`SELECT COALESCE(SUM(amount),0) as total FROM contributions WHERE trip_id = ${tripId}`;
  return Number(rows[0].total || 0);
};

export { addContribution, getContributionsForTrip, getTotalContributionsForTrip };
