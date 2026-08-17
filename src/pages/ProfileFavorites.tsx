import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import { useCityStore } from '@/store/useCityStore';
import CityCard from '@/components/ui/CityCard';
import Button from '@/components/ui/Button';
import type { City } from '@/types';

export default function ProfileFavorites() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, toggleFavorite } = useUserStore();
  const { showToast } = useUIStore();
  const { cities, fetchCities } = useCityStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const favoriteCities = useMemo(() => {
    if (!currentUser) return [];
    return currentUser.favorites
      .map((id) => cities.find(c => c.id === id))
      .filter(Boolean) as (City | undefined)[];
  }, [currentUser, cities]);

  const allSelected = favoriteCities.length > 0 && selectedIds.length === favoriteCities.length;

  const handleToggleSelect = (cityId: string) => {
    setSelectedIds((prev) =>
      prev.includes(cityId) ? prev.filter((id) => id !== cityId) : [...prev, cityId]
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(favoriteCities.map((c) => c!.id));
    }
  };

  const handleBatchUnfavorite = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => toggleFavorite(id));
    setSelectedIds([]);
    showToast(`已取消 ${selectedIds.length} 个收藏`, 'success');
  };

  const handleViewDetail = (cityId: string) => {
    navigate(`/city/${cityId}`);
  };

  if (!currentUser) return null;

  return (
    <div className="card p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">我的收藏</h1>
          <p className="section-subtitle">共 {favoriteCities.length} 个城市</p>
        </div>

        {favoriteCities.length > 0 && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-600">全选</span>
            </label>

            <Button
              variant="outline"
              onClick={handleBatchUnfavorite}
              disabled={selectedIds.length === 0}
              className="border-rose-300 text-rose-500 hover:bg-rose-50 hover:border-rose-400"
            >
              <Trash2 className="w-4 h-4" />
              批量取消收藏 ({selectedIds.length})
            </Button>
          </div>
        )}
      </div>

      {favoriteCities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-lg text-slate-500 mb-2">还没有收藏任何城市</p>
          <p className="text-sm text-slate-400 mb-6">快去发现你喜欢的城市吧</p>
          <Button onClick={() => navigate('/cities')}>浏览城市</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteCities.map((city) => (
            <div key={city!.id} className="relative">
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(city!.id)}
                  onChange={() => handleToggleSelect(city!.id)}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <CityCard
                city={city!}
                isFavorite={true}
                onFavorite={() => toggleFavorite(city!.id)}
                onViewDetail={() => handleViewDetail(city!.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
