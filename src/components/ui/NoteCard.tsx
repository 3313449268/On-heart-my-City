import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Eye, MapPin, User } from 'lucide-react';
import { Note } from '@/types';
import { cn, formatDate, formatNumber } from '@/utils/helpers';
import { noteApi } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';

interface NoteCardProps {
  note: Note;
  onNoteChange?: (updated: Note) => void;
}

export default function NoteCard({ note, onNoteChange }: NoteCardProps) {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.currentUser);
  const [likeAnim, setLikeAnim] = useState(false);

  const cover = note.images?.[0];
  const extraImgCount = note.images?.length ? note.images.length - 1 : 0;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 400);
      const res = await noteApi.toggleLike(note.id, user.id);
      onNoteChange?.({ ...note, isLiked: res.liked, likeCount: res.likeCount });
    } catch (err) {
      // 忽略
    }
  };

  const handleCardClick = () => {
    // 点击跳转到笔记详情页
    navigate(`/note/${note.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-white border border-slate-100 card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* 图片区 */}
      {cover && (
        <div className="relative overflow-hidden bg-slate-100">
          <img
            src={cover}
            alt={note.title}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          {extraImgCount > 0 && (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur text-white text-xs rounded-full">
              +{extraImgCount} 张
            </div>
          )}
          {/* 城市标签 —— 单独点击跳城市详情，阻止冒泡到卡片 */}
          <Link
            to={`/city/${note.cityId}`}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 bg-white/90 hover:bg-white backdrop-blur rounded-full text-xs font-medium text-emerald-700 shadow-sm transition-colors"
          >
            <MapPin className="w-3 h-3" />
            {note.cityName}
          </Link>
        </div>
      )}

      {/* 内容区 */}
      <div className="p-3.5">
        <h3 className="font-semibold text-slate-800 text-[15px] leading-snug line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
          {note.title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-3">
          {note.content}
        </p>

        {/* 底部信息 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {note.userAvatar ? (
              <img
                src={note.userAvatar}
                alt={note.username}
                className="w-6 h-6 rounded-full object-cover border border-slate-100"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}
            <span className="text-xs text-slate-500 truncate">{note.username}</span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-400 shrink-0">
              {formatDate(note.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1 transition-transform select-none',
                likeAnim && 'scale-125'
              )}
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors',
                  note.isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'
                )}
              />
              <span
                className={cn(
                  'text-xs',
                  note.isLiked ? 'text-rose-500 font-medium' : 'text-slate-400'
                )}
              >
                {formatNumber(note.likeCount)}
              </span>
            </button>
            <div className="flex items-center gap-1 text-slate-400">
              <Eye className="w-4 h-4" />
              <span className="text-xs">{formatNumber(note.viewCount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
