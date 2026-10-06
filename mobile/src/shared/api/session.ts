import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { sessionSchema, type Session } from '../../entities/types';

const key = 'antiqueai.session.v1';
let webSession: string | null = null;
const storage = {
  get: () => Platform.OS === 'web' ? Promise.resolve(webSession) : SecureStore.getItemAsync(key),
  set: (value: string) => Platform.OS === 'web' ? Promise.resolve(void (webSession = value)) : SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
  clear: () => Platform.OS === 'web' ? Promise.resolve(void (webSession = null)) : SecureStore.deleteItemAsync(key),
};
// Serialize writes so a late refresh cannot restore tokens after logout.
let writes: Promise<void> = Promise.resolve();
function persist(session: Session | null) { writes = writes.catch(() => {}).then(() => session ? storage.set(JSON.stringify(session)) : storage.clear()); return writes; }
export const useSession = create<{ session: Session | null; hydrated: boolean; generation: number; setSession: (session: Session | null) => Promise<void>; hydrate: () => Promise<void> }>((set, get) => ({
  session: null, hydrated: false, generation: 0,
  setSession: async (session) => { set({ session, generation: get().generation + 1 }); try { await persist(session); } catch (error) { set({ session: null }); throw error; } },
  hydrate: async () => {
    const generation = get().generation;
    try { const saved = await storage.get(); const parsed = sessionSchema.safeParse(saved ? JSON.parse(saved) : null); if (get().generation === generation) set({ session: parsed.success ? parsed.data : null }); }
    catch { if (get().generation === generation) set({ session: null }); }
    finally { set({ hydrated: true }); }
  },
}));
