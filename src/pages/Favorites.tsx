import { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
  Star,
  MapPin,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { RESTAURANTS } from '@/data/restaurants';
import { SPICY_LABELS } from '@/types';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const {
    favoriteRestaurantIds,
    selectedFavoriteIds,
    toggleFavoriteSelection,
    selectAllFavorites,
    clearFavoriteSelection,
    removeFromFavorites,
    removeSelectedFromFavorites,
    clearAllFavorites,
  } = useStore();

  const [restaurantToRemove, setRestaurantToRemove] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);

  const favoriteRestaurants = RESTAURANTS.filter((r) =>
    favoriteRestaurantIds.includes(r.id)
  );

  const hasSelection = selectedFavoriteIds.length > 0;
  const allSelected =
    favoriteRestaurants.length > 0 && selectedFavoriteIds.length === favoriteRestaurants.length;

  const handleDeleteSelected = () => {
    removeSelectedFromFavorites();
    setShowDeleteSelectedConfirm(false);
  };

  const handleClearAll = () => {
    clearAllFavorites();
    setShowClearAllConfirm(false);
  };

  const handleRemoveSingle = (id: string) => {
    removeFromFavorites(id);
    setRestaurantToRemove(null);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      clearFavoriteSelection();
    } else {
      selectAllFavorites();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <h1 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
              <Heart size={20} className="text-red-500 fill-red-500" />
              我的收藏
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      {favoriteRestaurants.length > 0 && (
        <div className="sticky top-[73px] z-40 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {allSelected ? (
                <CheckSquare size={18} className="text-primary-500" />
              ) : (
                <Square size={18} />
              )}
              <span>全选</span>
            </button>
            <div className="flex items-center gap-2">
              {hasSelection && (
                <span className="text-sm text-gray-500">
                  已选 {selectedFavoriteIds.length} 项
                </span>
              )}
              {hasSelection && (
                <button
                  onClick={() => setShowDeleteSelectedConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  取消收藏
                </button>
              )}
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                清空
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        {favoriteRestaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Heart size={32} className="text-red-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">暂无收藏</h3>
            <p className="text-gray-500 mb-6">收藏喜欢的餐厅，匹配时会优先推荐哦</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-6 py-2.5"
            >
              去匹配餐厅
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {favoriteRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <button
                      onClick={() => toggleFavoriteSelection(restaurant.id)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                    >
                      {selectedFavoriteIds.includes(restaurant.id) ? (
                        <CheckSquare size={18} className="text-primary-500" />
                      ) : (
                        <Square size={18} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => setRestaurantToRemove(restaurant.id)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <h3 className="font-semibold text-white">{restaurant.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      {restaurant.rating}
                    </span>
                    <span>•</span>
                    <span>{restaurant.cuisine}</span>
                    <span>•</span>
                    <span>{SPICY_LABELS[restaurant.spicyLevel]}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin size={14} />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {restaurant.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {restaurantToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-800">取消收藏</h3>
            </div>
            <p className="text-gray-600 mb-6">确定要取消收藏这家餐厅吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setRestaurantToRemove(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleRemoveSingle(restaurantToRemove)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-800">清空收藏</h3>
            </div>
            <p className="text-gray-600 mb-6">确定要清空所有收藏吗？此操作无法撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSelectedConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-800">取消选中收藏</h3>
            </div>
            <p className="text-gray-600 mb-6">
              确定要取消选中的 {selectedFavoriteIds.length} 家餐厅的收藏吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteSelectedConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
