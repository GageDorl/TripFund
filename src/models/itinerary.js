import { v4 as uuidv4 } from 'uuid';
import { sql } from '../middleware/db.js';

const mapRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    dayNumber: row.day_number,
    title: row.title,
    location: row.location,
    notes: row.notes,
    estimatedCost: row.estimated_cost,
    activityTime: row.activity_time
  };
};

const addItineraryItem = async ({ tripId, dayNumber, title, location, notes, estimatedCost, activityTime }) => {
  const id = uuidv4();
  const rows = await sql`INSERT INTO itinerary_items(id, trip_id, day_number, title, location, notes, estimated_cost, activity_time) VALUES(${id}, ${tripId}, ${dayNumber}, ${title}, ${location}, ${notes}, ${estimatedCost}, ${activityTime}) RETURNING *`;
  return mapRow(rows[0]);
};

const getItineraryForTrip = async (tripId) => {
  const rows = await sql`SELECT * FROM itinerary_items WHERE trip_id = ${tripId} ORDER BY day_number`;
  return rows.map(mapRow);
};

const deleteItineraryItem = async (id) => {
  await sql`DELETE FROM itinerary_items WHERE id = ${id}`;
  return true;
};

export { addItineraryItem, getItineraryForTrip, deleteItineraryItem };
