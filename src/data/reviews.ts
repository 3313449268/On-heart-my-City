import { Review } from '@/types';

export const reviews: Review[] = [
  {
    id: '1',
    userId: '1',
    username: '小明',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
    cityId: '1',
    rating: 5,
    content: '杭州真的太美了！西湖边散步非常惬意，互联网公司也多，工作机会不少。就是房价有点高，但相比北上广深还是好很多。',
    createdAt: '2024-01-15',
    isApproved: true,
  },
  {
    id: '2',
    userId: '2',
    username: '安居客',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anjuke',
    cityId: '1',
    rating: 4,
    content: '在杭州生活了5年，整体很满意。绿化好，空气也还行，就是夏天太热了，梅雨季也挺难受的。',
    createdAt: '2024-02-20',
    isApproved: true,
  },
  {
    id: '3',
    userId: '3',
    username: '吃货一枚',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chihuo',
    cityId: '2',
    rating: 5,
    content: '成都太巴适了！火锅串串吃不完，生活节奏慢，房价也不贵。唯一的缺点可能就是冬天太阴冷了，见不到太阳。',
    createdAt: '2024-03-10',
    isApproved: true,
  },
  {
    id: '4',
    userId: '4',
    username: '海的女儿',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=haide',
    cityId: '3',
    rating: 5,
    content: '青岛的海太美了！夏天去海边游泳散步太舒服了。城市干净，人也热情，啤酒海鲜绝配！',
    createdAt: '2024-01-25',
    isApproved: true,
  },
  {
    id: '5',
    userId: '5',
    username: '养老达人',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yanglao',
    cityId: '10',
    rating: 5,
    content: '昆明真的是春城！一年四季如春，冬天不冷夏天不热，鲜花常年盛开，特别适合养老。就是经济发展一般，年轻人机会可能少点。',
    createdAt: '2024-02-05',
    isApproved: true,
  },
  {
    id: '6',
    userId: '6',
    username: '打工人',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dagong',
    cityId: '11',
    rating: 3,
    content: '上海机会确实多，薪资也高。但压力太大了，房价高得离谱，生活节奏快到喘不过气。适合年轻人打拼，但不适合定居。',
    createdAt: '2024-03-01',
    isApproved: true,
  },
  {
    id: '7',
    userId: '7',
    username: '快乐打工人',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kuaile',
    cityId: '13',
    rating: 5,
    content: '长沙真的幸福感爆棚！房价低，美食多，娱乐丰富。周末可以去橘子洲头散步，晚上吃小龙虾喝奶茶，太爽了！',
    createdAt: '2024-03-15',
    isApproved: true,
  },
  {
    id: '8',
    userId: '8',
    username: '旅行者',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lvxing',
    cityId: '4',
    rating: 4,
    content: '厦门风景真的没话说，鼓浪屿、环岛路都很美。但房价太高了，工资又一般，性价比不是很高。旅游可以，定居的话要考虑考虑。',
    createdAt: '2024-02-28',
    isApproved: true,
  },
];

export const getReviewsByCityId = (cityId: string): Review[] => {
  return reviews.filter(review => review.cityId === cityId && review.isApproved);
};

export const getReviewsByUserId = (userId: string): Review[] => {
  return reviews.filter(review => review.userId === userId);
};
