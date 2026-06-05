import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Person, MatchResult, WeightConfig, DEFAULT_WEIGHTS, MatchRecord, Vote, VoteRule } from '@/types';
import { matchRestaurants } from '@/utils/matchAlgorithm';

interface StoreState {
  people: Person[];
  matchResults: MatchResult[];
  isMatching: boolean;
  weights: WeightConfig;
  historyRecords: MatchRecord[];
  selectedHistoryIds: string[];
  favoriteRestaurantIds: string[];
  selectedFavoriteIds: string[];
  blacklistRestaurantIds: string[];
  selectedBlacklistIds: string[];
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
  toggleFavorite: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;
  removeFromFavorites: (restaurantId: string) => void;
  removeSelectedFromFavorites: () => void;
  toggleFavoriteSelection: (id: string) => void;
  selectAllFavorites: () => void;
  clearFavoriteSelection: () => void;
  clearAllFavorites: () => void;
  toggleBlacklist: (restaurantId: string) => void;
  isBlacklisted: (restaurantId: string) => boolean;
  removeFromBlacklist: (restaurantId: string) => void;
  removeSelectedFromBlacklist: () => void;
  toggleBlacklistSelection: (id: string) => void;
  selectAllBlacklist: () => void;
  clearBlacklistSelection: () => void;
  clearAllBlacklist: () => void;
  votes: Vote[];
  currentVoteId: string | null;
  createVote: (title: string, restaurantIds: string[], rules: VoteRule, creatorName: string) => string;
  castVote: (voteId: string, voterId: string, restaurantIds: string[]) => void;
  endVote: (voteId: string) => void;
  deleteVote: (voteId: string) => void;
  getVote: (voteId: string) => Vote | undefined;
  setCurrentVoteId: (voteId: string | null) => void;
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
      favoriteRestaurantIds: [],
      selectedFavoriteIds: [],
      blacklistRestaurantIds: [],
      selectedBlacklistIds: [],
      votes: [],
      currentVoteId: null,

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
          const results = matchRestaurants(
            get().people,
            get().weights,
            get().favoriteRestaurantIds,
            get().blacklistRestaurantIds
          );
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

      toggleFavorite: (restaurantId) =>
        set((state) => ({
          favoriteRestaurantIds: state.favoriteRestaurantIds.includes(restaurantId)
            ? state.favoriteRestaurantIds.filter((id) => id !== restaurantId)
            : [...state.favoriteRestaurantIds, restaurantId],
        })),

      isFavorite: (restaurantId) => get().favoriteRestaurantIds.includes(restaurantId),

      removeFromFavorites: (restaurantId) =>
        set((state) => ({
          favoriteRestaurantIds: state.favoriteRestaurantIds.filter((id) => id !== restaurantId),
          selectedFavoriteIds: state.selectedFavoriteIds.filter((id) => id !== restaurantId),
        })),

      removeSelectedFromFavorites: () =>
        set((state) => ({
          favoriteRestaurantIds: state.favoriteRestaurantIds.filter(
            (id) => !state.selectedFavoriteIds.includes(id)
          ),
          selectedFavoriteIds: [],
        })),

      toggleFavoriteSelection: (id) =>
        set((state) => ({
          selectedFavoriteIds: state.selectedFavoriteIds.includes(id)
            ? state.selectedFavoriteIds.filter((i) => i !== id)
            : [...state.selectedFavoriteIds, id],
        })),

      selectAllFavorites: () =>
        set((state) => ({
          selectedFavoriteIds: [...state.favoriteRestaurantIds],
        })),

      clearFavoriteSelection: () => set({ selectedFavoriteIds: [] }),

      clearAllFavorites: () =>
        set({ favoriteRestaurantIds: [], selectedFavoriteIds: [] }),

      toggleBlacklist: (restaurantId) =>
        set((state) => ({
          blacklistRestaurantIds: state.blacklistRestaurantIds.includes(restaurantId)
            ? state.blacklistRestaurantIds.filter((id) => id !== restaurantId)
            : [...state.blacklistRestaurantIds, restaurantId],
        })),

      isBlacklisted: (restaurantId) => get().blacklistRestaurantIds.includes(restaurantId),

      removeFromBlacklist: (restaurantId) =>
        set((state) => ({
          blacklistRestaurantIds: state.blacklistRestaurantIds.filter((id) => id !== restaurantId),
          selectedBlacklistIds: state.selectedBlacklistIds.filter((id) => id !== restaurantId),
        })),

      removeSelectedFromBlacklist: () =>
        set((state) => ({
          blacklistRestaurantIds: state.blacklistRestaurantIds.filter(
            (id) => !state.selectedBlacklistIds.includes(id)
          ),
          selectedBlacklistIds: [],
        })),

      toggleBlacklistSelection: (id) =>
        set((state) => ({
          selectedBlacklistIds: state.selectedBlacklistIds.includes(id)
            ? state.selectedBlacklistIds.filter((i) => i !== id)
            : [...state.selectedBlacklistIds, id],
        })),

      selectAllBlacklist: () =>
        set((state) => ({
          selectedBlacklistIds: [...state.blacklistRestaurantIds],
        })),

      clearBlacklistSelection: () => set({ selectedBlacklistIds: [] }),

      clearAllBlacklist: () =>
        set({ blacklistRestaurantIds: [], selectedBlacklistIds: [] }),

      createVote: (title, restaurantIds, rules, creatorName) => {
        const voteId = Date.now().toString();
        const newVote: Vote = {
          id: voteId,
          creatorId: 'creator-' + Date.now(),
          creatorName,
          title,
          restaurantIds,
          rules,
          votes: {},
          isActive: true,
          createdAt: Date.now(),
        };
        set((state) => ({
          votes: [...state.votes, newVote],
        }));
        return voteId;
      },

      castVote: (voteId, voterId, restaurantIds) =>
        set((state) => ({
          votes: state.votes.map((vote) =>
            vote.id === voteId && vote.isActive
              ? { ...vote, votes: { ...vote.votes, [voterId]: restaurantIds } }
              : vote
          ),
        })),

      endVote: (voteId) =>
        set((state) => ({
          votes: state.votes.map((vote) =>
            vote.id === voteId
              ? { ...vote, isActive: false, endedAt: Date.now() }
              : vote
          ),
        })),

      deleteVote: (voteId) =>
        set((state) => ({
          votes: state.votes.filter((v) => v.id !== voteId),
          currentVoteId: state.currentVoteId === voteId ? null : state.currentVoteId,
        })),

      getVote: (voteId) => get().votes.find((v) => v.id === voteId),

      setCurrentVoteId: (voteId) => set({ currentVoteId: voteId }),
    }),
    {
      name: 'restaurant-match-storage',
      partialize: (state) => ({
        historyRecords: state.historyRecords,
        people: state.people,
        weights: state.weights,
        favoriteRestaurantIds: state.favoriteRestaurantIds,
        blacklistRestaurantIds: state.blacklistRestaurantIds,
        votes: state.votes,
      }),
    }
  )
);
