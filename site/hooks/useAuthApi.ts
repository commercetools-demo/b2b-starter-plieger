export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export async function meFetcher(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  const data = await res.json();
  const c = data.customer ?? data;
  return { id: c.id, email: c.email, firstName: c.firstName, lastName: c.lastName };
}

export async function loginRequest(email: string, password: string): Promise<void> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Login failed');
  }
}

export async function logoutRequest(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function registerRequest(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  companyName?: string,
): Promise<void> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName, lastName, companyName }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Registration failed');
  }
}
