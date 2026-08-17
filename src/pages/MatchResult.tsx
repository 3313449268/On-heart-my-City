import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  GitCompare,
  ArrowRight,
  Filter,
  RotateCcw,
  RefreshCw,
  Trophy,
  MapPin,
  Home,
  Briefcase,
  Leaf,
  type LucideIcon,
} from 'lucide-react';
import { useCityStore } from '@/store/useCityStore';
import { useMatchStore } from '@/store/useMatchStore';
import { useUserStore } from '@/store/useUserStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useUIStore } from '@/store/useUIStore';
import Button from '@/components/ui/Button';
import { cityLevelLabels, type CityLevel, type City } from '@/types';
import { cn, formatNumber, formatSalary, getLevelLabel, getScoreColor } from '@/utils/helpers';

const livableTags = [
  { id: 'low-price', label: '低物价' },
  { id: 'good-education', label: '教育强' },
  { id: 'good-environment', label: '环境好' },
  { id: 'suitable-elderly', label: '适合养老' },
  { id: 'coastal', label: '靠海' },
  { id: 'good-food', label: '美食多' },
];

interface RankedCityCardProps {
  city: City | undefined;
  rank: number;
  score: number;
  isFavorite: boolean;
  isInCompare: boolean;
  onFavorite: () => void;
  onCompare: () => void;
  onViewDetail: () => void;
}

function RankedCityCard({
  city,
  rank,
  score,
  isFavorite,
  isInCompare,
  onFavorite,
  onCompare,
  onViewDetail,
}: RankedCityCardProps) {
  if (!city) return null;

  const matchPercent = Math.round(score * 10);

  const getRankStyles = () => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
          text: 'text-white',
          shadow: 'shadow-lg shadow-amber-500/30',
          ring: 'ring-4 ring-amber-200',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-slate-300 to-slate-400',
          text: 'text-white',
          shadow: 'shadow-lg shadow-slate-400/30',
          ring: 'ring-4 ring-slate-200',
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-orange-400 to-amber-500',
          text: 'text-white',
          shadow: 'shadow-lg shadow-orange-500/30',
          ring: 'ring-4 ring-orange-200',
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-500',
          shadow: '',
          ring: '',
        };
    }
  };

  const rankStyles = getRankStyles();

  return (
    <div className={cn(
      'card card-hover overflow-hidden group',
      rank <= 3 && 'border-emerald-100'
    )}>
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-56 h-48 md:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={city.image}
            alt={city.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:bg-gradient-to-r md:from-black/40 md:to-transparent" />
          
          <div className={cn(
            'absolute top-3 left-3 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
            rankStyles.bg,
            rankStyles.text,
            rankStyles.shadow,
            rankStyles.ring
          )}>
            {rank <= 3 ? (
              <Trophy className="w-6 h-6" />
            ) : (
              rank
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-1.5 text-white/90 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{city.province}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 md:p-6 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-serif-sc text-2xl font-bold text-slate-800">
                  {city.name}
                </h3>
                <span className="badge badge-emerald">
                  {getLevelLabel(city.level)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {city.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className={cn(
                'text-3xl font-bold mb-1',
                matchPercent >= 90 ? 'text-emerald-600' :
                matchPercent >= 80 ? 'text-green-600' :
                matchPercent >= 70 ? 'text-yellow-600' :
                'text-orange-600'
              )}>
                {matchPercent}%
              </div>
              <div className="text-sm text-slate-500">匹配度</div>
              <div className="mt-2 w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    matchPercent >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                    matchPercent >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    matchPercent >= 70 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                    'bg-gradient-to-r from-orange-500 to-yellow-500'
                  )}
                  style={{ width: `${matchPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Home className="w-3.5 h-3.5" />
                <span>房价</span>
              </div>
              <div className="font-semibold text-slate-800 text-sm">
                {formatNumber(city.housingPrice)}元/㎡
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>薪资</span>
              </div>
              <div className="font-semibold text-slate-800 text-sm">
                {formatSalary(city.averageSalary)}/月
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Leaf className="w-3.5 h-3.5" />
                <span>环境</span>
              </div>
              <div className="font-semibold text-slate-800 text-sm">
                {city.airQualityScore.toFixed(1)}分
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>综合</span>
              </div>
              <div className={cn('font-semibold text-sm', getScoreColor(city.overallScore))}>
                {city.overallScore.toFixed(1)}分
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onFavorite}
                className={cn(
                  'p-2 rounded-full transition-all duration-200',
                  isFavorite
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500'
                )}
              >
                <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
              </button>
              <button
                onClick={onCompare}
                className={cn(
                  'p-2 rounded-full transition-all duration-200',
                  isInCompare
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                )}
              >
                <GitCompare className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={onViewDetail}
            >
              查看详情
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeightBar({ label, value, icon: Icon }: { label: string; value: number; icon?: LucideIcon }) {
  const percentage = (value / 10) * 100;
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
          <span className="text-xs text-slate-600">{label}</span>
        </div>
        <span className="text-xs font-semibold text-emerald-600">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function MatchResult() {
  const navigate = useNavigate();
  const { cities, fetchCities } = useCityStore();
  const { matchResults, currentPreferences } = useMatchStore();
  const { toggleFavorite, isFavorite } = useUserStore();
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const [selectedLevels, setSelectedLevels] = useState<CityLevel[]>([]);
  const [housingPriceMin, setHousingPriceMin] = useState(0);
  const [housingPriceMax, setHousingPriceMax] = useState(80000);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortType, setSortType] = useState<'match' | 'price-asc' | 'salary-desc'>('match');

  const matchedCities = useMemo(() => {
    return matchResults
      .map(result => ({
        ...result,
        city: cities.find(c => c.id === result.cityId),
      }))
      .filter(r => r.city);
  }, [matchResults, cities]);

  const filteredCities = useMemo(() => {
    let result = [...matchedCities];

    if (selectedLevels.length > 0) {
      result = result.filter(r => r.city && selectedLevels.includes(r.city.level));
    }

    result = result.filter(r => {
      if (!r.city) return false;
      const price = r.city.housingPrice;
      return price >= housingPriceMin && price <= housingPriceMax;
    });

    if (selectedTags.length > 0) {
      result = result.filter(r => {
        if (!r.city) return false;
        return selectedTags.every(tag => {
          const city = r.city!;
          switch (tag) {
            case 'low-price':
              return city.priceLevel <= 6;
            case 'good-education':
              return city.educationScore >= 8;
            case 'good-environment':
              return city.airQualityScore >= 8.5 && city.greeningScore >= 8;
            case 'suitable-elderly':
              return city.climateScore >= 8 && city.lifePaceScore <= 5;
            case 'coastal':
              return city.isCoastal;
            case 'good-food':
              return city.tags.some(t => t.includes('美食'));
            default:
              return true;
          }
        });
      });
    }

    switch (sortType) {
      case 'match':
        result.sort((a, b) => b.score - a.score);
        break;
      case 'price-asc':
        result.sort((a, b) => (a.city?.housingPrice || 0) - (b.city?.housingPrice || 0));
        break;
      case 'salary-desc':
        result.sort((a, b) => (b.city?.averageSalary || 0) - (a.city?.averageSalary || 0));
        break;
    }

    return result;
  }, [matchedCities, selectedLevels, housingPriceMin, housingPriceMax, selectedTags, sortType]);

  const handleReset = () => {
    setSelectedLevels([]);
    setHousingPriceMin(0);
    setHousingPriceMax(80000);
    setSelectedTags([]);
    setSortType('match');
  };

  const toggleLevel = (level: CityLevel) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleFavorite = (cityId: string) => {
    toggleFavorite(cityId);
    const fav = isFavorite(cityId);
    showToast(fav ? '已取消收藏' : '已添加到收藏', fav ? 'info' : 'success');
  };

  const handleCompare = (cityId: string) => {
    if (isInCompare(cityId)) {
      removeFromCompare(cityId);
      showToast('已从对比列表移除', 'info');
    } else {
      const city = cities.find(c => c.id === cityId);
      if (city) {
        const result = addToCompare(city);
        showToast(result.message, result.success ? 'success' : 'warning');
      }
    }
  };

  if (matchResults.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="font-serif-sc text-2xl font-bold text-slate-800 mb-3">
            还没有匹配结果
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            去完成智能匹配，根据你的偏好为你推荐最适合的城市
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/match')}
          >
            去做智能匹配
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 pt-[64px] lg:pt-[80px]">
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-serif-sc text-4xl md:text-5xl font-bold mb-4">
            匹配结果
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            根据你的偏好设置，为你精选了最适合定居的城市
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="card p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif-sc text-xl font-bold text-slate-800">
                      你的匹配偏好
                    </h2>
                    <p className="text-sm text-slate-500">
                      共 {matchResults.length} 个城市参与匹配
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                      经济类
                    </h3>
                    <div className="space-y-3">
                      <WeightBar label="房价权重" value={currentPreferences.housingWeight} />
                      <WeightBar label="薪资权重" value={currentPreferences.salaryWeight} />
                      <WeightBar label="物价权重" value={currentPreferences.priceWeight} />
                      {currentPreferences.maxHousingPrice > 0 && (
                        <div className="text-xs text-slate-500 mt-2">
                          房价上限：{formatNumber(currentPreferences.maxHousingPrice)}元/㎡
                        </div>
                      )}
                      {currentPreferences.expectedSalary > 0 && (
                        <div className="text-xs text-slate-500">
                          期望薪资：{formatSalary(currentPreferences.expectedSalary)}/月
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                      配套类
                    </h3>
                    <div className="space-y-3">
                      <WeightBar label="教育资源" value={currentPreferences.educationWeight} />
                      <WeightBar label="三甲医疗" value={currentPreferences.medicalWeight} />
                      <WeightBar label="公共交通" value={currentPreferences.transportationWeight} />
                      <WeightBar label="就业机会" value={currentPreferences.employmentWeight} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-green-500 rounded-full"></span>
                      环境类
                    </h3>
                    <div className="space-y-3">
                      <WeightBar label="空气质量" value={currentPreferences.airQualityWeight} />
                      <WeightBar label="城市绿化" value={currentPreferences.greeningWeight} />
                      <WeightBar label="生活节奏" value={currentPreferences.lifePaceWeight} />
                      <WeightBar label="气候舒适度" value={currentPreferences.climateWeight} />
                    </div>
                  </div>
                </div>

                {currentPreferences.specialRequirements && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">特殊需求</h3>
                    <p className="text-sm text-slate-500">{currentPreferences.specialRequirements}</p>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/match')}
                >
                  <RefreshCw className="w-4 h-4" />
                  重新匹配
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <aside className="w-72 flex-shrink-0 hidden lg:block">
              <div className="sticky top-6 bg-white rounded-2xl card-shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-serif-sc text-lg font-bold text-slate-800">筛选条件</h2>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">城市等级</h3>
                  <div className="space-y-2">
                    {(Object.keys(cityLevelLabels) as CityLevel[]).map(level => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level)}
                          onChange={() => toggleLevel(level)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-600">{cityLevelLabels[level]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">房价区间</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-500">房价范围</span>
                    <span className="text-xs font-medium text-emerald-600">
                      {(housingPriceMin / 10000).toFixed(0)} - {(housingPriceMax / 10000).toFixed(0)} 万/平
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-8">最低</span>
                      <input
                        type="range"
                        min="0"
                        max="80000"
                        step="1000"
                        value={housingPriceMin}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setHousingPriceMin(Math.min(val, housingPriceMax - 1000));
                        }}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-8">最高</span>
                      <input
                        type="range"
                        min="0"
                        max="80000"
                        step="1000"
                        value={housingPriceMax}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setHousingPriceMax(Math.max(val, housingPriceMin + 1000));
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">宜居标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {livableTags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          selectedTags.includes(tag.id)
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置筛选条件
                </Button>
              </div>
            </aside>

            <main className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <p className="text-slate-600">
                  为你推荐 <span className="font-bold text-emerald-600">{filteredCities.length}</span> 个城市
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">排序：</span>
                  <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value as typeof sortType)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="match">匹配度优先</option>
                    <option value="price-asc">房价从低到高</option>
                    <option value="salary-desc">薪资从高到低</option>
                  </select>
                </div>
              </div>

              {filteredCities.length > 0 ? (
                <div className="space-y-4">
                  {filteredCities.map((item, index) => (
                    <div
                      key={item.cityId}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
                    >
                      <RankedCityCard
                        city={item.city}
                        rank={index + 1}
                        score={item.score}
                        isFavorite={isFavorite(item.cityId)}
                        isInCompare={isInCompare(item.cityId)}
                        onFavorite={() => handleFavorite(item.cityId)}
                        onCompare={() => handleCompare(item.cityId)}
                        onViewDetail={() => navigate(`/city/${item.cityId}`)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                    <Filter className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="font-serif-sc text-xl font-bold text-slate-700 mb-2">
                    未找到符合条件的城市
                  </h3>
                  <p className="text-slate-500 mb-6">试试调整筛选条件吧</p>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" />
                    重置筛选条件
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
