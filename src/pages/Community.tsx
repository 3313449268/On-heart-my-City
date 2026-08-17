import { useState, useEffect, useCallback } from 'react';
import { Send, MapPin, Filter, Flame, Clock, TrendingUp, Users, Loader2, Sparkles } from 'lucide-react';
import { Note, NoteListResponse, City } from '@/types';
import { noteApi } from '@/lib/api';
import { useCityStore } from '@/store/useCityStore';
import { useUserStore } from '@/store/useUserStore';
import NoteCard from '@/components/ui/NoteCard';
import CreateNoteModal from '@/components/layout/CreateNoteModal';
import { cn, formatNumber } from '@/utils/helpers';

type SortType = 'latest' | 'hot' | 'popular';

export default function Community() {
  const user = useUserStore((state) => state.currentUser);
  const { cities, fetchCities } = useCityStore();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [cityFilter, setCityFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortType>('latest');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const loadNotes = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        const p = reset ? 1 : page;
        const res = (await noteApi.list({
          cityId: cityFilter === 'all' ? undefined : cityFilter,
          sort,
          page: p,
          pageSize: 15,
          userId: user?.id,
        })) as NoteListResponse;
        if (reset) {
          setNotes(res.list);
        } else {
          setNotes((prev) => [...prev, ...res.list]);
        }
        setHasMore(res.hasMore);
        setTotal(res.total);
        setPage(p + 1);
      } catch (err) {
        console.error('加载笔记失败:', err);
        // fallback：空列表，不让页面空白
        if (reset) setNotes([]);
      } finally {
        setLoading(false);
      }
    },
    [cityFilter, sort, page, user?.id]
  );

  // 首次加载
  useEffect(() => {
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 筛选变化重新加载
  useEffect(() => {
    setPage(1);
    loadNotes(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, sort, user?.id]);

  // 滚动加载更多
  useEffect(() => {
    const onScroll = () => {
      if (loading || !hasMore) return;
      const scrollTop = window.scrollY + document.documentElement.clientHeight;
      if (scrollTop >= document.documentElement.scrollHeight - 300) {
        loadNotes(false);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loading, hasMore, loadNotes]);

  // 笔记变更（点赞等）
  const handleNoteChange = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  // 发布后插入到顶部
  const handleCreated = (note: Note) => {
    setNotes((prev) => [note, ...prev]);
  };

  // 城市筛选：热门城市 + 全部
  const hotCityIds = ['1', '2', '5', '11', '12', '13', '3', '7'];
  const filterCities: { id: string; name: string; province?: string }[] = [
    { id: 'all', name: '全部城市' },
    ...hotCityIds
      .map((id) => cities.find((c) => c.id === id))
      .filter(Boolean)
      .map((c) => ({ id: (c as City).id, name: (c as City).name, province: (c as City).province })),
  ];

  const currentCityName =
    cityFilter === 'all'
      ? '全部城市'
      : cities.find((c) => c.id === cityFilter)?.name || '全部城市';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-[64px] lg:pt-[80px] ">
      {/* 顶部 Hero */}
      <div className="relative overflow-hidden text-white"
      style={{
        backgroundImage: `url('/community_top.jpg')`, 
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-yellow-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                如意城市 · 分享社区
              </div>
              <h1 className="font-serif-sc text-3xl sm:text-4xl font-bold tracking-wide mb-2">
                真实居住体验分享
              </h1>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
                看看城市各地大家真实的城市生活感受，分享你的居住体验、美食推荐、居住感受、避坑指南。
              </p>
              {/* 数据卡片 */}
              <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
                <div className="px-3 py-2.5 bg-white/20 backdrop-blur rounded-xl border border-white/10">
                  <div className="flex items-center gap-1 text-white/80 text-[11px] mb-0.5">
                    <Users className="w-3 h-3" /> 笔记数量
                  </div>
                  <div className="font-bold text-lg">{formatNumber(total)}</div>
                </div>
                <div className="px-3 py-2.5 bg-white/20 backdrop-blur rounded-xl border border-white/10">
                  <div className="flex items-center gap-1 text-white/80 text-[11px] mb-0.5">
                    <MapPin className="w-3 h-3" /> 覆盖城市
                  </div>
                  <div className="font-bold text-lg">{cities.length}</div>
                </div>
                <div className="px-3 py-2.5 bg-white/20 backdrop-blur rounded-xl border border-white/10">
                  <div className="flex items-center gap-1 text-white/80 text-[11px] mb-0.5">
                    <Flame className="w-3 h-3" /> 本周最热
                  </div>
                  <div className="font-bold text-lg">
                    {notes.length > 0 ? formatNumber(notes[0].likeCount) : '--'}
                  </div>
                </div>
              </div>
            </div>
            {/* 发布按钮 */}
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 self-start px-5 py-3 bg-white text-emerald-600 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all"
            >
              <Send className="w-4.5 h-4.5" />
              发布笔记
            </button>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="sticky top-[60px] z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* 城市筛选（桌面端） */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 -mx-2 px-2">
            {filterCities.map((c) => (
              <button
                key={c.id}
                onClick={() => setCityFilter(c.id)}
                className={cn(
                  'shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all',
                  cityFilter === c.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {c.name}
              </button>
            ))}
            {/* 自定义城市选择 */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowCityDropdown((v) => !v)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
              >
                <Filter className="w-3.5 h-3.5" />
                更多城市
              </button>
              {showCityDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCityDropdown(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 w-64 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-1.5 animate-fade-in">
                    <div className="grid grid-cols-3 gap-1 p-1">
                      {cities.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setCityFilter(c.id);
                            setShowCityDropdown(false);
                          }}
                          className={cn(
                            'px-2 py-1.5 text-xs rounded-lg text-left transition-colors',
                            cityFilter === c.id
                              ? 'bg-emerald-50 text-emerald-700 font-medium'
                              : 'text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 移动端筛选按钮 */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium"
          >
            <Filter className="w-3.5 h-3.5" />
            {currentCityName}
          </button>

          {/* 排序 */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full shrink-0">
            {[
              { key: 'latest' as const, label: '最新', icon: Clock },
              { key: 'hot' as const, label: '最热', icon: Flame },
              { key: 'popular' as const, label: '热门', icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setSort(item.key)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all',
                    sort === item.key
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 移动端筛选弹层 */}
      {showMobileFilter && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowMobileFilter(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto bg-white rounded-t-3xl p-5 animate-fade-in-up"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 mb-3">选择城市</h3>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => { setCityFilter('all'); setShowMobileFilter(false); }}
                className={cn(
                  'px-2 py-2 rounded-xl text-sm',
                  cityFilter === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                )}
              >
                全部
              </button>
              {cities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCityFilter(c.id); setShowMobileFilter(false); }}
                  className={cn(
                    'px-2 py-2 rounded-xl text-sm',
                    cityFilter === c.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 瀑布流卡片列表 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading && notes.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="text-sm">加载中...</span>
          </div>
        ) : notes.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1.5">还没有笔记</h3>
            <p className="text-sm text-slate-400 mb-4">
              {cityFilter !== 'all' ? `${currentCityName} 暂时还没有人分享笔记` : '快来发布第一条城市生活笔记吧'}
            </p>
            <button
              onClick={() => setCreateOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <Send className="w-4 h-4" />
              立即发布
            </button>
          </div>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onNoteChange={handleNoteChange}
                />
              ))}
            </div>

            {/* 加载更多状态 */}
            <div className="py-8 flex justify-center">
              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  加载中...
                </div>
              ) : hasMore ? (
                <button
                  onClick={() => loadNotes(false)}
                  className="btn btn-secondary btn-sm"
                >
                  加载更多
                </button>
              ) : (
                <div className="text-xs text-slate-400 py-2">
                  · 已经到底啦，试试换个城市看看 ·
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 发布笔记模态框 */}
      <CreateNoteModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
        defaultCityId={cityFilter !== 'all' ? cityFilter : undefined}
      />
    </div>
  );
}
