export interface City {
  id: string;
  name: string;
  province: string;
  level: 'first-tier' | 'new-first-tier' | 'second-tier' | 'third-fourth-tier';
  image: string;
  bannerImage: string;
  description: string;
  overallScore: number;
  
  housingPrice: number;
  averageSalary: number;
  priceLevel: number;
  
  educationScore: number;
  medicalScore: number;
  transportationScore: number;
  employmentScore: number;
  
  airQualityScore: number;
  greeningScore: number;
  lifePaceScore: number;
  climateScore: number;
  
  tags: string[];
  
  isCoastal: boolean;
  hasMountains: boolean;
  isHistorical: boolean;
}

export interface User {
  id: string;
  username: string;
  phone: string;
  avatar: string;
  favorites: string[];
  createdAt: string;
  isDisabled: boolean;
}

export interface MatchRecord {
  id: string;
  userId: string;
  createdAt: string;
  
  maxHousingPrice: number;
  expectedSalary: number;
  housingWeight: number;
  salaryWeight: number;
  priceWeight: number;
  
  educationWeight: number;
  medicalWeight: number;
  transportationWeight: number;
  employmentWeight: number;
  
  airQualityWeight: number;
  greeningWeight: number;
  lifePaceWeight: number;
  climateWeight: number;
  
  specialRequirements: string;
  
  results: { cityId: string; score: number }[];
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  cityId: string;
  rating: number;
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isActive: boolean;
}

export interface MatchPreferences {
  maxHousingPrice: number;
  expectedSalary: number;
  housingWeight: number;
  salaryWeight: number;
  priceWeight: number;
  educationWeight: number;
  medicalWeight: number;
  transportationWeight: number;
  employmentWeight: number;
  airQualityWeight: number;
  greeningWeight: number;
  lifePaceWeight: number;
  climateWeight: number;
  specialRequirements: string;
}

export type CityLevel = 'first-tier' | 'new-first-tier' | 'second-tier' | 'third-fourth-tier';

export const cityLevelLabels: Record<CityLevel, string> = {
  'first-tier': '一线城市',
  'new-first-tier': '新一线城市',
  'second-tier': '二线城市',
  'third-fourth-tier': '三四线小城',
};

export interface Note {
  id: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  cityId: string;
  cityName: string;
  title: string;
  content: string;
  images: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteListResponse {
  list: Note[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const provinces = [
  '北京', '上海', '广东', '江苏', '浙江', '四川', '湖北', '湖南',
  '山东', '福建', '陕西', '重庆', '天津', '安徽', '河南', '河北',
  '辽宁', '云南', '贵州', '广西', '江西', '山西', '黑龙江', '吉林',
  '甘肃', '内蒙古', '新疆', '海南', '宁夏', '青海', '西藏',
];
