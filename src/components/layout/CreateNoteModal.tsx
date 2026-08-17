import { useState, useEffect, useRef } from 'react';
import { X, Upload, MapPin, ImagePlus, Loader2, Image as ImgIcon, Send } from 'lucide-react';
import { City, Note } from '@/types';
import { useCityStore } from '@/store/useCityStore';
import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import { noteApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CreateNoteModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (note: Note) => void;
  defaultCityId?: string;
}

const MAX_IMAGES = 9;

export default function CreateNoteModal({ open, onClose, onCreated, defaultCityId }: CreateNoteModalProps) {
  const { cities, fetchCities } = useCityStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const showToast = useUIStore((state) => state.showToast);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cityId, setCityId] = useState<string>(defaultCityId || '');
  const [citySearch, setCitySearch] = useState('');
  const [cityDropdown, setCityDropdown] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) fetchCities();
  }, [open, fetchCities]);

  useEffect(() => {
    if (defaultCityId) {
      setCityId(defaultCityId);
    }
  }, [defaultCityId]);

  // ESC 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const selectedCity: City | undefined = cities.find((c) => c.id === cityId);

  const filteredCities = cities.filter((c) =>
    c.name.includes(citySearch.trim()) || c.province.includes(citySearch.trim())
  ).slice(0, 15);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      showToast(`最多上传 ${MAX_IMAGES} 张图片`, 'warning');
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    // 校验格式
    const invalid = toUpload.some(
      (f) => !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)
    );
    if (invalid) {
      showToast('只支持 JPG / PNG / WebP / GIF 格式', 'error');
      return;
    }
    try {
      setUploading(true);
      const urls = await noteApi.uploadImages(toUpload);
      setImages((prev) => [...prev, ...urls]);
      showToast(`上传成功 ${urls.length} 张图片`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '图片上传失败', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      showToast('请先登录后再发布笔记', 'error');
      return;
    }
    if (!cityId) {
      showToast('请选择要关联的城市', 'warning');
      return;
    }
    if (!title.trim()) {
      showToast('请填写笔记标题', 'warning');
      return;
    }
    if (!content.trim()) {
      showToast('请填写笔记内容', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      const note = await noteApi.create({
        userId: currentUser.id,
        username: currentUser.username || currentUser.phone,
        userAvatar: currentUser.avatar || undefined,
        cityId,
        cityName: selectedCity?.name || '未知城市',
        title: title.trim(),
        content: content.trim(),
        images,
      });
      showToast('发布成功！🎉', 'success');
      onCreated?.(note as Note);
      // 重置表单
      setTitle('');
      setContent('');
      setImages([]);
      setCitySearch('');
      setCityId(defaultCityId || '');
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '发布失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-500" />
              发布城市生活笔记
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              分享你的真实感受，帮助更多人了解城市生活
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* 城市选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              关联城市 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={selectedCity ? `${selectedCity.name}（${selectedCity.province}）` : citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    if (selectedCity) setCityId('');
                    setCityDropdown(true);
                  }}
                  onFocus={() => setCityDropdown(true)}
                  onBlur={() => setTimeout(() => setCityDropdown(false), 150)}
                  placeholder="搜索城市名称或省份"
                  className="w-full input"
                />
                {selectedCity && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                    已选择
                  </span>
                )}
              </div>
              {cityDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-10 animate-fade-in">
                  {filteredCities.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-400">
                      没有找到匹配的城市
                    </div>
                  ) : (
                    filteredCities.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setCityId(c.id);
                          setCityDropdown(false);
                          setCitySearch('');
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-emerald-50 transition-colors',
                          cityId === c.id && 'bg-emerald-50 text-emerald-700'
                        )}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-slate-400">{c.province} · {c.level}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 标题 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">标题 <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 80))}
              placeholder="一句话总结你的笔记，例如：「在成都生活3年的真实感受」"
              className="w-full input"
              maxLength={80}
            />
            <div className="text-right text-xs text-slate-400">{title.length}/80</div>
          </div>

          {/* 内容 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">内容 <span className="text-rose-500">*</span></label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 2000))}
              placeholder="分享你的城市生活体验、美食推荐、居住感受、避坑指南..."
              rows={6}
              maxLength={2000}
              className="w-full input resize-none"
            />
            <div className="text-right text-xs text-slate-400">{content.length}/2000</div>
          </div>

          {/* 图片上传 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <ImagePlus className="w-4 h-4 text-emerald-500" />
              上传图片（最多 {MAX_IMAGES} 张）
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {images.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group"
                >
                  <img
                    src={url}
                    alt={`图片${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black/50 hover:bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <label className="relative aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-400 hover:text-emerald-500 cursor-pointer transition-all">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs">上传中...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">上传图片</span>
                      <span className="text-[10px] text-slate-300">{images.length}/{MAX_IMAGES}</span>
                    </>
                  )}
                </label>
              )}
            </div>
            {images.length === 0 && (
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <ImgIcon className="w-3 h-3" />
                建议上传真实的城市照片，笔记更容易获得点赞和浏览
              </p>
            )}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-xs text-slate-400">
            {!currentUser && <span className="text-rose-500">⚠ 请先登录才能发布</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary btn-sm"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !currentUser}
              className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  发布中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  立即发布
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
