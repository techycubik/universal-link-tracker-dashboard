import bcrypt from "bcryptjs";

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.DASHBOARD_PASSWORD_HASH;

  if (!hash) {
    throw new Error("DASHBOARD_PASSWORD_HASH not configured");
  }

  return bcrypt.compare(password, hash);
}
