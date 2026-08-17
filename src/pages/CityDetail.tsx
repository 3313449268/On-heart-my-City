import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, GitCompare, Star, Send, User } from 'lucide-react';
import { getCityById } from '@/data/cities';
import { getReviewsByCityId } from '@/data/reviews';
import { useUserStore } from '@/store/useUserStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useUIStore } from '@/store/useUIStore';
import RadarChart from '@/components/ui/RadarChart';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import {
  cn,
  formatNumber,
  formatSalary,
  getLevelLabel,
  getScoreColor,
} from '@/utils/helpers';
import { Review } from '@/types';

const REVIEWS_PER_PAGE = 5;

const getScoreLabel = (score: number): string => {
  if (score >= 9) return '非常宜居';
  if (score >= 8) return '比较宜居';
  if (score >= 7) return '一般宜居';
  if (score >= 6) return '不太宜居';
  return '不宜居';
};

export default function CityDetail() {
  const { id } = useParams<{ id: string }>();
  const city = id ? getCityById(id) : undefined;
  const initialReviews = id ? getReviewsByCityId(id) : [];

  const { toggleFavorite, isFavorite, isLoggedIn } = useUserStore();
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  const { showToast } = useUIStore();

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const isFav = city ? isFavorite(city.id) : false;
  const inCompare = city ? isInCompare(city.id) : false;

  const radarData = useMemo(() => {
    if (!city) return [];
    return [
      {
        name: city.name,
        data: [
          { name: '经济', value: (city.housingPrice / 10000 + city.averageSalary / 2000) / 2 },
          { name: '教育', value: city.educationScore },
          { name: '医疗', value: city.medicalScore },
          { name: '交通', value: city.transportationScore },
          { name: '就业', value: city.employmentScore },
          { name: '环境', value: (city.airQualityScore + city.greeningScore) / 2 },
          { name: '气候', value: city.climateScore },
        ],
      },
    ];
  }, [city]);

  const economicIndicators = useMemo(() => {
    if (!city) return [];
    return [
      { name: '房价水平', value: city.housingPrice, display: `${formatNumber(city.housingPrice)} 元/㎡`, score: Math.min(10, (city.housingPrice / 80000) * 10) },
      { name: '平均薪资', value: city.averageSalary, display: `${formatSalary(city.averageSalary)}/月`, score: Math.min(10, (city.averageSalary / 20000) * 10) },
      { name: '物价水平', value: city.priceLevel, display: `${city.priceLevel.toFixed(1)}/10`, score: city.priceLevel },
    ];
  }, [city]);

  const cityFacilities = useMemo(() => {
    if (!city) return [];
    return [
      { name: '教育资源', value: city.educationScore, display: `${city.educationScore.toFixed(1)}/10`, score: city.educationScore },
      { name: '医疗水平', value: city.medicalScore, display: `${city.medicalScore.toFixed(1)}/10`, score: city.medicalScore },
      { name: '交通便利', value: city.transportationScore, display: `${city.transportationScore.toFixed(1)}/10`, score: city.transportationScore },
      { name: '就业机会', value: city.employmentScore, display: `${city.employmentScore.toFixed(1)}/10`, score: city.employmentScore },
    ];
  }, [city]);

  const livingEnvironment = useMemo(() => {
    if (!city) return [];
    return [
      { name: '空气质量', value: city.airQualityScore, display: `${city.airQualityScore.toFixed(1)}/10`, score: city.airQualityScore },
      { name: '绿化程度', value: city.greeningScore, display: `${city.greeningScore.toFixed(1)}/10`, score: city.greeningScore },
      { name: '生活节奏', value: city.lifePaceScore, display: `${city.lifePaceScore.toFixed(1)}/10`, score: 10 - city.lifePaceScore },
      { name: '气候宜人', value: city.climateScore, display: `${city.climateScore.toFixed(1)}/10`, score: city.climateScore },
    ];
  }, [city]);

  const specialAttributes = useMemo(() => {
    if (!city) return [];
    const attrs = [];
    if (city.isCoastal) attrs.push({ name: '海滨城市', value: '是', display: '是', score: 10 });
    if (city.hasMountains) attrs.push({ name: '山水之城', value: '是', display: '是', score: 10 });
    if (city.isHistorical) attrs.push({ name: '历史名城', value: '是', display: '是', score: 10 });
    if (attrs.length === 0) attrs.push({ name: '普通城市', value: '否', display: '否', score: 5 });
    return attrs;
  }, [city]);

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  const handleFavorite = () => {
    if (!city) return;
    if (!isLoggedIn) {
      showToast('请先登录后再收藏', 'warning');
      return;
    }
    toggleFavorite(city.id);
    const fav = isFavorite(city.id);
    showToast(fav ? '已取消收藏' : '已添加到收藏', fav ? 'info' : 'success');
  };

  const handleCompare = () => {
    if (!city) return;
    if (inCompare) {
      removeFromCompare(city.id);
      showToast('已从对比列表移除', 'info');
    } else {
      const result = addToCompare(city.id);
      showToast(result.message, result.success ? 'success' : 'warning');
    }
  };

  const handleSubmitReview = () => {
    if (!city) return;
    if (!isLoggedIn) {
      showToast('请先登录后再发表评价', 'warning');
      return;
    }
    if (!reviewContent.trim()) {
      showToast('请输入评价内容', 'warning');
      return;
    }

    const currentUser = useUserStore.getState().currentUser;
    const newReview: Review = {
      id: Math.random().toString(36).substring(2, 11),
      userId: currentUser?.id || '',
      username: currentUser?.username || '匿名用户',
      userAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous',
      cityId: city.id,
      rating,
      content: reviewContent.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      isApproved: true,
    };

    setReviews(prev => [newReview, ...prev]);
    setReviewContent('');
    setRating(5);
    setCurrentPage(1);
    showToast('评价发布成功', 'success');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!city) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif-sc text-2xl font-bold text-slate-700 mb-2">城市不存在</h2>
          <p className="text-slate-500">找不到该城市信息</p>
        </div>
      </div>
    );
  }

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-5 h-5 transition-colors',
              interactive ? 'cursor-pointer' : '',
              star <= (interactive ? (hoverRating || rating) : count)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300'
            )}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  const renderProgressBar = (score: number) => (
    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
        style={{ width: `${(score / 10) * 100}%` }}
      />
    </div>
  );

  const renderIndicatorGroup = (title: string, indicators: { name: string; value: number; display: string; score: number }[]) => (
    <div className="card p-6">
      <h3 className="font-serif-sc text-lg font-bold text-slate-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {indicators.map((indicator, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-sm text-slate-600 w-20 flex-shrink-0">{indicator.name}</span>
            {renderProgressBar(indicator.score)}
            <span className={cn('text-sm font-semibold w-20 text-right', getScoreColor(indicator.score))}>
              {indicator.display}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={city.bannerImage}
          alt={city.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="badge badge-emerald bg-white/20 text-white backdrop-blur-md border border-white/30">
                  {getLevelLabel(city.level)}
                </span>
                <span className="text-white/80 text-sm">{city.province}</span>
              </div>
              <h1 className="font-serif-sc text-4xl md:text-6xl font-bold text-white mb-2">
                {city.name}
              </h1>
              <p className="text-white/70 text-lg max-w-2xl line-clamp-2">
                {city.description}
              </p>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={handleFavorite}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 backdrop-blur-md',
                  isFav
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                )}
              >
                <Heart className={cn('w-5 h-5', isFav && 'fill-current')} />
                {isFav ? '已收藏' : '收藏'}
              </button>
              <button
                onClick={handleCompare}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 backdrop-blur-md',
                  inCompare
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                )}
              >
                <GitCompare className="w-5 h-5" />
                {inCompare ? '已添加' : '加入对比'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="card p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                  <div className="text-center md:text-left">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={cn('text-5xl font-bold', getScoreColor(city.overallScore))}>
                        {city.overallScore.toFixed(1)}
                      </span>
                      <span className="text-slate-400 text-lg">/10</span>
                    </div>
                    <div className={cn('font-medium', getScoreColor(city.overallScore))}>
                      综合宜居得分 · {getScoreLabel(city.overallScore)}
                    </div>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-slate-200" />
                  <div className="flex-1">
                    <p className="text-slate-600 leading-relaxed">{city.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {city.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card p-6 md:p-8">
                <h2 className="font-serif-sc text-2xl font-bold text-slate-800 mb-6 text-center">
                  多维宜居指数
                </h2>
                <RadarChart data={radarData} height={350} />
              </div>

              <div>
                <h2 className="font-serif-sc text-2xl font-bold text-slate-800 mb-6">
                  详细指标数据
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderIndicatorGroup('经济指标', economicIndicators)}
                  {renderIndicatorGroup('城市配套', cityFacilities)}
                  {renderIndicatorGroup('生活环境', livingEnvironment)}
                  {renderIndicatorGroup('特殊属性', specialAttributes)}
                </div>
              </div>

              <div className="card p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif-sc text-2xl font-bold text-slate-800">
                    用户评价
                  </h2>
                  <span className="text-slate-500 text-sm">共 {reviews.length} 条评价</span>
                </div>

                {isLoggedIn ? (
                  <div className="bg-slate-50 rounded-2xl p-5 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">发表评价</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {renderStars(rating, true)}
                          <span className="text-sm text-slate-500">
                            {rating} 分
                          </span>
                        </div>
                      </div>
                    </div>
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="分享你对这座城市的看法..."
                      className="input resize-none h-24 mb-4"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSubmitReview}>
                        <Send className="w-4 h-4" />
                        发布评价
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-8 mb-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 mb-4">登录后发表评价</p>
                    <Button variant="outline">去登录</Button>
                  </div>
                )}

                <div className="space-y-6">
                  {paginatedReviews.length > 0 ? (
                    <>
                      {paginatedReviews.map((review) => (
                        <div
                          key={review.id}
                          className="flex gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0"
                        >
                          <img
                            src={review.userAvatar}
                            alt={review.username}
                            className="w-10 h-10 rounded-full flex-shrink-0 bg-slate-100"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-slate-800">
                                {review.username}
                              </span>
                              <span className="text-sm text-slate-400">
                                {review.createdAt}
                              </span>
                            </div>
                            <div className="mb-2">
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                              {review.content}
                            </p>
                          </div>
                        </div>
                      ))}
                      {totalPages > 1 && (
                        <div className="pt-4">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500">暂无评价，快来发表第一条评价吧</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-6 sticky top-6">
                <h3 className="font-serif-sc text-lg font-bold text-slate-800 mb-4">
                  快速信息
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">所属省份</span>
                    <span className="font-medium text-slate-700">{city.province}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">城市等级</span>
                    <span className="font-medium text-slate-700">{getLevelLabel(city.level)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">房价水平</span>
                    <span className="font-medium text-rose-600">{formatNumber(city.housingPrice)} 元/㎡</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">平均薪资</span>
                    <span className="font-medium text-emerald-600">{formatSalary(city.averageSalary)}/月</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500">宜居排名</span>
                    <span className="font-medium text-amber-600">No.{city.overallScore >= 9 ? 1 : city.overallScore >= 8.5 ? 3 : 5}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
