import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { useCityStore } from '@/store/useCityStore';
import CityCard from '@/components/ui/CityCard';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import { provinces, cityLevelLabels, CityLevel } from '@/types';
import { useUserStore } from '@/store/useUserStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useUIStore } from '@/store/useUIStore';

type SortType = 'comprehensive' | 'price-asc' | 'salary-desc' | 'livability';

const livableTags = [
  { id: 'low-price', label: '低物价' },
  { id: 'good-education', label: '教育强' },
  { id: 'good-environment', label: '环境好' },
  { id: 'suitable-elderly', label: '适合养老' },
  { id: 'coastal', label: '靠海' },
  { id: 'good-food', label: '美食多' },
];

const sortOptions = [
  { value: 'comprehensive', label: '综合排序' },
  { value: 'price-asc', label: '房价从低到高' },
  { value: 'salary-desc', label: '薪资从高到低' },
  { value: 'livability', label: '宜居分数' },
];

const PAGE_SIZE = 9;

export default function CityList() {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useUserStore();
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  const { showToast } = useUIStore();
  const { cities: allCities, fetchCities } = useCityStore();

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<CityLevel[]>([]);
  const [housingPriceMin, setHousingPriceMin] = useState(0);
  const [housingPriceMax, setHousingPriceMax] = useState(80000);
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(20000);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState<SortType>('comprehensive');
  const [provinceDropdownOpen, setProvinceDropdownOpen] = useState(false);

  const filteredCities = useMemo(() => {
    let result = [...allCities];

    if (selectedProvinces.length > 0) {
      result = result.filter(city => selectedProvinces.includes(city.province));
    }

    if (selectedLevels.length > 0) {
      result = result.filter(city => selectedLevels.includes(city.level));
    }

    result = result.filter(city => {
      const price = city.housingPrice;
      return price >= housingPriceMin && price <= housingPriceMax;
    });

    result = result.filter(city => {
      const salary = city.averageSalary;
      return salary >= salaryMin && salary <= salaryMax;
    });

    if (selectedTags.length > 0) {
      result = result.filter(city => {
        return selectedTags.every(tag => {
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
      case 'comprehensive':
        result.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case 'price-asc':
        result.sort((a, b) => a.housingPrice - b.housingPrice);
        break;
      case 'salary-desc':
        result.sort((a, b) => b.averageSalary - a.averageSalary);
        break;
      case 'livability':
        result.sort((a, b) => b.overallScore - a.overallScore);
        break;
    }

    return result;
  }, [selectedProvinces, selectedLevels, housingPriceMin, housingPriceMax, salaryMin, salaryMax, selectedTags, sortType]);

  const totalPages = Math.ceil(filteredCities.length / PAGE_SIZE);
  const paginatedCities = filteredCities.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleReset = () => {
    setSelectedProvinces([]);
    setSelectedLevels([]);
    setHousingPriceMin(0);
    setHousingPriceMax(80000);
    setSalaryMin(0);
    setSalaryMax(20000);
    setSelectedTags([]);
    setCurrentPage(1);
    setSortType('comprehensive');
  };

  const toggleProvince = (province: string) => {
    setSelectedProvinces(prev =>
      prev.includes(province)
        ? prev.filter(p => p !== province)
        : [...prev, province]
    );
    setCurrentPage(1);
  };

  const toggleLevel = (level: CityLevel) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
    setCurrentPage(1);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
    setCurrentPage(1);
  };

  const handleFavorite = (cityId: string) => {
    toggleFavorite(cityId);
    const fav = isFavorite(cityId);
    showToast(fav ? '已取消收藏' : '已添加到收藏', fav ? 'info' : 'success');
  };

  const handleCompare = (cityId: string) => {
    const city = allCities.find(c => c.id === cityId);
    if (!city) return;
    if (isInCompare(cityId)) {
      removeFromCompare(cityId);
      showToast('已从对比列表移除', 'info');
    } else {
      const result = addToCompare(city);
      showToast(result.message, result.success ? 'success' : 'warning');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-[64px] lg:pt-[80px]">
      <section className="relative text-white py-16 overflow-hidden"
        style={{
          backgroundImage: `url('/list_top.jpg')`, 
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <h1 className="font-serif-sc text-4xl md:text-5xl font-bold mb-4">
            城市大全
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            汇聚全国宜居城市，多维度筛选对比，找到最适合你的那一座城
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <aside className="w-72 flex-shrink-0">
              <div className="sticky top-6 bg-white rounded-2xl card-shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-serif-sc text-lg font-bold text-slate-800">筛选条件</h2>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">省份筛选</h3>
                  <div className="relative">
                    <button
                      onClick={() => setProvinceDropdownOpen(!provinceDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-left text-sm text-slate-700 hover:border-slate-300 transition-colors"
                    >
                      <span className="truncate">
                        {selectedProvinces.length > 0
                          ? `已选 ${selectedProvinces.length} 个省份`
                          : '选择省份'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${provinceDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {provinceDropdownOpen && (
                      <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-lg">
                        {provinces.map(province => (
                          <label
                            key={province}
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedProvinces.includes(province)}
                              onChange={() => toggleProvince(province)}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="text-slate-700">{province}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
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
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">经济区间</h3>
                  
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500">房价区间</span>
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
                            setCurrentPage(1);
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
                            setCurrentPage(1);
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500">平均薪资</span>
                      <span className="text-xs font-medium text-emerald-600">
                        {(salaryMin / 1000).toFixed(0)} - {(salaryMax / 1000).toFixed(0)} K/月
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-8">最低</span>
                        <input
                          type="range"
                          min="0"
                          max="20000"
                          step="500"
                          value={salaryMin}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSalaryMin(Math.min(val, salaryMax - 500));
                            setCurrentPage(1);
                          }}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-8">最高</span>
                        <input
                          type="range"
                          min="0"
                          max="20000"
                          step="500"
                          value={salaryMax}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSalaryMax(Math.max(val, salaryMin + 500));
                            setCurrentPage(1);
                          }}
                          className="flex-1"
                        />
                      </div>
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
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-600">
                  共找到 <span className="font-bold text-emerald-600">{filteredCities.length}</span> 个城市
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">排序：</span>
                  <select
                    value={sortType}
                    onChange={(e) => {
                      setSortType(e.target.value as SortType);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {paginatedCities.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {paginatedCities.map((city, index) => (
                      <div
                        key={city.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
                      >
                        <CityCard
                          city={city}
                          isFavorite={isFavorite(city.id)}
                          isInCompare={isInCompare(city.id)}
                          onFavorite={() => handleFavorite(city.id)}
                          onCompare={() => handleCompare(city.id)}
                          onViewDetail={() => navigate(`/city/${city.id}`)}
                        />
                      </div>
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
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
