import { User } from '@/types';

export const defaultUsers: User[] = [
  {
    id: '1',
    username: '如意用户',
    phone: '13800138000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ruyi',
    favorites: ['1', '2', '5'],
    createdAt: '2024-01-01',
    isDisabled: false,
  },
];

export const adminUsers = [
  {
    id: 'admin1',
    username: 'admin',
    password: 'admin123',
  },
];
