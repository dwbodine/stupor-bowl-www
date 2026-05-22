import { USER_STORAGE_KEY } from './const';

export function getStoredUserId(): number | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function clearStoredUserId() {
  localStorage.removeItem(USER_STORAGE_KEY);
}