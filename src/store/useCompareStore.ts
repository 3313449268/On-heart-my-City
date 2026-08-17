import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { City } from '@/types';

interface CompareState {
  compareList: City[];
  isDrawerOpen: boolean;
  showMiniTip: boolean;
  miniTipCity: string;

  addToCompare: (city: City) => { success: boolean; message: string };
  removeFromCompare: (cityId: string) => void;
  clearCompare: () => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  hideMiniTip: () => void;
  isInCompare: (cityId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compareList: [],
      isDrawerOpen: false,
      showMiniTip: false,
      miniTipCity: '',

      addToCompare: (city: City) => {
        const { compareList } = get();
        
        if (compareList.some(c => c.id === city.id)) {
          return { success: false, message: '该城市已在对比列表中' };
        }

        if (compareList.length >= 5) {
          return { success: false, message: '对比最多5个城市，请先移除' };
        }

        const newList = [...compareList, city];
        set({ 
          compareList: newList,
          showMiniTip: newList.length <= 1,
          miniTipCity: city.name,
        });

        if (newList.length <= 1) {
          setTimeout(() => {
            set({ showMiniTip: false });
          }, 3000);
        }

        return { success: true, message: `已将${city.name}加入对比` };
      },

      removeFromCompare: (cityId: string) => {
        set(state => ({
          compareList: state.compareList.filter(c => c.id !== cityId),
        }));
      },

      clearCompare: () => {
        set({ compareList: [] });
      },

      toggleDrawer: () => {
        set(state => ({ isDrawerOpen: !state.isDrawerOpen }));
      },

      closeDrawer: () => {
        set({ isDrawerOpen: false });
      },

      hideMiniTip: () => {
        set({ showMiniTip: false });
      },

      isInCompare: (cityId: string) => {
        return get().compareList.some(c => c.id === cityId);
      },
    }),
    {
      name: 'ruyi-city-compare-storage',
    }
  )
);
