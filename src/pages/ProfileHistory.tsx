import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, RefreshCw, Trash2, Calendar, MapPin } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useMatchStore } from '@/store/useMatchStore';
import { useUIStore } from '@/store/useUIStore';
import { useCityStore } from '@/store/useCityStore';
import Button from '@/components/ui/Button';
import { MatchRecord } from '@/types';

const weightLabels: Record<string, string> = {
  housingWeight: '房价',
  salaryWeight: '薪资',
  priceWeight: '物价',
  educationWeight: '教育',
  medicalWeight: '医疗',
  transportationWeight: '交通',
  employmentWeight: '就业',
  airQualityWeight: '空气质量',
  greeningWeight: '绿化',
  lifePaceWeight: '生活节奏',
  climateWeight: '气候',
};

function getTopWeights(record: MatchRecord, count = 3): string[] {
  const weights = [
    { key: 'housingWeight', value: record.housingWeight },
    { key: 'salaryWeight', value: record.salaryWeight },
    { key: 'priceWeight', value: record.priceWeight },
    { key: 'educationWeight', value: record.educationWeight },
    { key: 'medicalWeight', value: record.medicalWeight },
    { key: 'transportationWeight', value: record.transportationWeight },
    { key: 'employmentWeight', value: record.employmentWeight },
    { key: 'airQualityWeight', value: record.airQualityWeight },
    { key: 'greeningWeight', value: record.greeningWeight },
    { key: 'lifePaceWeight', value: record.lifePaceWeight },
    { key: 'climateWeight', value: record.climateWeight },
  ];

  return weights
    .sort((a, b) => b.value - a.value)
    .slice(0, count)
    .map((w) => weightLabels[w.key] || w.key);
}

export default function ProfileHistory() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useUserStore();
  const { matchHistory, deleteMatchRecord, reuseMatchRecord } = useMatchStore();
  const { showToast } = useUIStore();
  const { cities, fetchCities } = useCityStore();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const userHistory = useMemo(() => {
    if (!currentUser) return [];
    return matchHistory.filter((r) => r.userId === currentUser.id);
  }, [matchHistory, currentUser]);

  const handleViewResult = (record: MatchRecord) => {
    reuseMatchRecord(record.id);
    navigate('/match-result');
  };

  const handleReuse = (record: MatchRecord) => {
    reuseMatchRecord(record.id);
    navigate('/smart-match');
    showToast('已复用匹配条件', 'success');
  };

  const handleDelete = (recordId: string) => {
    deleteMatchRecord(recordId);
    showToast('已删除匹配记录', 'success');
  };

  if (!currentUser) return null;

  return (
    <div className="card p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">历史匹配记录</h1>
          <p className="section-subtitle">共 {userHistory.length} 条记录</p>
        </div>
      </div>

      {userHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Clock className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-lg text-slate-500 mb-2">还没有匹配记录</p>
          <p className="text-sm text-slate-400 mb-6">去智能匹配页面开始你的第一次匹配吧</p>
          <Button onClick={() => navigate('/smart-match')}>智能匹配</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {userHistory.map((record) => {
            const topWeights = getTopWeights(record);
            const topCity = record.results[0]
              ? cities.find(c => c.id === record.results[0].cityId)
              : null;

            return (
              <div
                key={record.id}
                className="border border-slate-100 rounded-2xl p-6 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{record.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">匹配到 {record.results.length} 个城市</span>
                      </div>
                      {topCity && (
                        <span className="badge badge-emerald">
                          最佳匹配：{topCity.name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {topWeights.map((weight, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                        >
                          {weight}权重高
                        </span>
                      ))}
                    </div>

                    {record.specialRequirements && (
                      <p className="text-sm text-slate-500 mb-4">
                        特殊需求：{record.specialRequirements}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewResult(record)}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <Eye className="w-4 h-4" />
                      查看结果
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReuse(record)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      复用本次
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
