import { create } from 'zustand';
export const useChallenge = create<{ id: string; email: string; set: (id: string, email: string) => void }>(set => ({ id: '', email: '', set: (id, email) => set({ id, email }) }));
