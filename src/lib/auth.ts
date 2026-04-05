import { getSession } from "./session";

export async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.adminId) {
    return null;
  }
  return session;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true && !!session.adminId;
}
