import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Star,
  Filter,
} from 'lucide-react';
import { reviewApi } from '@/lib/api';
import { useCityStore } from '@/store/useCityStore';
import { Review } from '@/types';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

type FilterStatus = 'all' | 'approved' | 'pending';

export default function AdminReviews() {
  const { cities, fetchCities } = useCityStore();
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    reviewApi
      .getAll()
      .then((data) => setReviewList(data))
      .catch((err) => console.error('加载评价列表失败:', err));
  }, []);

  const refreshReviews = () => {
    reviewApi
      .getAll()
      .then((data) => setReviewList(data))
      .catch((err) => console.error('加载评价列表失败:', err));
  };

  const getCityName = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    return city ? city.name : '未知城市';
  };

  const filteredReviews = reviewList.filter((review) => {
    const matchesSearch =
      review.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCityName(review.cityId).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'approved'
        ? review.isApproved
        : !review.isApproved;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReviews.length / PAGE_SIZE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleApprove = async (id: string) => {
    try {
      await reviewApi.approve(id);
      refreshReviews();
    } catch (err) {
      console.error('审核失败:', err);
      alert('审核失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条评价吗？')) return;
    try {
      await reviewApi.delete(id);
      refreshReviews();
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败，请重试');
    }
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
            )}
          />
        ))}
      </div>
    );
  };

  const filterTabs = [
    { key: 'all' as FilterStatus, label: '全部' },
    { key: 'approved' as FilterStatus, label: '已审核' },
    { key: 'pending' as FilterStatus, label: '待审核' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索用户、城市或评价内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <Filter className="w-4 h-4 text-slate-500 ml-2" />
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  filterStatus === tab.key
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">用户</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">城市</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">评分</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">内容</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">时间</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">状态</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedReviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{review.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.userAvatar}
                        alt={review.username}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-800">{review.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {getCityName(review.cityId)}
                  </td>
                  <td className="px-6 py-4">{renderStars(review.rating)}</td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-slate-600 line-clamp-2">{review.content}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{review.createdAt}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                        review.isApproved
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      )}
                    >
                      {review.isApproved ? '已审核' : '待审核'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {!review.isApproved && (
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="审核通过"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedReviews.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              共 {filteredReviews.length} 条记录，第 {currentPage} / {totalPages} 页
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageNumbers().map((page, index) =>
                page === 'ellipsis' ? (
                  <div
                    key={`ellipsis-${index}`}
                    className="flex items-center justify-center w-9 h-9 text-slate-400"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                      currentPage === page
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
