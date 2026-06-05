import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Person, MatchResult, WeightConfig, DEFAULT_WEIGHTS, MatchRecord } from '@/types';
import { matchRestaurants } from '@/utils/matchAlgorithm';

interface StoreState {
  people: Person[];
  matchResults: MatchResult[];
  isMatching: boolean;
  weights: WeightConfig;
  historyRecords: MatchRecord[];
  selectedHistoryIds: string[];
  addPerson: (person: Omit<Person, 'id'>) => void;
  removePerson: (id: string) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  updateWeight: (key: keyof WeightConfig, value: number) => void;
  resetWeights: () => void;
  performMatch: () => void;
  clearResults: () => void;
  saveMatchRecord: () => void;
  deleteHistoryRecord: (id: string) => void;
  deleteSelectedHistoryRecords: () => void;
  toggleHistorySelection: (id: string) => void;
  selectAllHistory: () => void;
  clearHistorySelection: () => void;
  clearAllHistory: () => void;
}

const AVATAR_EMOJIS = ['😊', '😎', '🤓', '🥳', '😋', '🤗', '😺', '🐱', '🦊', '🐼'];

function generateAvatar(): string {
  return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      people: [],
      matchResults: [],
      isMatching: false,
      weights: { ...DEFAULT_WEIGHTS },
      historyRecords: [],
      selectedHistoryIds: [],

      addPerson: (person) =>
        set((state) => ({
          people: [
            ...state.people,
            {
              ...person,
              id: Date.now().toString(),
              avatar: person.avatar || generateAvatar(),
            },
          ],
        })),

      removePerson: (id) =>
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
        })),

      updatePerson: (id, updates) =>
        set((state) => ({
          people: state.people.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      updateWeight: (key, value) =>
        set((state) => ({
          weights: { ...state.weights, [key]: value },
        })),

      resetWeights: () => set({ weights: { ...DEFAULT_WEIGHTS } }),

      performMatch: () => {
        set({ isMatching: true });
        setTimeout(() => {
          const results = matchRestaurants(get().people, get().weights);
          set({ matchResults: results, isMatching: false });
          if (results.length > 0) {
            get().saveMatchRecord();
          }
        }, 800);
      },

      clearResults: () => set({ matchResults: [] }),

      saveMatchRecord: () => {
        const { people, matchResults, weights } = get();
        if (matchResults.length === 0 || people.length === 0) return;

        const topResult = matchResults[0];
        const newRecord: MatchRecord = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          people: [...people],
          matchResults: [...matchResults],
          weights: { ...weights },
          topRestaurantName: topResult.restaurant.name,
          topMatchScore: topResult.matchScore,
        };

        set((state) => ({
          historyRecords: [newRecord, ...state.historyRecords],
        }));
      },

      deleteHistoryRecord: (id) =>
        set((state) => ({
          historyRecords: state.historyRecords.filter((r) => r.id !== id),
          selectedHistoryIds: state.selectedHistoryIds.filter((i) => i !== id),
        })),

      deleteSelectedHistoryRecords: () =>
        set((state) => ({
          historyRecords: state.historyRecords.filter(
            (r) => !state.selectedHistoryIds.includes(r.id)
          ),
          selectedHistoryIds: [],
        })),

      toggleHistorySelection: (id) =>
        set((state) => ({
          selectedHistoryIds: state.selectedHistoryIds.includes(id)
            ? state.selectedHistoryIds.filter((i) => i !== id)
            : [...state.selectedHistoryIds, id],
        })),

      selectAllHistory: () =>
        set((state) => ({
          selectedHistoryIds: state.historyRecords.map((r) => r.id),
        })),

      clearHistorySelection: () => set({ selectedHistoryIds: [] }),

      clearAllHistory: () => set({ historyRecords: [], selectedHistoryIds: [] }),
    }),
    {
      name: 'restaurant-match-storage',
      partialize: (state) => ({
        historyRecords: state.historyRecords,
        people: state.people,
        weights: state.weights,
      }),
    }
  )
);
