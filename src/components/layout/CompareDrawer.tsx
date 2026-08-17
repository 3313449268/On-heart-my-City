import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useCompareStore } from '@/store/useCompareStore';

export default function CompareDrawer() {
  const { isDrawerOpen, compareList, closeDrawer, removeFromCompare, clearCompare } = useCompareStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleGoToCompare = () => {
    closeDrawer();
    navigate('/compare');
  };

  if (!isDrawerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={closeDrawer}
      />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl animate-slide-in-right">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              对比清单
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({compareList.length}/5)
              </span>
            </h2>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {compareList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Trash2 className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">暂无对比城市</p>
              </div>
            ) : (
              <div className="space-y-3">
                {compareList.map((city) => (
                  <div
                    key={city.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-800 truncate">
                        {city.name}
                      </h3>
                      <p className="text-xs text-slate-500">{city.province}</p>
                    </div>
                    <button
                      onClick={() => removeFromCompare(city.id)}
                      className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 space-y-3">
            <button
              onClick={clearCompare}
              disabled={compareList.length === 0}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-full transition-all duration-200',
                compareList.length === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Trash2 className="w-4 h-4" />
              清空全部
            </button>
            <button
              onClick={handleGoToCompare}
              disabled={compareList.length < 2}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-full transition-all duration-200',
                compareList.length >= 2
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              前往对比
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
