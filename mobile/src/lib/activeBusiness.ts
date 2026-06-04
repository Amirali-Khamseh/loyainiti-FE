import AsyncStorage from '@react-native-async-storage/async-storage';

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
