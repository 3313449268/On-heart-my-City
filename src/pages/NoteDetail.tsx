import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Eye, MapPin, User, MessageCircle, ChevronLeft, ChevronRight, X, Share2, Trash2 } from 'lucide-react';
import { Note } from '@/types';
import { noteApi } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import { cn, formatDate, formatNumber } from '@/utils/helpers';

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.currentUser);
  const showToast = useUIStore((state) => state.showToast);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeAnim, setLikeAnim] = useState(false);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const loadNote = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await noteApi.getById(id, user?.id);
      setNote(data as Note);
    } catch (err) {
      showToast('笔记不存在或已被删除', 'error');
      navigate('/community', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, navigate, showToast]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  // ESC 关闭图片预览
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewIdx(null);
      if (e.key === 'ArrowLeft' && previewIdx !== null && previewIdx > 0) setPreviewIdx(previewIdx - 1);
      if (e.key === 'ArrowRight' && note && previewIdx !== null && previewIdx < note.images.length - 1) setPreviewIdx(previewIdx + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewIdx, note]);

  const handleLike = async () => {
    if (!note) return;
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 400);
      const res = await noteApi.toggleLike(note.id, user.id);
      setNote({ ...note, isLiked: res.liked, likeCount: res.likeCount });
    } catch (err) {
      // 忽略
    }
  };

  const handleDelete = async () => {
    if (!note || !user) return;
    if (!confirm('确定要删除这条笔记吗？此操作不可恢复。')) return;
    try {
      await noteApi.delete(note.id, user.id);
      showToast('笔记已删除', 'success');
      navigate('/community', { replace: true });
    } catch (err: any) {
      showToast(err?.message || '删除失败', 'error');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: note?.title || '如意城市 · 分享笔记',
          text: note?.content?.slice(0, 100),
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('链接已复制到剪贴板', 'success');
      }
    } catch (err) {
      // 忽略用户取消
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-slate-200 rounded mb-8" />
            <div className="h-10 w-2/3 bg-slate-200 rounded mb-4" />
            <div className="h-4 w-1/2 bg-slate-200 rounded mb-10" />
            <div className="aspect-[16/9] w-full bg-slate-200 rounded-2xl mb-10" />
            <div className="h-4 w-full bg-slate-200 rounded mb-3" />
            <div className="h-4 w-full bg-slate-200 rounded mb-3" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!note) return null;

  const isAuthor = user?.id === note.userId;
  const previewImg = previewIdx !== null ? note.images[previewIdx] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
        {/* 返回栏 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">返回</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">分享</span>
            </button>
            {isAuthor && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">删除</span>
              </button>
            )}
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-4">
          {note.title}
        </h1>

        {/* 作者 + 元信息 */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-slate-200/70">
          <div className="flex items-center gap-3 min-w-0">
            {note.userAvatar ? (
              <img
                src={note.userAvatar}
                alt={note.username}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border-2 border-white shadow-sm">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{note.username}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatDate(note.createdAt)} 发布</p>
            </div>
          </div>

          {/* 城市标签 —— 点击跳城市详情 */}
          <Link
            to={`/city/${note.cityId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            {note.cityName}
          </Link>

          {/* 互动数据 */}
          <div className="flex items-center gap-4 ml-auto text-slate-500 text-sm">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(note.viewCount)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className={cn('w-4 h-4', note.isLiked && 'fill-rose-500 text-rose-500')} />
              <span>{formatNumber(note.likeCount)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>{formatNumber(note.commentCount)}</span>
            </div>
          </div>
        </div>

        {/* 图片画廊 */}
        {note.images.length > 0 && (
          <div className="mb-8">
            {note.images.length === 1 ? (
              <figure
                className="relative rounded-2xl overflow-hidden cursor-zoom-in bg-slate-100"
                onClick={() => setPreviewIdx(0)}
              >
                <img
                  src={note.images[0]}
                  alt={note.title}
                  className="w-full max-h-[560px] object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              </figure>
            ) : note.images.length <= 4 ? (
              <div
                className={cn(
                  'grid gap-2 rounded-2xl overflow-hidden bg-slate-100',
                  note.images.length === 2 && 'grid-cols-2',
                  note.images.length === 3 && 'grid-cols-2',
                  note.images.length === 4 && 'grid-cols-2'
                )}
              >
                {note.images.map((img, i) => (
                  <figure
                    key={i}
                    className={cn(
                      'relative overflow-hidden cursor-zoom-in',
                      note.images.length === 3 && i === 0 && 'row-span-2 col-span-1 aspect-square'
                    )}
                    style={{ aspectRatio: i === 0 && note.images.length === 3 ? '1 / 1' : '4 / 3' }}
                    onClick={() => setPreviewIdx(i)}
                  >
                    <img
                      src={img}
                      alt={`${note.title} ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </figure>
                ))}
              </div>
            ) : (
              // 5+ 张图：4 宫格 + 遮罩显示更多
              <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden bg-slate-100">
                {note.images.slice(0, 4).map((img, i) => (
                  <figure
                    key={i}
                    className="relative overflow-hidden cursor-zoom-in"
                    style={{ aspectRatio: '4 / 3' }}
                    onClick={() => setPreviewIdx(i)}
                  >
                    <img
                      src={img}
                      alt={`${note.title} ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {i === 3 && note.images.length > 4 && (
                      <div
                        className="absolute inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center text-white"
                      >
                        <div className="text-center">
                          <p className="text-4xl font-bold">+{note.images.length - 4}</p>
                          <p className="text-sm opacity-80 mt-1">张图片</p>
                        </div>
                      </div>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 正文 */}
        <article className="prose prose-slate max-w-none mb-10">
          <div className="text-slate-700 leading-relaxed text-[16px] whitespace-pre-wrap break-words">
            {note.content}
          </div>
        </article>

        {/* 底部互动栏 */}
        <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 sm:py-0 sm:mt-8 sm:sticky-none bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent sm:bg-transparent">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300',
                note.isLiked
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-600 hover:shadow-sm'
              )}
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-transform',
                  likeAnim && 'scale-150',
                  note.isLiked && 'fill-rose-500'
                )}
              />
              <span className="font-medium">
                {note.isLiked ? '已赞' : '点赞'} · {formatNumber(note.likeCount)}
              </span>
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-sm transition-all"
              title="评论功能开发中"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">评论 · {formatNumber(note.commentCount)}</span>
            </button>
          </div>
        </div>

        {/* 图片预览 Lightbox */}
        {previewImg && previewIdx !== null && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
            onClick={() => setPreviewIdx(null)}
          >
            <button
              className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setPreviewIdx(null); }}
            >
              <X className="w-5 h-5" />
            </button>

            {previewIdx > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setPreviewIdx(previewIdx - 1); }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {note.images && previewIdx < note.images.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setPreviewIdx(previewIdx + 1); }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <img
              src={previewImg}
              alt="预览"
              className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/40 text-white text-sm whitespace-nowrap">
              {previewIdx + 1} / {note.images.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
