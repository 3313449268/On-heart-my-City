import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MapPin,
  Eye,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  X,
  CheckSquare,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useCityStore } from '@/store/useCityStore';
import { Note } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate, formatNumber } from '@/utils/helpers';

const PAGE_SIZE = 10;
type FilterStatus = 'all' | 'approved' | 'pending';

export default function AdminNotes() {
  const { cities, fetchCities } = useCityStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCity, setFilterCity] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [previewImgIdx, setPreviewImgIdx] = useState<number | null>(null);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listNotes({
        keyword: searchQuery || undefined,
        status: filterStatus,
        cityId: filterCity || undefined,
        page: currentPage,
        pageSize: PAGE_SIZE,
      });
      setNotes(data.list);
      setTotal(data.total);
    } catch (err) {
      console.error('加载笔记列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotes(); }, [currentPage]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus, filterCity]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = () => {
    setCurrentPage(1);
    loadNotes();
  };

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveNote(id);
      loadNotes();
      showToast('审核通过成功', 'success');
    } catch (err) {
      alert('审核失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条笔记吗？此操作不可恢复。')) return;
    try {
      await adminApi.deleteNote(id);
      loadNotes();
      showToast('删除成功', 'success');
    } catch (err) {
      alert('删除失败，请重试');
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要批量审核通过 ${selectedIds.size} 条笔记吗？`)) return;
    try {
      await adminApi.batchApproveNotes(Array.from(selectedIds));
      setSelectedIds(new Set());
      loadNotes();
      showToast('批量审核成功', 'success');
    } catch (err) {
      alert('批量审核失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要批量删除 ${selectedIds.size} 条笔记吗？此操作不可恢复。`)) return;
    try {
      await adminApi.batchDeleteNotes(Array.from(selectedIds));
      setSelectedIds(new Set());
      loadNotes();
      showToast('批量删除成功', 'success');
    } catch (err) {
      alert('批量删除失败');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notes.length && notes.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notes.map((n) => n.id)));
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

  const allSelected = notes.length > 0 && selectedIds.size === notes.length;

  const filterTabs = [
    { key: 'all' as FilterStatus, label: '全部' },
    { key: 'pending' as FilterStatus, label: '待审核' },
    { key: 'approved' as FilterStatus, label: '已审核' },
  ];

  return (
    <div className="space-y-6">
      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索标题、内容或用户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 min-w-[160px]"
            >
              <option value="">全部城市</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-md transition-all"
            >
              搜索
            </button>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
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

        {/* 批量操作栏 */}
        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-sm font-medium text-emerald-700">
              已选择 {selectedIds.size} 条笔记
            </span>
            <div className="flex-1" />
            <button
              onClick={handleBatchApprove}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              批量审核
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              批量删除
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              取消
            </button>
          </div>
        )}
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3">
                  <button
                    onClick={toggleSelectAll}
                    className={cn(
                      'p-1 rounded transition-colors',
                      allSelected ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'
                    )}
                  >
                    <CheckSquare className="w-5 h-5" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">笔记</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">用户</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">城市</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">数据</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">发布时间</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">状态</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {notes.map((note) => {
                const isSelected = selectedIds.has(note.id);
                return (
                  <tr
                    key={note.id}
                    className={cn(
                      'transition-colors cursor-pointer',
                      isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/50'
                    )}
                    onClick={() => setPreviewNote(note)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelect(note.id)}
                        className={cn(
                          'p-1 rounded transition-colors',
                          isSelected ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'
                        )}
                      >
                        <CheckSquare className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-3">
                        {note.images.length > 0 && (
                          <img
                            src={note.images[0]}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 line-clamp-1">{note.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{note.content}</p>
                          {note.images.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                              <ImageIcon className="w-3 h-3" />
                              <span>{note.images.length} 张</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {note.userAvatar ? (
                          <img src={note.userAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-100" />
                        )}
                        <span className="text-sm text-slate-700">{note.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />
                        {note.cityName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {formatNumber(note.viewCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          {formatNumber(note.likeCount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(note.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                          note.isApproved
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        )}
                      >
                        {note.isApproved ? '已审核' : '待审核'}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {!note.isApproved && (
                          <button
                            onClick={() => handleApprove(note.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="审核通过"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {notes.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    暂无笔记数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              共 {total} 条记录，第 {currentPage} / {totalPages} 页
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
                  <div key={`e-${index}`} className="flex items-center justify-center w-9 h-9 text-slate-400">
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

      {/* 笔记详情预览 */}
      {previewNote && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => { setPreviewNote(null); setPreviewImgIdx(null); }}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">笔记详情</h3>
              <button
                onClick={() => { setPreviewNote(null); setPreviewImgIdx(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">{previewNote.title}</h2>
              <div className="flex items-center gap-3 text-sm">
                {previewNote.userAvatar ? (
                  <img src={previewNote.userAvatar} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100" />
                )}
                <span className="font-medium text-slate-700">{previewNote.username}</span>
                <span className="text-slate-400">·</span>
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">{previewNote.cityName}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{formatDate(previewNote.createdAt)}</span>
              </div>
              {previewNote.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previewNote.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80"
                      onClick={() => setPreviewImgIdx(i)}
                    />
                  ))}
                </div>
              )}
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{previewNote.content}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(previewNote.viewCount)}</span>
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{formatNumber(previewNote.likeCount)}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{formatNumber(previewNote.commentCount)}</span>
                <span
                  className={cn(
                    'ml-auto px-2.5 py-1 rounded-full text-xs font-medium',
                    previewNote.isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  )}
                >
                  {previewNote.isApproved ? '已审核' : '待审核'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50">
              {!previewNote.isApproved && (
                <button
                  onClick={() => {
                    handleApprove(previewNote.id);
                    setPreviewNote(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  审核通过
                </button>
              )}
              <button
                onClick={() => {
                  handleDelete(previewNote.id);
                  setPreviewNote(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors"
              >
                删除笔记
              </button>
            </div>
          </div>

          {/* 图片预览 */}
          {previewImgIdx !== null && previewNote.images[previewImgIdx] && (
            <div
              className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => setPreviewImgIdx(null)}
              >
                <X className="w-5 h-5" />
              </button>
              {previewImgIdx > 0 && (
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => setPreviewImgIdx(previewImgIdx - 1)}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <img
                src={previewNote.images[previewImgIdx]}
                alt=""
                className="max-w-[90vw] max-h-[85vh] object-contain"
              />
              {previewImgIdx < previewNote.images.length - 1 && (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => setPreviewImgIdx(previewImgIdx + 1)}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
              <div className="absolute bottom-6 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                {previewImgIdx + 1} / {previewNote.images.length}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 简易 toast 提示（管理员页面独立使用，避免循环依赖）
function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg ${
    type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
