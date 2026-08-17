// 将数据库行转换为前端 City 类型（snake_case -> camelCase）
export function mapCityRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    province: row.province,
    level: row.level,
    image: row.image || '',
    bannerImage: row.banner_image || '',
    description: row.description || '',
    overallScore: Number(row.overall_score),
    housingPrice: row.housing_price,
    averageSalary: row.average_salary,
    priceLevel: Number(row.price_level),
    educationScore: Number(row.education_score),
    medicalScore: Number(row.medical_score),
    transportationScore: Number(row.transportation_score),
    employmentScore: Number(row.employment_score),
    airQualityScore: Number(row.air_quality_score),
    greeningScore: Number(row.greening_score),
    lifePaceScore: Number(row.life_pace_score),
    climateScore: Number(row.climate_score),
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
    isCoastal: !!row.is_coastal,
    hasMountains: !!row.has_mountains,
    isHistorical: !!row.is_historical,
  };
}

// 将数据库行转换为前端 User 类型
export function mapUserRow(row: any) {
  return {
    id: row.id,
    username: row.username,
    phone: row.phone,
    avatar: row.avatar || '',
    favorites: typeof row.favorites === 'string' ? JSON.parse(row.favorites) : (row.favorites || []),
    isDisabled: !!row.is_disabled,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
  };
}

// 将数据库行转换为前端 Review 类型
export function mapReviewRow(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    userAvatar: row.user_avatar || '',
    cityId: row.city_id,
    rating: row.rating,
    content: row.content || '',
    isApproved: !!row.is_approved,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
  };
}

// 将数据库行转换为前端 Announcement 类型
export function mapAnnouncementRow(row: any) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    isActive: !!row.is_active,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
  };
}
