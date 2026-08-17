import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  GitCompare,
  Map,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useCityStore } from '@/store/useCityStore';
import CityCard from '@/components/ui/CityCard';
import Button from '@/components/ui/Button';

const carouselSlides = [
  {
    image: '/222.jpg',
    title: '如意城市，如我心意',
    subtitle: '智能匹配最适合你的宜居城市',
    cta: '开始智能匹配',
    route: '/match',
    gradient: 'from-slate-900/65 to-transparent',
  },
  {
    image: '/333.jpg',
    title: '百座城市，千种生活',
    subtitle: '探索全国宜居城市，发现你的理想家园',
    cta: '浏览城市大全',
    route: '/cities',
    gradient: 'from-slate-800/55 via-violet-900/20 to-transparent',
  },
  {
    image: '/111.jpg',
    title: '数据说话，理性选择',
    subtitle: '多维度对比分析，让城市选择更科学',
    cta: '查看热力地图',
    route: '/map',
    gradient: 'from-sky-900/65 via-blue-800/35 to-transparent',
  },
];

const featureCards = [
  {
    icon: Sparkles,
    title: '智能匹配',
    description: '根据你的偏好，AI智能推荐最适合的城市',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    path: '/match',
  },
  {
    icon: MapPin,
    title: '城市大全',
    description: '汇聚全国百座城市，详尽数据一目了然',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    path: '/cities',
  },
  {
    icon: GitCompare,
    title: '城市对比',
    description: '多城市横向对比，优缺点清晰可见',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    path: '/compare',
  },
  {
    icon: Map,
    title: '宜居地图',
    description: '全国宜居热力分布，一图尽收眼底',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-600',
    path: '/map',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const { cities, fetchCities } = useCityStore();
  useEffect(() => { fetchCities(); }, [fetchCities]);
  const topCities = useMemo(() => {
  if (cities.length === 0) return [];
  return [...cities].sort((a, b) => b.overallScore - a.overallScore).slice(0, 8);
}, [cities]);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const heatmapOption = useMemo(() => {
    const top10Cities = [...topCities].slice(0, 10);
    return {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: 10,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
          },
        },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'category',
        data: top10Cities.map((c) => c.name).reverse(),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#475569',
          fontSize: 13,
          fontWeight: 500,
        },
      },
      series: [
        {
          type: 'bar',
          data: top10Cities.map((c) => c.overallScore).reverse(),
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#14b8a6' },
              ],
            },
          },
          barWidth: 20,
          label: {
            show: true,
            position: 'right',
            color: '#0d9488',
            fontWeight: 600,
            fontSize: 13,
            formatter: '{c}',
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#334155',
        },
        formatter: (params: unknown) => {
          const data = (params as Array<{ name: string; value: number }>)[0];
          return `<div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
            <div>宜居得分: <span style="color: #10b981; font-weight: 600;">${data.value}</span></div>`;
        },
      },
    };
  }, [topCities]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative h-screen w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}>
      {carouselSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <div
                className={`max-w-2xl transition-all duration-700 ease-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <h1 className="font-serif-sc text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8">
                  {slide.subtitle}
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate(slide.route)}
                  className="bg-white text-white hover:bg-emerald-50 hover:text-emerald-700 shadow-xl hover:shadow-2xl"
                >
                  {slide.cta}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handlePrevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all duration-200 hover:scale-110 z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all duration-200 hover:scale-110 z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
    </section>

    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((card, index) => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="group relative overflow-hidden rounded-2xl p-6 bg-white border border-slate-100 card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgColor} rounded-bl-full opacity-50 group-hover:opacity-80 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl ${card.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-7 h-7 ${card.iconColor}`} />
                </div>
                <h3 className="font-serif-sc text-xl font-bold text-slate-800 mb-2">
                  {card.title}
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  {card.description}
                </p>
                <div className={`flex items-center gap-1 text-sm font-medium bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                  了解更多
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-serif-sc text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              热门宜居城市
            </h2>
            <p className="text-slate-500">
              综合评分最高的宜居城市，看看有没有你心仪的那一座
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/cities')}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hidden md:flex"
          >
            查看更多
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topCities.map((city, index) => (
            <div
              key={city.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
            >
              <CityCard
                city={city}
                onViewDetail={() => navigate(`/city/${city.id}`)}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button
            variant="outline"
            onClick={() => navigate('/cities')}
          >
            查看更多城市
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>

    <section className="py-20 bg-gradient-to-b from-slate-50 to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif-sc text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            全国宜居热力分布
          </h2>
          <p className="text-slate-500">
            各省市宜居城市排名，一图掌握全国宜居格局
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 card-shadow">
          <ReactECharts
            option={heatmapOption}
            style={{ height: '400px' }}
            opts={{ renderer: 'svg' }}
          />
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/map')}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium hover:underline underline-offset-4"
            >
              点击查看完整可视化地图
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=80"
          alt="背景"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 via-emerald-800/70 to-teal-900/80" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-serif-sc text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          找到属于你的理想城市
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          基于多维度数据智能匹配，让每一次选择都更接近你心中的理想生活
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/match')}
          className="bg-white text-white hover:bg-emerald-50 hover:text-emerald-700 shadow-xl hover:shadow-2xl text-lg px-10 py-4"
        >
          立即开始智能匹配
          <Sparkles className="w-5 h-5" />
        </Button>
      </div>
    </section>
    </div>
  );
}
