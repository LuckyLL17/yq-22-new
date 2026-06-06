import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Person, MatchResult, WeightConfig, DEFAULT_WEIGHTS, MatchRecord, Vote, VoteRule, MatchStep, MATCH_STEPS, Restaurant, Reservation, ReservationStatus, ParticipantTaste } from '@/types';
import { matchRestaurants } from '@/utils/matchAlgorithm';
import { RESTAURANTS } from '@/data/restaurants';

interface StoreState {
  people: Person[];
  matchResults: MatchResult[];
  isMatching: boolean;
  currentMatchStep: MatchStep;
  weights: WeightConfig;
  historyRecords: MatchRecord[];
  selectedHistoryIds: string[];
  favoriteRestaurantIds: string[];
  selectedFavoriteIds: string[];
  blacklistRestaurantIds: string[];
  selectedBlacklistIds: string[];
  surpriseDrawCount: number;
  surpriseLastDrawDate: string;
  currentSurpriseRestaurantId: string | null;
  reservations: Reservation[];
  currentReservationId: string | null;
  addPerson: (person: Omit<Person, 'id'>) => void;
  removePerson: (id: string) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  updateWeight: (key: keyof WeightConfig, value: number) => void;
  resetWeights: () => void;
      performMatch: () => void;
      setCurrentMatchStep: (step: MatchStep) => void;
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
  getSurpriseDrawCount: () => number;
  canDrawSurprise: () => boolean;
  drawSurpriseRestaurant: () => Restaurant | null;
  getCurrentSurpriseRestaurant: () => Restaurant | null;
  resetSurpriseForNewDay: () => void;
  createReservation: (data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'reminderSent'>) => string;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;
  deleteReservation: (id: string) => void;
  getReservation: (id: string) => Reservation | undefined;
  setCurrentReservationId: (id: string | null) => void;
  confirmReservation: (id: string) => void;
  completeReservation: (id: string) => void;
  sendReminder: (id: string) => void;
  importParticipantsFromPeople: (personIds: string[]) => ParticipantTaste[];
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
      currentMatchStep: 'collecting',
      weights: { ...DEFAULT_WEIGHTS },
      historyRecords: [],
      selectedHistoryIds: [],
      favoriteRestaurantIds: [],
      selectedFavoriteIds: [],
      blacklistRestaurantIds: [],
      selectedBlacklistIds: [],
      votes: [],
      currentVoteId: null,
      surpriseDrawCount: 0,
      surpriseLastDrawDate: '',
      currentSurpriseRestaurantId: null,
      reservations: [],
      currentReservationId: null,

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

      setCurrentMatchStep: (step) => set({ currentMatchStep: step }),

      performMatch: () => {
        set({ isMatching: true, currentMatchStep: 'collecting' });
        
        const steps: MatchStep[] = ['collecting', 'filtering', 'scoring', 'calculating', 'sorting', 'complete'];
        let stepIndex = 0;
        
        const runStep = () => {
          if (stepIndex < steps.length - 1) {
            set({ currentMatchStep: steps[stepIndex] });
            stepIndex++;
            setTimeout(runStep, 400);
          } else {
            const results = matchRestaurants(
              get().people,
              get().weights,
              get().favoriteRestaurantIds,
              get().blacklistRestaurantIds
            );
            set({ 
              matchResults: results, 
              isMatching: false, 
              currentMatchStep: 'complete' 
            });
            if (results.length > 0) {
              get().saveMatchRecord();
            }
          }
        };
        
        setTimeout(runStep, 300);
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
        const creatorId = 'creator-' + voteId;
        const newVote: Vote = {
          id: voteId,
          creatorId,
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
        localStorage.setItem('vote_creator_' + voteId, creatorId);
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

      getSurpriseDrawCount: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.surpriseLastDrawDate !== today) {
          return 0;
        }
        return state.surpriseDrawCount;
      },

      canDrawSurprise: () => {
        return get().getSurpriseDrawCount() < 3;
      },

      drawSurpriseRestaurant: () => {
        const state = get();
        const today = new Date().toDateString();
        
        const currentCount = state.surpriseLastDrawDate === today ? state.surpriseDrawCount : 0;
        if (currentCount >= 3) {
          return null;
        }

        const availableRestaurants = RESTAURANTS.filter(
          (r) => !state.blacklistRestaurantIds.includes(r.id)
        );
        
        if (availableRestaurants.length === 0) {
          return null;
        }

        const randomIndex = Math.floor(Math.random() * availableRestaurants.length);
        const restaurant = availableRestaurants[randomIndex];

        set({
          surpriseDrawCount: currentCount + 1,
          surpriseLastDrawDate: today,
          currentSurpriseRestaurantId: restaurant.id,
        });

        return restaurant;
      },

      getCurrentSurpriseRestaurant: () => {
        const state = get();
        if (!state.currentSurpriseRestaurantId) return null;
        return RESTAURANTS.find((r) => r.id === state.currentSurpriseRestaurantId) || null;
      },

      resetSurpriseForNewDay: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.surpriseLastDrawDate !== today) {
          set({
            surpriseDrawCount: 0,
            surpriseLastDrawDate: today,
            currentSurpriseRestaurantId: null,
          });
        }
      },

      createReservation: (data) => {
        const id = Date.now().toString();
        const now = Date.now();
        const newReservation: Reservation = {
          ...data,
          id,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          reminderSent: false,
        };
        set((state) => ({
          reservations: [newReservation, ...state.reservations],
        }));
        return id;
      },

      updateReservation: (id, updates) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r
          ),
        })),

      cancelReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, status: 'cancelled' as ReservationStatus, updatedAt: Date.now() } : r
          ),
        })),

      deleteReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.filter((r) => r.id !== id),
          currentReservationId: state.currentReservationId === id ? null : state.currentReservationId,
        })),

      getReservation: (id) => get().reservations.find((r) => r.id === id),

      setCurrentReservationId: (id) => set({ currentReservationId: id }),

      confirmReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, status: 'confirmed' as ReservationStatus, updatedAt: Date.now() } : r
          ),
        })),

      completeReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, status: 'completed' as ReservationStatus, updatedAt: Date.now() } : r
          ),
        })),

      sendReminder: (id) => {
        const reservation = get().getReservation(id);
        if (!reservation || reservation.reminderSent) return;
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, reminderSent: true, updatedAt: Date.now() } : r
          ),
        }));
        alert(`已向 ${reservation.contactName} 发送预约提醒：${reservation.restaurantName} 聚餐将于 ${new Date(reservation.reservationTime).toLocaleString()} 开始`);
      },

      importParticipantsFromPeople: (personIds) => {
        const { people } = get();
        return personIds
          .map((pid) => {
            const person = people.find((p) => p.id === pid);
            if (!person) return null;
            return {
              personId: person.id,
              personName: person.name,
              personAvatar: person.avatar,
              spicyLevel: person.preferences.spicyLevel,
              isVegetarian: person.preferences.isVegetarian,
              dislikes: [...person.preferences.dislikes],
              allergies: [...person.preferences.allergies],
              favorites: [...person.preferences.favorites],
            } as ParticipantTaste;
          })
          .filter(Boolean) as ParticipantTaste[];
      },
    }),
    {
      name: 'restaurant-match-storage',
      partialize: (state) => ({
        historyRecords: state.historyRecords,
        people: state.people,
        matchResults: state.matchResults,
        weights: state.weights,
        favoriteRestaurantIds: state.favoriteRestaurantIds,
        blacklistRestaurantIds: state.blacklistRestaurantIds,
        votes: state.votes,
        surpriseDrawCount: state.surpriseDrawCount,
        surpriseLastDrawDate: state.surpriseLastDrawDate,
        currentSurpriseRestaurantId: state.currentSurpriseRestaurantId,
        reservations: state.reservations,
        currentReservationId: state.currentReservationId,
      }),
    }
  )
);
