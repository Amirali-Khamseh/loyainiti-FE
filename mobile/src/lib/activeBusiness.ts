import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const KEY = 'loyainiti.activeBusinessId';

export async function getActiveBusinessId(): Promise<string | null> {
  return AsyncStorage.getItem(KEY);
}

export async function setActiveBusinessId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEY, id);
}

export async function clearActiveBusinessId(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

/**
 * Returns the stored business ID, or auto-discovers the first business the
 * current user owns via the API. This handles the case where a business was
 * created on web and the mobile AsyncStorage cache is empty.
 */
export async function resolveActiveBusinessId(): Promise<string | null> {
  const stored = await AsyncStorage.getItem(KEY);
  if (stored) return stored;
  try {
    const businesses = await api<{ id: string }[]>('/api/me/businesses');
    if (businesses.length > 0) {
      await AsyncStorage.setItem(KEY, businesses[0].id);
      return businesses[0].id;
    }
  } catch {
    // non-fatal — user may not have a business yet
  }
  return null;
}
