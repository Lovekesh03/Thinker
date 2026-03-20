import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  createdAt: number; 
  priority: 'low' | 'medium' | 'high';
}

interface AppState {
  tasks: Task[];
  currentStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD format
  badges: string[]; // unlocked badges

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskNotes: (id: string, notes: string) => void;

  evaluateStreak: () => void;
}

export const useTaskStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentStreak: 0,
      lastCompletedDate: null,
      badges: [],

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, {
          ...task,
          id: Math.random().toString(36).substring(7),
          createdAt: Date.now(),
          completed: false
        }]
      })),

      toggleTask: (id) => set((state) => {
        const tasks = state.tasks.map(t => 
          t.id === id ? { ...t, completed: !t.completed } : t
        );
        return { ...state, tasks };
      }),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      updateTaskNotes: (id, notes) => set((state) => ({
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, notes } : t
        )
      })),

      evaluateStreak: () => {
        // Evaluate daily streak logic
      }
    }),
    {
      name: 'aura-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
