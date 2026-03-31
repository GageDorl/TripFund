import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sql } from "../middleware/db.js";

const mapRowToUser = (row) => {
    if (!row) return null;
    const first = row.first_name || '';
    const last = row.last_name || '';
    return {
        username: row.username,
        first_name: first,
        last_name: last,
        email: row.email,
        role: row.role || 'user',
        created_at: row.created_at || null,
        passwordHash: row.password_hash || row.passwordHash,
        activeTrips: []
    };
}

const createUser = async ({ email, password, username, first_name, last_name }) => {
    const passwordHash = await bcrypt.hash(password, 10);

    // ensure email not already present
    const existing = await findUserByEmail(email);
    if (existing) {
        throw new Error("Email already in use");
    }
    // ensure we have a username (use uuid if not provided)
    const userName = username || uuidv4();

    // determine first/last name
    let first = first_name || '';
    let last = last_name || '';

    const rows = await sql`INSERT INTO users(username, first_name, last_name, email, password_hash, role) VALUES(${userName}, ${first}, ${last}, ${email}, ${passwordHash}, 'user') RETURNING *`;
    return mapRowToUser(rows[0]);
}

const findUserByEmail = async (email) => {
    const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    return mapRowToUser(rows[0]);
}

const findUserById = async (id) => {
    const rows = await sql`SELECT * FROM users WHERE username = ${id} LIMIT 1`;
    return mapRowToUser(rows[0]);
}

const findUserByUsername = async (username) => {
    const rows = await sql`SELECT * FROM users WHERE username = ${username} LIMIT 1`;
    return mapRowToUser(rows[0]);
}

const verifyUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }
    return user;
}

export { createUser, findUserByEmail, findUserById, findUserByUsername, verifyUser };
