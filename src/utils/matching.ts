import { City, MatchPreferences } from '@/types';

const normalizeScore = (value: number, min: number, max: number, reverse: boolean = false): number => {
  let score = ((value - min) / (max - min)) * 10;
  score = Math.max(0, Math.min(10, score));
  return reverse ? 10 - score : score;
};

export const calculateMatchScore = (city: City, preferences: MatchPreferences): number => {
  const {
    housingWeight,
    salaryWeight,
    priceWeight,
    educationWeight,
    medicalWeight,
    transportationWeight,
    employmentWeight,
    airQualityWeight,
    greeningWeight,
    lifePaceWeight,
    climateWeight,
  } = preferences;

  const totalWeight = 
    housingWeight + salaryWeight + priceWeight +
    educationWeight + medicalWeight + transportationWeight + employmentWeight +
    airQualityWeight + greeningWeight + lifePaceWeight + climateWeight;

  if (totalWeight === 0) return city.overallScore;

  const housingScore = normalizeScore(city.housingPrice, 5000, 80000, true);
  const salaryScore = normalizeScore(city.averageSalary, 5000, 20000);
  const priceScore = 10 - city.priceLevel;

  let totalScore = 0;

  totalScore += housingScore * housingWeight;
  totalScore += salaryScore * salaryWeight;
  totalScore += priceScore * priceWeight;
  totalScore += city.educationScore * educationWeight;
  totalScore += city.medicalScore * medicalWeight;
  totalScore += city.transportationScore * transportationWeight;
  totalScore += city.employmentScore * employmentWeight;
  totalScore += city.airQualityScore * airQualityWeight;
  totalScore += city.greeningScore * greeningWeight;
  totalScore += city.lifePaceScore * lifePaceWeight;
  totalScore += city.climateScore * climateWeight;

  return totalScore / totalWeight;
};

export const filterCities = (
  cities: City[],
  preferences: MatchPreferences
): City[] => {
  let filtered = [...cities];

  if (preferences.maxHousingPrice > 0) {
    filtered = filtered.filter(city => city.housingPrice <= preferences.maxHousingPrice);
  }

  if (preferences.expectedSalary > 0) {
    filtered = filtered.filter(city => city.averageSalary >= preferences.expectedSalary);
  }

  const specialReq = preferences.specialRequirements.toLowerCase();
  if (specialReq.includes('海') || specialReq.includes('海边') || specialReq.includes('靠海')) {
    filtered = filtered.filter(city => city.isCoastal);
  }
  if (specialReq.includes('山') || specialReq.includes('有山')) {
    filtered = filtered.filter(city => city.hasMountains);
  }
  if (specialReq.includes('历史') || specialReq.includes('古城')) {
    filtered = filtered.filter(city => city.isHistorical);
  }

  return filtered;
};

export const matchCities = (
  cities: City[],
  preferences: MatchPreferences
): { city: City; score: number }[] => {
  const filtered = filterCities(cities, preferences);
  
  return filtered
    .map(city => ({
      city,
      score: calculateMatchScore(city, preferences),
    }))
    .sort((a, b) => b.score - a.score);
};
