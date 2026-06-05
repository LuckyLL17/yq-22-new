import { create } from 'zustand';
import { Person, MatchResult, WeightConfig, DEFAULT_WEIGHTS } from '@/types';
import { matchRestaurants } from '@/utils/matchAlgorithm';

interface StoreState {
  people: Person[];
  matchResults: MatchResult[];
  isMatching: boolean;
  weights: WeightConfig;
  addPerson: (person: Omit<Person, 'id'>) => void;
  removePerson: (id: string) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  updateWeight: (key: keyof WeightConfig, value: number) => void;
  resetWeights: () => void;
  performMatch: () => void;
  clearResults: () => void;
}

const AVATAR_EMOJIS = ['😊', '😎', '🤓', '🥳', '😋', '🤗', '😺', '🐱', '🦊', '🐼'];

function generateAvatar(): string {
  return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
}

export const useStore = create<StoreState>((set, get) => ({
  people: [],
  matchResults: [],
  isMatching: false,
  weights: { ...DEFAULT_WEIGHTS },

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
    }, 800);
  },

  clearResults: () => set({ matchResults: [] }),
}));
