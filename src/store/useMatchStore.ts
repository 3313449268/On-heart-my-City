import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MatchPreferences, MatchRecord } from '@/types';
import { generateId } from '@/utils/helpers';

interface MatchState {
  currentPreferences: MatchPreferences;
  matchResults: { cityId: string; score: number }[];
  matchHistory: MatchRecord[];

  setPreferences: (prefs: Partial<MatchPreferences>) => void;
  setMatchResults: (results: { cityId: string; score: number }[]) => void;
  resetPreferences: () => void;
  saveMatchRecord: (userId: string) => void;
  deleteMatchRecord: (recordId: string) => void;
  reuseMatchRecord: (recordId: string) => void;
}

const defaultPreferences: MatchPreferences = {
  maxHousingPrice: 0,
  expectedSalary: 0,
  housingWeight: 7,
  salaryWeight: 6,
  priceWeight: 5,
  educationWeight: 6,
  medicalWeight: 5,
  transportationWeight: 5,
  employmentWeight: 7,
  airQualityWeight: 6,
  greeningWeight: 5,
  lifePaceWeight: 5,
  climateWeight: 6,
  specialRequirements: '',
};

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => ({
      currentPreferences: defaultPreferences,
      matchResults: [],
      matchHistory: [],

      setPreferences: (prefs) => {
        set(state => ({
          currentPreferences: { ...state.currentPreferences, ...prefs },
        }));
      },

      setMatchResults: (results) => {
        set({ matchResults: results });
      },

      resetPreferences: () => {
        set({ currentPreferences: defaultPreferences });
      },

      saveMatchRecord: (userId: string) => {
        const { currentPreferences, matchResults } = get();
        const record: MatchRecord = {
          id: generateId(),
          userId,
          createdAt: new Date().toISOString().split('T')[0],
          ...currentPreferences,
          results: matchResults,
        };
        set(state => ({
          matchHistory: [record, ...state.matchHistory],
        }));
      },

      deleteMatchRecord: (recordId: string) => {
        set(state => ({
          matchHistory: state.matchHistory.filter(r => r.id !== recordId),
        }));
      },

      reuseMatchRecord: (recordId: string) => {
        const record = get().matchHistory.find(r => r.id === recordId);
        if (record) {
          const {
            id,
            userId,
            createdAt,
            results,
            ...prefs
          } = record;
          set({
            currentPreferences: prefs as MatchPreferences,
            matchResults: results,
          });
        }
      },
    }),
    {
      name: 'ruyi-city-match-storage',
    }
  )
);
