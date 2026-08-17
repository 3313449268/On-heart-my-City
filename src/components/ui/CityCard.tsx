import { Heart, GitCompare, ArrowRight } from 'lucide-react';
import { City } from '@/types';
import { cn, getScoreColor, getLevelLabel } from '@/utils/helpers';
import Button from './Button';

interface CityCardProps {
  city: City;
  showFavorite?: boolean;
  showCompare?: boolean;
  onFavorite?: () => void;
  onCompare?: () => void;
  isFavorite?: boolean;
  isInCompare?: boolean;
  onViewDetail?: () => void;
}

export default function CityCard({
  city,
  showFavorite = true,
  showCompare = true,
  onFavorite,
  onCompare,
  isFavorite = false,
  isInCompare = false,
  onViewDetail,
}: CityCardProps) {
  return (
    <div className={cn(
      'card card-hover overflow-hidden group cursor-pointer',
      'flex flex-col'
    )}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={city.image}
          alt={city.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3 flex gap-2">
          {showFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.();
              }}
              className={cn(
                'p-2 rounded-full backdrop-blur-md transition-all duration-200',
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-500'
              )}
            >
              <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
            </button>
          )}
          {showCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompare?.();
              }}
              className={cn(
                'p-2 rounded-full backdrop-blur-md transition-all duration-200',
                isInCompare
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-emerald-500'
              )}
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="badge badge-emerald backdrop-blur-md bg-white/90">
            {getLevelLabel(city.level)}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-serif-sc text-xl font-bold text-slate-800">{city.name}</h3>
            <p className="text-sm text-slate-500">{city.province}</p>
          </div>
          <div className="text-right">
            <div className={cn('text-2xl font-bold', getScoreColor(city.overallScore))}>
              {city.overallScore.toFixed(1)}
            </div>
            <div className="text-xs text-slate-400">综合得分</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {city.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetail}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-0"
          >
            查看详情
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
