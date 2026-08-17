import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchCities } from '@/utils/matching';
import { useCityStore } from '@/store/useCityStore';
import { useMatchStore } from '@/store/useMatchStore';
import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import Button from '@/components/ui/Button';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function SliderInput({ label, value, onChange }: SliderInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="inline-flex items-center justify-center w-10 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold">
          {value}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export default function SmartMatch() {
  const navigate = useNavigate();
  const { cities, fetchCities } = useCityStore();
  const { currentPreferences, setPreferences, setMatchResults, resetPreferences, saveMatchRecord } = useMatchStore();
  const { isLoggedIn, currentUser } = useUserStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleSliderChange = (key: keyof typeof currentPreferences, value: number) => {
    setPreferences({ [key]: value });
  };

  const handleInputChange = (key: keyof typeof currentPreferences, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    setPreferences({ [key]: numValue });
  };

  const handleTextareaChange = (value: string) => {
    setPreferences({ specialRequirements: value });
  };

  const handleReset = () => {
    resetPreferences();
    showToast('已重置为默认设置', 'info');
  };

  const handleStartMatch = () => {
    const results = matchCities(cities, currentPreferences);
    const simplifiedResults = results.map(r => ({ cityId: r.city.id, score: r.score }));
    setMatchResults(simplifiedResults);

    if (isLoggedIn && currentUser) {
      saveMatchRecord(currentUser.id);
    }

    showToast('匹配完成！', 'success');
    navigate('/match-result');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 pt-[64px] lg:pt-[80px]">
      <div className="relative text-white overflow-hidden"
        style={{
          backgroundImage: `url('/match_top.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="font-serif-sc text-4xl font-bold mb-4">
            智能匹配你的理想城市
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            根据你的经济需求、生活偏好和特殊要求，
            为你精准推荐最适合定居的城市
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-8 space-y-6 relative z-10">
        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
              01
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
              <h2 className="font-serif-sc text-xl font-semibold text-slate-800 pl-2">
                经济需求设置
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                可接受房价上限（元/㎡）
              </label>
              <input
                type="number"
                placeholder="不限制则不填"
                value={currentPreferences.maxHousingPrice || ''}
                onChange={(e) => handleInputChange('maxHousingPrice', e.target.value)}
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                期望月薪（元）
              </label>
              <input
                type="number"
                placeholder="不限制则不填"
                value={currentPreferences.expectedSalary || ''}
                onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="space-y-5">
            <SliderInput
              label="房价权重"
              value={currentPreferences.housingWeight}
              onChange={(v) => handleSliderChange('housingWeight', v)}
            />
            <SliderInput
              label="薪资权重"
              value={currentPreferences.salaryWeight}
              onChange={(v) => handleSliderChange('salaryWeight', v)}
            />
            <SliderInput
              label="物价权重"
              value={currentPreferences.priceWeight}
              onChange={(v) => handleSliderChange('priceWeight', v)}
            />
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
              02
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
              <h2 className="font-serif-sc text-xl font-semibold text-slate-800 pl-2">
                城市配套权重设置
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            <SliderInput
              label="教育资源"
              value={currentPreferences.educationWeight}
              onChange={(v) => handleSliderChange('educationWeight', v)}
            />
            <SliderInput
              label="三甲医疗"
              value={currentPreferences.medicalWeight}
              onChange={(v) => handleSliderChange('medicalWeight', v)}
            />
            <SliderInput
              label="公共交通"
              value={currentPreferences.transportationWeight}
              onChange={(v) => handleSliderChange('transportationWeight', v)}
            />
            <SliderInput
              label="就业机会"
              value={currentPreferences.employmentWeight}
              onChange={(v) => handleSliderChange('employmentWeight', v)}
            />
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
              03
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
              <h2 className="font-serif-sc text-xl font-semibold text-slate-800 pl-2">
                生活环境权重设置
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            <SliderInput
              label="空气质量"
              value={currentPreferences.airQualityWeight}
              onChange={(v) => handleSliderChange('airQualityWeight', v)}
            />
            <SliderInput
              label="城市绿化"
              value={currentPreferences.greeningWeight}
              onChange={(v) => handleSliderChange('greeningWeight', v)}
            />
            <SliderInput
              label="生活节奏（慢生活 / 快节奏）"
              value={currentPreferences.lifePaceWeight}
              onChange={(v) => handleSliderChange('lifePaceWeight', v)}
            />
            <SliderInput
              label="气候舒适度"
              value={currentPreferences.climateWeight}
              onChange={(v) => handleSliderChange('climateWeight', v)}
            />
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
              04
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
              <h2 className="font-serif-sc text-xl font-semibold text-slate-800 pl-2">
                特殊需求设置
              </h2>
            </div>
          </div>

          <textarea
            placeholder="例如：要求靠海、有山、四季如春等..."
            value={currentPreferences.specialRequirements}
            onChange={(e) => handleTextareaChange(e.target.value)}
            rows={4}
            className="input resize-none"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-4 px-6 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleReset}
          >
            重置
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartMatch}
          >
            开始匹配
          </Button>
        </div>
      </div>
    </div>
  );
}
