/**
 * Permanent admin email list.
 * Edit this file to add / remove admin accounts.
 * Used in both the sidebar (client) and server functions.
 */
export const ADMIN_EMAILS: readonly string[] = [
  "phanigautham03@gmail.com",
  "phanigautham03@yahoo.co.in",
  "jacintaanju@gmail.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
