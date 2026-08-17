import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { defaultUsers } from '@/data/users';

interface UserState {
  currentUser: User | null;
  isLoggedIn: boolean;
  users: User[];
  
  login: (phone: string, password: string) => boolean;
  register: (username: string, phone: string, password: string) => boolean;
  logout: () => void;
  toggleFavorite: (cityId: string) => void;
  isFavorite: (cityId: string) => boolean;
  updateProfile: (data: Partial<Pick<User, 'username' | 'phone' | 'avatar'>>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoggedIn: false,
      users: defaultUsers,

      login: (phone: string) => {
        const users = get().users;
        let user = users.find(u => u.phone === phone);
        
        if (!user) {
          user = {
            id: Math.random().toString(36).substring(2, 11),
            username: '用户' + phone.slice(-4),
            phone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
            favorites: [],
            createdAt: new Date().toISOString().split('T')[0],
            isDisabled: false,
          };
          set(state => ({ users: [...state.users, user!] }));
        }

        if (user.isDisabled) return false;

        set({ currentUser: user, isLoggedIn: true });
        return true;
      },

      register: (username: string, phone: string) => {
        const users = get().users;
        if (users.some(u => u.phone === phone)) {
          return false;
        }

        const newUser: User = {
          id: Math.random().toString(36).substring(2, 11),
          username,
          phone,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
          favorites: [],
          createdAt: new Date().toISOString().split('T')[0],
          isDisabled: false,
        };

        set(state => ({
          users: [...state.users, newUser],
          currentUser: newUser,
          isLoggedIn: true,
        }));
        return true;
      },

      logout: () => {
        set({ currentUser: null, isLoggedIn: false });
      },

      toggleFavorite: (cityId: string) => {
        const { currentUser, isLoggedIn } = get();
        if (!isLoggedIn || !currentUser) return;

        const isFav = currentUser.favorites.includes(cityId);
        const newFavorites = isFav
          ? currentUser.favorites.filter(id => id !== cityId)
          : [...currentUser.favorites, cityId];

        set(state => ({
          currentUser: state.currentUser ? { ...state.currentUser, favorites: newFavorites } : null,
          users: state.users.map(u =>
            u.id === currentUser.id ? { ...u, favorites: newFavorites } : u
          ),
        }));
      },

      isFavorite: (cityId: string) => {
        const { currentUser, isLoggedIn } = get();
        if (!isLoggedIn || !currentUser) return false;
        return currentUser.favorites.includes(cityId);
      },

      updateProfile: (data) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...data };
        set(state => ({
          currentUser: updatedUser,
          users: state.users.map(u =>
            u.id === currentUser.id ? updatedUser : u
          ),
        }));
      },
    }),
    {
      name: 'ruyi-city-user-storage',
    }
  )
);
