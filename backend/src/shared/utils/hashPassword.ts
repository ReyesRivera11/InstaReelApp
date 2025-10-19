import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../config/env';

/**
 * Hashes a password using bcrypt
 * @param password - The plain text password
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, Number(SALT_ROUNDS));
};