import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  DollarSign,
  Heart,
  Ban,
  UtensilsCrossed,
  Sparkles,
  ArrowRightLeft,
  Clock,
  Info,
  Share2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { RESTAURANTS } from '@/data/restaurants';
import { Restaurant, SPICY_LABELS, PRICE_LABELS } from '@/types';

export default function RestaurantDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toggleFavorite, isFavorite, isBlacklisted, toggleBlacklist } = useStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [blacklisted, setBlacklisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'dishes' | 'info' | 'similar'>('dishes');

  useEffect(() => {
    if (id) {
      const found = RESTAURANTS.find((r) => r.id === id);
      if (found) {
        setRestaurant(found);
        setFavorited(isFavorite(found.id));
        setBlacklisted(isBlacklisted(found.id));
      }
    }
  }, [id, isFavorite, isBlacklisted]);

  const handleToggleFavorite = () => {
    if (restaurant) {
      toggleFavorite(restaurant.id);
      setFavorited(!favorited);
    }
  };

  const handleToggleBlacklist = () => {
    if (restaurant) {
      toggleBlacklist(restaurant.id);
      setBlacklisted(!blacklisted);
    }
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">餐厅不存在</p>
      </div>
    );
  }

  const similarRestaurants = restaurant.similarRestaurantIds
    .map((rid) => RESTAURANTS.find((r) => r.id === rid))
    .filter(Boolean) as Restaurant[];

  const alternativeRestaurants = restaurant.alternativeRestaurantIds
    .map((rid) => RESTAURANTS.find((r) => r.id === rid))
    .filter(Boolean) as Restaurant[];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <h1 className="font-display font-bold text-lg text-gray-800 truncate max-w-[200px]">
              {restaurant.name}
            </h1>
            <button
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: restaurant.name,
                    text: `推荐一家餐厅：${restaurant.name}`,
                    url: window.location.href,
                  });
                }
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                    {restaurant.cuisine}
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                    {SPICY_LABELS[restaurant.spicyLevel]}
                  </span>
                </div>
                <h2 className="font-display font-bold text-3xl text-white mb-2">
                  {restaurant.name}
                </h2>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurant.rating}</span>
                  </div>
                  <span className="text-white/50">•</span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={16} />
                    {PRICE_LABELS[restaurant.priceLevel]}
                  </span>
                  <span className="text-white/50">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {restaurant.distance}km
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                    favorited
                      ? 'bg-red-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart size={20} className={favorited ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={handleToggleBlacklist}
                  className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                    blacklisted
                      ? 'bg-gray-800 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Ban size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl card-shadow p-6 mb-6 animate-fade-in-up">
          <div className="flex items-start gap-3 mb-4">
            <MapPin size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-800 mb-1">地址</h3>
              <p className="text-gray-600">{restaurant.address}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-orange-50 rounded-xl flex items-center justify-center mb-2">
                <Star size={24} className="text-orange-500" />
              </div>
              <p className="text-lg font-bold text-gray-800">{restaurant.rating}</p>
              <p className="text-xs text-gray-500">评分</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-50 rounded-xl flex items-center justify-center mb-2">
                <MapPin size={24} className="text-blue-500" />
              </div>
              <p className="text-lg font-bold text-gray-800">{restaurant.distance}km</p>
              <p className="text-xs text-gray-500">距离</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-green-50 rounded-xl flex items-center justify-center mb-2">
                <UtensilsCrossed size={24} className="text-green-500" />
              </div>
              <p className="text-lg font-bold text-gray-800">{restaurant.dishes.length}</p>
              <p className="text-xs text-gray-500">招牌菜</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl card-shadow overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex border-b border-gray-100">
            {[
              { key: 'dishes', label: '招牌菜品', icon: UtensilsCrossed },
              { key: 'info', label: '餐厅信息', icon: Info },
              { key: 'similar', label: '相似推荐', icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'dishes' && (
              <div className="space-y-4">
                {restaurant.dishes.map((dish, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-800">{dish.name}</h4>
                        <span className="text-lg font-bold text-orange-500">
                          {dish.price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {dish.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-500" />
                    餐厅标签
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <UtensilsCrossed size={18} className="text-green-500" />
                    常用食材
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" />
                    辣度等级
                  </h4>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                          level <= restaurant.spicyLevel
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {level === 0 ? '🌶️' : `🌶️×${level + 1}`}
                      </div>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {SPICY_LABELS[restaurant.spicyLevel]}
                    </span>
                  </div>
                </div>

                {restaurant.hasVegetarianOptions && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">🥬</span>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">有素食选项</p>
                      <p className="text-sm text-green-600">提供素食菜品</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'similar' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-500" />
                    相似口味推荐
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    与{restaurant.name}口味相近的餐厅
                  </p>
                  <div className="space-y-3">
                    {similarRestaurants.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => navigate(`/restaurant/${r.id}`)}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-800 truncate">
                            {r.name}
                          </h5>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-0.5">
                              <Star size={12} className="fill-yellow-400 text-yellow-400" />
                              {r.rating}
                            </span>
                            <span>•</span>
                            <span>{r.cuisine}</span>
                          </div>
                        </div>
                        <ArrowRightLeft size={18} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <ArrowRightLeft size={18} className="text-blue-500" />
                    替代方案
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    如果不想吃{restaurant.cuisine}，可以试试这些
                  </p>
                  <div className="space-y-3">
                    {alternativeRestaurants.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => navigate(`/restaurant/${r.id}`)}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-800 truncate">
                            {r.name}
                          </h5>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-0.5">
                              <Star size={12} className="fill-yellow-400 text-yellow-400" />
                              {r.rating}
                            </span>
                            <span>•</span>
                            <span>{r.cuisine}</span>
                          </div>
                        </div>
                        <ArrowRightLeft size={18} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={handleToggleFavorite}
            className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              favorited
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <Heart size={20} className={favorited ? 'fill-current' : ''} />
            {favorited ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-4 rounded-2xl font-bold bg-gradient-to-r from-primary-500 to-orange-500 text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/30 transition-all"
          >
            <ArrowLeft size={20} />
            返回
          </button>
        </div>
      </div>
    </div>
  );
}
