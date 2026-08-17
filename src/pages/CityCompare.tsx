import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Search, Trash2, Compass } from 'lucide-react';
import RadarChart from '@/components/ui/RadarChart';
import Button from '@/components/ui/Button';
import { useCityStore } from '@/store/useCityStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useUIStore } from '@/store/useUIStore';
import { cn, getLevelLabel, formatNumber, formatSalary } from '@/utils/helpers';
import type { City } from '@/types';

interface MetricGroup {
  group: string;
  metrics: {
    key: string;
    label: string;
    isHigherBetter: boolean;
    format?: (value: number | string) => string;
    getValue: (city: City) => number | string;
  }[];
}

const metricGroups: MetricGroup[] = [
  {
    group: '基本信息',
    metrics: [
      {
        key: 'level',
        label: '城市等级',
        isHigherBetter: true,
        getValue: (city) => getLevelLabel(city.level),
      },
      {
        key: 'province',
        label: '所属省份',
        isHigherBetter: false,
        getValue: (city) => city.province,
      },
    ],
  },
  {
    group: '经济指标',
    metrics: [
      {
        key: 'housingPrice',
        label: '平均房价',
        isHigherBetter: false,
        format: (v) => formatNumber(v as number) + '元/㎡',
        getValue: (city) => city.housingPrice,
      },
      {
        key: 'averageSalary',
        label: '平均月薪',
        isHigherBetter: true,
        format: (v) => formatSalary(v as number),
        getValue: (city) => city.averageSalary,
      },
      {
        key: 'priceLevel',
        label: '物价水平',
        isHigherBetter: false,
        format: (v) => (v as number).toFixed(1),
        getValue: (city) => city.priceLevel,
      },
    ],
  },
  {
    group: '城市配套',
    metrics: [
      {
        key: 'educationScore',
        label: '教育资源',
        isHigherBetter: true,
        format: (v) => (v as number).toFixed(1),
        getValue: (city) => city.educationScore,
      },
      {
        key: 'medicalScore',
        label: '三甲医疗',
        isHigherBetter: true,
        format: (v) => (v as number).toFixed(1),
        getValue: (city) => city.medicalScore,
      },
      {
        key: 'transportationScore',
        label: '公共交通',
        isHigherBetter: true,
        format: (v) => (v as number).toFixed(1),
        getValue: (city) => city.transportationScore,
      },
      {
        key: 'employmentScore',
        label: '就业机会',
        isHigherBetter: true,
        format: (v) => (v as number).toFixed(1),
        getValue: (city) => city.employmentScore,
      },
    ],
  },
  {
    group: '生活环境',
    metrics: [
      {
        key: 'airQualityScore',
        label: '空气质量',
        isHigherBetter: true,
        format: (v) => (v as number).toFixed(1),
        getValue: (city) => city.airQualityScore,
      },
      {
        key: 'greeningScore',
        label: '城市绿化',
        isHigherBetter: true,
        format: (v) => (v as number).toFixed(1),
        getValue: (city) => city.greeningScore,
      },
      {
        key: 'lifePaceScore',
        label: '生活节奏',
        isHigherBetter: false,
        format: (v) => (v as number).toFixed(1),
        getValue: (city) => city.lifePaceScore,
      },
      {
        key: 'climateScore',
        label: '气候舒适度',
        isHigherBetter: true,
        format: (v) => (v as number).toFixed(1),
        getValue: (city) => city.climateScore,
      },
    ],
  },
];

const radarIndicators = [
  { name: '房价', max: 10 },
  { name: '教育', max: 10 },
  { name: '医疗', max: 10 },
  { name: '交通', max: 10 },
  { name: '就业', max: 10 },
  { name: '环境', max: 10 },
  { name: '气候', max: 10 },
];

function getRadarData(city: City) {
  const housingRadar = Math.max(0, 10 - (city.housingPrice - 10000) / 7000);
  const environmentRadar = (city.airQualityScore + city.greeningScore) / 2;

  return [
    { name: '房价', value: Math.min(10, Math.max(0, Number(housingRadar.toFixed(1)))) },
    { name: '教育', value: city.educationScore },
    { name: '医疗', value: city.medicalScore },
    { name: '交通', value: city.transportationScore },
    { name: '就业', value: city.employmentScore },
    { name: '环境', value: Number(environmentRadar.toFixed(1)) },
    { name: '气候', value: city.climateScore },
  ];
}

function getBestValueIndex(
  values: (number | string)[],
  isHigherBetter: boolean
): number | null {
  const numericValues = values.map((v) => (typeof v === 'number' ? v : null));
  if (numericValues.every((v) => v === null)) return null;

  const validValues = numericValues.map((v, i) => ({ value: v!, index: i }));
  if (validValues.length === 0) return null;

  const best = isHigherBetter
    ? validValues.reduce((a, b) => (a.value > b.value ? a : b))
    : validValues.reduce((a, b) => (a.value < b.value ? a : b));

  const bestCount = validValues.filter((v) => v.value === best.value).length;
  if (bestCount > 1) return null;

  return best.index;
}

export default function CityCompare() {
  const navigate = useNavigate();
  const { cities, fetchCities } = useCityStore();
  const { compareList, removeFromCompare, clearCompare, addToCompare } = useCompareStore();
  const { showToast } = useUIStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return cities;
    const query = searchQuery.toLowerCase();
    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(query) ||
        city.province.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const radarData = useMemo(() => {
    return compareList.map((city) => ({
      name: city.name,
      data: getRadarData(city),
    }));
  }, [compareList]);

  const handleRemoveCity = (cityId: string, cityName: string) => {
    removeFromCompare(cityId);
    showToast(`已移除${cityName}`, 'info');
  };

  const handleClearAll = () => {
    clearCompare();
    showToast('已清空对比列表', 'info');
  };

  const handleAddCity = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    if (city) {
      const result = addToCompare(city);
      showToast(result.message, result.success ? 'success' : 'warning');
      if (result.success) {
        setIsModalOpen(false);
        setSearchQuery('');
      }
    }
  };

  const isInCompare = (cityId: string) => {
    return compareList.some((c) => c.id === cityId);
  };

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-[64px] lg:pt-[80px]">
        <div className="relative text-white overflow-hidden"
          style={{
            backgroundImage: `url('/compare_top.jpg')`, 
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
            <h1 className="font-serif-sc text-4xl font-bold mb-4">城市对比</h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              多维度对比城市数据，帮你做出更明智的选择
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
              <Compass className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="font-serif-sc text-2xl font-bold text-slate-800 mb-3">
              还没有选择对比城市
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              你可以在城市大全中浏览并添加城市到对比列表，最多可对比5个城市
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/')}
            >
              去城市大全选择城市
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 pt-[64px] lg:pt-[80px]">
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="font-serif-sc text-4xl font-bold mb-3">城市对比</h1>
              <p className="text-white/80 text-lg">
                多维度对比城市数据，帮你做出更明智的选择
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold">
                已选 {compareList.length}/5 个城市
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 space-y-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif-sc text-xl font-semibold text-slate-800">
              已选城市
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" />
              清空对比
            </Button>
          </div>

          <div className="flex items-start gap-4 overflow-x-auto pb-2">
            {compareList.map((city) => (
              <div
                key={city.id}
                className="relative flex-shrink-0 w-32 group"
              >
                <button
                  onClick={() => handleRemoveCity(city.id, city.name)}
                  className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-slate-700/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                  <div className="h-20 overflow-hidden">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <div className="font-serif-sc font-bold text-slate-800">
                      {city.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {city.province}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {compareList.length < 5 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-shrink-0 w-32 h-36 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">添加城市</span>
              </button>
            )}
          </div>

          {compareList.length < 2 && (
            <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></div>
              <p className="text-sm text-amber-700">
                请选择至少2个城市进行对比
              </p>
            </div>
          )}
        </div>

        {compareList.length >= 2 && (
          <>
            <div className="card p-6">
              <h2 className="font-serif-sc text-xl font-semibold text-slate-800 mb-6">
                多维雷达对比图
              </h2>
              <RadarChart
                data={radarData}
                indicators={radarIndicators}
                height={420}
              />
            </div>

            <div className="card overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-serif-sc text-xl font-semibold text-slate-800">
                  详细对比表格
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50">
                      <th className="text-left px-6 py-4 font-semibold text-slate-700 text-sm whitespace-nowrap sticky left-0 bg-slate-50 z-20 w-40">
                        指标
                      </th>
                      {compareList.map((city) => (
                        <th
                          key={city.id}
                          className="text-center px-4 py-4 font-semibold text-slate-800 whitespace-nowrap min-w-[140px]"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <img
                              src={city.image}
                              alt={city.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="font-serif-sc">{city.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metricGroups.map((group) => (
                      <>
                        <tr key={group.group} className="bg-emerald-50/50">
                          <td
                            colSpan={compareList.length + 1}
                            className="px-6 py-3 font-semibold text-emerald-700 text-sm sticky left-0 z-10"
                          >
                            {group.group}
                          </td>
                        </tr>
                        {group.metrics.map((metric, metricIndex) => {
                          const values = compareList.map((city) =>
                            metric.getValue(city)
                          );
                          const bestIndex = getBestValueIndex(
                            values,
                            metric.isHigherBetter
                          );

                          return (
                            <tr
                              key={metric.key}
                              className={cn(
                                'border-b border-slate-50',
                                metricIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/30',
                                'hover:bg-slate-50/70 transition-colors'
                              )}
                            >
                              <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap sticky left-0 bg-inherit z-10">
                                {metric.label}
                              </td>
                              {compareList.map((city, cityIndex) => {
                                const value = metric.getValue(city);
                                const isBest = bestIndex === cityIndex;
                                const displayValue = metric.format
                                  ? metric.format(value)
                                  : String(value);

                                return (
                                  <td
                                    key={city.id}
                                    className={cn(
                                      'text-center px-4 py-4 text-sm',
                                      isBest
                                        ? 'text-emerald-600 font-semibold bg-emerald-50/60'
                                        : 'text-slate-700'
                                    )}
                                  >
                                    {displayValue}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsModalOpen(false);
              setSearchQuery('');
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif-sc text-xl font-semibold text-slate-800">
                  添加城市
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索城市名称或省份..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-12"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
              {filteredCities.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  未找到相关城市
                </div>
              ) : (
                filteredCities.map((city) => {
                  const added = isInCompare(city.id);
                  return (
                    <button
                      key={city.id}
                      onClick={() => !added && handleAddCity(city.id)}
                      disabled={added}
                      className={cn(
                        'w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left',
                        added
                          ? 'bg-slate-50 opacity-60 cursor-not-allowed'
                          : 'hover:bg-slate-50 cursor-pointer'
                      )}
                    >
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif-sc font-bold text-slate-800">
                            {city.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                            {getLevelLabel(city.level)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5">
                          {city.province}
                        </div>
                      </div>
                      {added ? (
                        <span className="text-sm text-slate-400">已添加</span>
                      ) : (
                        <Plus className="w-5 h-5 text-emerald-500" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
