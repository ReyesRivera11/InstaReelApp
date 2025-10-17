import bcrypt from 'bcrypt';

/**
 * Compares a plain text password with a hashed password
 * @param password - The plain text password entered by the user
 * @param hashedPassword - The stored hashed password
 * @returns {Promise<boolean>} - `true` if the passwords match, `false` otherwise
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};