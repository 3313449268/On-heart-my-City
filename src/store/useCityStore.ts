import { create } from 'zustand';
import { City } from '@/types';
import { cityApi } from '@/lib/api';
import { cities as fallbackCities } from '@/data/cities';

interface CityStore {
  cities: City[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  fetchCities: () => Promise<void>;
  getCityById: (id: string) => City | undefined;
  getTopCities: (limit?: number) => City[];
  getCitiesByLevel: (level: string) => City[];
}

export const useCityStore = create<CityStore>((set, get) => ({
  cities: [],
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchCities: async () => {
    if (get().isLoaded) return;
    set({ isLoading: true, error: null });
    try {
      const data = await cityApi.getAll();
      set({ cities: data, isLoading: false, isLoaded: true });
    } catch (err) {
      console.warn('从后端获取城市数据失败，使用本地数据:', err);
      set({
        cities: fallbackCities,
        isLoading: false,
        isLoaded: true,
        error: '使用本地数据（后端未连接）',
      });
    }
  },

  getCityById: (id: string) => {
    return get().cities.find(city => city.id === id);
  },

  getTopCities: (limit: number = 8) => {
    return [...get().cities]
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);
  },

  getCitiesByLevel: (level: string) => {
    return get().cities.filter(city => city.level === level);
  },
}));
