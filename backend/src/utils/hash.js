import bcrypt from "bcryptjs";

export const hashValue = async (value) => bcrypt.hash(value, 12);
export const compareHash = async (value, hash) => bcrypt.compare(value, hash);
