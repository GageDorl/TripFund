import { v4 as uuidv4 } from 'uuid';
import { sql } from '../middleware/db.js';

const mapRowToTrip = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        destination: row.destination,
        startDate: row.start_date || row.startDate,
        endDate: row.end_date || row.endDate,
        description: row.description,
        userId: row.user_id || row.userId,
        cost: row.cost,
        fundsRaised: row.funds_raised || row.fundsRaised || 0,
        allowDonations: row.allow_donations === true || row.allow_donations === 't' || row.allowDonations === true || false,
        fundingGoal: row.funding_goal || row.fundingGoal || 0
    };
}

const createTrip = async ({ name, destination, startDate, endDate, userId, cost, description, allowDonations = false, fundingGoal = 0 }) => {
    if (!name || !destination || !startDate || !endDate || !userId || cost == null) {
        console.error("Failed to create trip: Missing required fields", { name, destination, startDate, endDate, userId, cost, description });
        throw new Error("All required fields must be provided");
    }

    const id = uuidv4();
    const rows = await sql`INSERT INTO trips(id, name, destination, start_date, end_date, description, user_id, cost, funds_raised, allow_donations, funding_goal) VALUES(${id}, ${name}, ${destination}, ${startDate}, ${endDate}, ${description || null}, ${userId}, ${cost}, ${0}, ${allowDonations}, ${fundingGoal}) RETURNING *`;
    return mapRowToTrip(rows[0]);
}

const updateTrip = async (id, { name, destination, startDate, endDate, cost, description, allowDonations = false, fundingGoal = 0 }) => {
    if (!id || !name || !destination || !startDate || !endDate || cost == null) {
        console.error("Failed to update trip: Missing required fields", { id, name, destination, startDate, endDate, cost, description });
        throw new Error("All required fields must be provided");
    }
    const rows = await sql`UPDATE trips SET name = ${name}, destination = ${destination}, start_date = ${startDate}, end_date = ${endDate}, cost = ${cost}, description = ${description || null}, allow_donations = ${allowDonations}, funding_goal = ${fundingGoal} WHERE id = ${id} RETURNING *`;
    return mapRowToTrip(rows[0]);
}

const deleteTrip = async (tripId) => {
    if (!tripId) throw new Error('tripId required');
    await sql`DELETE FROM trips WHERE id = ${tripId}`;
    return true;
}

const getTripById = async (tripId) => {
    const rows = await sql`SELECT * FROM trips WHERE id = ${tripId} LIMIT 1`;
    return mapRowToTrip(rows[0]);
}

const getTripsByUserId = async (userId) => {
    const rows = await sql`SELECT * FROM trips WHERE user_id = ${userId} ORDER BY start_date DESC`;
    return rows.map(mapRowToTrip);
}

const getAllTrips = async () => {
    const rows = await sql`SELECT * FROM trips ORDER BY start_date DESC`;
    return rows.map(mapRowToTrip);
}

export { createTrip, getTripById, getTripsByUserId, getAllTrips, updateTrip, deleteTrip };

