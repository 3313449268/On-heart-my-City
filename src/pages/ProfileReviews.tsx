import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Edit2, Trash2, X, MessageSquare } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import { useCityStore } from '@/store/useCityStore';
import { getReviewsByUserId } from '@/data/reviews';
import Button from '@/components/ui/Button';
import { Review } from '@/types';
import { generateId } from '@/utils/helpers';

export default function ProfileReviews() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useUserStore();
  const { showToast } = useUIStore();
  const { cities, fetchCities } = useCityStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }
    if (currentUser) {
      setReviews(getReviewsByUserId(currentUser.id));
    }
  }, [currentUser, isLoggedIn, navigate]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const reviewsWithCity = useMemo(() => {
    return reviews.map((review) => ({
      ...review,
      city: cities.find(c => c.id === review.cityId),
    }));
  }, [reviews, cities]);

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditContent(review.content);
  };

  const handleSaveEdit = () => {
    if (!editingReview) return;
    if (!editContent.trim()) {
      showToast('评价内容不能为空', 'error');
      return;
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === editingReview.id
          ? { ...r, rating: editRating, content: editContent.trim() }
          : r
      )
    );
    setEditingReview(null);
    showToast('评价已更新', 'success');
  };

  const handleDelete = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    showToast('评价已删除', 'success');
  };

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!currentUser) return null;

  return (
    <div className="card p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">我的评价</h1>
          <p className="section-subtitle">共 {reviews.length} 条评价</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-lg text-slate-500 mb-2">还没有写过评价</p>
          <p className="text-sm text-slate-400 mb-6">去城市详情页写下你的第一条评价吧</p>
          <Button onClick={() => navigate('/cities')}>浏览城市</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {reviewsWithCity.map((review) => (
            <div
              key={review.id}
              className="border border-slate-100 rounded-2xl p-6 hover:border-emerald-200 transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-serif-sc text-lg font-bold text-slate-800">
                      {review.city?.name || '未知城市'}
                    </h3>
                    <p className="text-sm text-slate-500">{review.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                {renderStars(review.rating)}
              </div>

              <p className="text-slate-600 leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      )}

      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-sc text-xl font-bold text-slate-800">编辑评价</h2>
              <button
                onClick={() => setEditingReview(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  评分
                </label>
                {renderStars(editRating, true, setEditRating)}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  评价内容
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={5}
                  className="input resize-none"
                  placeholder="分享你对这座城市的看法..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setEditingReview(null)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1">
                  保存
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
