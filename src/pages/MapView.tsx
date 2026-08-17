import { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useCityStore } from '@/store/useCityStore';
import { Search, BarChart3, List, MapPin } from 'lucide-react';

export default function MapView() {
  const { cities, fetchCities } = useCityStore();
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return cities;
    const q = searchQuery.toLowerCase();
    return cities.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [searchQuery, cities]);

  const barOption = useMemo(() => {
    const sorted = [...filteredCities].sort((a, b) => b.overallScore - a.overallScore);
    return {
      title: {
        text: '全国宜居城市综合得分排行',
        left: 'center',
        top: 10,
        textStyle: { fontSize: 18, color: '#1e293b' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = filteredCities.find(c => c.name === params[0].name);
          if (!data) return '';
          return `
            <div style="font-weight:bold;margin-bottom:8px;">${data.name} · ${data.province}</div>
            <div>综合得分: ${data.overallScore}</div>
            <div>房价: ¥${data.housingPrice.toLocaleString()}/㎡</div>
            <div>平均月薪: ¥${data.averageSalary.toLocaleString()}</div>
            <div>环境分: ${(data.airQualityScore + data.greeningScore) / 2}</div>
          `;
        },
      },
      grid: { left: 60, right: 30, top: 60, bottom: 30, containLabel: true },
      xAxis: {
        type: 'category',
        data: sorted.map(c => c.name),
        axisLabel: { rotate: 45, fontSize: 11, color: '#64748b' },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
      },
      yAxis: {
        type: 'value',
        name: '宜居得分',
        min: 5,
        max: 10,
        axisLabel: { color: '#64748b' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      series: [
        {
          data: sorted.map(c => c.overallScore),
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: (params: any) => {
              const score = params.value;
              if (score >= 9) return '#10b981';
              if (score >= 8.5) return '#34d399';
              if (score >= 8) return '#6ee7b7';
              if (score >= 7.5) return '#a7f3d0';
              return '#d1fae5';
            },
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            color: '#475569',
          },
        },
      ],
    };
  }, [filteredCities]);

  const scatterOption = useMemo(() => {
    return {
      title: {
        text: '宜居城市房价-薪资-环境三维分布',
        left: 'center',
        top: 10,
        textStyle: { fontSize: 18, color: '#1e293b' },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          return `
            <div style="font-weight:bold;margin-bottom:8px;">${data[4]}</div>
            <div>房价: ¥${data[0].toLocaleString()}/㎡</div>
            <div>月薪: ¥${data[1].toLocaleString()}</div>
            <div>综合得分: ${data[2]}</div>
            <div>环境分: ${data[3]}</div>
          `;
        },
      },
      grid: { left: 60, right: 30, top: 60, bottom: 50, containLabel: true },
      xAxis: {
        type: 'value',
        min: 5000,
        max: 78000,
        name: '房价 (元/㎡)',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: { color: '#64748b' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      yAxis: {
        type: 'value',
        min:3000,
        max:16000,
        name: '月薪 (元)',
        nameLocation: 'middle',
        nameGap: 40,
        axisLabel: { color: '#64748b' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      series: [
        {
          type: 'scatter',
          data: filteredCities.map(c => [
            c.housingPrice,
            c.averageSalary,
            c.overallScore,
            (c.airQualityScore + c.greeningScore) / 2,
            c.name,
          ]),
          symbolSize: (data: any) => data[2] * 2,
          itemStyle: {
            color: (params: any) => {
              const score = params.data[2];
              if (score >= 9) return '#10b981';
              if (score >= 8.5) return '#3b82f6';
              if (score >= 8) return '#8b5cf6';
              return '#f59e0b';
            },
            opacity: 0.7,
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.1)',
          },
          label: {
            show: true,
            formatter: (params: any) => params.data[4],
            position: 'top',
            fontSize: 10,
            color: '#475569',
          },
        },
      ],
    };
  }, [filteredCities]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-[64px] lg:pt-[80px]">
      <section className="py-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-serif-sc text-4xl font-bold mb-2">全国宜居城市可视化</h1>
          <p className="text-emerald-100">多角度、全方位展示全国宜居城市分布格局</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-4 md:p-6 card-shadow">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索城市、省份或标签..."
                  className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'chart'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">排行榜</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">散点图</span>
              </button>
            </div>
          </div>

          <div className="h-[500px]">
            <ReactECharts
              option={viewMode === 'chart' ? barOption : scatterOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              城市列表 ({filteredCities.length}个)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredCities
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((city, index) => (
                  <a
                    key={city.id}
                    href={`/city/${city.id}`}
                    className="block bg-slate-50 hover:bg-emerald-50 rounded-xl p-3 text-center transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="text-xs text-slate-400 mb-1">#{index + 1}</div>
                    <div className="font-medium text-slate-800">{city.name}</div>
                    <div className="text-xs text-slate-500">{city.province}</div>
                    <div className={`mt-1 text-sm font-semibold ${
                      city.overallScore >= 9
                        ? 'text-emerald-600'
                        : city.overallScore >= 8.5
                        ? 'text-green-600'
                        : 'text-teal-600'
                    }`}>
                      {city.overallScore}分
                    </div>
                  </a>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 card-shadow">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            可视化说明
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-600">
            <div>
              <h4 className="font-medium text-slate-800 mb-2"> 排行榜视图</h4>
              <p>以柱状图形式展示所有城市的综合宜居得分，一目了然对比各城市差异。</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-800 mb-2"> 散点图视图</h4>
              <p>横轴为房价、纵轴为月薪、气泡大小代表综合得分，帮助您平衡经济因素与居住体验。</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-800 mb-2"> 颜色说明</h4>
              <p>绿色越深代表宜居分数越高，环境分越高的城市在散点图中颜色越暖。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
