import bcryptjs from "bcryptjs";

const SALT = 10;

export function hashPassword(password: string) {
  return bcryptjs.hashSync(password, SALT);
}

export function comparePassword(password: string, hash: string) {
  return bcryptjs.compareSync(password, hash);
}
