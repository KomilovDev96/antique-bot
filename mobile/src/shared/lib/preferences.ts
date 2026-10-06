import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
export type Language = 'uz-latn' | 'uz-cyrl' | 'ru';
export const usePreferences = create<{ theme: 'system' | 'light' | 'dark'; language: Language; onboarded: boolean; categoryIds: string[]; setTheme: (theme: 'system' | 'light' | 'dark') => void; setLanguage: (language: Language) => void; finishOnboarding: (ids: string[]) => void }>()(persist(set => ({
  theme: 'system', language: 'uz-latn', onboarded: false, categoryIds: [],
  setTheme: theme => set({ theme }), setLanguage: language => set({ language }), finishOnboarding: categoryIds => set({ categoryIds, onboarded: true }),
}), { name: 'antiqueai.preferences', storage: createJSONStorage(() => AsyncStorage) }));
