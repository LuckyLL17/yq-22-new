import { useState } from 'react';
import {
  ArrowLeft,
  Ban,
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

export default function BlacklistPage() {
  const navigate = useNavigate();
  const {
    blacklistRestaurantIds,
    selectedBlacklistIds,
    toggleBlacklistSelection,
    selectAllBlacklist,
    clearBlacklistSelection,
    removeFromBlacklist,
    removeSelectedFromBlacklist,
    clearAllBlacklist,
  } = useStore();

  const [restaurantToRemove, setRestaurantToRemove] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);

  const blacklistedRestaurants = RESTAURANTS.filter((r) =>
    blacklistRestaurantIds.includes(r.id)
  );

  const hasSelection = selectedBlacklistIds.length > 0;
  const allSelected =
    blacklistedRestaurants.length > 0 && selectedBlacklistIds.length === blacklistedRestaurants.length;

  const handleDeleteSelected = () => {
    removeSelectedFromBlacklist();
    setShowDeleteSelectedConfirm(false);
  };

  const handleClearAll = () => {
    clearAllBlacklist();
    setShowClearAllConfirm(false);
  };

  const handleRemoveSingle = (id: string) => {
    removeFromBlacklist(id);
    setRestaurantToRemove(null);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      clearBlacklistSelection();
    } else {
      selectAllBlacklist();
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
              <Ban size={20} className="text-gray-700" />
              黑名单
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      {blacklistedRestaurants.length > 0 && (
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
                  已选 {selectedBlacklistIds.length} 项
                </span>
              )}
              {hasSelection && (
                <button
                  onClick={() => setShowDeleteSelectedConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  移出黑名单
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
        {blacklistedRestaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Ban size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">黑名单为空</h3>
            <p className="text-gray-500 mb-6">拉黑的餐厅不会出现在匹配结果中</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-6 py-2.5"
            >
              去匹配餐厅
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {blacklistedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md relative"
              >
                <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2">
                    <Ban size={16} />
                    <span className="text-sm font-medium">已拉黑</span>
                  </div>
                </div>
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover grayscale"
                  />
                  <div className="absolute top-3 left-3 z-20">
                    <button
                      onClick={() => toggleBlacklistSelection(restaurant.id)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                    >
                      {selectedBlacklistIds.includes(restaurant.id) ? (
                        <CheckSquare size={18} className="text-primary-500" />
                      ) : (
                        <Square size={18} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={() => setRestaurantToRemove(restaurant.id)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                      title="移出黑名单"
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
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-800">移出黑名单</h3>
            </div>
            <p className="text-gray-600 mb-6">确定要将这家餐厅移出黑名单吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setRestaurantToRemove(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleRemoveSingle(restaurantToRemove)}
                className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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
              <h3 className="font-semibold text-gray-800">清空黑名单</h3>
            </div>
            <p className="text-gray-600 mb-6">确定要清空黑名单吗？此操作无法撤销。</p>
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
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-800">移出黑名单</h3>
            </div>
            <p className="text-gray-600 mb-6">
              确定要将选中的 {selectedBlacklistIds.length} 家餐厅移出黑名单吗？
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
                className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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
