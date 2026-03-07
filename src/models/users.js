import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const users = [];

const createUser = async ({ name, email, password }) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
        id: uuidv4(),
        name,
        email,
        passwordHash,
        activeTrips: []
    };
    users.push(newUser);
    return newUser;
}

const findUserByEmail = (email) => {
    return users.find(user => user.email === email);
}

const verifyUser = async (email, password) => {
    const user = findUserByEmail(email);
    if (!user) {
        throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }
    return user;
}

export { createUser, findUserByEmail, verifyUser };
