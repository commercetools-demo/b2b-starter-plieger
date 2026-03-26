export async function setLocaleRequest(locale: string, currency: string): Promise<void> {
  await fetch('/api/session/locale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale, currency }),
  });
}
