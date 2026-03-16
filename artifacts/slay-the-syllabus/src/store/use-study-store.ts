import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StudyState {
  // Global Content
  content: string;
  setContent: (content: string) => void;
  
  // Gamification
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  addXP: (amount: number) => void;
  checkStreak: () => void;
  
  // App State
  hasSeenSplash: boolean;
  setHasSeenSplash: (seen: boolean) => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      content: '',
      setContent: (content) => set({ content }),
      
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      
      checkStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const last = get().lastActiveDate;
        
        if (!last) {
          set({ streak: 1, lastActiveDate: today });
          return;
        }
        
        if (last === today) return; // Already checked in today
        
        const lastDate = new Date(last);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          set((state) => ({ streak: state.streak + 1, lastActiveDate: today }));
        } else {
          set({ streak: 1, lastActiveDate: today });
        }
      },
      
      hasSeenSplash: false,
      setHasSeenSplash: (seen) => set({ hasSeenSplash: seen }),
    }),
    {
      name: 'slay-syllabus-storage',
    }
  )
);
